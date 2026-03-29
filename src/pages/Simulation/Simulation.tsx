import { useState, useCallback, useRef, useEffect } from "react";
import {
  FiArrowLeft,
  FiBox,
  FiCheck,
  FiLayers,
  FiLoader,
  FiSave,
} from "react-icons/fi";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useFloorPlans, useFloorPlan, useCreateSession } from "@/hooks/useSimulation";
import simulationApi from "@/services/simulationApi";
import type { FloorPlan, Placement, AutoPlaceResponse, GenerateLayoutsResponse, LayoutOption, AiRanking } from "@/types/simulation";
import FloorPlanCanvas from "@/components/FloorPlanCanvas/FloorPlanCanvas";
import type { FloorPlanCanvasHandle } from "@/components/FloorPlanCanvas/FloorPlanCanvas";
import { validatePlacement } from "@/utils/placementValidator";
import snowLogo from "../../assets/images/snow_logo.png";
import styles from "./Simulation.module.css";

// 도면 이미지 매핑 (floor_plan_id → 이미지)
const floorPlanImages = Object.fromEntries(
  Object.entries(
    import.meta.glob("../../assets/images/d2_floor/fp_*.png", { eager: true, import: "default" })
  ).map(([path, src]) => {
    const match = path.match(/fp_(\d+)/);
    const id = match ? parseInt(match[1], 10) : 0;
    return [id, src as string];
  })
);

type ProductDetail = {
  product_id: number;
  name: string;
  category: string;
  totalPrice: number;
  subscriptionPrice: number;
  image?: string;
};

type SimulationState = {
  packageTitle?: string;
  packageTypeLabel?: string;
  itemCount?: number;
  productIds?: number[];
  productDetails?: ProductDetail[];
  interiorStyle?: string;
  ownedAppliances?: string[];
  lifestyle?: string[];
  budget?: number;
};

type SimulationTab = "floor2d" | "image3d" | "cart";

// 테스트용 기본 제품 세트 (냉장고, 세탁기, TV, 에어컨, 소파, 침대)
const TEST_PRODUCT_IDS = [114, 292, 64, 737, 1841, 1563];

const TAB_COPY: Record<SimulationTab, { label: string; description: string }> = {
  floor2d: {
    label: "2D 평면도",
    description: "도면 기준으로 가전과 공간 배치를 먼저 확인할 수 있어요.",
  },
  image3d: {
    label: "3D 이미지",
    description: "실제 연출에 가까운 장면형 미리보기 자리입니다.",
  },
  cart: {
    label: "장바구니",
    description: "선택한 패키지 상품과 요약 정보를 모아보는 자리입니다.",
  },
};

function formatPrice(price: number | null | undefined): string {
  if (!price) return "-";
  return `${price.toLocaleString("ko-KR")}원`;
}

function formatCaption(plan: FloorPlan): string {
  const roomNames = plan.rooms.map((r) => r.name).join(", ");
  const area = plan.total_area_m2 ? `${plan.total_area_m2}m\u00B2` : "";
  return [area, roomNames].filter(Boolean).join(" \u00B7 ");
}

function Simulation() {
  useEffect(() => {
    document.title = "Home Canvas";
    return () => { document.title = "LGE.COM | LG전자"; };
  }, []);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const state = (location.state as SimulationState | null) ?? null;
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [planCategory, setPlanCategory] = useState<string>("원룸");
  const [activeTab, setActiveTab] = useState<SimulationTab>("floor2d");
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const [sessionId, setSessionId] = useState<number | null>(null);
  // const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [placementsMap, setPlacementsMap] = useState<Record<number, Placement[]>>({});
  const [autoPlaceWarnings, setAutoPlaceWarnings] = useState<string[]>([]);
  const [isAutoPlacing, setIsAutoPlacing] = useState(false);
  const [layouts, setLayouts] = useState<LayoutOption[]>([]);
  const [aiRankings, setAiRankings] = useState<AiRanking[]>([]);
  const [currentLayoutIdx, setCurrentLayoutIdx] = useState(-1); // -1 = 초기 auto-place
  const [image3dUrl, setImage3dUrl] = useState<string | null>(null);
  const [isGenerating3d, setIsGenerating3d] = useState(false);
  const [gen3dCount, setGen3dCount] = useState(0);
  const MAX_3D_GENERATIONS = 2;
  const [isGeneratingLayouts, setIsGeneratingLayouts] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [paymentStep, setPaymentStep] = useState<"confirm" | "processing" | "done">("confirm");
  const [paymentType, setPaymentType] = useState<"lump" | "subscription">("lump");
  const canvasHandle = useRef<FloorPlanCanvasHandle>(null);

  const productIds = state?.productIds ?? TEST_PRODUCT_IDS;

  const { data: floorPlans = [], isLoading: isLoadingPlans } = useFloorPlans();
  const { data: floorPlanDetail } = useFloorPlan(selectedPlanId);
  const createSession = useCreateSession();

  const selectedPlan = floorPlans.find((p) => p.id === selectedPlanId) ?? floorPlans[0] ?? null;

  // 장바구니 + 결제 모달에서 공용으로 사용
  const ownedLabelsGlobal = state?.ownedAppliances ?? [];
  const labelToCatGlobal: Record<string, string> = {
    "건조기": "의류건조기", "스타일러": "의류관리기",
    "인덕션": "전기레인지", "전자레인지": "광파오븐/전자레인지", "오븐": "광파오븐/전자레인지",
  };
  const ownedCatsGlobal = new Set([...ownedLabelsGlobal, ...ownedLabelsGlobal.map((l) => labelToCatGlobal[l] ?? l)]);
  const allPlacementsFlat = Object.values(placementsMap).flat();
  const detailsMap = new Map((state?.productDetails ?? []).map((d) => [d.product_id, d]));
  const allPlacedProducts = allPlacementsFlat
    .map((pl) => {
      const product = pl.product;
      if (!product) {
        // product가 null이면 detailsMap에서 복구 시도
        const detail = detailsMap.get(pl.product_id);
        if (detail) {
          return {
            product_id: pl.product_id,
            name: detail.name ?? `제품 ${pl.product_id}`,
            category: detail.category ?? "",
            price: detail.totalPrice ?? 0,
            list_price: detail.totalPrice ?? 0,
            image_url: detail.image ?? null,
            width_mm: null as number | null, height_mm: null as number | null, depth_mm: null as number | null,
            isOwned: ownedCatsGlobal.has(detail.category ?? "") || ownedCatsGlobal.has(detail.name ?? ""),
            subscriptionPrice: detail.subscriptionPrice ?? 0,
            displayTotalPrice: detail.totalPrice ?? 0,
          };
        }
        return null;
      }
      const detail = detailsMap.get(product.product_id);
      return {
        ...product,
        isOwned: ownedCatsGlobal.has(product.category) || ownedCatsGlobal.has(product.name),
        subscriptionPrice: detail?.subscriptionPrice ?? 0,
        displayTotalPrice: detail?.totalPrice ?? product.list_price ?? product.price ?? 0,
      };
    })
    .filter((p): p is NonNullable<typeof p> => p != null);
  const placedProductsForSale = allPlacedProducts.filter((p) => !p.isOwned);
  const subscriptionProducts = placedProductsForSale.filter((p) => p.subscriptionPrice > 0);
  const nonSubscriptionProducts = placedProductsForSale.filter((p) => !p.subscriptionPrice);
  const totalListPrice = placedProductsForSale.reduce((sum, p) => sum + (p.list_price ?? p.displayTotalPrice ?? 0), 0);
  const totalPrice = placedProductsForSale.reduce((sum, p) => sum + (p.price ?? 0), 0);
  const totalSubscription = subscriptionProducts.reduce((sum, p) => sum + (p.subscriptionPrice ?? 0), 0);
  const nonSubTotal = nonSubscriptionProducts.reduce((sum, p) => sum + (p.price ?? 0), 0);

  // 방 선택 기능 비활성화됨

  const dragStartPosRef = useRef<{ roomId: number; index: number; x_mm: number; y_mm: number } | null>(null);

  const handlePlacementMove = useCallback(
    (roomId: number, index: number, xMm: number, yMm: number) => {
      setPlacementsMap((prev) => {
        const roomPls = prev[roomId];
        if (!roomPls || !roomPls[index]) return prev;

        // 드래그 시작 위치 저장 (최초 1회만)
        if (!dragStartPosRef.current) {
          dragStartPosRef.current = { roomId, index, x_mm: roomPls[index].x_mm, y_mm: roomPls[index].y_mm };
        }

        const updated = [...roomPls];
        updated[index] = { ...updated[index], x_mm: xMm, y_mm: yMm };
        return { ...prev, [roomId]: updated };
      });
    },
    [],
  );

  const handlePlacementMoveEnd = useCallback(
    (roomId: number, index: number, _xMm: number, _yMm: number) => {
      if (!floorPlanDetail) return;
      const room = floorPlanDetail.rooms.find((r) => r.id === roomId);
      if (!room) return;

      const roomPls = placementsMap[roomId];
      if (!roomPls || !roomPls[index]) return;
      const pl = roomPls[index];
      const others = roomPls.filter((_, i) => i !== index);

      const violations = validatePlacement(pl, room, others, floorPlanDetail?.rooms);

      setPlacementsMap((prev) => {
        const updated = [...(prev[roomId] ?? [])];
        if (updated[index]) {
          updated[index] = {
            ...updated[index],
            is_valid: violations.length === 0,
            violations,
          };
        }
        return { ...prev, [roomId]: updated };
      });

      dragStartPosRef.current = null;
    },
    [floorPlanDetail, placementsMap],
  );

  const handlePlacementRoomChange = useCallback(
    (fromRoomId: number, placementIndex: number, toRoomId: number, xMm: number, yMm: number): number => {
      let newIndex = 0;
      setPlacementsMap((prev) => {
        const fromPls = [...(prev[fromRoomId] ?? [])];
        const pl = fromPls[placementIndex];
        if (!pl) return prev;

        // 원래 방에서 제거
        fromPls.splice(placementIndex, 1);

        // 새 방에 추가
        const toPls = [...(prev[toRoomId] ?? [])];
        toPls.push({ ...pl, room_id: toRoomId, x_mm: xMm, y_mm: yMm });
        newIndex = toPls.length - 1;

        return { ...prev, [fromRoomId]: fromPls, [toRoomId]: toPls };
      });
      return newIndex;
    },
    [],
  );

  const handlePlacementRotate = useCallback(
    (roomId: number, index: number) => {
      if (!floorPlanDetail) return;
      const room = floorPlanDetail.rooms.find((r) => r.id === roomId);
      if (!room) return;

      setPlacementsMap((prev) => {
        const updated = [...(prev[roomId] ?? [])];
        if (!updated[index]) return prev;

        const pl = updated[index];
        const newRotation = ((pl.rotation + 90) % 360) as 0 | 90 | 180 | 270;
        const rotated = { ...pl, rotation: newRotation };

        const others = updated.filter((_, i) => i !== index);
        const violations = validatePlacement(rotated, room, others, floorPlanDetail?.rooms);

        updated[index] = {
          ...rotated,
          is_valid: violations.length === 0,
          violations,
        };
        return { ...prev, [roomId]: updated };
      });
    },
    [floorPlanDetail],
  );

  // @ts-expect-error: will be used when product selection is connected
  const _runAutoPlace = useCallback(
    async (sid: number) => {
      setIsAutoPlacing(true);
      try {
        const { data } = await simulationApi.post<AutoPlaceResponse>(
          `/sessions/${sid}/auto-place`,
          { product_ids: productIds },
        );
        const grouped: Record<number, Placement[]> = {};
        for (const pl of data.placements) {
          (grouped[pl.room_id] ??= []).push(pl);
        }
        setPlacementsMap(grouped);
        setAutoPlaceWarnings(data.warnings);
      } finally {
        setIsAutoPlacing(false);
      }
    },
    [productIds],
  );

  const applyLayoutByIndex = useCallback(
    (allLayouts: LayoutOption[], idx: number) => {
      const layout = allLayouts[idx];
      if (!layout) return;
      const grouped: Record<number, Placement[]> = {};
      for (let i = 0; i < layout.placements.length; i++) {
        const raw = layout.placements[i] as Placement & Record<string, unknown>;
        const pl: Placement = {
          id: raw.id ?? -(i + 1),
          session_id: raw.session_id ?? sessionId ?? 0,
          room_id: raw.room_id,
          product_id: raw.product_id,
          x_mm: raw.x_mm,
          y_mm: raw.y_mm,
          rotation: raw.rotation ?? 0,
          is_valid: raw.is_valid ?? true,
          violations: raw.violations ?? [],
          product: raw.product ?? null,
        };
        (grouped[pl.room_id] ??= []).push(pl);
      }
      setPlacementsMap(grouped);
      setAutoPlaceWarnings(layout.warnings);
      setCurrentLayoutIdx(idx);
    },
    [sessionId],
  );

  const handleGenerateOrNext = useCallback(
    async () => {
      if (!sessionId) return;

      // 이미 레이아웃이 생성된 상태면 다음 배치안으로 전환
      if (layouts.length > 0) {
        const nextIdx = (currentLayoutIdx + 1) % layouts.length;
        applyLayoutByIndex(layouts, nextIdx);
        return;
      }

      // 처음 누르면 레이아웃 생성
      const currentIds = Object.values(placementsMap)
        .flat()
        .map((pl) => pl.product_id)
        .filter((id): id is number => id != null);
      const ids = currentIds.length > 0 ? [...new Set(currentIds)] : productIds;

      setIsGeneratingLayouts(true);
      try {
        const { data } = await simulationApi.post<GenerateLayoutsResponse>(
          `/sessions/${sessionId}/generate-layouts`,
          { product_ids: ids },
        );
        setLayouts(data.layouts);
        if (data.ai_evaluation) {
          setAiRankings(data.ai_evaluation.rankings);
        }
        // 최고 점수 배치안 자동 적용
        if (data.layouts.length > 0) {
          applyLayoutByIndex(data.layouts, 0);
        }
      } finally {
        setIsGeneratingLayouts(false);
      }
    },
    [sessionId, layouts, currentLayoutIdx, placementsMap, productIds, applyLayoutByIndex],
  );

  // @ts-expect-error: will be used when layout selection is connected
  const _applyLayout = useCallback(
    (layout: LayoutOption) => {
      const grouped: Record<number, Placement[]> = {};
      for (let i = 0; i < layout.placements.length; i++) {
        const raw = layout.placements[i] as Placement & Record<string, unknown>;
        const pl: Placement = {
          id: raw.id ?? -(i + 1),
          session_id: raw.session_id ?? sessionId ?? 0,
          room_id: raw.room_id,
          product_id: raw.product_id,
          x_mm: raw.x_mm,
          y_mm: raw.y_mm,
          rotation: raw.rotation ?? 0,
          is_valid: raw.is_valid ?? true,
          violations: raw.violations ?? [],
          product: raw.product ?? null,
        };
        (grouped[pl.room_id] ??= []).push(pl);
      }
      setPlacementsMap(grouped);
      setAutoPlaceWarnings(layout.warnings);
      setIsModalOpen(false);
    },
    [sessionId],
  );

  const runGenerateLayoutsForSession = useCallback(
    async (sid: number) => {
      setIsGeneratingLayouts(true);
      try {
        // 보유 가전이 있으면 대표 제품 ID를 먼저 조회
        let allProductIds = [...productIds];
        const ownedAppliances = state?.ownedAppliances;
        console.log("[Simulation] ownedAppliances:", ownedAppliances);
        console.log("[Simulation] productIds:", productIds);
        if (ownedAppliances && ownedAppliances.length > 0) {
          try {
            const { data: repProducts } = await simulationApi.post<
              { label: string; product_id: number }[]
            >("/representative-products", { labels: ownedAppliances });
            console.log("[Simulation] 보유 가전 대표 제품:", repProducts);
            const ownedIds = repProducts.map((p) => p.product_id);
            allProductIds = [...new Set([...allProductIds, ...ownedIds])];
          } catch (err) {
            console.warn("보유 가전 대표 제품 조회 실패:", err);
          }
        }
        console.log("[Simulation] 최종 product_ids:", allProductIds);

        const { data } = await simulationApi.post<GenerateLayoutsResponse>(
          `/sessions/${sid}/generate-layouts`,
          { product_ids: allProductIds },
        );
        setLayouts(data.layouts);
        if (data.ai_evaluation) {
          setAiRankings(data.ai_evaluation.rankings);
        }
        if (data.layouts.length > 0) {
          applyLayoutByIndex(data.layouts, 0);
        }
      } finally {
        setIsGeneratingLayouts(false);
      }
    },
    [productIds, state?.ownedAppliances, applyLayoutByIndex],
  );

  const handleConfirmPlan = useCallback(() => {
    const planId = selectedPlanId ?? floorPlans[0]?.id;
    if (!planId) return;
    setSelectedPlanId(planId);
    createSession.mutate(
      { floor_plan_id: planId, session_name: `session-${planId}`, user_id: user?.id ?? 1 },
      {
        onSuccess: (session) => {
          setSessionId(session.id);
          setIsModalOpen(false);
          runGenerateLayoutsForSession(session.id);
        },
      },
    );
  }, [selectedPlanId, floorPlans, createSession, runGenerateLayoutsForSession]);

  const handleGenerate3d = useCallback(async () => {
    if (!sessionId) return;
    if (gen3dCount >= MAX_3D_GENERATIONS) {
      alert(`3D 변환은 최대 ${MAX_3D_GENERATIONS}회까지 가능합니다.`);
      return;
    }
    setIsGenerating3d(true);
    setActiveTab("image3d");
    try {
      const canvasImage = canvasHandle.current?.toDataURL() ?? null;
      const { data } = await simulationApi.post<{ image_url: string }>(
        `/sessions/${sessionId}/generate-3d`,
        {
          canvas_image: canvasImage,
          interior_style: state?.interiorStyle ?? null,
          lifestyle: state?.lifestyle ?? null,
          budget: state?.budget ?? null,
        },
        { timeout: 120_000 },
      );
      setImage3dUrl(data.image_url);
      setGen3dCount((prev) => prev + 1);
    } catch (err) {
      console.error("3D generation failed:", err);
      setImage3dUrl(null);
      alert("3D 이미지 생성에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsGenerating3d(false);
    }
  }, [sessionId, gen3dCount]);

  const handleSaveSnapshot = useCallback(async (type: "2d" | "3d" | "all") => {
    if (!sessionId || isSaving) return;
    setIsSaving(true);
    setSaveMessage(null);

    try {
      const body: Record<string, string> = {};

      // 2D는 항상 저장 (Canvas가 있으면)
      if (type === "2d" || type === "all") {
        const dataUrl = canvasHandle.current?.toDataURL();
        if (dataUrl) {
          body.snapshot_2d = dataUrl;
        } else if (type === "2d") {
          alert("2D 도면이 아직 렌더링되지 않았습니다.");
          return;
        }
      }

      // 3D는 이미지가 있을 때만 저장
      if (type === "3d" || type === "all") {
        if (image3dUrl) {
          body.snapshot_3d_url = image3dUrl;
        } else if (type === "3d") {
          alert("3D 이미지가 아직 생성되지 않았습니다.");
          return;
        }
      }

      if (Object.keys(body).length === 0) {
        alert("저장할 데이터가 없습니다.");
        return;
      }

      await simulationApi.put(`/sessions/${sessionId}/snapshot`, body);

      const saved = [];
      if (body.snapshot_2d) saved.push("2D 도면");
      if (body.snapshot_3d_url) saved.push("3D 이미지");
      setSaveMessage(`${saved.join(" + ")} 저장 완료!`);
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (err) {
      console.error("Snapshot save failed:", err);
      alert("저장에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsSaving(false);
    }
  }, [sessionId, isSaving, image3dUrl]);

  const tabMeta = TAB_COPY[activeTab];

  return (
    <div className={styles.page}>
      <div className={styles.pageGlow} aria-hidden="true" />

      <header className={styles.header}>
        <div style={{ display: "flex", gap: 8 }}>
          <button type="button" className={styles.backButton} onClick={() => navigate(-1)}>
            <FiArrowLeft size={18} />
            <span>이전으로</span>
          </button>
          <button type="button" className={styles.backButton} onClick={() => { sessionStorage.clear(); navigate("/"); }}>
            <span>메인으로</span>
          </button>
        </div>

        <div className={styles.headerText}>
          <div className={styles.headerBadge}>
            <img src={snowLogo} alt="" aria-hidden="true" className={styles.headerLogo} />
            <span>AI 배치 시뮬레이션</span>
          </div>
          <h1 className={styles.title}>추천 패키지 배치보기</h1>
          <p className={styles.subtitle}>
            도면을 선택하면 AI가 최적의 가전·가구 배치를 추천합니다.
          </p>
        </div>
      </header>

      <section className={styles.content}>
        <aside className={styles.summaryCard}>
          <span className={styles.summaryLabel}>선택한 패키지</span>
          <strong className={styles.summaryTitle}>{state?.packageTitle ?? "추천 패키지"}</strong>
          <p className={styles.summaryMeta}>
            {state?.packageTypeLabel ?? "PACKAGE"} / 구성 상품 {state?.itemCount ?? productIds.length}개
          </p>

          <div className={styles.selectedPlanCard}>
            <div className={styles.selectedPlanHeader}>
              <FiLayers size={16} />
              <span>현재 도면</span>
            </div>
            <strong className={styles.selectedPlanName}>{selectedPlan?.name ?? "미선택"}</strong>
            <p className={styles.selectedPlanCaption}>
              {selectedPlan ? formatCaption(selectedPlan) : "도면을 선택해 주세요"}
            </p>
          </div>

          <button
            type="button"
            className={styles.secondaryButton}
            onClick={() => setIsModalOpen(true)}
          >
            도면 다시 선택
          </button>

          {(() => {
            const allPlacements = Object.values(placementsMap).flat();
            const violations = allPlacements.filter((pl) => !pl.is_valid && pl.violations?.length);
            const hasIssues = autoPlaceWarnings.length > 0 || violations.length > 0;
            if (!hasIssues) return null;
            return (
              <div style={{
                marginTop: 12, padding: 12, borderRadius: 8,
                background: "#fff3e0", border: "1px solid #ffcc80",
                fontSize: 13, lineHeight: 1.5,
              }}>
                {autoPlaceWarnings.length > 0 ? (
                  <>
                    <strong style={{ color: "#e65100", display: "block", marginBottom: 4 }}>
                      배치 불가 ({autoPlaceWarnings.length}건)
                    </strong>
                    {autoPlaceWarnings.map((w, i) => (
                      <div key={`w-${i}`} style={{ color: "#bf360c", marginBottom: 2 }}>{w}</div>
                    ))}
                  </>
                ) : null}
                {violations.length > 0 ? (
                  <>
                    <strong style={{ color: "#c62828", display: "block", marginTop: autoPlaceWarnings.length > 0 ? 8 : 0, marginBottom: 4 }}>
                      배치 규칙 위반 ({violations.length}건)
                    </strong>
                    {violations.map((pl, i) => (
                      <div key={`v-${i}`} style={{ color: "#b71c1c", marginBottom: 2 }}>
                        {pl.product?.category ?? `제품 ${pl.product_id}`}: {pl.violations.join(", ")}
                      </div>
                    ))}
                  </>
                ) : null}
              </div>
            );
          })()}

          {/* 배치된 제품 목록 */}
          {(() => {
            const allPlacements = Object.values(placementsMap).flat();
            if (allPlacements.length === 0) return null;
            const ownedLabels = state?.ownedAppliances ?? [];
            // 라벨 → DB 카테고리 매핑 (차이가 있는 것만)
            const labelToCategory: Record<string, string> = {
              "건조기": "의류건조기", "스타일러": "의류관리기",
              "인덕션": "전기레인지", "전자레인지": "광파오븐/전자레인지", "오븐": "광파오븐/전자레인지",
            };
            const ownedCategories = ownedLabels.map((l) => labelToCategory[l] ?? l);
            const ownedSet = new Set([...ownedLabels, ...ownedCategories]);

            // 보유 가전 제품과 추천 제품 분리
            const owned: typeof allPlacements = [];
            const recommended: typeof allPlacements = [];
            for (const pl of allPlacements) {
              const cat = pl.product?.category ?? "";
              if (ownedSet.has(cat) || ownedSet.has(pl.product?.name ?? "")) {
                owned.push(pl);
              } else {
                recommended.push(pl);
              }
            }

            return (
              <div style={{ marginTop: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#415042", marginBottom: 6 }}>
                  배치된 제품 ({allPlacements.length}개)
                </div>
                {owned.length > 0 && (
                  <>
                    <div style={{ fontSize: 11, color: "#5a7a7a", marginBottom: 4 }}>보유 가전</div>
                    {owned.map((pl, i) => (
                      <div key={`owned-${i}`} style={{
                        display: "flex", alignItems: "center", gap: 6,
                        padding: "5px 8px", marginBottom: 3, borderRadius: 6,
                        background: "rgba(60, 93, 93, 0.08)", fontSize: 12,
                      }}>
                        <span style={{ background: "#3C5D5D", color: "#fff", padding: "1px 6px", borderRadius: 4, fontSize: 10, fontWeight: 600 }}>보유</span>
                        <span style={{ color: "#3C5D5D", fontWeight: 500 }}>{pl.product?.name ?? pl.product?.category ?? `제품 ${pl.product_id}`}</span>
                      </div>
                    ))}
                  </>
                )}
                {recommended.length > 0 && (
                  <>
                    <div style={{ fontSize: 11, color: "#7a8a7c", marginBottom: 4, marginTop: owned.length > 0 ? 8 : 0 }}>추천 제품</div>
                    {recommended.map((pl, i) => (
                      <div key={`rec-${i}`} style={{
                        display: "flex", alignItems: "center", gap: 6,
                        padding: "5px 8px", marginBottom: 3, borderRadius: 6,
                        background: "#f5f5f5", fontSize: 12,
                      }}>
                        <span style={{ color: "#555", fontWeight: 500 }}>{pl.product?.name ?? pl.product?.category ?? `제품 ${pl.product_id}`}</span>
                      </div>
                    ))}
                  </>
                )}
              </div>
            );
          })()}
        </aside>

        <main className={styles.canvasCard}>
          <div className={styles.canvasHeader}>
            <div className={styles.canvasHeaderLeft}>
              <div className={styles.tabList} role="tablist" aria-label="시뮬레이션 보기 선택">
                {(
                  [
                    ["floor2d", "2D 평면도"],
                    ["image3d", "3D 이미지"],
                    ["cart", "장바구니"],
                  ] as const
                ).map(([tabId, label]) => {
                  const isActive = activeTab === tabId;

                  return (
                    <button
                      key={tabId}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      className={`${styles.tabButton} ${isActive ? styles.tabButtonActive : ""}`}
                      onClick={() => setActiveTab(tabId)}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
              <p className={styles.tabDescription}>{tabMeta.description}</p>
            </div>

            <div className={styles.canvasHeaderActions}>
              <button
                type="button"
                className={styles.headerActionBtn}
                onClick={handleGenerateOrNext}
                disabled={!sessionId || isGeneratingLayouts}
              >
                <FiLayers size={16} />
                <span>
                  {isGeneratingLayouts
                    ? "생성 중..."
                    : layouts.length > 0
                      ? `다음 배치안 (${currentLayoutIdx + 1}/${layouts.length})`
                      : "AI 배치안 보기"}
                </span>
              </button>
              <button
                type="button"
                className={styles.headerActionBtn}
                onClick={handleGenerate3d}
                disabled={!sessionId || isGenerating3d || Object.keys(placementsMap).length === 0 || gen3dCount >= MAX_3D_GENERATIONS}
              >
                <FiBox size={16} />
                <span>{isGenerating3d ? "생성 중..." : gen3dCount >= MAX_3D_GENERATIONS ? `3D 변환 완료 (${MAX_3D_GENERATIONS}/${MAX_3D_GENERATIONS})` : `3D 변환하기 (${gen3dCount}/${MAX_3D_GENERATIONS})`}</span>
              </button>
              <div className={styles.canvasStatus}>
                <span className={styles.statusDot} />
                <span>
                  {isAutoPlacing
                    ? "자동 배치 중..."
                    : Object.keys(placementsMap).length > 0
                      ? `배치 완료 (${Object.values(placementsMap).flat().length}개 제품)`
                      : sessionId
                        ? "도면 데이터 연결됨"
                        : "도면 데이터 연결 전"}
                </span>
              </div>
            </div>
          </div>

          <div className={styles.canvasArea}>
            {(isAutoPlacing || isGeneratingLayouts || isGenerating3d) ? (
              <div className={styles.loadingOverlay}>
                <div className={styles.loadingSpinner} />
                <div className={styles.loadingTitle}>
                  {isGenerating3d
                    ? "AI가 3D 이미지를 생성하고 있습니다"
                    : isGeneratingLayouts
                      ? "AI가 배치안을 비교 분석하고 있습니다"
                      : "AI가 최적 배치를 계산하고 있습니다"}
                </div>
                <div className={styles.loadingSubtitle}>
                  {isGenerating3d
                    ? "약 60~90초 소요됩니다. 잠시만 기다려 주세요."
                    : isGeneratingLayouts
                      ? "5개의 배치안을 생성하고 AI가 평가합니다. 약 10~20초 소요됩니다."
                      : "도면 구조와 제품 특성을 분석하여 최적의 위치를 찾고 있습니다."}
                </div>
              </div>
            ) : null}

            {/* Canvas는 항상 렌더링 (저장 시 toDataURL 필요), 2D 탭 아닐 때는 숨김 */}
            <div style={{ display: activeTab === "floor2d" ? "flex" : "none", gap: 16, height: "100%" }}>
              <div className={styles.roomFrame} style={{ flex: 1, minWidth: 0 }}>
                <FloorPlanCanvas
                  ref={canvasHandle}
                  floorPlan={floorPlanDetail ?? null}
                  placements={placementsMap}
                  selectedRoomId={null}
                  onPlacementMove={handlePlacementMove}
                  onPlacementMoveEnd={handlePlacementMoveEnd}
                  onPlacementRotate={handlePlacementRotate}
                  onPlacementRoomChange={handlePlacementRoomChange}
                />
              </div>

                {currentLayoutIdx >= 0 && layouts[currentLayoutIdx] ? (() => {
                  const layout = layouts[currentLayoutIdx];
                  const ranking = aiRankings.find((r) => r.layout_id === layout.id);
                  return (
                    <div style={{
                      width: 280, flexShrink: 0,
                      display: "flex", flexDirection: "column", gap: 12,
                      padding: 16, borderRadius: 12,
                      background: "#fafbfc", border: "1px solid #e5e7eb",
                      overflowY: "auto", fontSize: 13, lineHeight: 1.6,
                    }}>
                      <div>
                        <div style={{ fontSize: 11, color: "#888", marginBottom: 4 }}>AI 배치 평가</div>
                        <strong style={{ fontSize: 16, color: "#1565c0" }}>
                          {layout.name}
                        </strong>
                      </div>

                      <div style={{
                        display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8,
                      }}>
                        <div style={{ padding: "8px 10px", borderRadius: 8, background: "#e8f4fd", textAlign: "center" }}>
                          <div style={{ fontSize: 20, fontWeight: 700, color: "#1565c0" }}>
                            {layout.metrics.total.toFixed(0)}
                          </div>
                          <div style={{ fontSize: 11, color: "#666" }}>종합점수</div>
                        </div>
                        {ranking ? (
                          <div style={{ padding: "8px 10px", borderRadius: 8, background: "#f3e8fd", textAlign: "center" }}>
                            <div style={{ fontSize: 20, fontWeight: 700, color: "#7b1fa2" }}>
                              {ranking.score}
                            </div>
                            <div style={{ fontSize: 11, color: "#666" }}>AI 점수</div>
                          </div>
                        ) : null}
                      </div>

                      <div style={{
                        display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, fontSize: 12,
                      }}>
                        {[
                          ["공간활용", layout.metrics.space_usage],
                          ["동선", layout.metrics.circulation],
                          ["균형", layout.metrics.wall_balance],
                          ["개방감", layout.metrics.center_openness],
                          ["쌍배치", layout.metrics.pair_satisfaction],
                          ["전면배치", layout.metrics.front_zone],
                        ].map(([label, val]) => (
                          <div key={label as string} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: "1px solid #eee" }}>
                            <span style={{ color: "#666" }}>{label}</span>
                            <strong style={{ color: (val as number) >= 80 ? "#2e7d32" : (val as number) >= 50 ? "#e65100" : "#c62828" }}>
                              {(val as number).toFixed(0)}
                            </strong>
                          </div>
                        ))}
                      </div>

                      {ranking ? (
                        <>
                          <div style={{ padding: 10, borderRadius: 8, background: "#e8f5e9" }}>
                            <strong style={{ color: "#2e7d32", fontSize: 12, display: "block", marginBottom: 4 }}>장점</strong>
                            <span style={{ color: "#333" }}>{ranking.pros}</span>
                          </div>
                          <div style={{ padding: 10, borderRadius: 8, background: "#fbe9e7" }}>
                            <strong style={{ color: "#c62828", fontSize: 12, display: "block", marginBottom: 4 }}>단점</strong>
                            <span style={{ color: "#333" }}>{ranking.cons}</span>
                          </div>
                        </>
                      ) : null}

                      <div style={{ fontSize: 11, color: "#aaa", textAlign: "center" }}>
                        {currentLayoutIdx + 1} / {layouts.length} 배치안
                      </div>

                      <button
                        type="button"
                        onClick={() => handleSaveSnapshot("all")}
                        disabled={isSaving || !sessionId}
                        style={{
                          marginTop: 12, width: "auto", minHeight: 36, marginLeft: "auto",
                          borderRadius: 8, border: "none", cursor: "pointer",
                          padding: "0 16px",
                          background: "#3C5D5D", color: "#fff",
                          fontSize: 13, fontWeight: 600,
                          display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                          opacity: isSaving || !sessionId ? 0.5 : 1,
                        }}
                      >
                        <FiSave size={16} />
                        {isSaving ? "저장 중..." : "저장하기"}
                      </button>
                      {saveMessage && (
                        <div style={{ color: "#2e7d32", fontSize: 12, textAlign: "center", marginTop: 4 }}>
                          ✓ {saveMessage}
                        </div>
                      )}
                    </div>
                  );
                })() : null}
            </div>

            {activeTab === "image3d" ? (
              <div className={styles.preview3D}>
                {isGenerating3d ? (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 12 }}>
                    <FiLoader size={32} />
                    <strong>AI가 3D 이미지를 생성하고 있습니다...</strong>
                    <p style={{ color: "#888", fontSize: 13 }}>약 15~30초 소요됩니다.</p>
                  </div>
                ) : image3dUrl ? (
                  <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column" }}>
                    <img
                      src={image3dUrl}
                      alt="3D 렌더링 이미지"
                      style={{ width: "100%", flex: 1, objectFit: "contain", borderRadius: 8 }}
                    />
                    <div style={{ display: "flex", justifyContent: "center", gap: 8, padding: "8px 0" }}>
                      <button
                        type="button"
                        className={styles.secondaryButton}
                        style={{ flex: 1, maxWidth: 200 }}
                        onClick={handleGenerate3d}
                        disabled={isGenerating3d}
                      >
                        다시 생성
                      </button>
                      <button
                        type="button"
                        style={{
                          flex: 1, maxWidth: 200, padding: "8px 20px", borderRadius: 8,
                          background: "#3C5D5D", color: "#fff", border: "none",
                          fontSize: 13, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap",
                        }}
                        onClick={() => handleSaveSnapshot("all")}
                        disabled={isSaving}
                      >
                        {isSaving ? "저장 중..." : "저장하기"}
                      </button>
                    </div>
                    {saveMessage && (
                      <div style={{ color: "#2e7d32", fontSize: 13, textAlign: "center", padding: "4px 0", fontWeight: 600 }}>
                        ✓ {saveMessage}
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 12 }}>
                    <FiBox size={48} style={{ color: "#ccc" }} />
                    <strong>3D 이미지 미리보기</strong>
                    <p style={{ color: "#888", fontSize: 13, textAlign: "center" }}>
                      상단의 "3D 변환하기" 버튼을 클릭하면<br />
                      현재 배치를 기반으로 AI가 3D 이미지를 생성합니다.
                    </p>
                  </div>
                )}
              </div>
            ) : null}

            {activeTab === "cart" ? (() => {
              const placedProducts = placedProductsForSale;

              return (
                <div className={styles.cartView}>
                  <div className={styles.cartList}>
                    {placedProducts.length === 0 ? (
                      <div style={{ padding: 32, textAlign: "center", color: "#999" }}>
                        배치된 제품이 없습니다. 도면을 선택하고 배치를 실행해 주세요.
                      </div>
                    ) : (
                      placedProducts.map((product, idx) => (
                        <div key={`${product.product_id}-${idx}`} className={styles.cartItem}>
                          <div
                            className={styles.cartItemThumb}
                            style={product.image_url ? {
                              backgroundImage: `url(${product.image_url})`,
                              backgroundSize: "cover",
                              backgroundPosition: "center",
                            } : undefined}
                          />
                          <div className={styles.cartItemContent}>
                            <strong>{product.name}</strong>
                            <span>{product.category}</span>
                          </div>
                          <div className={styles.cartItemPrice} style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2 }}>
                            {product.list_price && product.list_price > (product.price ?? 0) ? (
                              <>
                                <span style={{ textDecoration: "line-through", color: "#aaa", fontSize: 12 }}>
                                  {formatPrice(product.list_price)}
                                </span>
                                <span style={{ color: "#e53935", fontWeight: 700 }}>
                                  {formatPrice(product.price)}
                                </span>
                              </>
                            ) : (
                              <span style={{ fontWeight: 700 }}>{formatPrice(product.price)}</span>
                            )}
                            {product.subscriptionPrice > 0 && (
                              <span style={{ fontSize: 12, color: "#3C5D5D", fontWeight: 600 }}>
                                월 {product.subscriptionPrice.toLocaleString()}원
                              </span>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className={styles.cartSummary}>
                    <span className={styles.cartSummaryLabel}>장바구니 요약</span>
                    <strong className={styles.cartSummaryTitle}>
                      {state?.packageTitle ?? "추천 패키지"} 구성
                    </strong>
                    <div style={{ borderBottom: "1px solid #eee", paddingBottom: 8, marginBottom: 8 }}>
                      <div className={styles.cartSummaryRow}>
                        <span>정가 합계</span>
                        <strong style={{ textDecoration: totalPrice < totalListPrice ? "line-through" : "none", color: "#999" }}>
                          {formatPrice(totalListPrice)}
                        </strong>
                      </div>
                      <div className={styles.cartSummaryRow}>
                        <span>할인가 합계</span>
                        <strong style={{ color: "#e53935" }}>{formatPrice(totalPrice)}</strong>
                      </div>
                    </div>
                    {totalSubscription > 0 && (
                      <div style={{ borderBottom: "1px solid #eee", paddingBottom: 8, marginBottom: 8 }}>
                        <div className={styles.cartSummaryRow}>
                          <span>가전 구독</span>
                          <strong style={{ color: "#3C5D5D" }}>월 {totalSubscription.toLocaleString()}원</strong>
                        </div>
                      </div>
                    )}
                    {nonSubTotal > 0 && (
                      <div style={{ borderBottom: "1px solid #eee", paddingBottom: 8, marginBottom: 8 }}>
                        <div className={styles.cartSummaryRow}>
                          <span>일시불 합계</span>
                          <strong>{formatPrice(nonSubTotal)}</strong>
                        </div>
                      </div>
                    )}
                    <div className={styles.cartSummaryRow}>
                      <span>배치 상품 수</span>
                      <strong>{placedProducts.length}개</strong>
                    </div>

                    <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                      {/* 일시불 */}
                      <div style={{
                        flex: 1, borderRadius: 10, border: "1px solid #ddd", padding: "14px 12px",
                        display: "flex", flexDirection: "column", alignItems: "center", gap: 6, background: "#fafafa",
                      }}>
                        <span style={{ fontSize: 11, color: "#888", fontWeight: 600 }}>일시불 구매</span>
                        <strong style={{ fontSize: 18, color: "#222" }}>{formatPrice(totalPrice)}</strong>
                        <span style={{ fontSize: 11, color: "#aaa" }}>한 번에 결제</span>
                        <button
                          type="button"
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setPaymentType("lump"); setIsPaymentOpen(true); }}
                          disabled={placedProducts.length === 0}
                          style={{
                            marginTop: 6, width: "100%", padding: "8px 0",
                            borderRadius: 8, border: "1px solid #3C5D5D", cursor: "pointer",
                            background: "#fff", color: "#3C5D5D",
                            fontSize: 13, fontWeight: 700,
                            opacity: placedProducts.length === 0 ? 0.4 : 1,
                          }}
                        >
                          일시불 구매
                        </button>
                      </div>

                      {/* 구독 */}
                      <div style={{
                        flex: 1, borderRadius: 10, border: "2px solid #3C5D5D", padding: "14px 12px",
                        display: "flex", flexDirection: "column", alignItems: "center", gap: 6, background: "#f0f5f5",
                      }}>
                        <span style={{ fontSize: 11, color: "#3C5D5D", fontWeight: 700 }}>구독 + 일시불</span>
                        {totalSubscription > 0 ? (
                          <>
                            <strong style={{ fontSize: 18, color: "#3C5D5D" }}>월 {totalSubscription.toLocaleString()}원</strong>
                            {nonSubTotal > 0 && (
                              <span style={{ fontSize: 11, color: "#666" }}>+ 일시불 {formatPrice(nonSubTotal)}</span>
                            )}
                          </>
                        ) : (
                          <strong style={{ fontSize: 18, color: "#3C5D5D" }}>{formatPrice(totalPrice)}</strong>
                        )}
                        <button
                          type="button"
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setPaymentType("subscription"); setIsPaymentOpen(true); }}
                          disabled={placedProducts.length === 0}
                          style={{
                            marginTop: 6, width: "100%", padding: "8px 0",
                            borderRadius: 8, border: "none", cursor: "pointer",
                            background: "#3C5D5D", color: "#fff",
                            fontSize: 13, fontWeight: 700,
                            opacity: placedProducts.length === 0 ? 0.4 : 1,
                          }}
                        >
                          구독 구매
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })() : null}
          </div>
        </main>
      </section>

      {isModalOpen ? (() => {
        const categories = ["전체", ...Array.from(new Set(floorPlans.map((p) => p.category)))];
        const filteredPlans = (planCategory === "전체"
          ? floorPlans
          : floorPlans.filter((p) => p.category === planCategory)
        ).slice().sort((a, b) => (a.total_area_m2 ?? 0) - (b.total_area_m2 ?? 0));

        return (
        <div className={styles.modalBackdrop}>
          <div
            className={styles.modalCard}
            role="dialog"
            aria-modal="true"
            aria-labelledby="floor-plan-title"
            style={{ maxHeight: "85vh", display: "flex", flexDirection: "column" }}
          >
            <div className={styles.modalHeader}>
              <span className={styles.modalEyebrow}>STEP 1</span>
              <h2 id="floor-plan-title" className={styles.modalTitle}>
                도면을 선택해 주세요
              </h2>
              <p className={styles.modalDescription}>
                {isLoadingPlans
                  ? "도면 목록을 불러오는 중입니다..."
                  : "거주 유형을 선택한 뒤 원하는 평면도를 골라주세요."}
              </p>

              <div className={styles.tabList} role="tablist" aria-label="거주 유형 선택" style={{ marginTop: 12 }}>
                {categories.map((cat) => {
                  const isActive = planCategory === cat;
                  const count = cat === "전체" ? floorPlans.length : floorPlans.filter((p) => p.category === cat).length;
                  return (
                    <button
                      key={cat}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      className={`${styles.tabButton} ${isActive ? styles.tabButtonActive : ""}`}
                      onClick={() => setPlanCategory(cat)}
                    >
                      {cat} ({count})
                    </button>
                  );
                })}
              </div>
            </div>

            <div className={styles.optionGrid} style={{ overflowY: "auto", flex: 1 }}>
              {isLoadingPlans ? (
                <div className={styles.optionCard} style={{ justifyContent: "center", alignItems: "center" }}>
                  <FiLoader size={24} />
                  <span>불러오는 중...</span>
                </div>
              ) : (
                filteredPlans.map((plan) => {
                  const isSelected = plan.id === (selectedPlanId ?? filteredPlans[0]?.id);

                  return (
                    <button
                      key={plan.id}
                      type="button"
                      className={`${styles.optionCard} ${isSelected ? styles.optionCardSelected : ""}`}
                      onClick={() => setSelectedPlanId(plan.id)}
                    >
                      <div className={styles.optionPreview}>
                        {floorPlanImages[plan.id] ? (
                          <img
                            src={floorPlanImages[plan.id]}
                            alt={plan.name}
                            className={styles.optionPreviewImage}
                          />
                        ) : (
                          plan.rooms.slice(0, 3).map((room) => (
                            <div
                              key={room.id}
                              className={
                                room.room_type === "living"
                                  ? styles.optionPreviewRoomLarge
                                  : room.room_type === "kitchen"
                                    ? styles.optionPreviewRoomMedium
                                    : styles.optionPreviewRoomSmall
                              }
                            />
                          ))
                        )}
                      </div>
                      <div className={styles.optionText}>
                        <strong>{plan.name}</strong>
                        <span>{formatCaption(plan)}</span>
                      </div>
                      {isSelected ? (
                        <span className={styles.optionCheck}>
                          <FiCheck size={14} />
                          선택됨
                        </span>
                      ) : null}
                    </button>
                  );
                })
              )}
            </div>

            <div className={styles.modalActions} style={{ display: "flex", gap: 8 }}>
              <button
                type="button"
                className={styles.primaryButton}
                onClick={handleConfirmPlan}
                disabled={createSession.isPending || isLoadingPlans}
              >
                {createSession.isPending ? "세션 생성 중..." : "이 도면으로 시작하기"}
              </button>
            </div>
          </div>
        </div>
        );
      })() : null}

      {/* 챗봇 아이콘 제거됨 */}

      {isPaymentOpen && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 9999,
          background: "rgba(0,0,0,0.5)", display: "flex",
          alignItems: "center", justifyContent: "center",
        }}>
          <div style={{
            background: "#fff", borderRadius: 16, padding: 32,
            width: "100%", maxWidth: 480, maxHeight: "90vh",
            overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
          }}>
            {paymentStep === "confirm" && (
              <>
                <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>
                  {paymentType === "subscription" ? "구독 주문 확인" : "일시불 주문 확인"}
                </h2>
                <p style={{ color: "#888", fontSize: 14, marginBottom: 20 }}>선택하신 제품을 확인해주세요</p>

                <div style={{ maxHeight: 240, overflowY: "auto", marginBottom: 20 }}>
                  {placedProductsForSale.map((p, i) => (
                    <div key={i} style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      padding: "10px 0", borderBottom: "1px solid #f0f0f0",
                    }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{p.name}</div>
                        <div style={{ color: "#888", fontSize: 12 }}>{p.category}</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        {paymentType === "subscription" && p.subscriptionPrice && p.subscriptionPrice > 0 ? (
                          <>
                            <div style={{ fontWeight: 700, fontSize: 14, color: "#3C5D5D" }}>월 {p.subscriptionPrice.toLocaleString()}원</div>
                          </>
                        ) : (
                          <div style={{ fontWeight: 700, fontSize: 14 }}>{formatPrice(p.price)}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{
                  background: "#f8f9fa", borderRadius: 10, padding: 16, marginBottom: 20,
                }}>
                  {paymentType === "subscription" ? (
                    <>
                      {totalSubscription > 0 && (
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                          <span style={{ color: "#3C5D5D", fontWeight: 600 }}>가전 구독 (월)</span>
                          <strong style={{ color: "#3C5D5D", fontSize: 18 }}>월 {totalSubscription.toLocaleString()}원</strong>
                        </div>
                      )}
                      {nonSubTotal > 0 && (
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                          <span style={{ color: "#888" }}>일시불 제품 합계</span>
                          <span style={{ fontWeight: 600 }}>{formatPrice(nonSubTotal)}</span>
                        </div>
                      )}
                      <div style={{
                        display: "flex", justifyContent: "space-between",
                        borderTop: "1px solid #e0e0e0", paddingTop: 8,
                      }}>
                        <span style={{ fontWeight: 700, fontSize: 16 }}>결제 금액</span>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontWeight: 700, fontSize: 18, color: "#3C5D5D" }}>월 {totalSubscription.toLocaleString()}원</div>
                          {nonSubTotal > 0 && (
                            <div style={{ fontSize: 12, color: "#888" }}>+ 일시불 {formatPrice(nonSubTotal)}</div>
                          )}
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      {totalListPrice > totalPrice && totalPrice > 0 && (
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                          <span style={{ color: "#888" }}>정가 합계</span>
                          <span style={{ textDecoration: "line-through", color: "#aaa" }}>{formatPrice(totalListPrice)}</span>
                        </div>
                      )}
                      {totalListPrice > totalPrice && totalPrice > 0 && (
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                          <span style={{ color: "#e53935" }}>할인</span>
                          <span style={{ color: "#e53935", fontWeight: 600 }}>-{formatPrice(totalListPrice - totalPrice)}</span>
                        </div>
                      )}
                      <div style={{
                        display: "flex", justifyContent: "space-between",
                        borderTop: totalListPrice > totalPrice ? "1px solid #e0e0e0" : "none",
                        paddingTop: totalListPrice > totalPrice ? 8 : 0,
                      }}>
                        <span style={{ fontWeight: 700, fontSize: 16 }}>결제 금액</span>
                        <span style={{ fontWeight: 700, fontSize: 18, color: "#3C5D5D" }}>{formatPrice(totalPrice)}</span>
                      </div>
                    </>
                  )}
                </div>

                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    type="button"
                    onClick={() => { setIsPaymentOpen(false); setPaymentStep("confirm"); }}
                    style={{
                      flex: 1, minHeight: 48, borderRadius: 10,
                      border: "1px solid #ddd", background: "#fff",
                      fontSize: 15, fontWeight: 600, cursor: "pointer",
                    }}
                  >
                    취소
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentStep("processing");
                      setTimeout(() => setPaymentStep("done"), 2000);
                    }}
                    style={{
                      flex: 2, minHeight: 48, borderRadius: 10,
                      border: "none", background: "#3C5D5D", color: "#fff",
                      fontSize: 15, fontWeight: 700, cursor: "pointer",
                    }}
                  >
                    {paymentType === "subscription" ? "구독 결제하기" : "일시불 결제하기"}
                  </button>
                </div>
              </>
            )}

            {paymentStep === "processing" && (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <FiLoader size={40} style={{ animation: "spin 1s linear infinite", color: "#3C5D5D" }} />
                <p style={{ marginTop: 16, fontSize: 16, fontWeight: 600 }}>결제 처리 중...</p>
                <p style={{ color: "#888", fontSize: 14 }}>잠시만 기다려주세요</p>
              </div>
            )}

            {paymentStep === "done" && (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <div style={{
                  width: 64, height: 64, borderRadius: "50%",
                  background: "#3C5D5D", color: "#fff",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 16px", fontSize: 28,
                }}>
                  ✓
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>결제가 완료되었습니다</h3>
                <p style={{ color: "#888", fontSize: 14, marginBottom: 24 }}>
                  {placedProductsForSale.length}개 제품 · {paymentType === "subscription" && totalSubscription > 0
                    ? `월 ${totalSubscription.toLocaleString()}원${nonSubTotal > 0 ? ` + 일시불 ${formatPrice(nonSubTotal)}` : ""}`
                    : `총 ${formatPrice(totalPrice)}`
                  }
                </p>
                <button
                  type="button"
                  onClick={() => { setIsPaymentOpen(false); setPaymentStep("confirm"); }}
                  style={{
                    minHeight: 44, padding: "0 32px", borderRadius: 10,
                    border: "none", background: "#3C5D5D", color: "#fff",
                    fontSize: 15, fontWeight: 700, cursor: "pointer",
                  }}
                >
                  확인
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Simulation;
