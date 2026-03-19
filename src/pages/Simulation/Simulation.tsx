import { useState, type FormEvent } from "react";
import {
  FiArrowLeft,
  FiArrowUp,
  FiBox,
  FiCheck,
  FiChevronDown,
  FiLayers,
  FiPlus,
  FiRefreshCw,
  FiShoppingCart,
} from "react-icons/fi";
import { useLocation, useNavigate } from "react-router-dom";
import chatbotIcon from "../../assets/images/chatbot_icon.png";
import snowLogo from "../../assets/images/snow_logo.png";
import styles from "./Simulation.module.css";

type SimulationState = {
  packageTitle?: string;
  packageTypeLabel?: string;
  itemCount?: number;
};

type FloorPlanOption = {
  id: string;
  name: string;
  caption: string;
};

type SimulationTab = "floor2d" | "image3d" | "cart";

const FLOOR_PLAN_OPTIONS: FloorPlanOption[] = [
  {
    id: "plan-a",
    name: "도면도 A",
    caption: "현관과 거실 중심의 기본형 자리",
  },
  {
    id: "plan-b",
    name: "도면도 B",
    caption: "주방과 다이닝이 강조된 확장형 자리",
  },
  {
    id: "plan-c",
    name: "도면도 C",
    caption: "침실 분리가 보이는 복합형 자리",
  },
];

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

const CART_ITEMS = [
  { name: "오브제 냉장고", category: "주방 가전", price: "월 58,900원" },
  { name: "오브제 식기세척기", category: "주방 가전", price: "월 31,900원" },
  { name: "오브제 정수기", category: "생활 가전", price: "월 27,900원" },
];

function Simulation() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as SimulationState | null) ?? null;
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInputValue, setChatInputValue] = useState("");
  const [activeTab, setActiveTab] = useState<SimulationTab>("floor2d");
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(
    FLOOR_PLAN_OPTIONS[0]?.id ?? null,
  );

  const selectedPlan =
    FLOOR_PLAN_OPTIONS.find((option) => option.id === selectedPlanId) ?? FLOOR_PLAN_OPTIONS[0];

  const handleChatSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setChatInputValue((prev) => prev.trim());
  };

  const tabMeta = TAB_COPY[activeTab];

  return (
    <div className={styles.page}>
      <div className={styles.pageGlow} aria-hidden="true" />

      <header className={styles.header}>
        <button type="button" className={styles.backButton} onClick={() => navigate(-1)}>
          <FiArrowLeft size={18} />
          <span>이전으로</span>
        </button>

        <div className={styles.headerText}>
          <div className={styles.headerBadge}>
            <img src={snowLogo} alt="" aria-hidden="true" className={styles.headerLogo} />
            <span>AI 배치 시뮬레이션</span>
          </div>
          <h1 className={styles.title}>추천 패키지 배치보기</h1>
          <p className={styles.subtitle}>
            실제 도면 데이터가 들어오기 전 단계라서, 먼저 도면도 선택 위치와 시뮬레이션 화면 구조만
            잡아두었습니다.
          </p>
        </div>
      </header>

      <section className={styles.content}>
        <aside className={styles.summaryCard}>
          <span className={styles.summaryLabel}>선택한 패키지</span>
          <strong className={styles.summaryTitle}>{state?.packageTitle ?? "추천 패키지"}</strong>
          <p className={styles.summaryMeta}>
            {state?.packageTypeLabel ?? "PACKAGE"} / 구성 상품 {state?.itemCount ?? 0}개
          </p>

          <div className={styles.selectedPlanCard}>
            <div className={styles.selectedPlanHeader}>
              <FiLayers size={16} />
              <span>현재 도면도</span>
            </div>
            <strong className={styles.selectedPlanName}>{selectedPlan?.name}</strong>
            <p className={styles.selectedPlanCaption}>{selectedPlan?.caption}</p>
          </div>

          <button
            type="button"
            className={styles.secondaryButton}
            onClick={() => setIsModalOpen(true)}
          >
            도면도 다시 선택
          </button>
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
              <button type="button" className={styles.headerActionBtn}>
                <FiRefreshCw size={16} />
                <span>다시 추천받기</span>
              </button>
              <button type="button" className={styles.headerActionBtn}>
                <FiBox size={16} />
                <span>3D 변환하기</span>
              </button>
              <button
                type="button"
                className={`${styles.headerActionBtn} ${styles.headerActionPrimary}`}
              >
                <FiShoppingCart size={16} />
                <span>장바구니 담기</span>
              </button>
              <div className={styles.canvasStatus}>
                <span className={styles.statusDot} />
                <span>도면 데이터 연결 전</span>
              </div>
            </div>
          </div>

          <div className={styles.canvasArea}>
            {activeTab === "floor2d" ? (
              <div className={styles.roomFrame}>
                <div className={`${styles.zoneCard} ${styles.zoneLiving}`}>거실 영역</div>
                <div className={`${styles.zoneCard} ${styles.zoneKitchen}`}>주방 영역</div>
                <div className={`${styles.zoneCard} ${styles.zoneBedroom}`}>침실 영역</div>
                <div className={`${styles.zoneCard} ${styles.zoneEntry}`}>현관 영역</div>
                <div className={styles.planWatermark}>{selectedPlan?.name}</div>
              </div>
            ) : null}

            {activeTab === "image3d" ? (
              <div className={styles.preview3D}>
                <div className={styles.preview3DScene}>
                  <div className={styles.preview3DGlow} aria-hidden="true" />
                  <div className={styles.preview3DCardMain}>
                    <span>3D 이미지 자리</span>
                  </div>
                  <div className={styles.preview3DCardSide}>가전 배치</div>
                  <div className={styles.preview3DCardBottom}>가구 연출</div>
                </div>
                <div className={styles.preview3DInfo}>
                  <span className={styles.preview3DBadge}>PREVIEW</span>
                  <strong>{selectedPlan?.name} 기준 장면형 미리보기</strong>
                  <p>
                    실제 렌더링 데이터가 연결되면 여기에서 공간 분위기와 배치 결과를 3D 이미지 형태로
                    보여줄 수 있어요.
                  </p>
                </div>
              </div>
            ) : null}

            {activeTab === "cart" ? (
              <div className={styles.cartView}>
                <div className={styles.cartList}>
                  {CART_ITEMS.map((item) => (
                    <div key={item.name} className={styles.cartItem}>
                      <div className={styles.cartItemThumb} />
                      <div className={styles.cartItemContent}>
                        <strong>{item.name}</strong>
                        <span>{item.category}</span>
                      </div>
                      <div className={styles.cartItemPrice}>{item.price}</div>
                    </div>
                  ))}
                </div>

                <div className={styles.cartSummary}>
                  <span className={styles.cartSummaryLabel}>장바구니 요약</span>
                  <strong className={styles.cartSummaryTitle}>
                    {state?.packageTitle ?? "추천 패키지"} 구성
                  </strong>
                  <p className={styles.cartSummaryText}>
                    실제 상품 데이터 연결 전 단계라서, 현재는 구성 예시와 요약 정보 자리만 먼저
                    배치해두었습니다.
                  </p>
                  <div className={styles.cartSummaryRow}>
                    <span>예상 월 납부액</span>
                    <strong>월 118,700원</strong>
                  </div>
                  <div className={styles.cartSummaryRow}>
                    <span>선택 상품 수</span>
                    <strong>{state?.itemCount ?? 0}개</strong>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </main>
      </section>

      {isModalOpen ? (
        <div className={styles.modalBackdrop}>
          <div
            className={styles.modalCard}
            role="dialog"
            aria-modal="true"
            aria-labelledby="floor-plan-title"
          >
            <div className={styles.modalHeader}>
              <span className={styles.modalEyebrow}>STEP 1</span>
              <h2 id="floor-plan-title" className={styles.modalTitle}>
                도면도를 선택해 주세요
              </h2>
              <p className={styles.modalDescription}>
                실제 데이터가 들어오기 전이므로, 우선 선택지 3개의 위치와 형태만 확인할 수 있게
                배치해두었습니다.
              </p>
            </div>

            <div className={styles.optionGrid}>
              {FLOOR_PLAN_OPTIONS.map((option) => {
                const isSelected = option.id === selectedPlanId;

                return (
                  <button
                    key={option.id}
                    type="button"
                    className={`${styles.optionCard} ${isSelected ? styles.optionCardSelected : ""}`}
                    onClick={() => setSelectedPlanId(option.id)}
                  >
                    <div className={styles.optionPreview}>
                      <div className={styles.optionPreviewRoomLarge} />
                      <div className={styles.optionPreviewRoomMedium} />
                      <div className={styles.optionPreviewRoomSmall} />
                    </div>
                    <div className={styles.optionText}>
                      <strong>{option.name}</strong>
                      <span>{option.caption}</span>
                    </div>
                    {isSelected ? (
                      <span className={styles.optionCheck}>
                        <FiCheck size={14} />
                        선택됨
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>

            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.primaryButton}
                onClick={() => setIsModalOpen(false)}
              >
                이 도면도로 시작하기
              </button>
            </div>
          </div>
        </div>
      ) : null}

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
