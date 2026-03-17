import { FiMenu, FiEdit, FiLogOut } from "react-icons/fi";
import styles from "./ChatSidebar.module.css";

interface ChatSidebarProps {
  open: boolean;
  onToggle: () => void;
  onNewChat: () => void;
  onExit: () => void;
}

function ChatSidebar({ open, onToggle, onNewChat, onExit }: ChatSidebarProps) {
  return (
    <aside
      className={`${styles.sidebar} ${open ? styles.sidebarOpen : styles.sidebarClosed}`}
    >
      <div className={styles.sidebarHeader}>
        <button
          className={styles.toggleBtn}
          onClick={onToggle}
          aria-label="사이드바 토글"
        >
          <FiMenu size={20} />
        </button>
        {open && (
          <button className={styles.newChatBtn} onClick={onNewChat}>
            <FiEdit size={16} />
            <span>새 채팅</span>
          </button>
        )}
      </div>
      {open && (
        <nav className={styles.sidebarNav}>
          <span className={styles.navLink}>이전 채팅 기록</span>
          <span className={styles.navLink}>원룸을 위한 가전 리스트</span>
        </nav>
      )}
      <div className={styles.sidebarFooter}>
        <button
          className={`${styles.exitBtn} ${!open ? styles.exitBtnCollapsed : ""}`}
          onClick={onExit}
          aria-label="메인 페이지로 나가기"
        >
          <FiLogOut size={18} />
          {open && <span>나가기</span>}
        </button>
      </div>
    </aside>
  );
}

export default ChatSidebar;
