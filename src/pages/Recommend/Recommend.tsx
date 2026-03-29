import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { prestartChat, startChat, toStarterPackageType } from "@/services/chatService";
import snowLogo from "../../assets/images/snow_logo.png";
import styles from "./Recommend.module.css";

type LifeTypeId = "single" | "couple" | "baby" | "kids" | "parents" | "restart";

interface TitlePart {
  text: string;
  accent?: boolean;
}

interface LifeTypeCard {
  id: LifeTypeId;
  title: TitlePart[];
  desc: string;
}

const LIFE_TYPES: LifeTypeCard[] = [
  {
    id: "single",
    title: [
      { text: "싱글 " },
      { text: "라이프", accent: true },
    ],
    desc: "혼자 사는 공간에 맞는\n가전과 가구를 추천해드려요",
  },
  {
    id: "couple",
    title: [
      { text: "함께 " },
      { text: "시작하는 집", accent: true },
    ],
    desc: "두 사람의 생활에 맞는\n공간 구성을 도와드려요",
  },
  {
    id: "baby",
    title: [
      { text: "아기가 ", accent: true },
      { text: "있는 집" },
    ],
    desc: "육아에 필요한 안전하고\n편리한 공간을 제안해드려요",
  },
  {
    id: "kids",
    title: [
      { text: "자녀와 ", accent: true },
      { text: "함께하는 집" },
    ],
    desc: "성장하는 가족의\n생활 패턴에 맞춰 추천해드려요",
  },
  {
    id: "parents",
    title: [
      { text: "부모님과 ", accent: true },
      { text: "함께하는 집" },
    ],
    desc: "모두가 편안한\n생활 동선을 함께 살펴봐드려요",
  },
  {
    id: "restart",
    title: [
      { text: "은퇴 후 ", accent: true },
      { text: "다시 꾸미는 집" },
    ],
    desc: "달라진 일상에 맞는\n편안한 공간 구성을 도와드려요",
  },
];

function Recommend() {
  const [selected, setSelected] = useState<LifeTypeId | null>(null);
  const [isLoginPromptOpen, setIsLoginPromptOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    document.title = "Home Canvas";
    return () => { document.title = "LGE.COM | LG전자"; };
  }, []);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  const getRedirectState = () => ({
    redirectTo: "/chatbot",
    lifeType: selected,
  });

  const handleStart = async () => {
    if (!selected) return;

    if (!isLoggedIn) {
      setIsLoginPromptOpen(true);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // 1. prestart → starter_package_id
      const packageType = toStarterPackageType(selected);
      const starterPackageId = await prestartChat(packageType);

      // 2. start → chat session
      const session = await startChat(starterPackageId);

      // 3. 세션 정보와 함께 chatbot으로 이동
      navigate("/chatbot", {
        state: {
          lifeType: selected,
          chatSession: session,
        },
      });
    } catch (err) {
      console.error("채팅 세션 생성 실패:", err);
      setError("채팅 세션을 생성하지 못했습니다. 다시 시도해주세요.");
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <img src={snowLogo} alt="" className={styles.heroLogo} aria-hidden="true" />

        <div className={styles.heroPanel}>
          <h1 className={styles.heroTitle}>우리 집에 맞는 공간 솔루션을 찾아보세요</h1>
          <p className={styles.heroDesc}>
            생활 방식과 가족 구성에 맞춰
            <br />
            가전·가구 추천부터 설치 가능 여부, 배치 제안까지 도와드려요.
          </p>
        </div>
      </section>

      <section className={styles.selectionSection}>
        <div className={styles.cardGrid}>
          {LIFE_TYPES.map((type) => (
            <button
              key={type.id}
              type="button"
              aria-pressed={selected === type.id}
              className={`${styles.card} ${styles[`card_${type.id}`]} ${
                selected === type.id ? styles.cardActive : ""
              }`}
              onClick={() => setSelected(type.id)}
            >
              <div className={styles.cardGlow} aria-hidden="true" />
              <div className={styles.cardContent}>
                <h2 className={styles.cardTitle}>
                  {type.title.map((part, index) => (
                    <span
                      key={`${type.id}-${index}`}
                      className={part.accent ? styles.cardTitleAccent : undefined}
                    >
                      {part.text}
                    </span>
                  ))}
                </h2>
                <p className={styles.cardDesc}>{type.desc}</p>
              </div>

              <div className={styles.cardArtwork} aria-hidden="true">
                {type.id === "baby" && (
                  <svg
                    className={styles.babyCurve}
                    viewBox="0 0 120 180"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M106 8
                        C78 10 42 30 24 64
                        C7 98 10 142 24 178
                        L56 178
                        C42 138 46 101 63 72
                        C79 44 98 31 114 31
                        C114 20 111 12 106 8Z"
                      fill="#79cd77"
                    />
                  </svg>
                )}

                {type.id === "parents" && (
                  <div className={styles.parentsFace}>
                    <span className={styles.parentEye} />
                    <span className={styles.parentEye} />
                    <span className={styles.parentSmile} />
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>

        {error && <p className={styles.errorText}>{error}</p>}
        <button
          type="button"
          className={styles.startBtn}
          disabled={!selected || isLoading}
          onClick={handleStart}
        >
          {isLoading ? "채팅방 준비 중..." : "선택한 유형으로 시작하기"}
        </button>
      </section>

      {isLoginPromptOpen && (
        <div
          className={styles.modalBackdrop}
          role="presentation"
          onClick={() => setIsLoginPromptOpen(false)}
        >
          <div
            className={styles.modalCard}
            role="dialog"
            aria-modal="true"
            aria-labelledby="recommend-login-title"
            onClick={(e) => e.stopPropagation()}
          >
            <span className={styles.modalEyebrow}>회원 전용 서비스</span>
            <h2 id="recommend-login-title" className={styles.modalTitle}>
              선택한 유형 기반 추천 서비스는
              <br />
              로그인한 회원만 이용할 수 있어요
            </h2>
            <p className={styles.modalDescription}>
              LG전자 계정으로 로그인하면
              <br />
              선택한 라이프 유형에 맞춘 공간 추천을
              <br />
              바로 이어서 받아볼 수 있어요.
            </p>
            <p className={styles.modalDescription}>
              아직 회원이 아니신가요?
              <br />
              지금 가입하고 맞춤 추천은 물론,
              <br />
              다양한 회원 혜택과 편리한 서비스를 함께 누려보세요.
            </p>
            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.modalSecondaryBtn}
                onClick={() => navigate("/login", { state: getRedirectState() })}
              >
                로그인
              </button>
              <button
                type="button"
                className={styles.modalPrimaryBtn}
                onClick={() => navigate("/signup", { state: getRedirectState() })}
              >
                회원가입
              </button>
            </div>
            <button
              type="button"
              className={styles.modalCloseBtn}
              onClick={() => setIsLoginPromptOpen(false)}
            >
              나중에 할게요
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Recommend;
