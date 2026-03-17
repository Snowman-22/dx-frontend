import { Link } from "react-router-dom";
import logoImg from "@/assets/images/icon_symbor_mark.png";
import styles from "./Footer.module.css";

const FOOTER_LINKS = [
  {
    title: "제품",
    links: [
      { label: "TV", path: "/products/tv" },
      { label: "냉장고", path: "/products/refrigerator" },
      { label: "세탁기", path: "/products/washer" },
      { label: "에어컨", path: "/products/air-conditioner" },
      { label: "노트북", path: "/products/laptop" },
    ],
  },
  {
    title: "서비스",
    links: [
      { label: "가전 구독", path: "/subscription" },
      { label: "멤버십", path: "/membership" },
      { label: "LGE카드", path: "/lge-card" },
      { label: "기업 구매", path: "/business" },
    ],
  },
  {
    title: "고객지원",
    links: [
      { label: "서비스 예약", path: "/support/reservation" },
      { label: "이메일 문의", path: "/support/email" },
      { label: "자주 묻는 질문", path: "/support/faq" },
      { label: "매뉴얼/소프트웨어", path: "/support/manual" },
    ],
  },
  {
    title: "회사소개",
    links: [
      { label: "LG전자 소개", path: "/about" },
      { label: "뉴스룸", path: "/newsroom" },
      { label: "채용", path: "/careers" },
      { label: "투자정보", path: "/investor" },
    ],
  },
];

const BOTTOM_LINKS = [
  { label: "개인정보 처리방침", path: "/privacy" },
  { label: "이용약관", path: "/terms" },
  { label: "이메일 무단수집거부", path: "/email-policy" },
  { label: "사이트맵", path: "/sitemap" },
];

function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.top}>
          <div className={styles.logo}>
            <img src={logoImg} alt="LG전자" style={{ width: 28, height: 28, objectFit: "contain" }} />
            <span className={styles.logoText}>LG전자</span>
          </div>
          <div className={styles.linkGroups}>
            {FOOTER_LINKS.map((group) => (
              <div key={group.title} className={styles.linkGroup}>
                <h4 className={styles.groupTitle}>{group.title}</h4>
                <ul className={styles.groupList}>
                  {group.links.map((link) => (
                    <li key={link.path}>
                      <Link to={link.path} className={styles.groupLink}>
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.bottom}>
          <div className={styles.bottomLinks}>
            {BOTTOM_LINKS.map((link) => (
              <Link key={link.path} to={link.path} className={styles.bottomLink}>
                {link.label}
              </Link>
            ))}
          </div>
          <div className={styles.copyright}>
            <p>Copyright &copy; 2009-2026 LG Electronics. All Rights Reserved</p>
            <p className={styles.companyInfo}>
              서울특별시 영등포구 여의대로 128 | 대표이사: 조주완 |
              사업자등록번호: 107-86-14075
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
