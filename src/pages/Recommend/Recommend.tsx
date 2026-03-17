import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Recommend.module.css";

const LIFE_TYPES = [
  {
    id: "single",
    title: "싱글 라이프",
    desc: "나만의 공간에 맞는 가전과 가구를 추천해드려요",
  },
  {
    id: "couple",
    title: "함께 시작하는 집",
    desc: "두 사람의 생활에 맞는 공간 구성을 도와드려요",
  },
  {
    id: "baby",
    title: "아기가 있는 집",
    desc: "아이에게 안전하고 편리한 공간을 제안해드려요",
  },
  {
    id: "kids",
    title: "자녀와 함께하는 집",
    desc: "성장기 가족의 생활 패턴에 맞춰 추천해드려요",
  },
  {
    id: "parents",
    title: "부모님과 함께하는 집",
    desc: "모두가 편안한 생활 동선을 함께 살펴보드려요",
  },
  {
    id: "restart",
    title: "독립 후 다시 꾸미는 집",
    desc: "달라진 라이프에 맞는 편안한 공간 구성을 도와드려요",
  },
];

function Recommend() {
  const [selected, setSelected] = useState<string | null>(null);
  const navigate = useNavigate();

  return (
    <div className={styles.page}>
      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroIcon}>
          <svg viewBox="0 0 80 80" width="80" height="80" fill="none">
            <path
              d="M40 10 C20 10, 10 30, 10 45 C10 60, 25 70, 40 70 C55 70, 70 60, 70 45 C70 30, 60 10, 40 10Z"
              fill="#83E3CB"
              opacity="0.7"
            />
            <path
              d="M40 15 C30 15, 22 28, 22 40 C22 52, 30 60, 40 60"
              stroke="#2DBFA0"
              strokeWidth="4"
              strokeLinecap="round"
              fill="none"
            />
            <circle cx="50" cy="30" r="3" fill="#2DBFA0" />
            <circle cx="55" cy="38" r="2.5" fill="#2DBFA0" />
          </svg>
        </div>
        <h1 className={styles.heroTitle}>
          우리 집에 맞는 공간 솔루션을 찾아보세요
        </h1>
        <p className={styles.heroDesc}>
          생활 방식과 가족 구성에 맞춰
          <br />
          가전·가구 추천부터 설치 가능 여부, 배치 제안까지 도와드려요.
        </p>
      </section>

      {/* Selection Cards */}
      <section className={styles.cardSection}>
        <div className={styles.cardGrid}>
          {LIFE_TYPES.map((type) => (
            <button
              key={type.id}
              className={`${styles.card} ${selected === type.id ? styles.cardActive : ""}`}
              onClick={() => setSelected(type.id)}
            >
              <div className={styles.cardThumb}>
                <svg viewBox="0 0 100 80" width="100" height="80" fill="none">
                  <rect x="15" y="20" width="30" height="40" rx="6" fill="#83E3CB" opacity="0.5" />
                  <rect x="55" y="10" width="30" height="50" rx="6" fill="#83E3CB" opacity="0.7" />
                  <circle cx="30" cy="55" r="5" fill="#2DBFA0" />
                  <circle cx="70" cy="55" r="5" fill="#2DBFA0" />
                  <circle cx="60" cy="25" r="3" fill="#fff" />
                  <circle cx="66" cy="30" r="2" fill="#fff" />
                </svg>
              </div>
              <h3 className={styles.cardTitle}>{type.title}</h3>
              <p className={styles.cardDesc}>{type.desc}</p>
            </button>
          ))}
        </div>

        <button
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
