import { useEffect, useRef, useState, type FormEvent } from "react";
import { FiArrowUp, FiChevronDown, FiHome, FiPlus, FiShoppingCart } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import chatbotIcon from "../../assets/images/chatbot_icon.png";
import airPurifierImage from "../../assets/images/lg_appliances/Air_Purifier.avif";
import clothingCareImage from "../../assets/images/lg_appliances/Clothing_Care.avif";
import dishwasherImage from "../../assets/images/lg_appliances/Dishwasher.avif";
import inductionImage from "../../assets/images/lg_appliances/Induction.avif";
import refrigeratorImage from "../../assets/images/lg_appliances/Refrigerator.avif";
import snowLogo from "../../assets/images/snow_logo.png";
import washingMachineImage from "../../assets/images/lg_appliances/Washing_Machine.avif";
import waterPurifierImage from "../../assets/images/lg_appliances/Water_Purifier.avif";
import styles from "./RecommendChatbot.module.css";

type RecommendAppliance = {
  name: string;
  category: string;
  totalPrice: number;
  subscriptionPrice: number;
  image: string;
  productUrl: string;
  popularityScore: number;
};

type RecommendFurniture = {
  name: string;
  category: string;
  price: number;
  image: string;
  productUrl: string;
};

type RecommendPackage = {
  title: string;
  typeLabel: string;
  appliances: RecommendAppliance[];
  furniture: RecommendFurniture[];
  recommendationReason: string;
};

type RecommendPackagesResponse = readonly [
  RecommendPackage,
  RecommendPackage,
  RecommendPackage,
];

type BackendRecommendPackagesPayload = {
  packages: RecommendPackagesResponse;
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

const createFurnitureImage = (fill: string, accent: string, shape: string) =>
  `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 220">
      <rect width="220" height="220" rx="28" fill="#f7f5ef" />
      ${shape}
      <rect x="26" y="178" width="168" height="10" rx="5" fill="${fill}" opacity="0.14" />
      <circle cx="178" cy="40" r="14" fill="${accent}" opacity="0.18" />
    </svg>
  `)}`;

const lampImage = createFurnitureImage(
  "#c25a2d",
  "#ff8f5d",
  `
    <circle cx="92" cy="88" r="34" fill="#d95f36" />
    <circle cx="92" cy="88" r="22" fill="#fff5ed" />
    <rect x="86" y="116" width="12" height="34" rx="6" fill="#90452f" />
    <ellipse cx="92" cy="158" rx="28" ry="14" fill="#d95f36" />
  `,
);

const deskLampImage = createFurnitureImage(
  "#333333",
  "#92b8de",
  `
    <rect x="98" y="62" width="10" height="78" rx="5" transform="rotate(26 103 101)" fill="#2f353a" />
    <rect x="74" y="106" width="10" height="62" rx="5" transform="rotate(-28 79 137)" fill="#2f353a" />
    <rect x="114" y="48" width="42" height="14" rx="7" transform="rotate(-24 135 55)" fill="#2f353a" />
    <circle cx="82" cy="111" r="8" fill="#2f353a" />
    <circle cx="104" cy="142" r="8" fill="#2f353a" />
    <rect x="54" y="156" width="70" height="10" rx="5" fill="#2f353a" />
  `,
);

const slipperImage = createFurnitureImage(
  "#8ea8cf",
  "#6c8fc0",
  `
    <rect x="56" y="104" width="52" height="42" rx="18" transform="rotate(-12 82 125)" fill="#87a5d1" />
    <rect x="114" y="100" width="52" height="42" rx="18" transform="rotate(8 140 121)" fill="#87a5d1" />
    <path d="M60 116c11-10 27-13 41-6" fill="none" stroke="#c5d6ee" stroke-width="8" stroke-linecap="round" />
    <path d="M118 113c11-10 27-13 41-6" fill="none" stroke="#c5d6ee" stroke-width="8" stroke-linecap="round" />
  `,
);

const sofaImage = createFurnitureImage(
  "#b68b4e",
  "#d5ad6d",
  `
    <rect x="60" y="84" width="100" height="68" rx="30" fill="#b88a50" />
    <rect x="44" y="92" width="34" height="72" rx="17" fill="#b88a50" />
    <rect x="142" y="92" width="34" height="72" rx="17" fill="#b88a50" />
    <rect x="70" y="152" width="12" height="22" rx="6" fill="#8d6736" />
    <rect x="138" y="152" width="12" height="22" rx="6" fill="#8d6736" />
  `,
);

const BACKEND_RECOMMEND_PACKAGE_PAYLOAD: BackendRecommendPackagesPayload = {
  packages: [
    {
      title: "추천 패키지 1",
      typeLabel: "FLEX TYPE",
      appliances: [
        {
          name: "LG 디오스 인덕션",
          category: "주방 가전",
          totalPrice: 1711200,
          subscriptionPrice: 36100,
          image: inductionImage,
          productUrl: "",
          popularityScore: 94,
        },
        {
          name: "LG 오브제컬렉션 냉장고",
          category: "주방 가전",
          totalPrice: 2890000,
          subscriptionPrice: 58900,
          image: refrigeratorImage,
          productUrl: "",
          popularityScore: 97,
        },
        {
          name: "LG 디오스 식기세척기",
          category: "주방 가전",
          totalPrice: 1540000,
          subscriptionPrice: 31900,
          image: dishwasherImage,
          productUrl: "",
          popularityScore: 88,
        },
        {
          name: "LG 퓨리케어 정수기",
          category: "생활 가전",
          totalPrice: 1290000,
          subscriptionPrice: 27900,
          image: waterPurifierImage,
          productUrl: "",
          popularityScore: 91,
        },
      ],
      furniture: [
        {
          name: "Eclisse 4colors",
          category: "조명",
          price: 396000,
          image: lampImage,
          productUrl: "",
        },
        {
          name: "Tizio",
          category: "조명",
          price: 765000,
          image: deskLampImage,
          productUrl: "",
        },
        {
          name: "와플 거실 슬리퍼",
          category: "생활 소품",
          price: 10100,
          image: slipperImage,
          productUrl: "",
        },
        {
          name: "모듈 패브릭 소파",
          category: "거실 가구",
          price: 1342500,
          image: sofaImage,
          productUrl: "",
        },
      ],
      recommendationReason:
        "주방 동선과 기본 생활 가전을 먼저 구성하고, 공간 분위기를 살려주는 조명과 소품까지 함께 제안한 조합입니다.",
    },
    {
      title: "추천 패키지 2",
      typeLabel: "TYPE",
      appliances: [
        {
          name: "LG 트롬 세탁기",
          category: "세탁 가전",
          totalPrice: 1980000,
          subscriptionPrice: 42900,
          image: washingMachineImage,
          productUrl: "",
          popularityScore: 92,
        },
        {
          name: "LG 스타일러",
          category: "의류 관리기",
          totalPrice: 1760000,
          subscriptionPrice: 38900,
          image: clothingCareImage,
          productUrl: "",
          popularityScore: 86,
        },
        {
          name: "LG 퓨리케어 공기청정기",
          category: "공기 관리",
          totalPrice: 990000,
          subscriptionPrice: 22100,
          image: airPurifierImage,
          productUrl: "",
          popularityScore: 89,
        },
      ],
      furniture: [
        {
          name: "코지 라운지 체어",
          category: "리빙 체어",
          price: 689000,
          image: sofaImage,
          productUrl: "",
        },
        {
          name: "무드 테이블 램프",
          category: "조명",
          price: 129000,
          image: lampImage,
          productUrl: "",
        },
      ],
      recommendationReason:
        "의류 관리와 공기 관리에 집중한 가전 구성에 휴식감을 더해 주는 가구를 조합해 생활 만족도를 높이도록 구성했습니다.",
    },
    {
      title: "추천 패키지 3",
      typeLabel: "FLEX TYPE",
      appliances: [
        {
          name: "LG 디오스 인덕션",
          category: "주방 가전",
          totalPrice: 1711200,
          subscriptionPrice: 36100,
          image: inductionImage,
          productUrl: "",
          popularityScore: 94,
        },
        {
          name: "LG 디오스 식기세척기",
          category: "주방 가전",
          totalPrice: 1540000,
          subscriptionPrice: 31900,
          image: dishwasherImage,
          productUrl: "",
          popularityScore: 88,
        },
        {
          name: "LG 오브제컬렉션 냉장고",
          category: "주방 가전",
          totalPrice: 2890000,
          subscriptionPrice: 58900,
          image: refrigeratorImage,
          productUrl: "",
          popularityScore: 97,
        },
        {
          name: "LG 스타일러",
          category: "의류 관리기",
          totalPrice: 1760000,
          subscriptionPrice: 38900,
          image: clothingCareImage,
          productUrl: "",
          popularityScore: 86,
        },
        {
          name: "LG 퓨리케어 공기청정기",
          category: "공기 관리",
          totalPrice: 990000,
          subscriptionPrice: 22100,
          image: airPurifierImage,
          productUrl: "",
          popularityScore: 89,
        },
      ],
      furniture: [
        {
          name: "패브릭 슬리퍼",
          category: "생활 소품",
          price: 18900,
          image: slipperImage,
          productUrl: "",
        },
        {
          name: "아틀리에 데스크 램프",
          category: "조명",
          price: 239000,
          image: deskLampImage,
          productUrl: "",
        },
      ],
      recommendationReason:
        "주방과 생활 가전을 균형 있게 구성하고, 조명과 소품으로 공간 인상을 부드럽게 보완한 패키지입니다.",
    },
  ],
};

const INITIAL_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: "assistant-welcome",
    role: "assistant",
    text: "여기까지 알려주신 정보를 모두 잘 반영했어요!\n이제 고객님에게 맞는 추천 패키지를 확인해 보시고,\n더 궁금한 점이나 바꾸고 싶은 조건이 있다면 계속 말씀해 주세요.",
  },
];

function RecommendChatbot() {
  const navigate = useNavigate();
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [chatInputValue, setChatInputValue] = useState("");
  const [chatMessages, setChatMessages] = useState(INITIAL_CHAT_MESSAGES);
  const [expandedPackages, setExpandedPackages] = useState<Record<string, boolean>>({});
  const [selectedSort, setSelectedSort] = useState<PackageSortType>("default");
  const collapsedApplianceLimit = isChatOpen ? 4 : 5;
  const recommendPackages = BACKEND_RECOMMEND_PACKAGE_PAYLOAD.packages;
  const chatMessagesRef = useRef<HTMLDivElement | null>(null);
  const sortedRecommendPackages = [...recommendPackages].sort((leftPackage, rightPackage) => {
    if (selectedSort === "price") {
      return getPackageTotalPrice(leftPackage) - getPackageTotalPrice(rightPackage);
    }

    if (selectedSort === "popularity") {
      return getPackagePopularityScore(rightPackage) - getPackagePopularityScore(leftPackage);
    }

    return 0;
  });

  useEffect(() => {
    if (!isChatOpen || !chatMessagesRef.current) {
      return;
    }

    chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
  }, [chatMessages, isChatOpen]);

  const handleChatSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedValue = chatInputValue.trim();

    if (!trimmedValue) {
      return;
    }

    setChatMessages((prev) => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        role: "user",
        text: trimmedValue,
      },
      {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        text: trimmedValue,
      },
    ]);
    setChatInputValue("");
  };

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
            {sortedRecommendPackages.map((recommendPackage) => {
              const isExpanded = expandedPackages[recommendPackage.title] ?? false;
              const applianceItems = recommendPackage.appliances;
              const furnitureItems = recommendPackage.furniture;
              const visibleApplianceItems = isExpanded
                ? applianceItems
                : applianceItems.slice(0, collapsedApplianceLimit);
              const hasMoreItems =
                furnitureItems.length > 0 || applianceItems.length > visibleApplianceItems.length;

              return (
                <section key={recommendPackage.title} className={styles.packageSection}>
                  <div className={styles.packageHeader}>
                    <div className={styles.packageHeadingRow}>
                      <h2 className={styles.packageTitle}>{recommendPackage.title}</h2>
                      <span className={styles.packageMeta}>
                        {`{${recommendPackage.typeLabel}} | 총 예상 결제액 ${Math.round(
                          getPackageTotalPrice(recommendPackage) / 10000,
                        ).toLocaleString("ko-KR")}만원`}
                      </span>
                    </div>
                    <button
                      type="button"
                      className={styles.optionBtn}
                      onClick={() => {
                        if (hasMoreItems) {
                          togglePackage(recommendPackage.title);
                        }
                      }}
                      disabled={!hasMoreItems}
                    >
                      {hasMoreItems && isExpanded ? "옵션 접기" : "옵션 더보기"}
                    </button>
                  </div>

                  <div className={styles.packageCard}>
                    {isExpanded && furnitureItems.length > 0 ? (
                      <>
                        <div className={styles.packageGroup}>
                          <span className={styles.packageGroupBadge}>가전 패키지</span>
                          <div className={styles.productGrid}>
                            {applianceItems.map((item) => (
                              <div
                                key={`${recommendPackage.title}-${item.name}`}
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
                                <span className={styles.productPrice}>
                                  {formatPrice(item.totalPrice)}
                                </span>
                                <span className={styles.subscriptionLabel}>구독가</span>
                                <div className={styles.subscriptionPill}>
                                  {`월 ${formatPrice(item.subscriptionPrice)}`}
                                </div>
                                <span className={styles.productAction}>자세히 보기 &gt;</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className={styles.packageGroup}>
                          <span className={styles.packageGroupBadge}>가구 패키지</span>
                          <div className={styles.productGrid}>
                            {furnitureItems.map((item) => (
                              <div
                                key={`${recommendPackage.title}-${item.name}`}
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
                                <span className={styles.productAction}>자세히 보기 &gt;</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className={styles.productGrid}>
                        {visibleApplianceItems.map((item) => (
                          <div
                            key={`${recommendPackage.title}-${item.name}`}
                            className={styles.productCard}
                          >
                            <div className={styles.productImageWrap}>
                              <img src={item.image} alt={item.name} className={styles.productImage} />
                            </div>
                            <strong className={styles.productName}>{item.name}</strong>
                            <span className={styles.productCategory}>{item.category}</span>
                            <span className={styles.productPrice}>{formatPrice(item.totalPrice)}</span>
                            <span className={styles.subscriptionLabel}>구독가</span>
                            <div className={styles.subscriptionPill}>
                              {`월 ${formatPrice(item.subscriptionPrice)}`}
                            </div>
                            <span className={styles.productAction}>자세히 보기 &gt;</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {isExpanded ? (
                      <p className={styles.recommendationMessage}>
                        {recommendPackage.recommendationReason}
                      </p>
                    ) : null}
                    <div className={styles.packageActions}>
                      <button
                        type="button"
                        className={`${styles.packageActionBtn} ${styles.packageActionPrimary}`}
                        onClick={() =>
                          navigate("/simulation", {
                            state: {
                              packageTitle: recommendPackage.title,
                              packageTypeLabel: recommendPackage.typeLabel,
                              itemCount: getPackageItemCount(recommendPackage),
                            },
                          })
                        }
                      >
                        <FiHome size={16} />
                        <span>배치보기</span>
                      </button>
                      <button type="button" className={styles.packageActionBtn}>
                        <FiShoppingCart size={16} />
                        <span>카트</span>
                      </button>
                    </div>
                  </div>
                </section>
              );
            })}
          </div>

          <div className={styles.moreWrap}>
            <button type="button" className={styles.moreBtn}>
              다른 추천 보기
            </button>
          </div>
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
                  placeholder="추가로 궁금한 내용이나 조건을 입력해 주세요"
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

export default RecommendChatbot;
