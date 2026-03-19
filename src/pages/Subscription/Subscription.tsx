import { useState, useEffect, useCallback } from "react";
import { FiChevronLeft, FiChevronRight, FiStar, FiHeart } from "react-icons/fi";
import {
  SUB_CATEGORIES,
  HERO_SLIDES,
  QUICK_LINKS,
  getSubscriptionProducts,
  formatMonthlyPrice,
} from "@/data/subscriptionData";
import type { SubscriptionProduct } from "@/data/subscriptionData";
import styles from "./Subscription.module.css";

function Subscription() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [currentSlide, setCurrentSlide] = useState(0);

  const products: SubscriptionProduct[] = getSubscriptionProducts(activeCategory);

  // 히어로 자동 슬라이드
  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(nextSlide, 4000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  };

  return (
    <div className={styles.page}>
      {/* ── 히어로 배너 ── */}
      <section className={styles.hero}>
        <div
          className={styles.heroTrack}
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {HERO_SLIDES.map((slide) => (
            <div
              key={slide.id}
              className={styles.heroSlide}
              style={{ background: slide.bgColor }}
            >
              <div className={styles.heroContent}>
                <p className={styles.heroLabel}>LG 가전 구독</p>
                <h2 className={styles.heroTitle}>{slide.title}</h2>
                <p className={styles.heroDesc}>{slide.desc}</p>
                <span className={styles.heroHighlight}>{slide.highlight}</span>
              </div>
              <div className={styles.heroImage}>
                <span>프로모션 이미지</span>
              </div>
            </div>
          ))}
        </div>
        <button
          className={`${styles.heroArrow} ${styles.heroArrowLeft}`}
          onClick={prevSlide}
          aria-label="이전 슬라이드"
        >
          <FiChevronLeft size={24} />
        </button>
        <button
          className={`${styles.heroArrow} ${styles.heroArrowRight}`}
          onClick={nextSlide}
          aria-label="다음 슬라이드"
        >
          <FiChevronRight size={24} />
        </button>
        <div className={styles.heroDots}>
          {HERO_SLIDES.map((slide, i) => (
            <button
              key={slide.id}
              className={`${styles.heroDot} ${i === currentSlide ? styles.heroDotActive : ""}`}
              onClick={() => setCurrentSlide(i)}
              aria-label={`슬라이드 ${i + 1}`}
            />
          ))}
        </div>
      </section>

      <div className={styles.container}>
        {/* ── 퀵 링크 ── */}
        <section className={styles.quickLinks}>
          {QUICK_LINKS.map((link) => (
            <div key={link.title} className={styles.quickCard}>
              <span className={styles.quickIcon}>{link.icon}</span>
              <div>
                <p className={styles.quickTitle}>{link.title}</p>
                <p className={styles.quickDesc}>{link.desc}</p>
              </div>
              <FiChevronRight size={16} className={styles.quickArrow} />
            </div>
          ))}
        </section>

        {/* ── 카테고리 탭 ── */}
        <section className={styles.categorySection}>
          <h2 className={styles.sectionTitle}>인기 구독 제품</h2>
          <div className={styles.categoryTabs}>
            {SUB_CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                className={`${styles.categoryTab} ${activeCategory === cat.value ? styles.categoryTabActive : ""}`}
                onClick={() => setActiveCategory(cat.value)}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </section>

        {/* ── 제품 수 ── */}
        <div className={styles.resultBar}>
          <p className={styles.resultCount}>
            총 <strong>{products.length}</strong>개 제품
          </p>
        </div>

        {/* ── 제품 그리드 ── */}
        <div className={styles.productGrid}>
          {products.map((product) => (
            <SubCard key={product.id} product={product} />
          ))}
        </div>

        {/* ── 하단 안내 ── */}
        <section className={styles.infoSection}>
          <div className={styles.infoCard}>
            <h3 className={styles.infoTitle}>구독 서비스란?</h3>
            <p className={styles.infoDesc}>
              구매 부담 없이 월 구독료만 내면 최신 가전을 이용할 수 있는 서비스입니다.
              정기적인 케어 서비스와 함께 항상 최상의 상태를 유지합니다.
            </p>
          </div>
          <div className={styles.infoCard}>
            <h3 className={styles.infoTitle}>구독 혜택</h3>
            <ul className={styles.benefitList}>
              <li>무상 A/S 및 정기 케어 서비스</li>
              <li>최대 50% 요금 할인</li>
              <li>포인트 적립 혜택</li>
              <li>계약 만료 시 반납/연장/인수 선택</li>
            </ul>
          </div>
          <div className={styles.infoCard}>
            <h3 className={styles.infoTitle}>자주 묻는 질문</h3>
            <ul className={styles.faqList}>
              <li>
                <strong>Q.</strong> 구독 기간은 얼마인가요?
                <p>A. 제품에 따라 48개월 또는 60개월입니다.</p>
              </li>
              <li>
                <strong>Q.</strong> 중도 해지가 가능한가요?
                <p>A. 가능하며, 위약금이 발생할 수 있습니다.</p>
              </li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}

function SubCard({ product }: { product: SubscriptionProduct }) {
  const discountRate = product.originalMonthlyPrice
    ? Math.round(
        ((product.originalMonthlyPrice - product.monthlyPrice) /
          product.originalMonthlyPrice) *
          100,
      )
    : 0;

  return (
    <div className={styles.card}>
      {/* 이미지 */}
      <div className={styles.cardImage}>
        {product.badges.length > 0 && (
          <div className={styles.badgeRow}>
            {product.badges.map((badge) => (
              <span
                key={badge}
                className={`${styles.badge} ${
                  badge === "닷컴 ONLY"
                    ? styles.badgeOnly
                    : badge === "신제품"
                      ? styles.badgeNew
                      : badge === "1위"
                        ? styles.badgeRank
                        : ""
                }`}
              >
                {badge}
              </span>
            ))}
          </div>
        )}
        <button className={styles.wishBtn} title="찜하기">
          <FiHeart size={18} />
        </button>
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} className={styles.cardImg} />
        ) : (
          <span className={styles.imagePlaceholder}>제품 이미지</span>
        )}
      </div>

      {/* 바디 */}
      <div className={styles.cardBody}>
        <h3 className={styles.cardName}>{product.name}</h3>
        <p className={styles.cardModel}>{product.model}</p>

        {product.rating && (
          <div className={styles.ratingRow}>
            <div className={styles.stars}>
              {[1, 2, 3, 4, 5].map((star) => (
                <FiStar
                  key={star}
                  size={11}
                  className={
                    star <= Math.round(product.rating!)
                      ? styles.starFilled
                      : styles.starEmpty
                  }
                />
              ))}
            </div>
            <span className={styles.ratingText}>{product.rating}</span>
            {product.reviewCount && (
              <span className={styles.reviewCount}>
                ({product.reviewCount.toLocaleString()})
              </span>
            )}
          </div>
        )}

        {product.colors && product.colors.length > 0 && (
          <p className={styles.colorText}>{product.colors.join(" / ")}</p>
        )}

        {/* 가격 */}
        <div className={styles.priceArea}>
          {product.originalMonthlyPrice && discountRate > 0 && (
            <div className={styles.originalRow}>
              <span className={styles.originalPrice}>
                월 {formatMonthlyPrice(product.originalMonthlyPrice)}원
              </span>
              <span className={styles.discountRate}>{discountRate}%</span>
            </div>
          )}
          <div className={styles.monthlyRow}>
            <span className={styles.monthlyLabel}>월</span>
            <span className={styles.monthlyPrice}>
              {formatMonthlyPrice(product.monthlyPrice)}
            </span>
            <span className={styles.monthlyUnit}>원</span>
          </div>
          {product.maxBenefitPrice !== undefined && (
            <p className={styles.maxBenefit}>
              최대혜택가 월 <strong>{formatMonthlyPrice(product.maxBenefitPrice)}</strong>원
            </p>
          )}
        </div>

        <div className={styles.periodTag}>{product.period} 약정</div>
      </div>
    </div>
  );
}

export default Subscription;
