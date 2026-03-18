import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FiChevronRight, FiStar, FiHeart, FiBarChart2 } from "react-icons/fi";
import { MEGA_MENU_DATA } from "@/components/Header/megaMenuData";
import {
  getProducts,
  getProductsByTab,
  formatPrice,
  PATH_LABELS,
  CATEGORY_DESCRIPTIONS,
} from "@/data/productData";
import type { Product } from "@/data/productData";
import styles from "./ProductCategory.module.css";

type SortOption = "recommend" | "price-asc" | "price-desc" | "review" | "newest";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "recommend", label: "추천순" },
  { value: "newest", label: "신상품순" },
  { value: "price-asc", label: "낮은가격순" },
  { value: "price-desc", label: "높은가격순" },
  { value: "review", label: "리뷰많은순" },
];

function ProductCategory() {
  const { tab, category, sub } = useParams<{
    tab: string;
    category: string;
    sub: string;
  }>();

  const [sortBy, setSortBy] = useState<SortOption>("recommend");

  // 현재 탭의 메가메뉴 데이터 가져오기
  const menuData = useMemo(() => {
    const productsMenu = MEGA_MENU_DATA["제품/소모품"];
    if (!productsMenu?.tabs) return null;
    return productsMenu.tabs.find((t) => {
      const pathSegment = t.path.split("/").pop();
      return pathSegment === tab;
    });
  }, [tab]);

  // 현재 선택된 카테고리 찾기
  const activeCategory = useMemo(() => {
    if (!menuData || !category) return null;
    return menuData.categories.find((c) => {
      const pathSegment = c.path.split("/").pop();
      return pathSegment === category;
    });
  }, [menuData, category]);

  // 제품 목록
  const products: Product[] = useMemo(() => {
    let items: Product[];
    if (sub && category) items = getProducts(category, sub);
    else if (category) items = getProducts(category);
    else if (tab) items = getProductsByTab(tab);
    else items = [];

    // 정렬
    const sorted = [...items];
    switch (sortBy) {
      case "price-asc":
        sorted.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        sorted.sort((a, b) => b.price - a.price);
        break;
      case "review":
        sorted.sort((a, b) => (b.reviewCount ?? 0) - (a.reviewCount ?? 0));
        break;
      case "newest":
        sorted.sort((a, b) => {
          const aNew = a.badges.includes("신제품") ? 1 : 0;
          const bNew = b.badges.includes("신제품") ? 1 : 0;
          return bNew - aNew;
        });
        break;
      default:
        break;
    }
    return sorted;
  }, [tab, category, sub, sortBy]);

  // Breadcrumb 데이터
  const breadcrumbs = useMemo(() => {
    const crumbs = [
      { label: "홈", path: "/" },
      { label: "제품/소모품", path: "/products" },
    ];
    if (tab) {
      crumbs.push({
        label: PATH_LABELS[tab] || tab,
        path: `/products/${tab}`,
      });
    }
    if (category) {
      crumbs.push({
        label: PATH_LABELS[category] || category,
        path: `/products/${tab}/${category}`,
      });
    }
    if (sub) {
      crumbs.push({
        label: PATH_LABELS[sub] || sub,
        path: `/products/${tab}/${category}/${sub}`,
      });
    }
    return crumbs;
  }, [tab, category, sub]);

  const pageTitle =
    sub
      ? PATH_LABELS[sub]
      : category
        ? PATH_LABELS[category]
        : tab
          ? PATH_LABELS[tab]
          : "제품";

  const description = category
    ? CATEGORY_DESCRIPTIONS[category]
    : undefined;

  return (
    <div className={styles.page}>
      {/* Breadcrumb */}
      <div className={styles.breadcrumbWrap}>
        <div className={styles.breadcrumbInner}>
          {breadcrumbs.map((crumb, i) => (
            <span key={crumb.path} className={styles.breadcrumbItem}>
              {i > 0 && <FiChevronRight size={12} className={styles.breadcrumbSep} />}
              {i === breadcrumbs.length - 1 ? (
                <span className={styles.breadcrumbCurrent}>{crumb.label}</span>
              ) : (
                <Link to={crumb.path} className={styles.breadcrumbLink}>
                  {crumb.label}
                </Link>
              )}
            </span>
          ))}
        </div>
      </div>

      <div className={styles.container}>
        {/* Sidebar */}
        <aside className={styles.sidebar}>
          {menuData ? (
            <>
              {menuData.categories.map((cat) => {
                const catSlug = cat.path.split("/").pop() || "";
                const isActive = category === catSlug;
                return (
                  <div key={cat.title} className={styles.sideGroup}>
                    <Link
                      to={`/products/${tab}/${catSlug}`}
                      className={`${styles.sideTitle} ${isActive ? styles.sideTitleActive : ""}`}
                    >
                      {cat.title}
                      <FiChevronRight size={14} className={styles.sideArrow} />
                    </Link>
                    {isActive && cat.items.length > 0 && (
                      <ul className={styles.sideSubList}>
                        {cat.items.map((item) => {
                          const subSlug = item.path.split("/").pop() || "";
                          return (
                            <li key={item.path}>
                              <Link
                                to={item.path}
                                className={`${styles.sideSubLink} ${sub === subSlug ? styles.sideSubLinkActive : ""}`}
                              >
                                {item.label}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                );
              })}
            </>
          ) : (
            <div className={styles.sideGroup}>
              <span className={styles.sideTitle}>카테고리</span>
            </div>
          )}

          {/* 사이드바 배너 */}
          <div className={styles.sideBanner}>
            <div className={styles.sideBannerInner}>
              <p className={styles.sideBannerTitle}>구매 가이드</p>
              <p className={styles.sideBannerDesc}>
                어떤 제품을 선택해야 할지 고민이라면?
              </p>
              <span className={styles.sideBannerLink}>자세히 보기 &gt;</span>
            </div>
          </div>
          <div className={styles.sideBanner}>
            <div className={styles.sideBannerInner}>
              <p className={styles.sideBannerTitle}>자주 묻는 질문</p>
              <p className={styles.sideBannerDesc}>
                제품에 대해 궁금한 점이 있으신가요?
              </p>
              <span className={styles.sideBannerLink}>FAQ 보기 &gt;</span>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className={styles.main}>
          {/* 카테고리 배너 */}
          {description && (
            <div className={styles.categoryBanner}>
              <div className={styles.categoryBannerContent}>
                <h1 className={styles.categoryBannerTitle}>{pageTitle}</h1>
                <p className={styles.categoryBannerDesc}>{description}</p>
              </div>
              <div className={styles.categoryBannerImage}>
                <span>카테고리 이미지</span>
              </div>
            </div>
          )}

          {/* 페이지 헤더 (배너 없을 때) */}
          {!description && (
            <div className={styles.pageHeader}>
              <h1 className={styles.pageTitle}>{pageTitle}</h1>
            </div>
          )}

          {/* Filter bar */}
          {activeCategory && activeCategory.items.length > 0 && (
            <div className={styles.filterBar}>
              <Link
                to={`/products/${tab}/${category}`}
                className={`${styles.filterChip} ${!sub ? styles.filterChipActive : ""}`}
              >
                전체
              </Link>
              {activeCategory.items.map((item) => {
                const subSlug = item.path.split("/").pop() || "";
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`${styles.filterChip} ${sub === subSlug ? styles.filterChipActive : ""}`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          )}

          {/* 정렬 바 */}
          <div className={styles.sortBar}>
            <p className={styles.productCount}>
              총 <strong>{products.length}</strong>개 제품
            </p>
            <div className={styles.sortOptions}>
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  className={`${styles.sortBtn} ${sortBy === opt.value ? styles.sortBtnActive : ""}`}
                  onClick={() => setSortBy(opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Product Grid */}
          {products.length > 0 ? (
            <div className={styles.productGrid}>
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>
                <FiBarChart2 size={48} />
              </div>
              <p className={styles.emptyTitle}>해당 카테고리의 제품이 없습니다.</p>
              <p className={styles.emptyDesc}>다른 카테고리를 선택해 보세요.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function ProductCard({ product }: { product: Product }) {
  return (
    <div className={styles.card}>
      {/* 이미지 영역 */}
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
                      : ""
                }`}
              >
                {badge}
              </span>
            ))}
          </div>
        )}
        <div className={styles.cardActions}>
          <button className={styles.cardActionBtn} title="찜하기">
            <FiHeart size={18} />
          </button>
          <button className={styles.cardActionBtn} title="비교하기">
            <FiBarChart2 size={18} />
          </button>
        </div>
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} className={styles.cardImg} />
        ) : (
          <span className={styles.imagePlaceholder}>제품 이미지</span>
        )}
      </div>

      {/* 바디 영역 */}
      <div className={styles.cardBody}>
        <h3 className={styles.cardName}>{product.name}</h3>
        <p className={styles.cardModel}>{product.model}</p>

        {/* 리뷰/평점 */}
        {product.rating && (
          <div className={styles.ratingRow}>
            <div className={styles.stars}>
              {[1, 2, 3, 4, 5].map((star) => (
                <FiStar
                  key={star}
                  size={12}
                  className={star <= Math.round(product.rating!) ? styles.starFilled : styles.starEmpty}
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

        {/* 색상 */}
        {product.colors && product.colors.length > 0 && (
          <p className={styles.colorText}>
            {product.colors.join(" / ")}
          </p>
        )}

        {/* 가격 */}
        <div className={styles.cardPriceRow}>
          {product.originalPrice && product.originalPrice > product.price && (
            <div className={styles.discountRow}>
              <span className={styles.discountRate}>
                {Math.round(
                  ((product.originalPrice - product.price) / product.originalPrice) * 100,
                )}
                %
              </span>
              <span className={styles.originalPrice}>
                {formatPrice(product.originalPrice)}원
              </span>
            </div>
          )}
          <span className={styles.cardPrice}>
            {formatPrice(product.price)}
            <span className={styles.priceUnit}>원</span>
          </span>
        </div>

        {/* 특징 태그 */}
        {product.features && product.features.length > 0 && (
          <div className={styles.featureRow}>
            {product.features.slice(0, 3).map((feat) => (
              <span key={feat} className={styles.featureTag}>
                {feat}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductCategory;
