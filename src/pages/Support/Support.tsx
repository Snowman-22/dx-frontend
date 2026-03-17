import { useState } from "react";
import { Link } from "react-router-dom";
import {
  FiTruck,
  FiCalendar,
  FiHeadphones,
  FiBook,
  FiMapPin,
  FiShoppingBag,
  FiDroplet,
  FiPackage,
  FiSearch,
  FiChevronRight,
  FiTool,
  FiMessageSquare,
  FiStar,
  FiAlertCircle,
  FiCheckCircle,
  FiPhone,
} from "react-icons/fi";
import styles from "./Support.module.css";

/* ── Hero Slide Data ── */
const HERO_SLIDES = [
  {
    id: 1,
    title: "가전세척 봄맞이\n10% 할인 이벤트",
    desc: "에어컨, 세탁기, 냉장고 전문 세척 서비스",
    tag: "이벤트",
    bg: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  },
  {
    id: 2,
    title: "LG 맡김서비스\n간편하게 수리 맡기세요",
    desc: "택배로 보내고, 수리 후 받아보세요",
    tag: "신규",
    bg: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
  },
  {
    id: 3,
    title: "야간·주말 서비스\n운영 안내",
    desc: "바쁜 일상 속 편리한 서비스 이용",
    tag: "안내",
    bg: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
  },
];

/* ── Quick Action Cards ── */
const QUICK_ACTIONS = [
  { icon: FiTruck, label: "출장 서비스\n예약", path: "/support/reservation/visit", color: "#a50034" },
  { icon: FiCalendar, label: "예약\n조회/변경", path: "/support/reservation/check", color: "#0077b6" },
  { icon: FiHeadphones, label: "서비스\n전문 상담", path: "/support/consultation", color: "#6c63ff" },
  { icon: FiBook, label: "매뉴얼/\n소프트웨어", path: "/support/manual", color: "#2ec4b6" },
  { icon: FiMapPin, label: "센터\n방문 예약", path: "/support/reservation/center", color: "#e07a5f" },
  { icon: FiShoppingBag, label: "케어용품/\n소모품", path: "/products/consumables", color: "#81b29a" },
  { icon: FiDroplet, label: "가전\n세척", path: "/support/best-care/cleaning", color: "#3d5a80" },
  { icon: FiPackage, label: "이전\n설치", path: "/support/best-care/install", color: "#f4845f" },
];

/* ── Self-help Popular Keywords ── */
const POPULAR_KEYWORDS = [
  "에어컨 청소",
  "리모컨 설정",
  "세탁기 에러",
  "냉장고 온도",
  "TV 화면",
  "정수기 필터",
];

/* ── Notice Data ── */
const NOTICES = [
  { id: 1, title: "서비스센터 2번째, 4번째 토요일 휴무 안내", date: "2026.03.10" },
  { id: 2, title: "설 연휴 고객서비스 운영 안내", date: "2026.01.20" },
  { id: 3, title: "일부 지역 출장 서비스 지연 안내", date: "2026.03.05" },
];

/* ── Tips Data ── */
const TIPS = [
  {
    id: 1,
    category: "에어컨",
    title: "에어컨 필터 셀프 청소 방법",
    desc: "간단한 방법으로 에어컨 필터를 깨끗하게 관리하세요",
  },
  {
    id: 2,
    category: "세탁기",
    title: "세탁기 통세척 하는 방법",
    desc: "월 1회 통세척으로 세탁기를 깨끗하게 유지하세요",
  },
  {
    id: 3,
    category: "냉장고",
    title: "냉장고 적정 온도 설정 가이드",
    desc: "식품 보관에 최적화된 온도 설정법을 알려드립니다",
  },
  {
    id: 4,
    category: "TV",
    title: "TV 화면 설정 최적화 방법",
    desc: "시청 환경에 맞는 화면 모드 설정법을 확인하세요",
  },
];

/* ── Best Care Data ── */
const BEST_CARE = [
  {
    icon: FiDroplet,
    title: "가전 세척",
    desc: "에어컨, 세탁기, 냉장고 등 전문 세척 서비스로 깨끗하고 건강한 가전 관리",
    items: ["에어컨 분해 세척", "세탁기 통세척", "냉장고 청소"],
    path: "/support/best-care/cleaning",
  },
  {
    icon: FiPackage,
    title: "이전 설치",
    desc: "이사 시 가전제품 안전한 이전 및 설치를 전문 엔지니어가 도와드립니다",
    items: ["가전 이전", "신규 설치", "철거 서비스"],
    path: "/support/best-care/install",
  },
  {
    icon: FiStar,
    title: "케어십/구독",
    desc: "정기 관리 서비스로 가전제품의 수명을 늘리고 최적의 성능을 유지하세요",
    items: ["정기 점검", "소모품 교체", "케어 매니저"],
    path: "/support/best-care/subscription",
  },
];

/* ── FAQ Data ── */
const FAQS = [
  { id: 1, q: "출장 서비스 비용은 얼마인가요?", category: "서비스" },
  { id: 2, q: "제품 보증 기간은 어떻게 되나요?", category: "보증" },
  { id: 3, q: "서비스 센터 영업 시간은 어떻게 되나요?", category: "센터" },
  { id: 4, q: "온라인으로 수리 접수를 할 수 있나요?", category: "서비스" },
  { id: 5, q: "부품 구매는 어디서 할 수 있나요?", category: "부품" },
];

function Support() {
  const [heroIdx, setHeroIdx] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className={styles.page}>
      {/* ── Hero Banner ── */}
      <section className={styles.hero}>
        <div className={styles.heroSlider}>
          {HERO_SLIDES.map((slide, i) => (
            <div
              key={slide.id}
              className={`${styles.heroSlide} ${i === heroIdx ? styles.heroSlideActive : ""}`}
              style={{ background: slide.bg }}
            >
              <div className={styles.heroContent}>
                <span className={styles.heroTag}>{slide.tag}</span>
                <h2 className={styles.heroTitle}>{slide.title}</h2>
                <p className={styles.heroDesc}>{slide.desc}</p>
                <button className={styles.heroBtn}>자세히 보기</button>
              </div>
            </div>
          ))}
        </div>
        <div className={styles.heroDots}>
          {HERO_SLIDES.map((_, i) => (
            <button
              key={i}
              className={`${styles.heroDot} ${i === heroIdx ? styles.heroDotActive : ""}`}
              onClick={() => setHeroIdx(i)}
            />
          ))}
        </div>
      </section>

      {/* ── Notice Bar ── */}
      <section className={styles.noticeBar}>
        <div className={styles.inner}>
          <span className={styles.noticeLabel}>
            <FiAlertCircle />
            공지
          </span>
          <Link to="/support/info/notice" className={styles.noticeText}>
            {NOTICES[0].title}
          </Link>
          <Link to="/support/info/notice" className={styles.noticeMore}>
            더보기 <FiChevronRight />
          </Link>
        </div>
      </section>

      {/* ── Quick Actions ── */}
      <section className={styles.section}>
        <div className={styles.inner}>
          <h2 className={styles.sectionTitle}>무엇을 도와드릴까요?</h2>
          <p className={styles.sectionSub}>필요한 서비스를 빠르게 찾아보세요</p>
          <div className={styles.quickGrid}>
            {QUICK_ACTIONS.map((item) => (
              <Link key={item.label} to={item.path} className={styles.quickCard}>
                <div className={styles.quickIcon} style={{ background: item.color }}>
                  <item.icon size={24} />
                </div>
                <span className={styles.quickLabel}>{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Self-help Search ── */}
      <section className={styles.searchSection}>
        <div className={styles.inner}>
          <h2 className={styles.sectionTitle}>스스로 해결</h2>
          <p className={styles.sectionSub}>증상으로 검색하면 해결 방법을 알려드립니다</p>
          <div className={styles.searchBox}>
            <FiSearch className={styles.searchIcon} />
            <input
              type="text"
              className={styles.searchInput}
              placeholder="증상이나 궁금한 점을 검색해 보세요"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button className={styles.searchBtn}>검색</button>
          </div>
          <div className={styles.keywords}>
            <span className={styles.keywordLabel}>인기 검색어</span>
            {POPULAR_KEYWORDS.map((kw) => (
              <button key={kw} className={styles.keyword}>
                {kw}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Tips ── */}
      <section className={styles.section}>
        <div className={styles.inner}>
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>가전 꿀팁</h2>
              <p className={styles.sectionSub}>우리 집 가전, 이렇게 관리하세요</p>
            </div>
            <Link to="/story/tips" className={styles.viewAll}>
              전체보기 <FiChevronRight />
            </Link>
          </div>
          <div className={styles.tipsGrid}>
            {TIPS.map((tip) => (
              <div key={tip.id} className={styles.tipCard}>
                <div className={styles.tipThumb}>
                  <FiTool size={28} />
                </div>
                <div className={styles.tipBody}>
                  <span className={styles.tipCategory}>{tip.category}</span>
                  <h3 className={styles.tipTitle}>{tip.title}</h3>
                  <p className={styles.tipDesc}>{tip.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Best Care ── */}
      <section className={styles.careSection}>
        <div className={styles.inner}>
          <h2 className={styles.sectionTitle}>LG 베스트 케어</h2>
          <p className={styles.sectionSub}>전문 엔지니어의 프리미엄 케어 서비스</p>
          <div className={styles.careGrid}>
            {BEST_CARE.map((care) => (
              <Link key={care.title} to={care.path} className={styles.careCard}>
                <div className={styles.careIcon}>
                  <care.icon size={28} />
                </div>
                <h3 className={styles.careTitle}>{care.title}</h3>
                <p className={styles.careDesc}>{care.desc}</p>
                <ul className={styles.careList}>
                  {care.items.map((item) => (
                    <li key={item}>
                      <FiCheckCircle size={14} />
                      {item}
                    </li>
                  ))}
                </ul>
                <span className={styles.careMore}>
                  자세히 보기 <FiChevronRight size={14} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className={styles.section}>
        <div className={styles.inner}>
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>자주 묻는 질문</h2>
              <p className={styles.sectionSub}>고객님들이 많이 궁금해하시는 질문들입니다</p>
            </div>
            <Link to="/support/self" className={styles.viewAll}>
              전체보기 <FiChevronRight />
            </Link>
          </div>
          <div className={styles.faqList}>
            {FAQS.map((faq) => (
              <div key={faq.id} className={styles.faqItem}>
                <span className={styles.faqBadge}>{faq.category}</span>
                <span className={styles.faqQ}>
                  <FiMessageSquare size={16} />
                  {faq.q}
                </span>
                <FiChevronRight className={styles.faqArrow} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Contact Info ── */}
      <section className={styles.contactSection}>
        <div className={styles.inner}>
          <div className={styles.contactGrid}>
            <div className={styles.contactCard}>
              <FiPhone size={24} />
              <h3>전화 상담</h3>
              <p className={styles.contactNum}>1544-7777</p>
              <span className={styles.contactTime}>평일 09:00 ~ 18:00 | 토요일 09:00 ~ 13:00</span>
            </div>
            <div className={styles.contactCard}>
              <FiMessageSquare size={24} />
              <h3>채팅 상담</h3>
              <p className={styles.contactDesc}>AI 챗봇과 상담사가 도와드립니다</p>
              <button className={styles.contactBtn}>채팅 상담하기</button>
            </div>
            <div className={styles.contactCard}>
              <FiMapPin size={24} />
              <h3>서비스 센터 찾기</h3>
              <p className={styles.contactDesc}>가까운 서비스 센터를 찾아보세요</p>
              <button className={styles.contactBtn}>센터 찾기</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Support;
