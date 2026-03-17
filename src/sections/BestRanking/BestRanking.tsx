import { useState } from "react";
import { Link } from "react-router-dom";
import styles from "./BestRanking.module.css";

const CATEGORIES = [
  "전체",
  "노트북/태블릿",
  "청소기",
  "세탁기",
  "워시타워",
  "워시콤보",
  "의류건조기",
  "냉장고",
  "컨버터블 패키지",
  "김치냉장고",
];

const PRODUCTS = [
  {
    id: 1,
    rank: 1,
    name: "LG 디오스 오브제컬렉션 냉장고 (노크온 매직스페이스) · 832L · 2등급",
    model: "S836MEE022",
    originalPrice: "1,290,000",
    discountRate: "26%",
    price: "1,134,600",
    badge: "닷컴 ONLY",
  },
  {
    id: 2,
    rank: 2,
    name: "LG 전자레인지 · 20L · 화이트",
    model: "MW20GDN",
    originalPrice: null,
    discountRate: "29%",
    price: "119,000",
    badge: null,
  },
  {
    id: 3,
    rank: 3,
    name: "LG 스탠바이미 2 · 27인치",
    model: "27LX6TPGA",
    originalPrice: "1,290,000",
    discountRate: null,
    price: "1,134,600",
    badge: null,
  },
];

function BestRanking() {
  const [activeCategory, setActiveCategory] = useState(0);

  return (
    <section className={styles.bestRanking}>
      <div className={styles.inner}>
        <div className={styles.header}>
          <h2 className={styles.title}>베스트 랭킹</h2>
          <p className={styles.subtitle}>LGE.COM 인기 제품 추천</p>
        </div>

        <div className={styles.categories}>
          {CATEGORIES.map((cat, i) => (
            <button
              key={cat}
              className={`${styles.categoryBtn} ${i === activeCategory ? styles.categoryActive : ""}`}
              onClick={() => setActiveCategory(i)}
            >
              <div className={styles.categoryIcon}>
                <div className={styles.categoryIconPlaceholder} />
              </div>
              <span>{cat}</span>
            </button>
          ))}
        </div>

        <div className={styles.productList}>
          {PRODUCTS.map((product) => (
            <Link
              to={`/product/${product.model}`}
              key={product.id}
              className={styles.productCard}
            >
              <div className={styles.imageWrap}>
                <span className={styles.rank}>{product.rank}</span>
                {product.badge && (
                  <span className={styles.badge}>{product.badge}</span>
                )}
                <div className={styles.imagePlaceholder}>
                  <span>제품 이미지</span>
                </div>
              </div>
              <div className={styles.info}>
                <h3 className={styles.productName}>{product.name}</h3>
                <p className={styles.model}>{product.model}</p>
                {product.discountRate && (
                  <p className={styles.discount}>
                    <span className={styles.discountRate}>
                      {product.discountRate}
                    </span>{" "}
                    {product.originalPrice && (
                      <span className={styles.originalPrice}>
                        {product.originalPrice}원
                      </span>
                    )}
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

export default BestRanking;
