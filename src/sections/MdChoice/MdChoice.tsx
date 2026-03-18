import { Link } from "react-router-dom";
import styles from "./MdChoice.module.css";

const PRODUCTS = [
  {
    id: 1,
    name: "LG 그램 Pro AI 2026 · 40.6cm · AMD 라이젠™ AI 5",
    model: "16Z95U-GS5WK",
    price: "2,101,800",
    badge: "닷컴 ONLY",
    imageUrl:
      "https://www.lge.co.kr/kr/images/notebook/md10744830/md10744830-280x280.jpg",
  },
  {
    id: 2,
    name: "LG 퓨리케어 360° 공기청정기 Hit · 62㎡ · 2등급",
    model: "AS186HWWL",
    price: "343,100",
    badge: "닷컴 ONLY",
    imageUrl:
      "https://www.lge.co.kr/kr/images/air-purifier/md10745833/md10745833-280x280.jpg",
  },
  {
    id: 3,
    name: "LG 스타일러 오브제컬렉션 · 5벌 · 1등급",
    model: "SC5MBR62B",
    price: "1,487,700",
    badge: null,
    imageUrl:
      "https://www.lge.co.kr/kr/images/lg-styler/md10724835/md10724835-280x280.jpg",
  },
  {
    id: 4,
    name: "LG 올레드 TV · 65인치 · 4K",
    model: "OLED65C4KNA",
    price: "2,390,000",
    badge: "닷컴 ONLY",
    imageUrl:
      "https://www.lge.co.kr/kr/images/tvs/md10319903/md10319903-280x280.jpg",
  },
];

function MdChoice() {
  return (
    <section className={styles.mdChoice}>
      <div className={styles.inner}>
        <div className={styles.header}>
          <h2 className={styles.title}>MD's CHOICE</h2>
          <p className={styles.subtitle}>놓치기 아쉬운 특별한 가격</p>
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

export default MdChoice;
