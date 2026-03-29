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
import axios from "axios";
import { useAuth, getAccessToken } from "@/contexts/AuthContext";
import simulationApi from "@/services/simulationApi";
import styles from "./MyPage.module.css";

const apiBase = import.meta.env.VITE_API_BASE || "/api";

type CartItem = {
  cart_id: number;
  product_id: number;
  model_id: string;
  name: string;
  brand: string;
  category: string;
  quantity: number;
  price: number;
  image: string;
  product_url: string;
};

type ChatHistoryItem = {
  id: string;
  title: string;
  summary: string;
  time: string;
};

type SnapshotItem = {
  session_id: number;
  session_name: string;
  floor_plan_name: string;
  category: string;
  area_m2: number | null;
  has_2d: boolean;
  has_3d: boolean;
  snapshot_2d: string | null;
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
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([]);
  const [viewerImage, setViewerImage] = useState<string | null>(null);
  const [viewerTitle, setViewerTitle] = useState("");
  const [isLoadingImage, setIsLoadingImage] = useState(false);
  const [expandedChatId, setExpandedChatId] = useState<string | null>(null);
  const [chatDetail, setChatDetail] = useState<Record<string, { questions: { step: string; question: string; answer: string }[]; packages: string[] }>>({});
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const params = user?.id ? { user_id: user.id } : {};
    simulationApi
      .get<SnapshotItem[]>("/snapshots", { params })
      .then(({ data }) => setSnapshots(data))
      .catch((err) => console.error("Failed to load snapshots:", err));
  }, [user]);

  // 장바구니 로드
  useEffect(() => {
    if (!user?.id) return;
    const token = getAccessToken();
    if (!token) return;
    simulationApi.get<{ chat_id: string }[]>(`/user/${user.id}/cart-chats`)
      .then(async ({ data: chats }) => {
        // 가장 최근 chatId부터 장바구니가 있는 것을 찾음
        for (const chat of chats) {
          try {
            const { data } = await axios.get<CartItem[]>(
              `${apiBase}/cart/${chat.chat_id}`,
              { headers: { Authorization: `Bearer ${token}` } },
            );
            if (data.length > 0) {
              setCartItems(data);
              return;
            }
          } catch { /* skip */ }
        }
        setCartItems([]);
      })
      .catch((err) => console.error("Failed to load cart:", err));
  }, [user]);

  // 채팅 내역 로드
  useEffect(() => {
    if (!user) return;
    simulationApi.get<ChatHistoryItem[]>("/chat-history", { params: { user_id: user.id } })
      .then(({ data }) => {
        const items = data.map((c) => ({ ...c, time: formatDate(c.time) }));
        setChatHistory(items);
      })
      .catch((err) => console.error("Failed to load chat history:", err));
  }, [user]);

  const loadChatDetail = async (chatId: string) => {
    if (chatDetail[chatId]) {
      setExpandedChatId(expandedChatId === chatId ? null : chatId);
      return;
    }
    const token = getAccessToken();
    if (!token) return;
    try {
      const { data } = await axios.get(`${apiBase}/chats/${chatId}/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const msgs = data?.conversation?.messages ?? [];
      const questions: { step: string; question: string; answer: string }[] = [];

      const stepLabels: Record<string, string> = {
        CHAT_0: "집 평수", CHAT_2: "보유/필요 가전", CHAT_3: "가구 추천 여부",
        CHAT_4: "인테리어 스타일", CHAT_5: "라이프스타일", CHAT_6: "예산", CHAT_7: "필요 가구",
        RECOMMEND_RAG: "질문",
      };

      for (let i = 0; i < msgs.length; i++) {
        const msg = msgs[i];
        if (msg.role === "USER" && msg.step_code) {
          const payload = msg.payload_json;
          let answerStr = "";
          if (typeof payload === "string") {
            answerStr = payload || "(선택 안 함)";
          } else if (Array.isArray(payload)) {
            answerStr = payload.join(", ");
          } else if (payload && typeof payload === "object") {
            if (payload.owned || payload.needed) {
              const owned = payload.owned?.join(", ") || "없음";
              const needed = payload.needed?.join(", ") || "없음";
              answerStr = `보유: ${owned} / 필요: ${needed}`;
            } else {
              answerStr = JSON.stringify(payload);
            }
          }

          // RECOMMEND_RAG인 경우 다음 ASSISTANT 메시지에서 답변 추출
          let aiAnswer = "";
          if (msg.step_code === "RECOMMEND_RAG") {
            const nextMsg = msgs[i + 1];
            if (nextMsg?.role === "ASSISTANT") {
              aiAnswer = nextMsg.ai_response || nextMsg.data_json?.ai_response || nextMsg.payload_json || "";
            }
          }

          questions.push({
            step: stepLabels[msg.step_code] || msg.step_code,
            question: msg.step_code === "RECOMMEND_RAG"
              ? answerStr
              : (msg.assistant_text || stepLabels[msg.step_code] || ""),
            answer: msg.step_code === "RECOMMEND_RAG"
              ? (aiAnswer || "답변 대기 중")
              : answerStr,
          });
        }
      }
      const packages: string[] = [];
      setChatDetail((prev) => ({ ...prev, [chatId]: { questions, packages } }));
      setExpandedChatId(chatId);
    } catch {
      console.error("Failed to load chat detail");
    }
  };

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
                <strong>{cartItems.length}</strong>
                <span>장바구니 상품</span>
              </div>
              <div className={styles.summaryCard}>
                <FiMessageSquare size={18} />
                <strong>{chatHistory.length}</strong>
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
                {cartItems.length === 0 ? (
                  <p style={{ color: "#999", padding: "20px 0", textAlign: "center" }}>저장된 장바구니가 없습니다.</p>
                ) : (
                  cartItems.map((item) => (
                    <div key={item.cart_id} className={styles.listItem}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        {item.image && (
                          <img src={item.image} alt={item.name} style={{ width: 48, height: 48, objectFit: "contain", borderRadius: 4 }} />
                        )}
                        <div className={styles.itemText}>
                          <strong>{item.name}</strong>
                          <span>{item.brand} · {item.category}</span>
                        </div>
                      </div>
                      <div className={styles.itemMeta}>
                        <b>{item.price ? `${item.price.toLocaleString()}원` : ""}</b>
                      </div>
                    </div>
                  ))
                )}
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
                {chatHistory.length === 0 ? (
                  <p style={{ color: "#999", padding: "20px 0" }}>상담 내역이 없습니다.</p>
                ) : (
                  chatHistory.map((item) => (
                    <div key={item.id}>
                      <div
                        className={styles.timelineItem}
                        style={{ cursor: "pointer" }}
                        onClick={() => loadChatDetail(item.id)}
                      >
                        <div className={styles.timelineDot} />
                        <div className={styles.timelineContent}>
                          <div className={styles.timelineHeader}>
                            <strong>{item.title}</strong>
                            <span>
                              <FiClock size={14} />
                              {item.time}
                            </span>
                          </div>
                          <p style={{ fontSize: 12, color: "#888" }}>
                            {expandedChatId === item.id ? "▲ 접기" : "▼ 상세보기"}
                          </p>
                        </div>
                      </div>
                      {expandedChatId === item.id && chatDetail[item.id] && (
                        <div style={{
                          marginLeft: 24, padding: "12px 16px", background: "#f8f9fa",
                          borderRadius: 10, marginBottom: 12, fontSize: 13,
                        }}>
                          {chatDetail[item.id].questions.map((q, i) => (
                            <div key={i} style={{
                              display: "flex", gap: 8, marginBottom: 8,
                              paddingBottom: 8, borderBottom: "1px solid #eee",
                            }}>
                              <span style={{ color: "#3C5D5D", fontWeight: 700, minWidth: 90 }}>{q.step}</span>
                              {q.step === "질문" ? (
                                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                                  <span style={{ color: "#333", fontWeight: 600 }}>Q. {q.question}</span>
                                  <span style={{ color: "#666", fontSize: 13 }}>A. {q.answer}</span>
                                </div>
                              ) : (
                                <span style={{ color: "#333" }}>{q.answer}</span>
                              )}
                            </div>
                          ))}
                          {/* 추천 패키지 목록 제거됨 */}
                        </div>
                      )}
                    </div>
                  ))
                )}
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
                        {item.snapshot_2d ? (
                          <img
                            src={item.snapshot_2d}
                            alt={item.floor_plan_name}
                            style={{ width: "100%", height: "100%", objectFit: "contain", borderRadius: 8 }}
                          />
                        ) : (
                          <>
                            <div className={styles.roomBoxLarge} />
                            <div className={styles.roomBoxSmall} />
                            <div className={styles.roomLine} />
                          </>
                        )}
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
