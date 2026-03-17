import { Link } from "react-router-dom";
import styles from "./HomeStyle.module.css";

const CARDS = [
  {
    id: 1,
    tag: "홈스타일링",
    title: "취향을 발견하는\n홈스타일 콘텐츠",
    subtitle: "나만의 취향 탐색, 스타일 큐레이션",
    link: "/home-style/content",
  },
  {
    id: 2,
    tag: "공간별 가전",
    title: "공간에 맞는\n가전 추천",
    subtitle: "거실, 주방, 침실 맞춤 가전",
    link: "/home-style/space",
  },
];

function HomeStyle() {
  return (
    <section className={styles.homeStyle}>
      <div className={styles.inner}>
        <div className={styles.header}>
          <h2 className={styles.title}>홈스타일 탐색하기</h2>
          <p className={styles.subtitle}>가전과 공간을 연결하는 새로운 기준</p>
        </div>
        <div className={styles.cardList}>
          {CARDS.map((card) => (
            <Link to={card.link} key={card.id} className={styles.card}>
              <div className={styles.cardImage}>
                <div className={styles.imagePlaceholder}>
                  <span>인테리어 이미지</span>
                </div>
              </div>
              <div className={styles.cardText}>
                <span className={styles.tag}>{card.tag}</span>
                <h3 className={styles.cardTitle}>
                  {card.title.split("\n").map((line, i) => (
                    <span key={i}>
                      {line}
                      {i < card.title.split("\n").length - 1 && <br />}
                    </span>
                  ))}
                </h3>
                <p className={styles.cardSubtitle}>{card.subtitle}</p>
              </div>
            </Link>
          ))}
        </div>
        <div className={styles.scrollBar}>
          <div className={styles.scrollThumb} />
        </div>
      </div>
    </section>
  );
}

export default HomeStyle;
