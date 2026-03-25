import { useState, useCallback, useRef, type FormEvent } from "react";
import {
  FiArrowLeft,
  FiArrowUp,
  FiBox,
  FiCheck,
  FiChevronDown,
  FiLayers,
  FiLoader,
  FiPlus,
  FiSave,
} from "react-icons/fi";
import { useLocation, useNavigate } from "react-router-dom";
import { useFloorPlans, useFloorPlan, useCreateSession } from "@/hooks/useSimulation";
import simulationApi from "@/services/simulationApi";
import type { FloorPlan, FloorPlanRoom, Placement, AutoPlaceResponse, GenerateLayoutsResponse, LayoutOption, AiRanking } from "@/types/simulation";
import FloorPlanCanvas from "@/components/FloorPlanCanvas/FloorPlanCanvas";
import type { FloorPlanCanvasHandle } from "@/components/FloorPlanCanvas/FloorPlanCanvas";
import { validatePlacement } from "@/utils/placementValidator";
import chatbotIcon from "../../assets/images/chatbot_icon.png";
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

type SimulationState = {
  packageTitle?: string;
  packageTypeLabel?: string;
  itemCount?: number;
  productIds?: number[];
  interiorStyle?: string;
  ownedAppliances?: string[];
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
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as SimulationState | null) ?? null;
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [planCategory, setPlanCategory] = useState<string>("원룸");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInputValue, setChatInputValue] = useState("");
  const [activeTab, setActiveTab] = useState<SimulationTab>("floor2d");
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [placementsMap, setPlacementsMap] = useState<Record<number, Placement[]>>({});
  const [autoPlaceWarnings, setAutoPlaceWarnings] = useState<string[]>([]);
  const [isAutoPlacing, setIsAutoPlacing] = useState(false);
  const [layouts, setLayouts] = useState<LayoutOption[]>([]);
  const [aiRankings, setAiRankings] = useState<AiRanking[]>([]);
  const [currentLayoutIdx, setCurrentLayoutIdx] = useState(-1); // -1 = 초기 auto-place
  const [image3dUrl, setImage3dUrl] = useState<string | null>(null);
  const [isGenerating3d, setIsGenerating3d] = useState(false);
  const [isGeneratingLayouts, setIsGeneratingLayouts] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const canvasHandle = useRef<FloorPlanCanvasHandle>(null);

  const productIds = state?.productIds ?? TEST_PRODUCT_IDS;

  const { data: floorPlans = [], isLoading: isLoadingPlans } = useFloorPlans();
  const { data: floorPlanDetail } = useFloorPlan(selectedPlanId);
  const createSession = useCreateSession();

  const selectedPlan = floorPlans.find((p) => p.id === selectedPlanId) ?? floorPlans[0] ?? null;

  const handleRoomClick = useCallback((room: FloorPlanRoom) => {
    setSelectedRoomId(room.id);
  }, []);

  const handlePlacementMove = useCallback(
    (roomId: number, index: number, xMm: number, yMm: number) => {
      setPlacementsMap((prev) => {
        const roomPls = prev[roomId];
        if (!roomPls || !roomPls[index]) return prev;
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

      const violations = validatePlacement(pl, room, others);

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
    },
    [floorPlanDetail, placementsMap],
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
        const violations = validatePlacement(rotated, room, others);

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
      { floor_plan_id: planId, session_name: `session-${planId}` },
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
    setIsGenerating3d(true);
    setActiveTab("image3d");
    try {
      // 2D Canvas 이미지를 캡처하여 참조 이미지로 전송
      const canvasImage = canvasHandle.current?.toDataURL() ?? null;
      const { data } = await simulationApi.post<{ image_url: string }>(
        `/sessions/${sessionId}/generate-3d`,
        { canvas_image: canvasImage, interior_style: state?.interiorStyle ?? null },
        { timeout: 120_000 },
      );
      setImage3dUrl(data.image_url);
    } catch (err) {
      console.error("3D generation failed:", err);
      setImage3dUrl(null);
      alert("3D 이미지 생성에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsGenerating3d(false);
    }
  }, [sessionId]);

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

  const handleChatSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setChatInputValue((prev) => prev.trim());
  };

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
          <button type="button" className={styles.backButton} onClick={() => navigate("/")}>
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
            도면도를 선택하면 AI가 최적의 가전·가구 배치를 추천합니다.
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
              <span>현재 도면도</span>
            </div>
            <strong className={styles.selectedPlanName}>{selectedPlan?.name ?? "미선택"}</strong>
            <p className={styles.selectedPlanCaption}>
              {selectedPlan ? formatCaption(selectedPlan) : "도면도를 선택해 주세요"}
            </p>
          </div>

          <button
            type="button"
            className={styles.secondaryButton}
            onClick={() => setIsModalOpen(true)}
          >
            도면도 다시 선택
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
                    <div style={{ fontSize: 11, color: "#7a8a7c", marginBottom: 4 }}>보유 가전</div>
                    {owned.map((pl, i) => (
                      <div key={`owned-${i}`} style={{
                        display: "flex", alignItems: "center", gap: 6,
                        padding: "5px 8px", marginBottom: 3, borderRadius: 6,
                        background: "#e8f5e9", fontSize: 12,
                      }}>
                        <span style={{ background: "#66bb6a", color: "#fff", padding: "1px 6px", borderRadius: 4, fontSize: 10, fontWeight: 600 }}>보유</span>
                        <span style={{ color: "#2e7d32", fontWeight: 500 }}>{pl.product?.name ?? pl.product?.category ?? `제품 ${pl.product_id}`}</span>
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
                disabled={!sessionId || isGenerating3d || Object.keys(placementsMap).length === 0}
              >
                <FiBox size={16} />
                <span>{isGenerating3d ? "생성 중..." : "3D 변환하기"}</span>
              </button>
              <button
                type="button"
                className={`${styles.headerActionBtn} ${styles.headerActionPrimary}`}
                onClick={() => handleSaveSnapshot("all")}
                disabled={isSaving || !sessionId}
              >
                <FiSave size={16} />
                <span>{isSaving ? "저장 중..." : "저장하기"}</span>
              </button>
              {saveMessage && (
                <span style={{ color: "#2e7d32", fontSize: 13, fontWeight: 500, marginLeft: 8 }}>
                  ✓ {saveMessage}
                </span>
              )}
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
                  selectedRoomId={selectedRoomId}
                  onRoomClick={handleRoomClick}
                  onPlacementMove={handlePlacementMove}
                  onPlacementMoveEnd={handlePlacementMoveEnd}
                  onPlacementRotate={handlePlacementRotate}
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
                        onClick={handleGenerate3d}
                        disabled={isGenerating3d}
                      >
                        다시 생성하기
                      </button>
                    </div>
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
              const ownedLabelsCart = state?.ownedAppliances ?? [];
              const labelToCat: Record<string, string> = {
                "건조기": "의류건조기", "스타일러": "의류관리기",
                "인덕션": "전기레인지", "전자레인지": "광파오븐/전자레인지", "오븐": "광파오븐/전자레인지",
              };
              const ownedCats = new Set([...ownedLabelsCart, ...ownedLabelsCart.map((l) => labelToCat[l] ?? l)]);
              const allPlacements = Object.values(placementsMap).flat();
              const placedProducts = allPlacements
                .map((pl) => pl.product)
                .filter((p): p is NonNullable<typeof p> => p != null)
                .filter((p) => !ownedCats.has(p.category) && !ownedCats.has(p.name));
              const totalPrice = placedProducts.reduce((sum, p) => sum + (p.price ?? 0), 0);
              const totalListPrice = placedProducts.reduce((sum, p) => sum + (p.list_price ?? 0), 0);

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
                          <div className={styles.cartItemPrice}>
                            {formatPrice(product.price)}
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
                    {totalListPrice > totalPrice && totalPrice > 0 ? (
                      <div className={styles.cartSummaryRow}>
                        <span>정가 합계</span>
                        <strong style={{ textDecoration: "line-through", color: "#999" }}>
                          {formatPrice(totalListPrice)}
                        </strong>
                      </div>
                    ) : null}
                    <div className={styles.cartSummaryRow}>
                      <span>할인가 합계</span>
                      <strong style={{ color: "#4a6cf7" }}>{formatPrice(totalPrice)}</strong>
                    </div>
                    <div className={styles.cartSummaryRow}>
                      <span>배치 상품 수</span>
                      <strong>{placedProducts.length}개</strong>
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
                도면도를 선택해 주세요
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
                {createSession.isPending ? "세션 생성 중..." : "이 도면도로 시작하기"}
              </button>
            </div>
          </div>
        </div>
        );
      })() : null}

      <div className={styles.floatingChatbot}>
        {isChatOpen ? (
          <div className={styles.chatPanel}>
            <div className={styles.chatPanelHeader}>
              <div className={styles.chatPanelTitle}>챗봇</div>
              <button
                type="button"
                className={styles.chatCollapseBtn}
                aria-label="챗봇 닫기"
                onClick={() => setIsChatOpen(false)}
              >
                <FiChevronDown size={20} />
              </button>
            </div>

            <div className={styles.chatMessages}>
              <div className={styles.chatRow}>
                <div className={styles.chatAvatar}>
                  <img src={snowLogo} alt="챗봇 아이콘" className={styles.chatAvatarImage} />
                </div>
                <div className={styles.chatBubble}>
                  선택한 도면도 위에서 배치 시뮬레이션을 이어갈 수 있어요.
                  <br />
                  지금은 챗봇 패널이 화면을 덮는 방식으로 올라오고, 시뮬레이션 레이아웃은 그대로
                  유지됩니다.
                  <br />
                  이후 실제 데이터가 연결되면 배치 추천 흐름을 여기서 계속 확장할 수 있어요.
                </div>
              </div>
            </div>

            <form className={styles.chatInputBar} onSubmit={handleChatSubmit}>
              <div className={styles.chatInputWrap}>
                <button type="button" className={styles.chatIconBtn} aria-label="추가">
                  <FiPlus size={20} />
                </button>
                <input
                  className={styles.chatInput}
                  value={chatInputValue}
                  onChange={(event) => setChatInputValue(event.target.value)}
                  placeholder="궁금한 배치 조건이나 요청을 입력해 주세요"
                  aria-label="추가 질문 입력"
                />
                <button type="submit" className={styles.chatSendBtn} aria-label="전송">
                  <FiArrowUp size={18} />
                </button>
              </div>
            </form>
          </div>
        ) : (
          <button
            type="button"
            className={styles.chatToggleBtn}
            aria-label="챗봇 열기"
            onClick={() => setIsChatOpen(true)}
          >
            <img src={chatbotIcon} alt="" className={styles.chatToggleIcon} aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );
}

export default Simulation;
