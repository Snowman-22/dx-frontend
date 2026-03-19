import { Link } from "react-router-dom";
import styles from "./TimeDeal.module.css";

const PRODUCTS = [
  {
    id: 1,
    name: "LG 그램 Pro AI 2026 · 40.6cm",
    model: "16Z95U-GS5WK",
    originalPrice: "2,490,000",
    discountRate: "15%",
    price: "2,101,800",
    badge: "닷컴 ONLY",
    imageUrl:
      "https://www.lge.co.kr/kr/images/notebook/md10744830/md10744830-280x280.jpg",
  },
  {
    id: 2,
    name: "LG 트롬 세탁기 · 25kg · 1등급 · 스팀",
    model: "DUE4BGE",
    originalPrice: null,
    discountRate: null,
    price: "809,100",
    badge: null,
    imageUrl:
      "https://www.lge.co.kr/kr/images/dishwashers/md10645836/md10645836-280x280.jpg",
  },
  {
    id: 3,
    name: "LG 올레드 TV · 55인치 · 4K · AI",
    model: "OLED55B4KNA",
    originalPrice: "1,890,000",
    discountRate: "20%",
    price: "1,512,000",
    badge: "닷컴 ONLY",
    imageUrl:
      "https://www.lge.co.kr/kr/images/tvs/md10319945/md10319945-280x280.jpg",
  },
];

function TimeDeal() {
  return (
    <section className={styles.timeDeal}>
      <div className={styles.inner}>
        <div className={styles.header}>
          <h2 className={styles.title}>LGE.COM 타임딜</h2>
          <p className={styles.subtitle}>한정 시간 특별 혜택</p>
        </div>
        <div className={styles.productList}>
          {PRODUCTS.map((product) => (
            <Link
              to={`/product/${product.model}`}
              key={product.id}
              className={styles.productCard}
            >
              <div className={styles.imageWrap}>
                {product.badge && (
                  <span className={styles.badge}>{product.badge}</span>
                )}
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className={styles.productImage}
                />
              </div>
              <div className={styles.info}>
                <h3 className={styles.productName}>{product.name}</h3>
                <p className={styles.model}>{product.model}</p>
                {product.discountRate && (
                  <p className={styles.originalPrice}>
                    <span className={styles.discountRate}>
                      {product.discountRate}
                    </span>{" "}
                    <span className={styles.lineThrough}>
                      {product.originalPrice}원
                    </span>
                  </p>
                )}
                <p className={styles.price}>
                  <span className={styles.priceLabel}>최대혜택가</span>{" "}
                  <span className={styles.priceValue}>{product.price}</span>원
                </p>
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

export default TimeDeal;
