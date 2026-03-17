import { Link } from "react-router-dom";
import styles from "./NotReady.module.css";

function NotReady() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.iconWrap}>
          <svg
            width="80"
            height="80"
            viewBox="0 0 80 80"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="40" cy="40" r="38" stroke="#ddd" strokeWidth="2" />
            <path
              d="M28 42L36 50L52 30"
              stroke="#ccc"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
        </div>
        <h1 className={styles.title}>현재 준비중입니다</h1>
        <p className={styles.description}>
          빠른 시일 내에 더 좋은 서비스로 찾아뵙겠습니다.
        </p>
        <Link to="/" className={styles.homeBtn}>
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  );
}

export default NotReady;
