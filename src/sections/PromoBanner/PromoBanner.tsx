import { Link } from "react-router-dom";
import styles from "./PromoBanner.module.css";

const BANNERS = [
  {
    id: 1,
    title: "LGE.COM 홈스타일\n시몬스 타임특가 오픈!",
    link: "/events/homestyle",
    bgColor: "#f0e6d3",
  },
  {
    id: 2,
    title: "LG 베스트샵\n봄맞이 특별 할인전",
    link: "/events/spring-sale",
    bgColor: "#e6f0e6",
  },
  {
    id: 3,
    title: "가전 구독 혜택\n월 요금 반값 할인",
    link: "/subscription",
    bgColor: "#e6e6f0",
  },
];

function PromoBanner() {
  return (
    <section className={styles.promoBanner}>
      <div className={styles.inner}>
        {BANNERS.map((banner) => (
          <Link
            to={banner.link}
            key={banner.id}
            className={styles.bannerCard}
            style={{ backgroundColor: banner.bgColor }}
          >
            <div className={styles.bannerText}>
              <h3 className={styles.bannerTitle}>
                {banner.title.split("\n").map((line, i) => (
                  <span key={i}>
                    {line}
                    {i < banner.title.split("\n").length - 1 && <br />}
                  </span>
                ))}
              </h3>
              <span className={styles.bannerLink}>자세히 보기</span>
            </div>
            <div className={styles.bannerImage}>
              <div className={styles.imagePlaceholder} />
            </div>
          </Link>
        ))}
      </div>
      <div className={styles.dots}>
        <span className={styles.dotActive} />
        <span className={styles.dot} />
        <span className={styles.dot} />
      </div>
    </section>
  );
}

export default PromoBanner;
