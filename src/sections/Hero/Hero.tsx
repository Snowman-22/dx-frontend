import { useState, useEffect, useCallback, useRef } from "react";
import { FiChevronLeft, FiChevronRight, FiPause, FiPlay } from "react-icons/fi";
import styles from "./Hero.module.css";

const SLIDES = [
  {
    id: 1,
    title: "냉장고&세탁기 구매 찬스\n냉세만세 오픈!",
    subtitle: "매일 열리는 선착순 할인 쿠폰",
    bgColor: "#f5f5f0",
    imageUrl:
      "https://www.lge.co.kr/kr/images/refrigerators/md10635830/md10635830-280x280.jpg",
  },
  {
    id: 2,
    title: "LG 그램 Pro AI 2026\n새로운 시작",
    subtitle: "AI가 만드는 새로운 노트북 경험",
    bgColor: "#f0f0f5",
    imageUrl:
      "https://www.lge.co.kr/kr/images/notebook/md10744830/md10744830-280x280.jpg",
  },
  {
    id: 3,
    title: "LG 퓨리케어 에어로타워\n깨끗한 공기의 시작",
    subtitle: "공기청정과 온풍을 한번에",
    bgColor: "#f5f0f0",
    imageUrl:
      "https://www.lge.co.kr/kr/images/air-purifier/md10526826/md10526826-280x280.jpg",
  },
];

const INTERVAL = 5000;

function Hero() {
  const [current, setCurrent] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [direction, setDirection] = useState<"left" | "right">("right");
  const [isAnimating, setIsAnimating] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = useCallback(
    (idx: number, dir: "left" | "right" = "right") => {
      if (isAnimating) return;
      setDirection(dir);
      setIsAnimating(true);
      setCurrent(idx);
      setTimeout(() => setIsAnimating(false), 600);
    },
    [isAnimating],
  );

  const next = useCallback(() => {
    goTo(current === SLIDES.length - 1 ? 0 : current + 1, "right");
  }, [current, goTo]);

  const prev = useCallback(() => {
    goTo(current === 0 ? SLIDES.length - 1 : current - 1, "left");
  }, [current, goTo]);

  // Auto-play
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(next, INTERVAL);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, next]);

  const slide = SLIDES[current];

  return (
    <section className={styles.hero}>
      <div
        className={`${styles.slideWrap} ${isAnimating ? (direction === "right" ? styles.slideInRight : styles.slideInLeft) : ""}`}
        style={{ backgroundColor: slide.bgColor }}
      >
        <div className={styles.slideContent}>
          <div className={styles.textArea}>
            <h2 className={styles.title}>
              {slide.title.split("\n").map((line, i) => (
                <span key={i}>
                  {line}
                  {i < slide.title.split("\n").length - 1 && <br />}
                </span>
              ))}
            </h2>
            <p className={styles.subtitle}>{slide.subtitle}</p>
            <button className={styles.ctaBtn}>자세히 보기</button>
          </div>
          <div className={styles.imageArea}>
            <img
              src={slide.imageUrl}
              alt={slide.title.replace("\n", " ")}
              className={styles.slideImage}
            />
          </div>
        </div>
      </div>

      <button className={styles.arrowLeft} onClick={prev} aria-label="이전">
        <FiChevronLeft size={28} />
      </button>
      <button className={styles.arrowRight} onClick={next} aria-label="다음">
        <FiChevronRight size={28} />
      </button>

      <div className={styles.indicators}>
        <div className={styles.progressBar}>
          {SLIDES.map((_, i) => (
            <button
              key={i}
              className={`${styles.dot} ${i === current ? styles.dotActive : ""}`}
              onClick={() => goTo(i, i > current ? "right" : "left")}
              aria-label={`슬라이드 ${i + 1}`}
            >
              {i === current && isPlaying && (
                <span className={styles.dotFill} style={{ animationDuration: `${INTERVAL}ms` }} />
              )}
            </button>
          ))}
        </div>
        <button
          className={styles.playBtn}
          onClick={() => setIsPlaying((p) => !p)}
          aria-label={isPlaying ? "일시정지" : "재생"}
        >
          {isPlaying ? <FiPause size={14} /> : <FiPlay size={14} />}
        </button>
        <span className={styles.slideCount}>
          {current + 1} / {SLIDES.length}
        </span>
      </div>
    </section>
  );
}

export default Hero;
