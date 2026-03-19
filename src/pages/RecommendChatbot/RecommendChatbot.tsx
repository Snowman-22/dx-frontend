import { useState, type FormEvent } from "react";
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

type RecommendItem = {
  itemType: "appliance" | "furniture";
  image: string;
  name: string;
  category: string;
  price: number;
  subscriptionPrice?: number;
  productUrl: string;
};

type RecommendPackage = {
  title: string;
  typeLabel: string;
  items: RecommendItem[];
  recommendationMessage: string;
};

const formatPrice = (price: number) => `${price.toLocaleString("ko-KR")}원`;

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

const RECOMMEND_PACKAGES: RecommendPackage[] = [
  {
    title: "추천 패키지 1",
    typeLabel: "FLEX TYPE",
    recommendationMessage:
      "추천사유: 조리와 정리에 필요한 핵심 가전을 먼저 담고, 공간 분위기를 살려줄 가구와 소품을 함께 추천했어요. 기본 생활 동선은 더 편해지고, 공간은 더 따뜻하고 균형감 있게 완성할 수 있어요.",
    items: [
      {
        itemType: "appliance",
        image: inductionImage,
        name: "LG 디오스 인덕션",
        category: "1등급 미라듀어",
        price: 1711200,
        subscriptionPrice: 36100,
        productUrl: "",
      },
      {
        itemType: "appliance",
        image: refrigeratorImage,
        name: "LG 오브제 냉장고",
        category: "주방가전",
        price: 2890000,
        subscriptionPrice: 58900,
        productUrl: "",
      },
      {
        itemType: "appliance",
        image: dishwasherImage,
        name: "LG 디오스 식기세척기",
        category: "주방가전",
        price: 1540000,
        subscriptionPrice: 31900,
        productUrl: "",
      },
      {
        itemType: "appliance",
        image: waterPurifierImage,
        name: "LG 퓨리케어 정수기",
        category: "생활가전",
        price: 1290000,
        subscriptionPrice: 27900,
        productUrl: "",
      },
      {
        itemType: "furniture",
        image: lampImage,
        name: "Eclisse 4colors",
        category: "아르테미데",
        price: 396000,
        productUrl: "",
      },
      {
        itemType: "furniture",
        image: deskLampImage,
        name: "Tizio",
        category: "아르테미데",
        price: 765000,
        productUrl: "",
      },
      {
        itemType: "furniture",
        image: slipperImage,
        name: "퀼팅 워셔블 거실화",
        category: "자주",
        price: 10100,
        productUrl: "",
      },
      {
        itemType: "furniture",
        image: sofaImage,
        name: "엘머파파 1인소파 패브릭소파",
        category: "알로소",
        price: 1342500,
        productUrl: "",
      },
    ],
  },
  {
    title: "추천 패키지 2",
    typeLabel: "TYPE",
    recommendationMessage:
      "추천사유: 세탁과 공기 관리 중심으로 꼭 필요한 가전을 먼저 구성하고, 휴식감 있는 가구를 더해 생활 리듬이 자연스럽게 이어지도록 구성했어요. 기능성과 아늑함을 함께 가져갈 수 있는 조합이에요.",
    items: [
      {
        itemType: "appliance",
        image: washingMachineImage,
        name: "LG 트롬 세탁기",
        category: "세탁가전",
        price: 1980000,
        subscriptionPrice: 42900,
        productUrl: "",
      },
      {
        itemType: "appliance",
        image: clothingCareImage,
        name: "LG 스타일러",
        category: "의류관리기",
        price: 1760000,
        subscriptionPrice: 38900,
        productUrl: "",
      },
      {
        itemType: "appliance",
        image: airPurifierImage,
        name: "LG 퓨리케어 공기청정기",
        category: "공기관리",
        price: 990000,
        subscriptionPrice: 22100,
        productUrl: "",
      },
      {
        itemType: "furniture",
        image: sofaImage,
        name: "코지 라운지 체어",
        category: "리빙체어",
        price: 689000,
        productUrl: "",
      },
      {
        itemType: "furniture",
        image: lampImage,
        name: "무드 테이블 램프",
        category: "조명",
        price: 129000,
        productUrl: "",
      },
    ],
  },
  {
    title: "추천 패키지 3",
    typeLabel: "FLEX TYPE",
    recommendationMessage:
      "추천사유: 주방과 생활 가전을 균형 있게 묶고, 조명과 패브릭 소품으로 공간 인상을 부드럽게 보완했어요. 매일 자주 쓰는 제품 위주로 구성해서 활용도와 만족도를 함께 높일 수 있어요.",
    items: [
      {
        itemType: "appliance",
        image: inductionImage,
        name: "LG 디오스 인덕션",
        category: "1등급 미라듀어",
        price: 1711200,
        subscriptionPrice: 36100,
        productUrl: "",
      },
      {
        itemType: "appliance",
        image: dishwasherImage,
        name: "LG 디오스 식기세척기",
        category: "주방가전",
        price: 1540000,
        subscriptionPrice: 31900,
        productUrl: "",
      },
      {
        itemType: "appliance",
        image: refrigeratorImage,
        name: "LG 오브제 냉장고",
        category: "주방가전",
        price: 2890000,
        subscriptionPrice: 58900,
        productUrl: "",
      },
      {
        itemType: "appliance",
        image: clothingCareImage,
        name: "LG 스타일러",
        category: "의류관리기",
        price: 1760000,
        subscriptionPrice: 38900,
        productUrl: "",
      },
      {
        itemType: "appliance",
        image: airPurifierImage,
        name: "LG 퓨리케어 공기청정기",
        category: "공기관리",
        price: 990000,
        subscriptionPrice: 22100,
        productUrl: "",
      },
      {
        itemType: "furniture",
        image: slipperImage,
        name: "워셔블 룸슈즈",
        category: "패브릭 소품",
        price: 18900,
        productUrl: "",
      },
      {
        itemType: "furniture",
        image: deskLampImage,
        name: "아틀리에 데스크 램프",
        category: "조명",
        price: 239000,
        productUrl: "",
      },
    ],
  },
];

const getTotalPrice = (items: RecommendItem[]) =>
  items.reduce((sum, item) => sum + item.price, 0);

function RecommendChatbot() {
  const navigate = useNavigate();
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [chatInputValue, setChatInputValue] = useState("");
  const [expandedPackages, setExpandedPackages] = useState<Record<string, boolean>>({});
  const collapsedApplianceLimit = isChatOpen ? 4 : 5;

  const handleChatSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setChatInputValue((prev) => prev.trim());
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
                당신에게 맞는 추천 리스트를 완성했어요. 담고 싶은 가전을 선택해주세요.
              </p>
              <div className={styles.filterRow}>
                <button
                  type="button"
                  className={`${styles.filterChip} ${styles.filterChipActive}`}
                >
                  전체
                </button>
                <button type="button" className={styles.filterChip}>
                  가격순
                </button>
                <button type="button" className={styles.filterChip}>
                  인기순
                </button>
              </div>
            </div>
          </div>

          <div className={styles.packageList}>
            {RECOMMEND_PACKAGES.map((recommendPackage) => {
              const isExpanded = expandedPackages[recommendPackage.title] ?? false;
              const applianceItems = recommendPackage.items.filter(
                (item) => item.itemType === "appliance",
              );
              const furnitureItems = recommendPackage.items.filter(
                (item) => item.itemType === "furniture",
              );
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
                        {`{${recommendPackage.typeLabel}} | 총 예상 결제액: ${Math.round(
                          getTotalPrice(recommendPackage.items) / 10000,
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
                                  <img src={item.image} alt={item.name} className={styles.productImage} />
                                </div>
                                <strong className={styles.productName}>{item.name}</strong>
                                <span className={styles.productCategory}>{item.category}</span>
                                <span className={styles.productPrice}>{formatPrice(item.price)}</span>
                                {item.subscriptionPrice ? (
                                  <>
                                    <span className={styles.subscriptionLabel}>월 구독</span>
                                    <div className={styles.subscriptionPill}>
                                      {`월 ${formatPrice(item.subscriptionPrice)}`}
                                    </div>
                                  </>
                                ) : null}
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
                                  <img src={item.image} alt={item.name} className={styles.productImage} />
                                </div>
                                <strong className={styles.productName}>{item.name}</strong>
                                <span className={styles.productCategory}>{item.category}</span>
                                <span className={styles.productPrice}>{formatPrice(item.price)}</span>
                                {item.subscriptionPrice ? (
                                  <>
                                    <span className={styles.subscriptionLabel}>월 구독</span>
                                    <div className={styles.subscriptionPill}>
                                      {`월 ${formatPrice(item.subscriptionPrice)}`}
                                    </div>
                                  </>
                                ) : null}
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
                            <span className={styles.productPrice}>{formatPrice(item.price)}</span>
                            {item.subscriptionPrice ? (
                              <>
                                <span className={styles.subscriptionLabel}>월 구독</span>
                                <div className={styles.subscriptionPill}>
                                  {`월 ${formatPrice(item.subscriptionPrice)}`}
                                </div>
                              </>
                            ) : null}
                            <span className={styles.productAction}>자세히 보기 &gt;</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {isExpanded ? (
                      <p className={styles.recommendationMessage}>
                        {recommendPackage.recommendationMessage}
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
                              itemCount: recommendPackage.items.length,
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
                aria-label="챗봇 접기"
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
                  여기까지 알려주신 정보들 모두 잘 받았어요! 😊
                  <br />
                  이제 고객님만의 완벽한 공간을 위한 추천 리스트를 확인해보세요! ✨
                  <br />
                  추가로 물어보고 싶은 내용이 있다면 대화창에 계속 남겨주세요!
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
                  placeholder="추가로 궁금한 내용을 입력하세요"
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
