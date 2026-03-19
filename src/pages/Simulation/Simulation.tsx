import { useState } from "react";
import { FiArrowLeft, FiCheck, FiLayers } from "react-icons/fi";
import { useLocation, useNavigate } from "react-router-dom";
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

function Simulation() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as SimulationState | null) ?? null;
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(
    FLOOR_PLAN_OPTIONS[0]?.id ?? null,
  );

  const selectedPlan =
    FLOOR_PLAN_OPTIONS.find((option) => option.id === selectedPlanId) ?? FLOOR_PLAN_OPTIONS[0];

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
            <div>
              <span className={styles.canvasLabel}>시뮬레이션 영역</span>
              <h2 className={styles.canvasTitle}>배치 미리보기</h2>
            </div>
            <div className={styles.canvasStatus}>
              <span className={styles.statusDot} />
              <span>도면 데이터 연결 전</span>
            </div>
          </div>

          <div className={styles.canvasArea}>
            <div className={styles.roomFrame}>
              <div className={`${styles.zoneCard} ${styles.zoneLiving}`}>거실 영역</div>
              <div className={`${styles.zoneCard} ${styles.zoneKitchen}`}>주방 영역</div>
              <div className={`${styles.zoneCard} ${styles.zoneBedroom}`}>침실 영역</div>
              <div className={`${styles.zoneCard} ${styles.zoneEntry}`}>현관 영역</div>
              <div className={styles.planWatermark}>{selectedPlan?.name}</div>
            </div>
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
    </div>
  );
}

export default Simulation;
