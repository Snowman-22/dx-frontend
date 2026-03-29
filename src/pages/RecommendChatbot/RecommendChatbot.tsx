import { useEffect, useRef, useState, useCallback, type FormEvent } from "react";
import { FiArrowUp, FiChevronDown, FiHome, FiPlus, FiShoppingCart } from "react-icons/fi";
import { useLocation, useNavigate } from "react-router-dom";
import chatbotIcon from "../../assets/images/chatbot_icon.png";
import snowLogo from "../../assets/images/snow_logo.png";
import {
  connectStomp,
  subscribeTopic,
  sendRecommendRag,
} from "@/services/chatService";
import type { RecommendationsPageResponse } from "@/services/chatService";
import styles from "./RecommendChatbot.module.css";

type RecommendAppliance = {
  product_id: number;
  modelId: string;
  name: string;
  category: string;
  totalPrice: number;
  subscriptionPrice: number;
  image: string;
  productUrl: string;
  popularityScore: number;
};

type RecommendFurniture = {
  product_id: number;
  name: string;
  category: string;
  price: number;
  image: string;
  productUrl: string;
};

type RecommendPackage = {
  id: number;
  title: string;
  typeLabel: string;
  appliances: RecommendAppliance[];
  furniture: RecommendFurniture[];
  recommendationReason: string;
  recommendationPlus: string | null;
};

type ChatMessage = {
  id: string;
  role: "assistant" | "user";
  text: string;
};

type PackageSortType = "default" | "price" | "popularity";

const formatPrice = (price: number) => `${price.toLocaleString("ko-KR")}원`;

const getPackageTotalPrice = (recommendPackage: RecommendPackage) =>
  recommendPackage.appliances.reduce((sum, item) => sum + item.totalPrice, 0) +
  recommendPackage.furniture.reduce((sum, item) => sum + item.price, 0);

const getApplianceTotalPrice = (recommendPackage: RecommendPackage) =>
  recommendPackage.appliances.reduce((sum, item) => sum + item.totalPrice, 0);

const getApplianceSubscriptionTotal = (recommendPackage: RecommendPackage) =>
  recommendPackage.appliances.reduce((sum, item) => sum + item.subscriptionPrice, 0);

const getFurnitureTotalPrice = (recommendPackage: RecommendPackage) =>
  recommendPackage.furniture.reduce((sum, item) => sum + item.price, 0);

const getPackageItemCount = (recommendPackage: RecommendPackage) =>
  recommendPackage.appliances.length + recommendPackage.furniture.length;

const getPackagePopularityScore = (recommendPackage: RecommendPackage) => {
  if (recommendPackage.appliances.length === 0) {
    return 0;
  }

  const totalScore = recommendPackage.appliances.reduce(
    (sum, item) => sum + item.popularityScore,
    0,
  );

  return totalScore / recommendPackage.appliances.length;
};

// ─── API 응답 → RecommendPackage 변환 ───

function parseRecommendations(response: RecommendationsPageResponse): RecommendPackage[] {
  return response.recommendations.map((rec, index) => {
    let appliances: RecommendAppliance[] = [];
    let furniture: RecommendFurniture[] = [];

    try {
      const parsed = JSON.parse(rec.products);

      // 형식 1: {appliances: [...], furniture: [...]} (이전 형식)
      // 형식 2: [{...}, {...}, ...] (새 형식 - 단순 배열)
      let rawAppliances: Record<string, unknown>[] = [];
      let rawFurniture: Record<string, unknown>[] = [];

      if (Array.isArray(parsed)) {
        // 새 형식: 단순 배열 → totalPrice 키가 있으면 가전, price 키가 있으면 가구
        for (const item of parsed) {
          if (item.totalPrice !== undefined) {
            rawAppliances.push(item);
          } else {
            rawFurniture.push(item);
          }
        }
      } else {
        // 이전 형식: {appliances, furniture} 객체
        rawAppliances = parsed.appliances ?? [];
        rawFurniture = parsed.furniture ?? [];
      }

      appliances = rawAppliances.map((a) => ({
        product_id: (a.product_id as number) ?? (a.productId as number) ?? 0,
        modelId: (a.modelId as string) ?? (a.model_id as string) ?? "",
        name: a.name as string,
        category: a.category as string,
        totalPrice: (a.totalPrice as number) ?? 0,
        subscriptionPrice: (a.subscriptionPrice as number) ?? 0,
        image: (a.image as string) ?? "",
        productUrl: (a.productUrl as string) ?? "",
        popularityScore: (a.popularityScore as number) ?? 0,
      }));
      furniture = rawFurniture.map((f) => ({
        product_id: (f.product_id as number) ?? (f.productId as number) ?? 0,
        name: f.name as string,
        category: f.category as string,
        price: (f.price as number) ?? 0,
        image: (f.image as string) ?? "",
        productUrl: (f.productUrl as string) ?? "",
      }));
    } catch {
      console.error("products JSON 파싱 실패:", rec.products);
    }

    return {
      id: rec.recommendation_id,
      title: `추천 패키지 ${index + 1}`,
      typeLabel: rec.package_name ?? "",
      appliances,
      furniture,
      recommendationReason: rec.reason ?? "",
      recommendationPlus: rec.recommendationPlus ?? rec.recommendationplus ?? rec.recommendation_plus ?? null,
    };
  });
}

const INITIAL_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: "assistant-welcome",
    role: "assistant",
    text: "여기까지 알려주신 정보를 모두 잘 반영했어요!\n이제 고객님에게 맞는 추천 패키지를 확인해 보시고,\n더 궁금한 점이나 바꾸고 싶은 조건이 있다면 계속 말씀해 주세요.",
  },
];

type LocationState = {
  convId?: string;
  lifeType?: string;
  interiorStyle?: string;
  ownedAppliances?: string[];
  lifestyle?: string[];
  budget?: number;
  recommendations?: RecommendationsPageResponse;
} | null;

function RecommendChatbot() {
  useEffect(() => {
    document.title = "Home Canvas";
    return () => { document.title = "LGE.COM | LG전자"; };
  }, []);
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;
  const convId = state?.convId ?? null;

  const [isChatOpen, setIsChatOpen] = useState(true);
  const [chatInputValue, setChatInputValue] = useState("");
  const [chatMessages, setChatMessages] = useState(INITIAL_CHAT_MESSAGES);
  const [expandedPackages, setExpandedPackages] = useState<Record<string, boolean>>({});
  const [selectedSort, setSelectedSort] = useState<PackageSortType>("default");
  const [isWaitingResponse, setIsWaitingResponse] = useState(false);
  const [recommendPackages, setRecommendPackages] = useState<RecommendPackage[]>(() => {
    const parsed = state?.recommendations ? parseRecommendations(state.recommendations) : [];
    // STOMP에서 받은 추천 데이터로 recommendationPlus 보강
    const stompRecs = (state as Record<string, unknown>)?.stompRecommendations as Record<string, unknown>[] | null;
    if (stompRecs && Array.isArray(stompRecs)) {
      for (const pkg of parsed) {
        const match = stompRecs.find((sr) => sr.package_name === pkg.typeLabel);
        if (match && match.recommendationPlus && !pkg.recommendationPlus) {
          pkg.recommendationPlus = match.recommendationPlus as string;
        }
      }
    }
    return parsed;
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasNoMore, setHasNoMore] = useState(() =>
    state?.recommendations ? !state.recommendations.has_next : false,
  );
  const maxPage = 4;
  const [pageCache, setPageCache] = useState<Record<number, RecommendPackage[]>>(() => {
    const init: Record<number, RecommendPackage[]> = {};
    if (recommendPackages.length > 0) init[1] = recommendPackages;
    return init;
  });
  const collapsedApplianceLimit = isChatOpen ? 4 : 5;
  const chatMessagesRef = useRef<HTMLDivElement | null>(null);
  const stompInitRef = useRef(false);

  const handleGoToPage = useCallback(async (targetPage: number) => {
    if (!convId || isLoadingMore || targetPage < 1 || targetPage > maxPage) return;

    // 캐시에 있으면 바로 표시
    if (pageCache[targetPage]) {
      setRecommendPackages(pageCache[targetPage]);
      setCurrentPage(targetPage);
      setExpandedPackages({});
      return;
    }

    // 캐시에 없으면 API 호출
    setIsLoadingMore(true);
    try {
      const { fetchRecommendations } = await import("@/services/chatService");
      const response = await fetchRecommendations(convId, targetPage, 1, 0);

      if (response.recommendations.length === 0) {
        setHasNoMore(true);
      } else {
        const newPackages = parseRecommendations(response);
        setPageCache((prev) => ({ ...prev, [targetPage]: newPackages }));
        setRecommendPackages(newPackages);
        setCurrentPage(targetPage);
        setExpandedPackages({});
        if (!response.has_next || targetPage >= maxPage) {
          setHasNoMore(true);
        }
      }
    } catch (err) {
      console.error("Failed to load recommendations:", err);
    } finally {
      setIsLoadingMore(false);
    }
  }, [convId, isLoadingMore, pageCache]);

  const sortedRecommendPackages = [...recommendPackages].sort((leftPackage, rightPackage) => {
    if (selectedSort === "price") {
      return getPackageTotalPrice(leftPackage) - getPackageTotalPrice(rightPackage);
    }

    if (selectedSort === "popularity") {
      return getPackagePopularityScore(rightPackage) - getPackagePopularityScore(leftPackage);
    }

    return 0;
  });

  // STOMP 연결 + 구독
  useEffect(() => {
    if (!convId || stompInitRef.current) return;
    stompInitRef.current = true;

    let unsubscribe: (() => void) | null = null;

    const init = async () => {
      try {
        await connectStomp();
        console.log("[RecommendChatbot] STOMP connected, subscribing...");

        unsubscribe = subscribeTopic(convId, (body) => {
          // 서버 응답 수신 → aiResponse 우선 파싱
          let text: string | null = null;

          // 1차: 직접 키 접근
          if (typeof body.aiResponse === "string" && body.aiResponse.trim()) {
            text = body.aiResponse;
          } else if (typeof body.assistantText === "string" && body.assistantText.trim()) {
            text = body.assistantText;
          } else if (typeof body.answer === "string" && body.answer.trim()) {
            text = body.answer;
          } else if (typeof body.message === "string" && body.message.trim()) {
            text = body.message;
          }

          // 2차: body 전체를 문자열로 탐색 (aiResponse가 중첩 객체 안에 있을 수 있음)
          if (!text) {
            const raw = JSON.stringify(body);
            const match = raw.match(/"aiResponse"\s*:\s*"([^"]+)"/);
            if (match) {
              text = match[1].replace(/\\n/g, "\n").replace(/\\"/g, '"');
            }
          }

          // aiResponse가 없으면 무시 (JSON 원본 출력 방지)
          if (!text) {
            console.log("[RecommendChatbot] 서버 응답에 텍스트 없음, 무시:", Object.keys(body));
            return;
          }

          setChatMessages((prev) => [
            ...prev,
            {
              id: `assistant-${Date.now()}`,
              role: "assistant" as const,
              text,
            },
          ]);
          setIsWaitingResponse(false);
        });
      } catch (err) {
        console.error("[RecommendChatbot] STOMP init failed:", err);
      }
    };

    init();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [convId]);

  useEffect(() => {
    if (!isChatOpen || !chatMessagesRef.current) {
      return;
    }

    chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
  }, [chatMessages, isChatOpen]);

  const handleChatSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const trimmedValue = chatInputValue.trim();

      if (!trimmedValue || isWaitingResponse) {
        return;
      }

      // 사용자 메시지 추가
      setChatMessages((prev) => [
        ...prev,
        {
          id: `user-${Date.now()}`,
          role: "user",
          text: trimmedValue,
        },
      ]);
      setChatInputValue("");

      // STOMP로 RECOMMEND_RAG 전송 (convId가 있을 때만)
      if (convId) {
        setIsWaitingResponse(true);
        sendRecommendRag(convId, trimmedValue);
        console.log("[RecommendChatbot] Sent RECOMMEND_RAG:", trimmedValue);
      } else {
        // convId 없으면 로컬에서만 표시
        setChatMessages((prev) => [
          ...prev,
          {
            id: `assistant-${Date.now()}`,
            role: "assistant",
            text: "서버와 연결되지 않았습니다. 채팅을 처음부터 다시 시작해 주세요.",
          },
        ]);
      }
    },
    [chatInputValue, convId, isWaitingResponse],
  );

  const togglePackage = (title: string) => {
    setExpandedPackages((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  return (
    <div className={`${styles.page} ${isChatOpen ? styles.pageChatOpen : ""}`}>
      <section className={styles.leftPane}>
        <div className={styles.leftPaneInner}>
          <button
            type="button"
            onClick={() => {
              // 캐시 삭제
              sessionStorage.clear();
              navigate("/");
            }}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              background: "none", border: "none", cursor: "pointer",
              color: "#3C5D5D", fontSize: 14, fontWeight: 600,
              padding: "8px 0", marginBottom: 8,
            }}
          >
            ← 메인으로
          </button>
          <div className={styles.hero}>
            <img src={snowLogo} alt="" className={styles.heroLogo} aria-hidden="true" />
            <div className={styles.heroContent}>
              <div className={styles.titleRow}>
                <h1 className={styles.title}>LG 추천 리스트</h1>
                <span className={styles.sparkle} aria-hidden="true">
                  ✨
                </span>
              </div>
              <p className={styles.subtitle}>
                입력해주신 조건을 바탕으로 추천 패키지를 완성했어요. 원하는 구성을 살펴보세요.
              </p>
              <div className={styles.filterRow}>
                <button
                  type="button"
                  className={`${styles.filterChip} ${
                    selectedSort === "default" ? styles.filterChipActive : ""
                  }`}
                  onClick={() => setSelectedSort("default")}
                >
                  전체
                </button>
                <button
                  type="button"
                  className={`${styles.filterChip} ${
                    selectedSort === "price" ? styles.filterChipActive : ""
                  }`}
                  onClick={() => setSelectedSort("price")}
                >
                  가격순
                </button>
                <button
                  type="button"
                  className={`${styles.filterChip} ${
                    selectedSort === "popularity" ? styles.filterChipActive : ""
                  }`}
                  onClick={() => setSelectedSort("popularity")}
                >
                  인기순
                </button>
              </div>
            </div>
          </div>

          <div className={styles.packageList}>
            {recommendPackages.length === 0 && (
              <div style={{ textAlign: "center", padding: "60px 20px", color: "#888" }}>
                <p style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>추천 패키지가 없습니다</p>
                <p style={{ fontSize: 14 }}>채팅을 통해 조건을 입력하면 맞춤 패키지를 추천해 드립니다.</p>
              </div>
            )}
            {sortedRecommendPackages.map((recommendPackage) => {
              const isExpanded = expandedPackages[recommendPackage.title] ?? false;
              const applianceItems = recommendPackage.appliances;
              const furnitureItems = recommendPackage.furniture;
              const visibleApplianceItems = isExpanded
                ? applianceItems
                : applianceItems.slice(0, collapsedApplianceLimit);
              // 항상 토글 가능

              return (
                <section key={recommendPackage.id} className={styles.packageSection}>
                  <div className={styles.packageHeader}>
                    <div className={styles.packageHeadingRow}>
                      <h2 className={styles.packageTitle}>{recommendPackage.title}</h2>
                      <span className={styles.packageMeta}>
                        {recommendPackage.typeLabel} | {getPackageItemCount(recommendPackage)}개 상품
                      </span>
                    </div>
                    <div className={styles.packageSubRow}>
                      <div className={styles.packagePriceRow}>
                        <div className={styles.packagePriceGroup}>
                          <span className={styles.packagePriceLabel}>가전 구독</span>
                          <strong className={styles.packageSubscriptionPrice}>
                            월 {formatPrice(getApplianceSubscriptionTotal(recommendPackage))}
                          </strong>
                          <span className={styles.packagePriceSub}>
                            일시불 {Math.round(getApplianceTotalPrice(recommendPackage) / 10000).toLocaleString("ko-KR")}만원
                          </span>
                        </div>
                        {recommendPackage.furniture.length > 0 && (
                          <div className={styles.packagePriceGroup}>
                            <span className={styles.packagePriceLabel}>가구</span>
                            <strong className={styles.packageFurniturePrice}>
                              {Math.round(getFurnitureTotalPrice(recommendPackage) / 10000).toLocaleString("ko-KR")}만원
                            </strong>
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        className={styles.optionBtn}
                      onClick={() => togglePackage(recommendPackage.title)}
                    >
                        {isExpanded ? "옵션 접기 ▲" : "옵션 더보기 ▼"}
                      </button>
                    </div>
                  </div>

                  <div className={styles.packageCard}>
                    {isExpanded && furnitureItems.length > 0 ? (
                      <>
                        <div className={styles.packageGroup}>
                          <span className={styles.packageGroupBadge}>가전 패키지</span>
                          <div className={styles.productGrid}>
                            {applianceItems.map((item) => (
                              <div
                                key={`${recommendPackage.id}-${item.name}`}
                                className={styles.productCard}
                              >
                                <div className={styles.productImageWrap}>
                                  <img
                                    src={item.image}
                                    alt={item.name}
                                    className={styles.productImage}
                                  />
                                </div>
                                <strong className={styles.productName}>{item.name}</strong>
                                <span className={styles.productCategory}>
                                  {item.category}
                                  {item.category === "TV" && item.modelId && (() => {
                                    const match = item.modelId.match(/^(\d+)/);
                                    return match ? ` · ${match[1]}인치` : "";
                                  })()}
                                </span>
                                <span className={styles.productPriceMain}>{formatPrice(item.totalPrice)}</span>
                                {item.subscriptionPrice > 0 && (
                                  <div className={styles.subscriptionPill}>
                                    {`월 ${formatPrice(item.subscriptionPrice)}`}
                                  </div>
                                )}
                                {item.productUrl ? (
                                  <a
                                    href={item.productUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={styles.productAction}
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    자세히보기 &gt;
                                  </a>
                                ) : (
                                  <span className={styles.productAction}>자세히보기 &gt;</span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className={styles.packageGroup}>
                          <span className={styles.packageGroupBadge}>가구 패키지</span>
                          <div className={styles.productGrid}>
                            {furnitureItems.map((item) => (
                              <div
                                key={`${recommendPackage.id}-${item.name}`}
                                className={styles.productCard}
                              >
                                <div className={styles.productImageWrap}>
                                  <img
                                    src={item.image}
                                    alt={item.name}
                                    className={styles.productImage}
                                  />
                                </div>
                                <strong className={styles.productName}>{item.name}</strong>
                                <span className={styles.productCategory}>{item.category}</span>
                                <span className={styles.productPrice}>{formatPrice(item.price)}</span>
                                {item.productUrl ? (
                                  <a
                                    href={item.productUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={styles.productAction}
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    자세히보기 &gt;
                                  </a>
                                ) : (
                                  <span className={styles.productAction}>자세히보기 &gt;</span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className={styles.productGrid}>
                        {visibleApplianceItems.map((item) => (
                          <div
                            key={`${recommendPackage.id}-${item.name}`}
                            className={styles.productCard}
                          >
                            <div className={styles.productImageWrap}>
                              <img src={item.image} alt={item.name} className={styles.productImage} />
                            </div>
                            <strong className={styles.productName}>{item.name}</strong>
                            <span className={styles.productCategory}>
                              {item.category}
                              {item.category === "TV" && item.modelId && (() => {
                                const match = item.modelId.match(/^(\d+)/);
                                return match ? ` · ${match[1]}인치` : "";
                              })()}
                            </span>
                            <span className={styles.productPriceMain}>{formatPrice(item.totalPrice)}</span>
                            {item.subscriptionPrice > 0 && (
                              <div className={styles.subscriptionPill}>
                                {`월 ${formatPrice(item.subscriptionPrice)}`}
                              </div>
                            )}
                            {item.productUrl ? (
                              <a
                                href={item.productUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.productAction}
                                onClick={(e) => e.stopPropagation()}
                              >
                                자세히보기 &gt;
                              </a>
                            ) : (
                              <span className={styles.productAction}>자세히보기 &gt;</span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    {isExpanded && recommendPackage.recommendationReason ? (
                      <div style={{
                        margin: "12px 0 8px",
                        padding: "12px 14px 12px 0",
                      }}>
                        <div style={{ fontSize: 14, color: "#2e7d32", fontWeight: 700, marginBottom: 4 }}>
                          💡 AI 추천 이유
                        </div>
                        <p style={{
                          margin: 0, fontSize: 16.5, fontWeight: 500,
                          color: "#2c3e2c", lineHeight: 1.65, wordBreak: "keep-all",
                        }}>
                          {recommendPackage.recommendationReason}
                        </p>
                      </div>
                    ) : null}
                    {isExpanded && recommendPackage.recommendationPlus ? (
                      <div style={{
                        margin: "8px 0",
                        padding: "10px 14px",
                        borderRadius: 8,
                      }}>
                        <div style={{ fontSize: 13, color: "#3C5D5D", fontWeight: 700, marginBottom: 4 }}>
                          💡 참고사항
                        </div>
                        <p style={{
                          margin: 0, fontSize: 13.5, fontWeight: 500,
                          color: "#5d4037", lineHeight: 1.6, wordBreak: "keep-all",
                        }}>
                          {recommendPackage.recommendationPlus}
                        </p>
                      </div>
                    ) : null}
                    <div className={styles.packageActions}>
                      <button
                        type="button"
                        className={`${styles.packageActionBtn} ${styles.packageActionPrimary}`}
                        onClick={() => {
                          console.log("[RecommendChatbot] appliances:", recommendPackage.appliances);
                          console.log("[RecommendChatbot] furniture:", recommendPackage.furniture);
                          const productIds = [
                            ...recommendPackage.appliances.map((a) => a.product_id),
                            ...recommendPackage.furniture.map((f) => f.product_id),
                          ].filter((id) => id > 0);
                          console.log("[RecommendChatbot] productIds to simulation:", productIds);
                          const productDetails = [
                            ...recommendPackage.appliances.map((a) => ({
                              product_id: a.product_id,
                              name: a.name,
                              category: a.category,
                              totalPrice: a.totalPrice,
                              subscriptionPrice: a.subscriptionPrice,
                              image: a.image,
                            })),
                            ...recommendPackage.furniture.map((f) => ({
                              product_id: f.product_id,
                              name: f.name,
                              category: f.category,
                              totalPrice: f.price,
                              subscriptionPrice: 0,
                              image: f.image,
                            })),
                          ];
                          navigate("/simulation", {
                            state: {
                              packageTitle: recommendPackage.title,
                              packageTypeLabel: recommendPackage.typeLabel,
                              itemCount: getPackageItemCount(recommendPackage),
                              productIds,
                              productDetails,
                              interiorStyle: state?.interiorStyle ?? undefined,
                              ownedAppliances: state?.ownedAppliances ?? undefined,
                              lifestyle: state?.lifestyle ?? undefined,
                              budget: state?.budget ?? undefined,
                            },
                          });
                        }}
                      >
                        <FiHome size={16} />
                        <span>배치보기</span>
                      </button>
                      <button
                        type="button"
                        className={styles.packageActionBtn}
                        onClick={async () => {
                          console.log("[Cart] recommendPackage.id:", recommendPackage.id, "convId:", convId);
                          if (!convId || !recommendPackage.id) {
                            alert("장바구니 추가에 필요한 정보가 없습니다. 다시 추천을 받아주세요.");
                            return;
                          }
                          try {
                            const api = (await import("axios")).default;
                            const token = localStorage.getItem("lg_auth_token");
                            const baseUrl = import.meta.env.VITE_API_BASE || "/api";
                            const headers = { Authorization: `Bearer ${token}` };

                            await api.post(
                              `${baseUrl}/cart/${convId}/select`,
                              { recommendation_id: recommendPackage.id },
                              { headers },
                            );
                            alert("장바구니에 추가되었습니다!");
                          } catch (err) {
                            console.error("Cart save failed:", err);
                            alert("장바구니 추가에 실패했습니다.");
                          }
                        }}
                      >
                        <FiShoppingCart size={16} />
                        <span>카트</span>
                      </button>
                    </div>
                  </div>
                </section>
              );
            })}
          </div>

          <div className={styles.moreWrap} style={{ display: "flex", gap: 12, justifyContent: "center", alignItems: "center" }}>
            <button
              type="button"
              className={styles.moreBtn}
              onClick={() => handleGoToPage(currentPage - 1)}
              disabled={isLoadingMore || currentPage <= 1}
              style={{ opacity: currentPage <= 1 ? 0.4 : 1 }}
            >
              ← 이전 추천
            </button>
            <span style={{ color: "#666", fontSize: 14, fontWeight: 600 }}>
              {currentPage} / {maxPage}
            </span>
            <button
              type="button"
              className={styles.moreBtn}
              onClick={() => handleGoToPage(currentPage + 1)}
              disabled={isLoadingMore || !convId || (hasNoMore && currentPage >= maxPage)}
              style={{ opacity: (hasNoMore && currentPage >= maxPage) ? 0.4 : 1 }}
            >
              {isLoadingMore ? "불러오는 중..." : "다음 추천 →"}
            </button>
          </div>
          {hasNoMore && currentPage >= maxPage && (
            <div className={styles.moreWrap}>
              <span style={{ color: "#999", fontSize: 14 }}>
                더 이상 추천이 없습니다.
              </span>
            </div>
          )}
        </div>
      </section>

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

            <div className={styles.chatMessages} ref={chatMessagesRef}>
              {chatMessages.map((message) => (
                <div
                  key={message.id}
                  className={`${styles.chatRow} ${message.role === "user" ? styles.chatRowUser : ""}`}
                >
                  {message.role === "assistant" ? (
                    <div className={styles.chatAvatar}>
                      <img src={snowLogo} alt="챗봇 아이콘" className={styles.chatAvatarImage} />
                    </div>
                  ) : null}
                  <div
                    className={`${styles.chatBubble} ${message.role === "user" ? styles.chatBubbleUser : ""}`}
                  >
                    {message.text.split("\n").map((line, index) => (
                      <span key={`${message.id}-${index}`}>
                        {index > 0 ? <br /> : null}
                        {line}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
              {isWaitingResponse && (
                <div className={styles.chatRow}>
                  <div className={styles.chatAvatar}>
                    <img src={snowLogo} alt="챗봇 아이콘" className={styles.chatAvatarImage} />
                  </div>
                  <div className={styles.chatBubble}>
                    <span className={styles.typingDots}>
                      <span />
                      <span />
                      <span />
                    </span>
                  </div>
                </div>
              )}
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
                  placeholder={isWaitingResponse ? "답변을 기다리고 있어요..." : "추가로 궁금한 내용이나 조건을 입력해 주세요"}
                  aria-label="추가 질문 입력"
                  disabled={isWaitingResponse}
                />
                <button
                  type="submit"
                  className={styles.chatSendBtn}
                  aria-label="전송"
                  disabled={isWaitingResponse || !chatInputValue.trim()}
                >
                  {isWaitingResponse ? (
                    <span className={styles.chatSpinner} />
                  ) : (
                    <FiArrowUp size={18} />
                  )}
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

export default RecommendChatbot;
