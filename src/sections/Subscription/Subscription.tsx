import { useState } from "react";
import { Link } from "react-router-dom";
import styles from "./Subscription.module.css";

const CATEGORIES = [
  "정수기",
  "에어컨",
  "워시타워",
  "워시콤보",
  "건조기",
  "스타일러",
  "냉장고",
  "김치냉장고",
  "TV",
  "노트북",
  "가습기",
  "식기세척기",
];

const PRODUCTS = [
  {
    id: 1,
    name: "LG 퓨리케어 정수기 오브제컬렉션 (냉온정)",
    model: "WD523ACB",
    monthlyPrice: "29,900",
    badge: "닷컴 ONLY",
    discountTag: "요금 할인",
  },
  {
    id: 2,
    name: "LG 퓨리케어 정수기 오브제컬렉션 (냉정)",
    model: "WD321ACB",
    monthlyPrice: "25,900",
    badge: null,
    discountTag: null,
  },
  {
    id: 3,
    name: "LG 퓨리케어 상하좌우 정수기",
    model: "WD505AS",
    monthlyPrice: "22,900",
    badge: "닷컴 ONLY",
    discountTag: "요금 할인",
  },
];

function Subscription() {
  const [activeCategory, setActiveCategory] = useState(0);

  return (
    <section className={styles.subscription}>
      <div className={styles.inner}>
        <div className={styles.header}>
          <h2 className={styles.title}>가전 구독</h2>
          <p className={styles.subtitle}>
            LG전자만의 라이프 맞춤 구독 서비스
          </p>
        </div>

        <div className={styles.categories}>
          {CATEGORIES.map((cat, i) => (
            <button
              key={cat}
              className={`${styles.categoryBtn} ${i === activeCategory ? styles.categoryActive : ""}`}
              onClick={() => setActiveCategory(i)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className={styles.content}>
          <div className={styles.featureCard}>
            <h3 className={styles.featureTitle}>
              {CATEGORIES[activeCategory]} &gt;
            </h3>
            <p className={styles.featureDesc}>
              월 요금 반값 할인과
              <br />
              멤버십 최대 3만P까지!
            </p>
            <div className={styles.featureImagePlaceholder}>
              <span>제품 이미지</span>
            </div>
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
                  {product.discountTag && (
                    <span className={styles.discountTag}>
                      {product.discountTag}
                    </span>
                  )}
                  <div className={styles.imagePlaceholder}>
                    <span>제품 이미지</span>
                  </div>
                </div>
                <div className={styles.info}>
                  <h3 className={styles.productName}>{product.name}</h3>
                  <p className={styles.model}>{product.model}</p>
                  <p className={styles.price}>
                    월{" "}
                    <span className={styles.priceValue}>
                      {product.monthlyPrice}
                    </span>
                    원~
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Subscription;
