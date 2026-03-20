import { Navigate } from "react-router-dom";
import {
  FiArrowRight,
  FiBox,
  FiClock,
  FiGrid,
  FiImage,
  FiMessageSquare,
  FiShoppingCart,
  FiStar,
  FiUser,
} from "react-icons/fi";
import { useAuth } from "@/contexts/AuthContext";
import styles from "./MyPage.module.css";

const CART_ITEMS = [
  {
    id: "cart-1",
    name: "LG 오브제컬렉션 워시타워",
    detail: "세탁기 + 건조기 패키지",
    price: "3,590,000원",
    tag: "장바구니 담김",
  },
  {
    id: "cart-2",
    name: "LG 스탠바이미 2",
    detail: "27형 라이프스타일 스크린",
    price: "1,090,000원",
    tag: "관심 상품",
  },
];

const CHAT_HISTORY = [
  {
    id: "chat-1",
    title: "싱글 라이프 맞춤 공간 추천",
    summary: "원룸 12평 기준으로 가전 배치와 수납형 가구를 추천받았어요.",
    time: "오늘 14:20",
  },
  {
    id: "chat-2",
    title: "부모님과 함께하는 집 리모델링",
    summary: "동선이 편한 주방과 거실 배치, 안전 가전 중심으로 상담했어요.",
    time: "어제 18:40",
  },
];

const FLOOR_PLAN_HISTORY = [
  {
    id: "plan-1",
    title: "거실 중심 2D 배치도",
    description: "TV, 소파, 공기청정기 배치를 고려한 기본 평면도",
    meta: "최종 수정: 2026.03.19",
  },
  {
    id: "plan-2",
    title: "주방 확장형 배치도",
    description: "냉장고, 식기세척기, 수납장을 반영한 동선 중심 구성",
    meta: "최종 수정: 2026.03.17",
  },
];

const RENDERED_SHOTS = [
  {
    id: "render-1",
    title: "웜 뉴트럴 거실 3D",
    description: "우드톤 가구와 올리브 포인트를 적용한 시안",
  },
  {
    id: "render-2",
    title: "미니멀 다이닝 3D",
    description: "식탁과 냉장고 중심의 주방-다이닝 연결 시안",
  },
];

function MyPage() {
  const { user, isLoggedIn } = useAuth();

  if (!isLoggedIn || !user) {
    return <Navigate to="/login" replace state={{ redirectTo: "/mypage" }} />;
  }

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.inner}>
          <div className={styles.heroCard}>
            <div className={styles.profileRow}>
              <div className={styles.avatar}>
                <FiUser size={34} />
              </div>
              <div className={styles.profileText}>
                <span className={styles.eyebrow}>My LG Space</span>
                <h1 className={styles.title}>{user.name}님의 마이페이지</h1>
                <p className={styles.subtitle}>
                  장바구니, 챗봇 상담 내역, 배치도면, 3D 시안을 한 곳에서 확인해보세요.
                </p>
              </div>
            </div>

            <div className={styles.summaryGrid}>
              <div className={styles.summaryCard}>
                <FiShoppingCart size={18} />
                <strong>{CART_ITEMS.length}</strong>
                <span>장바구니 상품</span>
              </div>
              <div className={styles.summaryCard}>
                <FiMessageSquare size={18} />
                <strong>{CHAT_HISTORY.length}</strong>
                <span>챗봇 상담 내역</span>
              </div>
              <div className={styles.summaryCard}>
                <FiGrid size={18} />
                <strong>{FLOOR_PLAN_HISTORY.length}</strong>
                <span>받은 배치도면</span>
              </div>
              <div className={styles.summaryCard}>
                <FiImage size={18} />
                <strong>{RENDERED_SHOTS.length}</strong>
                <span>3D 이미지</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.inner}>
          <div className={styles.sectionHeader}>
            <div>
              <span className={styles.sectionEyebrow}>MY COLLECTION</span>
              <h2 className={styles.sectionTitle}>내 서비스 보관함</h2>
            </div>
            <p className={styles.sectionDescription}>
              최근에 저장한 상품과 상담 기록, 공간 시안을 빠르게 이어서 볼 수 있어요.
            </p>
          </div>

          <div className={styles.panelGrid}>
            <article className={styles.panel}>
              <div className={styles.panelHeader}>
                <div className={styles.panelIcon}>
                  <FiShoppingCart size={20} />
                </div>
                <div>
                  <h3 className={styles.panelTitle}>내 장바구니</h3>
                  <p className={styles.panelSub}>구매를 고민 중인 상품을 모아봤어요.</p>
                </div>
              </div>
              <div className={styles.list}>
                {CART_ITEMS.map((item) => (
                  <div key={item.id} className={styles.listItem}>
                    <div className={styles.itemText}>
                      <strong>{item.name}</strong>
                      <span>{item.detail}</span>
                    </div>
                    <div className={styles.itemMeta}>
                      <em>{item.tag}</em>
                      <b>{item.price}</b>
                    </div>
                  </div>
                ))}
              </div>
            </article>

            <article className={styles.panel}>
              <div className={styles.panelHeader}>
                <div className={styles.panelIcon}>
                  <FiMessageSquare size={20} />
                </div>
                <div>
                  <h3 className={styles.panelTitle}>내 챗봇 채팅내역</h3>
                  <p className={styles.panelSub}>최근 상담한 추천 대화를 다시 확인할 수 있어요.</p>
                </div>
              </div>
              <div className={styles.timeline}>
                {CHAT_HISTORY.map((item) => (
                  <div key={item.id} className={styles.timelineItem}>
                    <div className={styles.timelineDot} />
                    <div className={styles.timelineContent}>
                      <div className={styles.timelineHeader}>
                        <strong>{item.title}</strong>
                        <span>
                          <FiClock size={14} />
                          {item.time}
                        </span>
                      </div>
                      <p>{item.summary}</p>
                    </div>
                  </div>
                ))}
              </div>
            </article>

            <article className={`${styles.panel} ${styles.panelWide}`}>
              <div className={styles.panelHeader}>
                <div className={styles.panelIcon}>
                  <FiGrid size={20} />
                </div>
                <div>
                  <h3 className={styles.panelTitle}>내가 받은 배치도면</h3>
                  <p className={styles.panelSub}>상담과 시뮬레이션으로 저장된 도면 시안을 확인하세요.</p>
                </div>
              </div>
              <div className={styles.visualGrid}>
                {FLOOR_PLAN_HISTORY.map((item, index) => (
                  <div key={item.id} className={styles.visualCard}>
                    <div className={`${styles.visualPreview} ${styles[`floorTone${index + 1}`]}`}>
                      <div className={styles.roomBoxLarge} />
                      <div className={styles.roomBoxSmall} />
                      <div className={styles.roomLine} />
                    </div>
                    <div className={styles.visualText}>
                      <strong>{item.title}</strong>
                      <p>{item.description}</p>
                      <span>{item.meta}</span>
                    </div>
                  </div>
                ))}
              </div>
            </article>

            <article className={`${styles.panel} ${styles.panelWide}`}>
              <div className={styles.panelHeader}>
                <div className={styles.panelIcon}>
                  <FiStar size={20} />
                </div>
                <div>
                  <h3 className={styles.panelTitle}>내 3D 이미지</h3>
                  <p className={styles.panelSub}>공간 분위기와 가전 배치를 입체적으로 살펴볼 수 있어요.</p>
                </div>
              </div>
              <div className={styles.renderGrid}>
                {RENDERED_SHOTS.map((item, index) => (
                  <div key={item.id} className={styles.renderCard}>
                    <div className={`${styles.renderPreview} ${styles[`renderTone${index + 1}`]}`}>
                      <div className={styles.renderMain} />
                      <div className={styles.renderSide} />
                      <div className={styles.renderBottom} />
                    </div>
                    <div className={styles.visualText}>
                      <strong>{item.title}</strong>
                      <p>{item.description}</p>
                      <span className={styles.inlineAction}>
                        자세히 보기
                        <FiArrowRight size={14} />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className={styles.bottomSection}>
        <div className={styles.inner}>
          <div className={styles.accountCard}>
            <div>
              <span className={styles.sectionEyebrow}>ACCOUNT</span>
              <h2 className={styles.accountTitle}>계정 정보</h2>
            </div>
            <div className={styles.accountInfo}>
              <div>
                <span>이름</span>
                <strong>{user.name}</strong>
              </div>
              <div>
                <span>이메일</span>
                <strong>{user.email}</strong>
              </div>
              <div>
                <span>연락처</span>
                <strong>{user.phone}</strong>
              </div>
              <div>
                <span>회원 상태</span>
                <strong className={styles.accountStatus}>
                  <FiBox size={15} />
                  LG 멤버십 이용 중
                </strong>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default MyPage;
