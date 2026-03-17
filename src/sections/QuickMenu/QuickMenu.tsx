import { Link } from "react-router-dom";
import {
  FiGift,
  FiGrid,
  FiPlay,
  FiCreditCard,
  FiCalendar,
  FiTool,
  FiTag,
} from "react-icons/fi";
import styles from "./QuickMenu.module.css";

const MENU_ITEMS = [
  { icon: <FiTag size={28} />, label: "봄엔엘지", path: "/events/spring", badge: null },
  { icon: <FiGift size={28} />, label: "혜택/이벤트", path: "/events", badge: null },
  {
    icon: <FiGrid size={28} />,
    label: "다품목 할인",
    path: "/events/multi",
    badge: "웨딩&이사",
  },
  { icon: <FiPlay size={28} />, label: "라이브", path: "/live", badge: null },
  {
    icon: <FiCreditCard size={28} />,
    label: "LGE카드",
    path: "/lge-card",
    badge: null,
  },
  {
    icon: <FiCalendar size={28} />,
    label: "가전 구독",
    path: "/subscription",
    badge: null,
  },
  { icon: <FiTool size={28} />, label: "소모품", path: "/consumables", badge: null },
];

function QuickMenu() {
  return (
    <section className={styles.quickMenu}>
      <div className={styles.inner}>
        {MENU_ITEMS.map((item) => (
          <Link to={item.path} key={item.label} className={styles.menuItem}>
            <div className={styles.iconWrap}>
              {item.icon}
              {item.badge && (
                <span className={styles.badge}>{item.badge}</span>
              )}
            </div>
            <span className={styles.label}>{item.label}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default QuickMenu;
