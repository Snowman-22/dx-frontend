import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();

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

        <button
          type="button"
          className={styles.startBtn}
          disabled={!selected}
          onClick={() => navigate("/chatbot", { state: { lifeType: selected } })}
        >
          선택한 유형으로 시작하기
        </button>
      </section>
    </div>
  );
}

export default Recommend;
