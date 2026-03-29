import { useState, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiSearch,
  FiShoppingCart,
  FiUser,
  FiChevronRight,
  FiLogOut,
  FiBox,
  FiHeart,
  FiSettings,
} from "react-icons/fi";
import { MEGA_MENU_DATA } from "./megaMenuData";
import type { MegaMenuData, MegaMenuTab } from "./megaMenuData";
import { useAuth } from "@/contexts/AuthContext";
import logoImg from "@/assets/images/icon_symbor_mark.png";
import styles from "./Header.module.css";

const NAV_ITEMS = [
  { label: "제품/소모품", path: "/products" },
  { label: "가전 구독", path: "/subscription" },
  { label: "고객지원", path: "/support" },
  { label: "혜택/이벤트", path: "/events" },
  { label: "스토리", path: "/story" },
  { label: "베스트샵", path: "/best-shop" },
  { label: "LG AI", path: "/lg-ai" },
  { label: "홈스타일", path: "/home-style", highlight: true },
  { label: "Home Canvas", path: "/recommend", highlight: true, highlightColor: "#3C5D5D" },
];

const BRAND_ITEMS = [
  { label: "LG SIGNATURE", path: "/lg-signature" },
  { label: "LG Objet Collection", path: "/lg-objet" },
  { label: "LG ThinQ", path: "/lg-thinq" },
  { label: "Let's gram", path: "/lets-gram" },
];

function Header() {
  const { user, isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<number>(0);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const userDropdownTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const megaMenu: MegaMenuData | null = activeMenu
    ? MEGA_MENU_DATA[activeMenu] ?? null
    : null;

  const hasTabs = megaMenu?.tabs && megaMenu.tabs.length > 0;
  const hasSimple = megaMenu?.simpleItems && megaMenu.simpleItems.length > 0;
  const hasGrouped = megaMenu?.groupedItems && megaMenu.groupedItems.length > 0;
  const isOpen = activeMenu !== null && (hasTabs || hasSimple || hasGrouped);

  const currentTab: MegaMenuTab | null =
    hasTabs && megaMenu.tabs ? megaMenu.tabs[activeTab] ?? null : null;

  const clearClose = useCallback(() => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }, []);

  const scheduleClose = useCallback(() => {
    clearClose();
    closeTimer.current = setTimeout(() => {
      setActiveMenu(null);
      setActiveTab(0);
    }, 150);
  }, [clearClose]);

  const handleNavEnter = (label: string) => {
    clearClose();
    if (MEGA_MENU_DATA[label]) {
      setActiveMenu(label);
      setActiveTab(0);
    } else {
      setActiveMenu(null);
    }
  };

  const handleDropdownEnter = () => {
    clearClose();
  };

  const handleUserEnter = () => {
    if (userDropdownTimer.current) {
      clearTimeout(userDropdownTimer.current);
      userDropdownTimer.current = null;
    }
    setShowUserDropdown(true);
  };

  const handleUserLeave = () => {
    userDropdownTimer.current = setTimeout(() => {
      setShowUserDropdown(false);
    }, 150);
  };

  const handleLogout = () => {
    logout();
    setShowUserDropdown(false);
    navigate("/");
  };

  return (
    <header className={`${styles.header} ${isOpen ? styles.headerOpen : ""}`}>
      <div className={styles.inner}>
        <div className={styles.topRow}>
          <Link to="/" className={styles.logo}>
            <img src={logoImg} alt="LG전자" className={styles.logoImg} />
            <span className={styles.logoText}>LG전자</span>
          </Link>

          <div className={styles.utils}>
            <button className={styles.utilBtn} aria-label="검색">
              <FiSearch size={22} />
            </button>
            <Link to="/cart" className={styles.utilBtn} aria-label="장바구니">
              <FiShoppingCart size={22} />
            </Link>
            <div
              className={styles.userWrap}
              onMouseEnter={handleUserEnter}
              onMouseLeave={handleUserLeave}
            >
              <button className={styles.utilBtn} aria-label="마이페이지">
                <FiUser size={22} />
              </button>
              {showUserDropdown && (
                <div className={styles.userDropdown}>
                  {isLoggedIn ? (
                    <>
                      <div className={styles.userInfo}>
                        <div className={styles.userAvatar}>
                          <FiUser size={24} />
                        </div>
                        <div>
                          <p className={styles.userName}>{user!.name}님</p>
                          <p className={styles.userEmail}>{user!.email}</p>
                        </div>
                      </div>
                      <div className={styles.userDivider} />
                      <Link to="/mypage" className={styles.userMenuItem} onClick={() => setShowUserDropdown(false)}>
                        <FiUser size={16} />
                        <span>마이페이지</span>
                      </Link>
                      <Link to="/mypage/orders" className={styles.userMenuItem} onClick={() => setShowUserDropdown(false)}>
                        <FiBox size={16} />
                        <span>주문/배송 조회</span>
                      </Link>
                      <Link to="/mypage/wishlist" className={styles.userMenuItem} onClick={() => setShowUserDropdown(false)}>
                        <FiHeart size={16} />
                        <span>찜한 제품</span>
                      </Link>
                      <Link to="/mypage/settings" className={styles.userMenuItem} onClick={() => setShowUserDropdown(false)}>
                        <FiSettings size={16} />
                        <span>계정 설정</span>
                      </Link>
                      <div className={styles.userDivider} />
                      <button className={styles.userMenuItem} onClick={handleLogout}>
                        <FiLogOut size={16} />
                        <span>로그아웃</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <div className={styles.guestInfo}>
                        <div className={styles.userAvatar}>
                          <FiUser size={24} />
                        </div>
                        <p className={styles.guestText}>로그인이 필요합니다</p>
                      </div>
                      <div className={styles.userDivider} />
                      <Link
                        to="/login"
                        className={styles.loginBtn}
                        onClick={() => setShowUserDropdown(false)}
                      >
                        로그인
                      </Link>
                      <Link
                        to="/signup"
                        className={styles.signupBtn}
                        onClick={() => setShowUserDropdown(false)}
                      >
                        회원가입
                      </Link>
                      <div className={styles.userDivider} />
                      <Link to="/mypage/orders" className={styles.userMenuItem} onClick={() => setShowUserDropdown(false)}>
                        <FiBox size={16} />
                        <span>비회원 주문 조회</span>
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <nav className={styles.nav}>
          <ul className={styles.navList}>
            {NAV_ITEMS.map((item) => (
              <li
                key={item.path}
                className={styles.navItem}
                onMouseEnter={() => handleNavEnter(item.label)}
                onMouseLeave={scheduleClose}
              >
                <Link
                  to={item.path}
                  className={`${styles.navLink} ${item.highlight ? styles.navHighlight : ""} ${activeMenu === item.label ? styles.navActive : ""}`}
                  style={item.highlightColor ? { background: item.highlightColor } : undefined}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className={styles.brandList}>
            {BRAND_ITEMS.map((item) => (
              <Link key={item.path} to={item.path} className={styles.brandLink}>
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      </div>

      {/* Mega Menu Dropdown */}
      {isOpen && (
        <div
          className={styles.megaDropdown}
          onMouseEnter={handleDropdownEnter}
          onMouseLeave={scheduleClose}
        >
          {/* ── Tabs row for 제품/소모품 ── */}
          {hasTabs && megaMenu.tabs && (
            <>
              <div className={styles.tabRow}>
                <div className={styles.tabInner}>
                  {megaMenu.tabs.map((tab, i) => (
                    <button
                      key={tab.label}
                      className={`${styles.tabBtn} ${i === activeTab ? styles.tabBtnActive : ""}`}
                      onMouseEnter={() => setActiveTab(i)}
                    >
                      {tab.label}
                    </button>
                  ))}
                  <div className={styles.tabDivider} />
                  <Link to="/lg-signature" className={styles.tabBrand}>
                    LG SIGNATURE
                  </Link>
                  <Link to="/lg-objet" className={styles.tabBrand}>
                    LG Objet Collection
                  </Link>
                  <Link to="/lg-up" className={styles.tabBrand}>
                    LG UP 가전
                  </Link>
                </div>
              </div>

              {currentTab && (
                <div className={styles.megaContent}>
                  <div className={styles.megaInner}>
                    <div className={styles.categoryColumns}>
                      {currentTab.categories.map((cat) => (
                        <div key={cat.title} className={styles.categoryCol}>
                          <Link to={cat.path} className={styles.categoryTitle}>
                            {cat.title} <FiChevronRight size={14} />
                          </Link>
                          {cat.items.length > 0 && (
                            <ul className={styles.categoryItems}>
                              {cat.items.map((item) => (
                                <li key={item.path}>
                                  <Link to={item.path} className={styles.categoryLink}>
                                    {item.label}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                    {(currentTab.rightTitle || (currentTab.tags && currentTab.tags.length > 0)) && (
                      <div className={styles.tagArea}>
                        {currentTab.rightTitle && (
                          <Link to={currentTab.path} className={styles.megaCategoryHead}>
                            {currentTab.rightTitle} <FiChevronRight size={14} />
                          </Link>
                        )}
                        {currentTab.rightSubItem && (
                          <p className={styles.tagSubItem}>{currentTab.rightSubItem}</p>
                        )}
                        {currentTab.tags && currentTab.tags.map((tag) => (
                          <span key={tag} className={styles.tag}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {/* ── Grouped dropdown for 가전 구독, 고객지원, 스토리 ── */}
          {hasGrouped && megaMenu.groupedItems && (
            <div className={styles.groupedDropdown}>
              <div className={styles.groupedInner}>
                {megaMenu.groupedItems.map((group) => (
                  <div key={group.title} className={styles.groupCol}>
                    <Link to={group.path} className={styles.groupTitle}>
                      {group.title} <FiChevronRight size={14} />
                    </Link>
                    {group.items.length > 0 && (
                      <ul className={styles.groupItems}>
                        {group.items.map((item) => (
                          <li key={item.path}>
                            <Link to={item.path} className={styles.groupLink}>
                              {item.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Simple dropdown for 혜택/이벤트 ── */}
          {hasSimple && megaMenu.simpleItems && (
            <div className={styles.simpleDropdown}>
              <div className={styles.simpleInner}>
                {megaMenu.simpleItems.map((item) => (
                  <Link key={item.path} to={item.path} className={styles.simpleLink}>
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Overlay */}
      {isOpen && (
        <div
          className={styles.overlay}
          onMouseEnter={scheduleClose}
        />
      )}
    </header>
  );
}

export default Header;
