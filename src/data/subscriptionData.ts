export interface SubscriptionProduct {
  id: string;
  name: string;
  model: string;
  monthlyPrice: number;
  originalMonthlyPrice?: number;
  maxBenefitPrice?: number;
  period: string;
  badges: string[];
  category: string;
  rating?: number;
  reviewCount?: number;
  features?: string[];
  colors?: string[];
}

export const SUB_CATEGORIES = [
  { label: "전체", value: "all" },
  { label: "정수기", value: "water-purifier" },
  { label: "에어컨", value: "aircon" },
  { label: "세탁기", value: "washer" },
  { label: "냉장고", value: "refrigerator" },
  { label: "TV", value: "tv" },
  { label: "노트북", value: "notebook" },
  { label: "공기청정기", value: "air-purifier" },
  { label: "식기세척기", value: "dishwasher" },
  { label: "워시타워", value: "washtower" },
  { label: "의류건조기", value: "dryer" },
  { label: "스타일러", value: "styler" },
  { label: "안마의자", value: "massage-chair" },
  { label: "청소기", value: "vacuum" },
  { label: "워시콤보", value: "washcombo" },
  { label: "신발관리기", value: "shoe-care" },
] as const;

export const HERO_SLIDES = [
  {
    id: 1,
    title: "가전 구독 특별 혜택",
    desc: "최대 50% 요금 할인 + 포인트 적립",
    highlight: "월 0원부터",
    bgColor: "#1a1a2e",
  },
  {
    id: 2,
    title: "정수기 구독 페스타",
    desc: "인기 정수기 구독 시 최대 혜택",
    highlight: "월 20,400원~",
    bgColor: "#16213e",
  },
  {
    id: 3,
    title: "에어컨 시즌 오프",
    desc: "여름 전 미리 준비하는 에어컨 구독",
    highlight: "월 29,900원~",
    bgColor: "#0f3460",
  },
];

export const QUICK_LINKS = [
  { icon: "📋", title: "구독 이용 가이드", desc: "구독 서비스 한눈에 보기" },
  { icon: "🎁", title: "혜택 안내", desc: "구독 회원 전용 혜택 확인" },
  { icon: "🔢", title: "구독 요금 계산기", desc: "나에게 맞는 요금 확인" },
];

const PRODUCTS: SubscriptionProduct[] = [
  // 정수기
  { id: "sub-wp-1", name: "LG 퓨리케어 오브제컬렉션 얼음정수기", model: "WD523ACB", monthlyPrice: 20400, originalMonthlyPrice: 40900, maxBenefitPrice: 0, period: "60개월", badges: ["요금할인", "포인트적립"], category: "water-purifier", rating: 4.7, reviewCount: 1234, features: ["자가관리", "UV 살균", "얼음"], colors: ["베이지", "그레이"] },
  { id: "sub-wp-2", name: "LG 퓨리케어 오브제컬렉션 냉온정수기", model: "WD503AWB", monthlyPrice: 25900, originalMonthlyPrice: 36900, maxBenefitPrice: 5900, period: "60개월", badges: ["요금할인"], category: "water-purifier", rating: 4.6, reviewCount: 892, features: ["냉온수", "자가관리"] },
  { id: "sub-wp-3", name: "LG 퓨리케어 냉정수기", model: "WD305AW", monthlyPrice: 16900, originalMonthlyPrice: 28900, maxBenefitPrice: 6900, period: "60개월", badges: ["닷컴 ONLY"], category: "water-purifier", rating: 4.5, reviewCount: 567 },
  { id: "sub-wp-4", name: "LG 퓨리케어 정수전용", model: "WD101AW", monthlyPrice: 12900, originalMonthlyPrice: 22900, period: "48개월", badges: [], category: "water-purifier", rating: 4.3, reviewCount: 345 },
  { id: "sub-wp-5", name: "LG 퓨리케어 상하좌우 정수기", model: "WD505AW", monthlyPrice: 28900, originalMonthlyPrice: 42900, maxBenefitPrice: 8900, period: "60개월", badges: ["1위", "요금할인"], category: "water-purifier", rating: 4.8, reviewCount: 2345 },
  { id: "sub-wp-6", name: "LG 퓨리케어 빌트인 정수기", model: "WD321AW", monthlyPrice: 19900, originalMonthlyPrice: 29900, period: "48개월", badges: [], category: "water-purifier", rating: 4.4, reviewCount: 234 },

  // 에어컨
  { id: "sub-ac-1", name: "LG 휘센 오브제컬렉션 2in1 에어컨", model: "FQ20HDKWB2", monthlyPrice: 52900, originalMonthlyPrice: 79900, maxBenefitPrice: 32900, period: "60개월", badges: ["요금할인", "포인트적립"], category: "aircon", rating: 4.6, reviewCount: 234, features: ["2in1", "에너지 1등급"] },
  { id: "sub-ac-2", name: "LG 휘센 오브제컬렉션 스탠드 에어컨", model: "FQ18SDKWB1", monthlyPrice: 39900, originalMonthlyPrice: 59900, maxBenefitPrice: 19900, period: "60개월", badges: ["요금할인"], category: "aircon", rating: 4.5, reviewCount: 345 },
  { id: "sub-ac-3", name: "LG 휘센 벽걸이 에어컨 16평형", model: "SW16BDJWAS", monthlyPrice: 29900, originalMonthlyPrice: 42900, period: "48개월", badges: [], category: "aircon", rating: 4.4, reviewCount: 567 },
  { id: "sub-ac-4", name: "LG 휘센 벽걸이 에어컨 7평형", model: "SW07BDJWAS", monthlyPrice: 18900, originalMonthlyPrice: 28900, period: "48개월", badges: ["닷컴 ONLY"], category: "aircon", rating: 4.2, reviewCount: 456 },

  // 세탁기
  { id: "sub-ws-1", name: "LG 트롬 드럼세탁기 25kg", model: "F25WDLP", monthlyPrice: 32900, originalMonthlyPrice: 49900, maxBenefitPrice: 12900, period: "60개월", badges: ["요금할인"], category: "washer", rating: 4.5, reviewCount: 567, features: ["AI DD", "스팀"] },
  { id: "sub-ws-2", name: "LG 트롬 드럼세탁기 21kg", model: "F21WDLP", monthlyPrice: 27900, originalMonthlyPrice: 42900, period: "60개월", badges: [], category: "washer", rating: 4.4, reviewCount: 789 },
  { id: "sub-ws-3", name: "LG 통돌이 세탁기 19kg", model: "T19MX8", monthlyPrice: 16900, originalMonthlyPrice: 27900, period: "48개월", badges: ["포인트적립"], category: "washer", rating: 4.3, reviewCount: 1234 },

  // 냉장고
  { id: "sub-rf-1", name: "LG 디오스 오브제컬렉션 냉장고 832L", model: "M874GBB551", monthlyPrice: 55900, originalMonthlyPrice: 82900, maxBenefitPrice: 35900, period: "60개월", badges: ["요금할인", "포인트적립"], category: "refrigerator", rating: 4.7, reviewCount: 456, colors: ["베이지+베이지", "그레이+화이트"] },
  { id: "sub-rf-2", name: "LG 디오스 양문형 냉장고 821L", model: "S833SS30", monthlyPrice: 32900, originalMonthlyPrice: 49900, period: "60개월", badges: [], category: "refrigerator", rating: 4.4, reviewCount: 567 },
  { id: "sub-rf-3", name: "LG STEM 냉장고 870L", model: "T873MGB112", monthlyPrice: 69900, originalMonthlyPrice: 99900, maxBenefitPrice: 49900, period: "60개월", badges: ["신제품", "요금할인"], category: "refrigerator", rating: 4.8, reviewCount: 45 },

  // TV
  { id: "sub-tv-1", name: "LG OLED evo TV AI G4 83형", model: "OLED83G4KNA", monthlyPrice: 109900, originalMonthlyPrice: 159900, maxBenefitPrice: 89900, period: "60개월", badges: ["요금할인"], category: "tv", rating: 4.8, reviewCount: 342 },
  { id: "sub-tv-2", name: "LG OLED evo TV AI C4 65형", model: "OLED65C4KNA", monthlyPrice: 42900, originalMonthlyPrice: 62900, period: "60개월", badges: ["닷컴 ONLY"], category: "tv", rating: 4.7, reviewCount: 521 },
  { id: "sub-tv-3", name: "LG QNED TV 75형", model: "75QNED82KRA", monthlyPrice: 32900, originalMonthlyPrice: 49900, period: "48개월", badges: [], category: "tv", rating: 4.4, reviewCount: 156 },

  // 노트북
  { id: "sub-nb-1", name: "LG 그램 Pro 16 AI 2026", model: "16Z95U-GS5WK", monthlyPrice: 44900, originalMonthlyPrice: 62900, maxBenefitPrice: 24900, period: "60개월", badges: ["요금할인", "닷컴 ONLY"], category: "notebook", rating: 4.7, reviewCount: 234 },
  { id: "sub-nb-2", name: "LG 그램 17", model: "17Z90S-GD5CK", monthlyPrice: 29900, originalMonthlyPrice: 45900, period: "48개월", badges: [], category: "notebook", rating: 4.5, reviewCount: 567 },
  { id: "sub-nb-3", name: "LG 그램북 14", model: "14Z90RS-GD3FK", monthlyPrice: 18900, originalMonthlyPrice: 29900, period: "48개월", badges: ["포인트적립"], category: "notebook", rating: 4.3, reviewCount: 678 },

  // 공기청정기
  { id: "sub-ap-1", name: "LG 퓨리케어 360˚ 공기청정기", model: "AS186HWWL", monthlyPrice: 12900, originalMonthlyPrice: 22900, maxBenefitPrice: 2900, period: "60개월", badges: ["요금할인"], category: "air-purifier", rating: 4.6, reviewCount: 567 },
  { id: "sub-ap-2", name: "LG 에어로타워", model: "FS063PSSA", monthlyPrice: 19900, originalMonthlyPrice: 32900, period: "60개월", badges: ["포인트적립"], category: "air-purifier", rating: 4.7, reviewCount: 234 },

  // 식기세척기
  { id: "sub-dw-1", name: "LG 디오스 오브제컬렉션 식기세척기 14인용", model: "DFB41P", monthlyPrice: 22900, originalMonthlyPrice: 35900, maxBenefitPrice: 12900, period: "60개월", badges: ["요금할인"], category: "dishwasher", rating: 4.6, reviewCount: 678, colors: ["베이지", "그레이"] },
  { id: "sub-dw-2", name: "LG 디오스 식기세척기 12인용", model: "DFB22GA", monthlyPrice: 16900, originalMonthlyPrice: 25900, period: "48개월", badges: [], category: "dishwasher", rating: 4.5, reviewCount: 345 },

  // 워시타워
  { id: "sub-wt-1", name: "LG 트롬 오브제컬렉션 워시타워", model: "W20WAN", monthlyPrice: 49900, originalMonthlyPrice: 72900, maxBenefitPrice: 29900, period: "60개월", badges: ["요금할인", "포인트적립"], category: "washtower", rating: 4.7, reviewCount: 456, colors: ["베이지", "그린"] },
  { id: "sub-wt-2", name: "LG 트롬 오브제컬렉션 워시타워 컴팩트", model: "W16WAH", monthlyPrice: 39900, originalMonthlyPrice: 59900, period: "60개월", badges: [], category: "washtower", rating: 4.6, reviewCount: 234 },

  // 의류건조기
  { id: "sub-dr-1", name: "LG 트롬 건조기 20kg", model: "RH20WAN", monthlyPrice: 29900, originalMonthlyPrice: 45900, maxBenefitPrice: 19900, period: "60개월", badges: ["요금할인"], category: "dryer", rating: 4.6, reviewCount: 345 },
  { id: "sub-dr-2", name: "LG 트롬 건조기 16kg", model: "RH16WTAN", monthlyPrice: 22900, originalMonthlyPrice: 35900, period: "48개월", badges: [], category: "dryer", rating: 4.5, reviewCount: 456 },

  // 스타일러
  { id: "sub-sc-1", name: "LG 스타일러 오브제컬렉션", model: "SC5MBR62B", monthlyPrice: 29900, originalMonthlyPrice: 49900, maxBenefitPrice: 9900, period: "60개월", badges: ["요금할인"], category: "styler", rating: 4.7, reviewCount: 234, colors: ["미스트 베이지", "미스트 그린"] },
  { id: "sub-sc-2", name: "LG 스타일러 블랙에디션", model: "S5BB", monthlyPrice: 25900, originalMonthlyPrice: 39900, period: "48개월", badges: [], category: "styler", rating: 4.6, reviewCount: 456 },

  // 안마의자
  { id: "sub-mc-1", name: "LG 힐링미 안마의자 전신형", model: "MH70B", monthlyPrice: 82900, originalMonthlyPrice: 119900, maxBenefitPrice: 62900, period: "60개월", badges: ["요금할인"], category: "massage-chair", rating: 4.7, reviewCount: 45 },
  { id: "sub-mc-2", name: "LG 힐링미 안마의자 가구형", model: "MH50B", monthlyPrice: 52900, originalMonthlyPrice: 79900, period: "60개월", badges: ["포인트적립"], category: "massage-chair", rating: 4.6, reviewCount: 89 },

  // 청소기
  { id: "sub-vc-1", name: "LG 코드제로 A9S 올인원타워", model: "A9571IA", monthlyPrice: 22900, originalMonthlyPrice: 35900, maxBenefitPrice: 12900, period: "48개월", badges: ["요금할인"], category: "vacuum", rating: 4.7, reviewCount: 1234 },
  { id: "sub-vc-2", name: "LG 코드제로 로봇청소기 R5", model: "R580HKA", monthlyPrice: 29900, originalMonthlyPrice: 45900, period: "48개월", badges: ["신제품"], category: "vacuum", rating: 4.6, reviewCount: 234 },

  // 워시콤보
  { id: "sub-wc-1", name: "LG 트롬 오브제컬렉션 워시콤보 25kg", model: "FH25VAN", monthlyPrice: 42900, originalMonthlyPrice: 62900, maxBenefitPrice: 22900, period: "60개월", badges: ["요금할인", "신제품"], category: "washcombo", rating: 4.6, reviewCount: 123 },

  // 신발관리기
  { id: "sub-sh-1", name: "LG 슈케이스 오브제컬렉션", model: "SC2MWHAN", monthlyPrice: 18900, originalMonthlyPrice: 29900, period: "48개월", badges: ["포인트적립"], category: "shoe-care", rating: 4.5, reviewCount: 234 },
];

export function getSubscriptionProducts(category?: string): SubscriptionProduct[] {
  if (!category || category === "all") return PRODUCTS;
  return PRODUCTS.filter((p) => p.category === category);
}

export function formatMonthlyPrice(price: number): string {
  return price.toLocaleString("ko-KR");
}
