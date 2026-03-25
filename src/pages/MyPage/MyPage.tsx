import { useEffect, useState } from "react";
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
  FiX,
} from "react-icons/fi";
import { useAuth } from "@/contexts/AuthContext";
import simulationApi from "@/services/simulationApi";
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

type SnapshotItem = {
  session_id: number;
  session_name: string;
  floor_plan_name: string;
  category: string;
  area_m2: number | null;
  has_2d: boolean;
  has_3d: boolean;
  snapshot_3d_url: string | null;
  saved_at: string | null;
};

type SnapshotDetail = {
  snapshot_2d: string | null;
  snapshot_3d_url: string | null;
  saved_at: string | null;
};

function formatDate(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function MyPage() {
  const { user, isLoggedIn } = useAuth();
  const [snapshots, setSnapshots] = useState<SnapshotItem[]>([]);
  const [viewerImage, setViewerImage] = useState<string | null>(null);
  const [viewerTitle, setViewerTitle] = useState("");
  const [isLoadingImage, setIsLoadingImage] = useState(false);

  useEffect(() => {
    simulationApi
      .get<SnapshotItem[]>("/snapshots")
      .then(({ data }) => setSnapshots(data))
      .catch((err) => console.error("Failed to load snapshots:", err));
  }, []);

  const floorPlanSnapshots = snapshots.filter((s) => s.has_2d);
  const renderedSnapshots = snapshots.filter((s) => s.has_3d);

  const openSnapshot = async (sessionId: number, type: "2d" | "3d", title: string) => {
    if (type === "3d") {
      const item = snapshots.find((s) => s.session_id === sessionId);
      if (item?.snapshot_3d_url) {
        setViewerTitle(title);
        setViewerImage(item.snapshot_3d_url);
      }
      return;
    }

    setIsLoadingImage(true);
    setViewerTitle(title);
    try {
      const { data } = await simulationApi.get<SnapshotDetail>(
        `/sessions/${sessionId}/snapshot`,
      );
      setViewerImage(data.snapshot_2d);
    } catch {
      alert("이미지를 불러올 수 없습니다.");
    } finally {
      setIsLoadingImage(false);
    }
  };

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
                <strong>{floorPlanSnapshots.length}</strong>
                <span>받은 배치도면</span>
              </div>
              <div className={styles.summaryCard}>
                <FiImage size={18} />
                <strong>{renderedSnapshots.length}</strong>
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
                  <p className={styles.panelSub}>시뮬레이션에서 저장한 2D 도면을 확인하세요.</p>
                </div>
              </div>
              <div className={styles.visualGrid}>
                {floorPlanSnapshots.length === 0 ? (
                  <p style={{ color: "#999", padding: "20px 0" }}>저장된 배치도면이 없습니다.</p>
                ) : (
                  floorPlanSnapshots.map((item, index) => (
                    <div
                      key={item.session_id}
                      className={styles.visualCard}
                      style={{ cursor: "pointer" }}
                      onClick={() => openSnapshot(item.session_id, "2d", `${item.floor_plan_name} 배치도`)}
                    >
                      <div className={`${styles.visualPreview} ${styles[`floorTone${(index % 2) + 1}`]}`}>
                        <div className={styles.roomBoxLarge} />
                        <div className={styles.roomBoxSmall} />
                        <div className={styles.roomLine} />
                      </div>
                      <div className={styles.visualText}>
                        <strong>{item.floor_plan_name}</strong>
                        <p>{item.category} · {item.area_m2 ? `${item.area_m2}m²` : ""}</p>
                        <span>{item.saved_at ? formatDate(item.saved_at) : ""}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </article>

            <article className={`${styles.panel} ${styles.panelWide}`}>
              <div className={styles.panelHeader}>
                <div className={styles.panelIcon}>
                  <FiStar size={20} />
                </div>
                <div>
                  <h3 className={styles.panelTitle}>내 3D 이미지</h3>
                  <p className={styles.panelSub}>AI가 생성한 3D 인테리어 이미지를 확인하세요.</p>
                </div>
              </div>
              <div className={styles.renderGrid}>
                {renderedSnapshots.length === 0 ? (
                  <p style={{ color: "#999", padding: "20px 0" }}>저장된 3D 이미지가 없습니다.</p>
                ) : (
                  renderedSnapshots.map((item) => (
                    <div
                      key={`3d-${item.session_id}`}
                      className={styles.renderCard}
                      style={{ cursor: "pointer" }}
                      onClick={() => openSnapshot(item.session_id, "3d", `${item.floor_plan_name} 3D`)}
                    >
                      <div className={styles.renderPreview} style={{ overflow: "hidden" }}>
                        {item.snapshot_3d_url ? (
                          <img
                            src={item.snapshot_3d_url}
                            alt={item.floor_plan_name}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                        ) : (
                          <>
                            <div className={styles.renderMain} />
                            <div className={styles.renderSide} />
                          </>
                        )}
                      </div>
                      <div className={styles.visualText}>
                        <strong>{item.floor_plan_name} 3D</strong>
                        <p>{item.category} · {item.area_m2 ? `${item.area_m2}m²` : ""}</p>
                        <span className={styles.inlineAction}>
                          자세히 보기
                          <FiArrowRight size={14} />
                        </span>
                      </div>
                    </div>
                  ))
                )}
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
      {viewerImage && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 9999,
            background: "rgba(0,0,0,0.75)", display: "flex",
            alignItems: "center", justifyContent: "center",
          }}
          onClick={() => { setViewerImage(null); setViewerTitle(""); }}
        >
          <div
            style={{
              position: "relative", background: "#fff", borderRadius: 12,
              padding: 16, maxWidth: "90vw", maxHeight: "90vh",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <strong style={{ fontSize: 16 }}>{viewerTitle}</strong>
              <button
                type="button"
                onClick={() => { setViewerImage(null); setViewerTitle(""); }}
                style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}
              >
                <FiX size={20} />
              </button>
            </div>
            {isLoadingImage ? (
              <div style={{ padding: "60px 120px", textAlign: "center", color: "#999" }}>불러오는 중...</div>
            ) : (
              <img
                src={viewerImage}
                alt={viewerTitle}
                style={{ maxWidth: "85vw", maxHeight: "80vh", objectFit: "contain", borderRadius: 8 }}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default MyPage;
