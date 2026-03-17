export interface Product {
  id: string;
  name: string;
  model: string;
  price: number;
  originalPrice?: number;
  badges: string[];
  category: string;
  subCategory?: string;
  rating?: number;
  reviewCount?: number;
  colors?: string[];
  features?: string[];
}

// URL path segment → 한글 레이블 매핑
export const PATH_LABELS: Record<string, string> = {
  "tv-audio": "TV/오디오",
  "pc-monitor": "PC/모니터",
  kitchen: "주방가전",
  living: "생활가전",
  air: "에어컨/에어케어",
  "ai-home": "AI Home",
  consumables: "케어용품/소모품",
  tv: "TV",
  oled: "올레드",
  qned: "QNED",
  nanocell: "나노셀",
  "ultra-hd": "울트라 HD",
  led: "일반 LED",
  lifestyle: "라이프스타일 스크린",
  sets: "TV 세트",
  standbyme: "스탠바이미",
  projector: "프로젝터",
  cinebeam: "시네빔",
  "cinebeam-set": "시네빔 세트",
  accessories: "액세서리",
  moodmate: "무드메이트",
  probeam: "프로빔(상업용)",
  audio: "오디오",
  soundsuite: "사운드스위트",
  "soundsuite-set": "사운드스위트 세트",
  earphone: "블루투스 이어폰",
  speaker: "무선 스피커",
  soundbar: "사운드바",
  player: "오디오/플레이어",
  signage: "사이니지",
  standalone: "단독형",
  board: "전자칠판",
  kiosk: "키오스크",
  stretch: "고휘도/스트레치",
  videowall: "비디오월",
  notebook: "노트북",
  "gram-pro": "그램 Pro",
  "gram-pro-360": "그램 Pro 360",
  gram: "그램",
  grambook: "그램북",
  set: "세트",
  intel: "Intel Core Ultra",
  copilot: "Copilot+ PC",
  desktop: "일체형/데스크톱",
  aio: "일체형 PC",
  tower: "데스크톱",
  tablet: "태블릿 기타",
  monitor: "모니터",
  "oled-gaming": "올레드 게이밍",
  gaming: "게이밍모니터",
  smart: "스마트모니터",
  "smart-swing": "스마트모니터 스윙",
  ultrafine: "울트라파인 evo",
  uhd: "UHD모니터",
  wide: "와이드모니터",
  pc: "PC모니터",
  refrigerator: "냉장고",
  stem: "STEM",
  "top-bottom": "상냉장/하냉동",
  "side-by-side": "양문형",
  standard: "일반형",
  "pair-kit": "페어설치키트",
  convertible: "컨버터블 패키지",
  fridge: "냉장전용고",
  freezer: "냉동전용고",
  kimchi: "김치냉장고",
  stand: "스탠드형",
  "top-open": "뚜껑형",
  "wine-cellar": "와인셀러",
  range: "전기레인지",
  induction: "인덕션",
  hybrid: "하이브리드",
  dishwasher: "식기세척기",
  oven: "광파오븐/전자레인지",
  lightwave: "광파오븐",
  microwave: "전자레인지",
  "water-purifier": "정수기",
  ice: "얼음정수기",
  "hot-cold": "냉온정수기",
  cold: "냉정수기",
  purify: "정수전용",
  hot: "온정수기",
  beer: "맥주제조기",
  ingredients: "맥주 원료 패키지",
  tumbler: "텀블러 세척기",
  mycup: "myCup",
  washtower: "워시타워",
  washcombo: "워시콤보",
  washer: "세탁기",
  drum: "드럼세탁기",
  "top-load": "통돌이",
  mini: "미니세탁기",
  combo: "세탁기+건조기",
  dryer: "의류건조기",
  "clothing-care": "의류관리기",
  styler: "스타일러",
  ironing: "시스템아이어닝",
  "shoe-care": "신발관리기",
  shoecase: "슈케이스",
  shoecare: "슈케어",
  "massage-chair": "안마의자",
  full: "전신형",
  furniture: "가구형",
  vacuum: "청소기",
  cordless: "무선청소기",
  robot: "로봇청소기",
  corded: "유선청소기",
  commercial: "상업용 청소기",
  aircon: "에어컨",
  "2in1": "2in1",
  wall: "벽걸이형",
  portable: "창호형/이동식",
  "system-aircon": "시스템 에어컨",
  residential: "주거용 시스템 에어컨",
  "air-purifier": "공기청정기",
  "360": "360˚ 공기청정기",
  aero: "에어로시리즈",
  dehumidifier: "제습기",
  humidifier: "가습기",
  purified: "정수 가습기",
  natural: "자연기화 가습기",
  ventilation: "환기 시스템",
  hub: "허브",
  doorlock: "도어락",
  sensor: "센서",
  switch: "스위치",
  button: "버튼",
  plug: "플러그",
  lighting: "조명",
  controller: "컨트롤러",
  solution: "AI Home 솔루션",
  "smart-standard": "스마트스타트 스탠다드",
  "smart-allinone": "스마트스타트 올인원",
  wellsleeping: "웰슬리핑",
  all: "전체",
  sale: "특가 Zone",
  "up-kit": "LG UP Kit",
  a9: "A9/A9S/A7",
  a9air: "A9 Air/A5",
  roboking: "로보킹 AI 올인원",
  system: "시스템/천장형",
  tonefree: "톤프리",
  water: "정수기",
  laundry: "세탁기/건조기",
  "14": "14인용",
  "12": "12인용",
};

// 카테고리별 설명
export const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  tv: "LG TV는 자체발광 올레드부터 퀀텀닷 나노셀까지, 당신의 시청 경험을 한 차원 높여줍니다.",
  standbyme: "어디서든 자유롭게, 나만의 스크린을 즐기세요. LG 스탠바이미로 새로운 라이프스타일을 경험하세요.",
  projector: "집에서 즐기는 대화면의 감동. LG 프로젝터로 나만의 홈시네마를 완성하세요.",
  audio: "공간을 채우는 몰입감 넘치는 사운드. LG 오디오로 프리미엄 청음 경험을 선사합니다.",
  signage: "비즈니스에 최적화된 디스플레이 솔루션. LG 사이니지로 효과적인 메시지를 전달하세요.",
  notebook: "가볍고 강력한 LG 그램. 언제 어디서나 완벽한 퍼포먼스를 경험하세요.",
  desktop: "고성능 데스크톱과 일체형 PC로 업무 생산성을 극대화하세요.",
  monitor: "정확한 색감과 부드러운 화면. LG 모니터로 최적의 시각 환경을 만드세요.",
  refrigerator: "신선함을 오래오래. LG 냉장고는 식재료를 최적의 상태로 보관합니다.",
  convertible: "나만의 조합으로 완성하는 맞춤형 냉장 솔루션. LG 컨버터블 패키지.",
  kimchi: "김치 본연의 맛을 지키는 전문 보관 기술. LG 김치냉장고.",
  "wine-cellar": "와인의 풍미를 완벽하게 보존하는 프리미엄 와인셀러.",
  range: "정밀한 화력 제어로 요리의 완성도를 높여주는 LG 전기레인지.",
  dishwasher: "깨끗함의 차이를 느끼세요. LG 식기세척기로 편리한 주방을 완성하세요.",
  oven: "균일한 열로 요리의 맛을 살리는 LG 광파오븐과 전자레인지.",
  "water-purifier": "깨끗하고 시원한 물. LG 정수기로 건강한 음수 습관을 만드세요.",
  beer: "집에서 즐기는 수제 맥주. LG 맥주제조기로 나만의 맥주를 만드세요.",
  tumbler: "텀블러 안쪽까지 깨끗하게. LG 텀블러 세척기.",
  washtower: "세탁과 건조를 하나로. LG 워시타워로 공간과 시간을 절약하세요.",
  washcombo: "세탁에서 건조까지 원스톱. LG 워시콤보.",
  washer: "강력한 세탁력과 섬세한 옷감 관리를 동시에. LG 세탁기.",
  dryer: "빠르고 부드러운 건조. LG 의류건조기.",
  "clothing-care": "입는 옷부터 보관하는 옷까지 완벽 관리. LG 의류관리기.",
  ironing: "전문 케어 수준의 다림질. LG 시스템아이어닝.",
  "shoe-care": "소중한 신발을 전문적으로 관리. LG 신발관리기.",
  "massage-chair": "집에서 누리는 프리미엄 안마. LG 안마의자.",
  vacuum: "강력한 흡입력과 편리한 사용. LG 청소기로 깨끗한 공간을 만드세요.",
  aircon: "쾌적한 실내 온도를 유지하는 LG 휘센 에어컨.",
  "system-aircon": "공간에 맞는 최적의 냉난방. LG 시스템 에어컨.",
  "air-purifier": "깨끗한 공기로 건강한 실내 환경. LG 퓨리케어 공기청정기.",
  dehumidifier: "쾌적한 습도 관리. LG 제습기.",
  humidifier: "건조한 계절에 최적의 습도를 유지하는 LG 가습기.",
  ventilation: "실내 공기를 깨끗하게 순환시키는 LG 환기 시스템.",
  "ai-home": "더 스마트한 집. LG AI Home으로 생활의 편리함을 경험하세요.",
  solution: "AI로 더 똑똑해진 홈 솔루션. 맞춤형 스마트 리빙을 시작하세요.",
};

// 더미 제품 데이터
const PRODUCTS: Product[] = [
  // ═══════════════ TV/오디오 ═══════════════
  // TV - 올레드
  { id: "tv-1", name: "LG OLED evo TV AI G4", model: "OLED83G4KNA", price: 7490000, originalPrice: 8290000, badges: ["인기"], category: "tv", subCategory: "oled", rating: 4.8, reviewCount: 342, colors: ["블랙"], features: ["AI 화질엔진", "무반사 올레드 글레어프리", "Dolby Atmos"] },
  { id: "tv-2", name: "LG OLED evo TV AI C4", model: "OLED65C4KNA", price: 2390000, badges: ["닷컴 ONLY"], category: "tv", subCategory: "oled", rating: 4.7, reviewCount: 521, colors: ["블랙"], features: ["α9 AI 프로세서", "120Hz", "게이밍 모드"] },
  { id: "tv-3", name: "LG OLED evo TV B4", model: "OLED55B4KNA", price: 1590000, badges: [], category: "tv", subCategory: "oled", rating: 4.6, reviewCount: 189, colors: ["블랙"] },
  { id: "tv-4", name: "LG OLED evo TV AI M4", model: "OLED77M4KNA", price: 11900000, badges: ["신제품", "Zero Connect"], category: "tv", subCategory: "oled", rating: 4.9, reviewCount: 45, colors: ["블랙"] },
  { id: "tv-5", name: "LG OLED evo TV AI G4 77형", model: "OLED77G4KNA", price: 9490000, originalPrice: 10290000, badges: [], category: "tv", subCategory: "oled", rating: 4.8, reviewCount: 128, colors: ["블랙"] },
  { id: "tv-6", name: "LG OLED evo TV AI C4 77형", model: "OLED77C4KNA", price: 3990000, badges: ["인기"], category: "tv", subCategory: "oled", rating: 4.7, reviewCount: 267, colors: ["블랙"] },

  // TV - QNED
  { id: "tv-7", name: "LG QNED TV AI 86형", model: "86QNED87KRA", price: 2990000, badges: ["신제품"], category: "tv", subCategory: "qned", rating: 4.5, reviewCount: 73, colors: ["블랙"] },
  { id: "tv-8", name: "LG QNED TV 75형", model: "75QNED82KRA", price: 1890000, originalPrice: 2190000, badges: [], category: "tv", subCategory: "qned", rating: 4.4, reviewCount: 156 },
  { id: "tv-9", name: "LG QNED TV AI 75형", model: "75QNED91KRA", price: 2490000, badges: ["인기"], category: "tv", subCategory: "qned", rating: 4.6, reviewCount: 98, colors: ["블랙"] },
  { id: "tv-10", name: "LG QNED TV 65형", model: "65QNED80KRA", price: 1290000, badges: [], category: "tv", subCategory: "qned", rating: 4.3, reviewCount: 211 },
  { id: "tv-11", name: "LG QNED TV 55형", model: "55QNED80KRA", price: 990000, badges: [], category: "tv", subCategory: "qned", rating: 4.4, reviewCount: 145 },

  // TV - 나노셀
  { id: "tv-12", name: "LG 나노셀 TV AI 65형", model: "65NANO87KNA", price: 1290000, badges: [], category: "tv", subCategory: "nanocell", rating: 4.3, reviewCount: 187 },
  { id: "tv-13", name: "LG 나노셀 TV 55형", model: "55NANO87KNA", price: 890000, badges: ["인기"], category: "tv", subCategory: "nanocell", rating: 4.2, reviewCount: 312 },
  { id: "tv-14", name: "LG 나노셀 TV 75형", model: "75NANO87KNA", price: 1890000, originalPrice: 2090000, badges: [], category: "tv", subCategory: "nanocell", rating: 4.4, reviewCount: 89 },

  // TV - 울트라 HD
  { id: "tv-15", name: "LG 울트라 HD TV AI 75형", model: "75UT9300KNA", price: 1690000, badges: ["인기"], category: "tv", subCategory: "ultra-hd", rating: 4.3, reviewCount: 245 },
  { id: "tv-16", name: "LG 울트라 HD TV 65형", model: "65UT8300KNA", price: 990000, badges: [], category: "tv", subCategory: "ultra-hd", rating: 4.2, reviewCount: 178 },
  { id: "tv-17", name: "LG 울트라 HD TV 55형", model: "55UT8300KNA", price: 790000, badges: [], category: "tv", subCategory: "ultra-hd", rating: 4.1, reviewCount: 389 },
  { id: "tv-18", name: "LG 울트라 HD TV 50형", model: "50UT8300KNA", price: 690000, originalPrice: 790000, badges: [], category: "tv", subCategory: "ultra-hd", rating: 4.0, reviewCount: 456 },
  { id: "tv-19", name: "LG 울트라 HD TV 43형", model: "43UT8300KNA", price: 590000, badges: [], category: "tv", subCategory: "ultra-hd", rating: 4.1, reviewCount: 523 },

  // TV - 일반 LED
  { id: "tv-20", name: "LG LED TV 43형", model: "43LM6370KNA", price: 490000, badges: [], category: "tv", subCategory: "led", rating: 4.0, reviewCount: 678 },
  { id: "tv-21", name: "LG LED TV 32형", model: "32LM6370KNA", price: 290000, badges: ["인기"], category: "tv", subCategory: "led", rating: 4.1, reviewCount: 1023 },

  // TV - 라이프스타일 스크린
  { id: "tv-22", name: "LG 라이프스타일 스크린 55형", model: "55LS9900KNA", price: 3290000, badges: ["신제품"], category: "tv", subCategory: "lifestyle", rating: 4.7, reviewCount: 34 },

  // 스탠바이미
  { id: "sbm-1", name: "LG 스탠바이미 2 27형", model: "27ART20QEKR", price: 1090000, badges: ["인기"], category: "standbyme", rating: 4.6, reviewCount: 892, colors: ["베이지", "그레이"], features: ["터치스크린", "무선 이동", "배터리 내장"] },
  { id: "sbm-2", name: "LG 스탠바이미 Go 27형", model: "27LX5QKNA", price: 1190000, badges: ["닷컴 ONLY"], category: "standbyme", rating: 4.7, reviewCount: 456, colors: ["베이지"], features: ["캐리어 디자인", "풀 HD", "터치스크린"] },
  { id: "sbm-3", name: "LG 스탠바이미 Pro 32형", model: "32ART20QEKR", price: 1590000, badges: ["신제품"], category: "standbyme", rating: 4.8, reviewCount: 67, colors: ["그레이"] },

  // 프로젝터
  { id: "pj-1", name: "LG 시네빔 큐", model: "HU715QW", price: 2290000, badges: ["신제품"], category: "projector", subCategory: "cinebeam", rating: 4.5, reviewCount: 123 },
  { id: "pj-2", name: "LG 시네빔 PF610T", model: "PF610T", price: 890000, badges: [], category: "projector", subCategory: "cinebeam", rating: 4.3, reviewCount: 234 },
  { id: "pj-3", name: "LG 시네빔 HU710PW", model: "HU710PW", price: 3490000, badges: ["인기"], category: "projector", subCategory: "cinebeam", rating: 4.6, reviewCount: 89 },
  { id: "pj-4", name: "LG 시네빔 PH30N", model: "PH30N", price: 490000, badges: [], category: "projector", subCategory: "cinebeam", rating: 4.1, reviewCount: 567 },
  { id: "pj-5", name: "LG 무드메이트", model: "PH55BT", price: 590000, badges: [], category: "projector", subCategory: "moodmate", rating: 4.2, reviewCount: 345 },
  { id: "pj-6", name: "LG 프로빔 4K", model: "BU60PST", price: 3590000, badges: [], category: "projector", subCategory: "probeam", rating: 4.4, reviewCount: 45 },
  { id: "pj-7", name: "LG 프로빔 레이저", model: "BF60PST", price: 5990000, badges: [], category: "projector", subCategory: "probeam", rating: 4.5, reviewCount: 23 },

  // 오디오
  { id: "au-1", name: "LG 사운드스위트 11.1.4ch", model: "SP11RA", price: 1890000, badges: ["인기"], category: "audio", subCategory: "soundsuite", rating: 4.7, reviewCount: 156, features: ["Dolby Atmos", "DTS:X", "11.1.4ch"] },
  { id: "au-2", name: "LG 사운드스위트 세트", model: "SP11RA-SET", price: 2190000, badges: [], category: "audio", subCategory: "soundsuite-set", rating: 4.6, reviewCount: 45 },
  { id: "au-3", name: "LG 사운드바 AI 9.1.5ch", model: "SP9YA", price: 890000, badges: [], category: "audio", subCategory: "soundbar", rating: 4.5, reviewCount: 378 },
  { id: "au-4", name: "LG 사운드바 7.1.2ch", model: "SP7YA", price: 590000, badges: ["인기"], category: "audio", subCategory: "soundbar", rating: 4.4, reviewCount: 512, features: ["Dolby Atmos", "무선 서브우퍼"] },
  { id: "au-5", name: "LG 사운드바 3.1ch", model: "SP2KA", price: 190000, badges: [], category: "audio", subCategory: "soundbar", rating: 4.2, reviewCount: 789 },
  { id: "au-6", name: "LG 톤프리 T90Q", model: "TONE-T90Q", price: 249000, badges: ["닷컴 ONLY"], category: "audio", subCategory: "earphone", rating: 4.5, reviewCount: 1234, colors: ["블랙", "화이트"], features: ["ANC", "Dolby Atmos", "Dolby Head Tracking"] },
  { id: "au-7", name: "LG 톤프리 T80Q", model: "TONE-T80Q", price: 199000, badges: [], category: "audio", subCategory: "earphone", rating: 4.4, reviewCount: 892, colors: ["블랙", "화이트", "차콜"] },
  { id: "au-8", name: "LG 톤프리 T60Q", model: "TONE-T60Q", price: 129000, badges: ["인기"], category: "audio", subCategory: "earphone", rating: 4.3, reviewCount: 1567, colors: ["블랙", "화이트"] },
  { id: "au-9", name: "LG XBOOM Go XG7", model: "XG7QBK", price: 189000, badges: [], category: "audio", subCategory: "speaker", rating: 4.3, reviewCount: 456, features: ["방수 IP67", "24시간 재생"] },
  { id: "au-10", name: "LG XBOOM Go XG5", model: "XG5QBK", price: 129000, badges: [], category: "audio", subCategory: "speaker", rating: 4.2, reviewCount: 678 },
  { id: "au-11", name: "LG XBOOM 360 스피커", model: "XO3QBK", price: 390000, badges: ["신제품"], category: "audio", subCategory: "speaker", rating: 4.6, reviewCount: 89 },

  // 사이니지
  { id: "sg-1", name: "LG LED 사이니지", model: "LAEC015-GN2", price: 15900000, badges: [], category: "signage", subCategory: "led", rating: 4.5, reviewCount: 12 },
  { id: "sg-2", name: "LG 전자칠판 75형", model: "75TR3DK-B", price: 4590000, badges: [], category: "signage", subCategory: "board", rating: 4.4, reviewCount: 34 },
  { id: "sg-3", name: "LG 전자칠판 86형", model: "86TR3DK-B", price: 6290000, badges: ["신제품"], category: "signage", subCategory: "board", rating: 4.5, reviewCount: 15 },
  { id: "sg-4", name: "LG 키오스크 55형", model: "55TC3D-B", price: 5890000, badges: [], category: "signage", subCategory: "kiosk", rating: 4.3, reviewCount: 8 },

  // ═══════════════ PC/모니터 ═══════════════
  // 노트북
  { id: "nb-1", name: "LG 그램 Pro 16 AI 2026", model: "16Z95U-GS5WK", price: 2490000, badges: ["닷컴 ONLY", "신제품"], category: "notebook", subCategory: "gram-pro", rating: 4.7, reviewCount: 234, colors: ["화이트", "블랙"], features: ["OLED 디스플레이", "Intel Core Ultra", "AI 기능"] },
  { id: "nb-2", name: "LG 그램 Pro 16 AI", model: "16Z95U-GD50K", price: 2190000, badges: [], category: "notebook", subCategory: "gram-pro", rating: 4.6, reviewCount: 456 },
  { id: "nb-3", name: "LG 그램 Pro 14 AI", model: "14Z95U-GS3WK", price: 1990000, badges: ["인기"], category: "notebook", subCategory: "gram-pro", rating: 4.6, reviewCount: 312, colors: ["화이트"] },
  { id: "nb-4", name: "LG 그램 Pro 360 16형", model: "16T95U-GD50K", price: 2190000, badges: ["신제품"], category: "notebook", subCategory: "gram-pro-360", rating: 4.5, reviewCount: 89, features: ["360도 회전", "터치스크린", "S Pen"] },
  { id: "nb-5", name: "LG 그램 Pro 360 14형", model: "14T95U-GD50K", price: 1890000, badges: [], category: "notebook", subCategory: "gram-pro-360", rating: 4.5, reviewCount: 123 },
  { id: "nb-6", name: "LG 그램 17", model: "17Z90S-GD5CK", price: 1690000, badges: [], category: "notebook", subCategory: "gram", rating: 4.5, reviewCount: 567 },
  { id: "nb-7", name: "LG 그램 16", model: "16Z90S-GD5CK", price: 1490000, badges: ["인기"], category: "notebook", subCategory: "gram", rating: 4.4, reviewCount: 789, colors: ["화이트", "차콜"] },
  { id: "nb-8", name: "LG 그램 15", model: "15Z90S-GD5CK", price: 1290000, badges: [], category: "notebook", subCategory: "gram", rating: 4.3, reviewCount: 345 },
  { id: "nb-9", name: "LG 그램 14", model: "14Z90S-GD5CK", price: 1190000, badges: [], category: "notebook", subCategory: "gram", rating: 4.4, reviewCount: 456 },
  { id: "nb-10", name: "LG 그램북 14", model: "14Z90RS-GD3FK", price: 990000, badges: ["인기"], category: "notebook", subCategory: "grambook", rating: 4.3, reviewCount: 678, colors: ["화이트"] },
  { id: "nb-11", name: "LG 그램북 15", model: "15Z90RS-GD3FK", price: 1090000, badges: [], category: "notebook", subCategory: "grambook", rating: 4.2, reviewCount: 234 },

  // 일체형/데스크톱
  { id: "dt-1", name: "LG 일체형 PC 27형", model: "27V70S-G.AKR", price: 1590000, badges: ["인기"], category: "desktop", subCategory: "aio", rating: 4.3, reviewCount: 123 },
  { id: "dt-2", name: "LG 일체형 PC 24형", model: "24V70S-G.AKR", price: 1190000, badges: [], category: "desktop", subCategory: "aio", rating: 4.2, reviewCount: 89 },
  { id: "dt-3", name: "LG 데스크톱 타워", model: "B80GV.AKR", price: 890000, badges: [], category: "desktop", subCategory: "tower", rating: 4.1, reviewCount: 67 },

  // 모니터
  { id: "mn-1", name: "LG 울트라기어 OLED 27형", model: "27GS95QE", price: 1290000, badges: ["인기"], category: "monitor", subCategory: "oled-gaming", rating: 4.8, reviewCount: 567, features: ["240Hz", "0.03ms", "OLED"] },
  { id: "mn-2", name: "LG 울트라기어 OLED 32형", model: "32GS95UE", price: 1590000, badges: ["신제품"], category: "monitor", subCategory: "oled-gaming", rating: 4.9, reviewCount: 123 },
  { id: "mn-3", name: "LG 울트라기어 OLED 45형 커브드", model: "45GS95QE", price: 2290000, badges: ["닷컴 ONLY"], category: "monitor", subCategory: "oled-gaming", rating: 4.7, reviewCount: 89, features: ["800R 커브드", "240Hz"] },
  { id: "mn-4", name: "LG 울트라기어 32형 QHD", model: "32GN650-B", price: 490000, badges: [], category: "monitor", subCategory: "gaming", rating: 4.4, reviewCount: 1234 },
  { id: "mn-5", name: "LG 울트라기어 27형 FHD", model: "27GN650-B", price: 290000, badges: ["인기"], category: "monitor", subCategory: "gaming", rating: 4.3, reviewCount: 2345 },
  { id: "mn-6", name: "LG 스마트모니터 32형 4K", model: "32SQ780S", price: 690000, badges: [], category: "monitor", subCategory: "smart", rating: 4.5, reviewCount: 345, features: ["webOS", "에르고 스탠드"] },
  { id: "mn-7", name: "LG 스마트모니터 27형", model: "27SQ780S", price: 490000, badges: [], category: "monitor", subCategory: "smart", rating: 4.4, reviewCount: 234 },
  { id: "mn-8", name: "LG 울트라파인 evo 32형 OLED", model: "32EP950", price: 2990000, badges: [], category: "monitor", subCategory: "ultrafine", rating: 4.8, reviewCount: 56, features: ["OLED", "DCI-P3 99%"] },
  { id: "mn-9", name: "LG UHD 모니터 32형", model: "32UN880-B", price: 590000, badges: ["인기"], category: "monitor", subCategory: "uhd", rating: 4.4, reviewCount: 678 },
  { id: "mn-10", name: "LG UHD 모니터 27형", model: "27UN880-B", price: 490000, badges: [], category: "monitor", subCategory: "uhd", rating: 4.3, reviewCount: 891 },
  { id: "mn-11", name: "LG 울트라와이드 34형", model: "34WP65G-B", price: 490000, badges: [], category: "monitor", subCategory: "wide", rating: 4.4, reviewCount: 567 },
  { id: "mn-12", name: "LG 울트라와이드 49형", model: "49WQ95C-W", price: 1790000, badges: ["신제품"], category: "monitor", subCategory: "wide", rating: 4.6, reviewCount: 34 },

  // ═══════════════ 주방가전 ═══════════════
  // 냉장고
  { id: "rf-1", name: "LG 디오스 오브제컬렉션 냉장고 832L", model: "M874GBB551", price: 3290000, badges: ["인기"], category: "refrigerator", subCategory: "top-bottom", rating: 4.7, reviewCount: 456, colors: ["베이지+베이지", "그레이+화이트", "그린+베이지"], features: ["매직스페이스", "컨버터블"] },
  { id: "rf-2", name: "LG 디오스 오브제컬렉션 냉장고 710L", model: "M711GBB551", price: 2790000, badges: [], category: "refrigerator", subCategory: "top-bottom", rating: 4.6, reviewCount: 234, colors: ["베이지+베이지"] },
  { id: "rf-3", name: "LG 디오스 양문형 냉장고 821L", model: "S833SS30", price: 1590000, badges: [], category: "refrigerator", subCategory: "side-by-side", rating: 4.4, reviewCount: 567 },
  { id: "rf-4", name: "LG 디오스 양문형 냉장고 636L", model: "S631SS35Q", price: 1290000, badges: ["인기"], category: "refrigerator", subCategory: "side-by-side", rating: 4.3, reviewCount: 789 },
  { id: "rf-5", name: "LG STEM 냉장고 870L", model: "T873MGB112", price: 4290000, badges: ["신제품"], category: "refrigerator", subCategory: "stem", rating: 4.8, reviewCount: 45, features: ["LG STEM", "오브제컬렉션"] },
  { id: "rf-6", name: "LG STEM 냉장고 640L", model: "T643MEE112", price: 3590000, badges: [], category: "refrigerator", subCategory: "stem", rating: 4.7, reviewCount: 67 },
  { id: "rf-7", name: "LG 일반형 냉장고 507L", model: "B502W33", price: 890000, badges: [], category: "refrigerator", subCategory: "standard", rating: 4.2, reviewCount: 345 },
  { id: "rf-8", name: "LG 일반형 냉장고 462L", model: "B462W33", price: 790000, badges: [], category: "refrigerator", subCategory: "standard", rating: 4.1, reviewCount: 456 },

  // 컨버터블 패키지
  { id: "cv-1", name: "LG 컨버터블 냉장전용고 380L", model: "Y380GBB", price: 1490000, badges: ["인기"], category: "convertible", subCategory: "fridge", rating: 4.5, reviewCount: 123, colors: ["베이지"] },
  { id: "cv-2", name: "LG 컨버터블 냉동전용고 321L", model: "Y321GBB", price: 1290000, badges: [], category: "convertible", subCategory: "freezer", rating: 4.4, reviewCount: 89 },
  { id: "cv-3", name: "LG 컨버터블 김치냉장고 324L", model: "Y324GBB", price: 1190000, badges: [], category: "convertible", subCategory: "kimchi", rating: 4.3, reviewCount: 67 },

  // 김치냉장고
  { id: "km-1", name: "LG 디오스 오브제컬렉션 김치냉장고 스탠드형 407L", model: "Z407GBB161", price: 1890000, badges: ["인기"], category: "kimchi", subCategory: "stand", rating: 4.6, reviewCount: 234, colors: ["베이지"] },
  { id: "km-2", name: "LG 디오스 오브제컬렉션 김치냉장고 스탠드형 324L", model: "Z324GBB161", price: 1590000, badges: [], category: "kimchi", subCategory: "stand", rating: 4.5, reviewCount: 123 },
  { id: "km-3", name: "LG 디오스 김치냉장고 뚜껑형 219L", model: "K228LW13E", price: 890000, badges: [], category: "kimchi", subCategory: "top-open", rating: 4.3, reviewCount: 345 },

  // 와인셀러
  { id: "wc-1", name: "LG 디오스 와인셀러 71병", model: "W715S", price: 2290000, badges: [], category: "wine-cellar", rating: 4.5, reviewCount: 45 },
  { id: "wc-2", name: "LG 디오스 와인셀러 43병", model: "W435S", price: 1490000, badges: ["인기"], category: "wine-cellar", rating: 4.4, reviewCount: 89 },

  // 전기레인지
  { id: "rg-1", name: "LG 디오스 인덕션 3구", model: "BEI3GSTR", price: 1590000, badges: [], category: "range", subCategory: "induction", rating: 4.5, reviewCount: 234 },
  { id: "rg-2", name: "LG 디오스 인덕션 2구", model: "BEI2GSTR", price: 990000, badges: ["인기"], category: "range", subCategory: "induction", rating: 4.4, reviewCount: 456 },
  { id: "rg-3", name: "LG 디오스 하이브리드 전기레인지", model: "BEH3GTR", price: 1290000, badges: [], category: "range", subCategory: "hybrid", rating: 4.3, reviewCount: 123 },

  // 식기세척기
  { id: "dw-1", name: "LG 디오스 오브제컬렉션 식기세척기 14인용", model: "DFB41P", price: 1290000, badges: ["인기"], category: "dishwasher", subCategory: "14", rating: 4.6, reviewCount: 678, colors: ["베이지", "그레이"] },
  { id: "dw-2", name: "LG 디오스 식기세척기 14인용", model: "DFB22SA", price: 990000, badges: [], category: "dishwasher", subCategory: "14", rating: 4.4, reviewCount: 456 },
  { id: "dw-3", name: "LG 디오스 오브제컬렉션 식기세척기 12인용", model: "DFB22GA", price: 890000, badges: [], category: "dishwasher", subCategory: "12", rating: 4.5, reviewCount: 345 },

  // 광파오븐/전자레인지
  { id: "ov-1", name: "LG 디오스 광파오븐 39L", model: "ML39WN", price: 390000, badges: ["인기"], category: "oven", subCategory: "lightwave", rating: 4.4, reviewCount: 567 },
  { id: "ov-2", name: "LG 디오스 광파오븐 32L", model: "ML32WN", price: 290000, badges: [], category: "oven", subCategory: "lightwave", rating: 4.3, reviewCount: 789 },
  { id: "ov-3", name: "LG 전자레인지 23L", model: "MW23ND", price: 149000, badges: [], category: "oven", subCategory: "microwave", rating: 4.1, reviewCount: 1234 },
  { id: "ov-4", name: "LG 전자레인지 26L", model: "MW26ND", price: 179000, badges: [], category: "oven", subCategory: "microwave", rating: 4.2, reviewCount: 890 },

  // 정수기
  { id: "wp-1", name: "LG 퓨리케어 오브제컬렉션 얼음정수기", model: "WD523ACS", price: 1890000, badges: ["인기"], category: "water-purifier", subCategory: "ice", rating: 4.7, reviewCount: 234, colors: ["베이지", "그레이"], features: ["자가관리", "UV 살균"] },
  { id: "wp-2", name: "LG 퓨리케어 냉온정수기", model: "WD503AW", price: 690000, badges: [], category: "water-purifier", subCategory: "hot-cold", rating: 4.5, reviewCount: 456 },
  { id: "wp-3", name: "LG 퓨리케어 냉정수기", model: "WD305AW", price: 490000, badges: [], category: "water-purifier", subCategory: "cold", rating: 4.3, reviewCount: 567 },
  { id: "wp-4", name: "LG 퓨리케어 정수전용", model: "WD101AW", price: 290000, badges: [], category: "water-purifier", subCategory: "purify", rating: 4.2, reviewCount: 678 },

  // 맥주제조기
  { id: "br-1", name: "LG 홈브루 맥주제조기", model: "BB052S", price: 590000, badges: [], category: "beer", rating: 4.3, reviewCount: 234 },

  // 텀블러 세척기
  { id: "tb-1", name: "LG myCup 텀블러 세척기", model: "VX2AS", price: 299000, badges: ["신제품"], category: "tumbler", subCategory: "mycup", rating: 4.4, reviewCount: 123, colors: ["화이트", "핑크"] },

  // ═══════════════ 생활가전 ═══════════════
  // 워시타워
  { id: "wt-1", name: "LG 트롬 오브제컬렉션 워시타워", model: "W20WAN", price: 2690000, badges: ["인기"], category: "washtower", subCategory: "standard", rating: 4.7, reviewCount: 456, colors: ["베이지", "그린"], features: ["세탁 25kg", "건조 20kg"] },
  { id: "wt-2", name: "LG 트롬 오브제컬렉션 워시타워 컴팩트", model: "W16WAH", price: 2290000, badges: [], category: "washtower", subCategory: "standard", rating: 4.6, reviewCount: 234, colors: ["베이지"] },

  // 워시콤보
  { id: "wc2-1", name: "LG 트롬 오브제컬렉션 워시콤보 25kg", model: "FH25VAN", price: 2390000, badges: ["신제품"], category: "washcombo", subCategory: "standard", rating: 4.6, reviewCount: 123, colors: ["베이지", "그레이"] },

  // 세탁기
  { id: "ws-1", name: "LG 트롬 드럼세탁기 25kg", model: "F25WDLP", price: 1490000, badges: ["인기"], category: "washer", subCategory: "drum", rating: 4.5, reviewCount: 567 },
  { id: "ws-2", name: "LG 트롬 드럼세탁기 21kg", model: "F21WDLP", price: 1290000, badges: [], category: "washer", subCategory: "drum", rating: 4.4, reviewCount: 789 },
  { id: "ws-3", name: "LG 트롬 드럼세탁기 17kg", model: "F17WDAP", price: 990000, badges: [], category: "washer", subCategory: "drum", rating: 4.3, reviewCount: 456 },
  { id: "ws-4", name: "LG 통돌이 세탁기 19kg", model: "T19MX8", price: 790000, badges: ["인기"], category: "washer", subCategory: "top-load", rating: 4.3, reviewCount: 1234 },
  { id: "ws-5", name: "LG 통돌이 세탁기 16kg", model: "T16MX8", price: 590000, badges: [], category: "washer", subCategory: "top-load", rating: 4.2, reviewCount: 891 },
  { id: "ws-6", name: "LG 미니워시 4kg", model: "F4WC", price: 490000, badges: [], category: "washer", subCategory: "mini", rating: 4.1, reviewCount: 345 },

  // 의류건조기
  { id: "dr-1", name: "LG 트롬 건조기 20kg", model: "RH20WAN", price: 1590000, badges: ["인기"], category: "dryer", subCategory: "standard", rating: 4.6, reviewCount: 345, colors: ["베이지"] },
  { id: "dr-2", name: "LG 트롬 건조기 16kg", model: "RH16WTAN", price: 1290000, badges: [], category: "dryer", subCategory: "standard", rating: 4.5, reviewCount: 456 },

  // 의류관리기
  { id: "sc-1", name: "LG 스타일러 오브제컬렉션", model: "SC5MBR62B", price: 1690000, originalPrice: 1890000, badges: [], category: "clothing-care", subCategory: "styler", rating: 4.7, reviewCount: 234, colors: ["미스트 베이지", "미스트 그린"] },
  { id: "sc-2", name: "LG 스타일러 블랙에디션", model: "S5BB", price: 1490000, badges: ["인기"], category: "clothing-care", subCategory: "styler", rating: 4.6, reviewCount: 456, colors: ["블랙"] },
  { id: "sc-3", name: "LG 스타일러 슬림", model: "S3BF", price: 990000, badges: [], category: "clothing-care", subCategory: "styler", rating: 4.4, reviewCount: 567 },

  // 신발관리기
  { id: "sh-1", name: "LG 슈케이스 오브제컬렉션", model: "SC2MWHAN", price: 990000, badges: ["인기"], category: "shoe-care", subCategory: "shoecase", rating: 4.5, reviewCount: 234, colors: ["베이지"] },
  { id: "sh-2", name: "LG 슈케어", model: "SCW1BFSTL", price: 490000, badges: [], category: "shoe-care", subCategory: "shoecare", rating: 4.3, reviewCount: 345 },

  // 안마의자
  { id: "mc-1", name: "LG 힐링미 안마의자 전신형", model: "MH70B", price: 4990000, badges: ["신제품"], category: "massage-chair", subCategory: "full", rating: 4.7, reviewCount: 45 },
  { id: "mc-2", name: "LG 힐링미 안마의자 가구형", model: "MH50B", price: 2990000, badges: ["인기"], category: "massage-chair", subCategory: "furniture", rating: 4.6, reviewCount: 89, colors: ["브라운", "그레이"] },

  // 청소기
  { id: "vc-1", name: "LG 코드제로 A9S 올인원타워", model: "A9571IA", price: 1290000, badges: ["인기"], category: "vacuum", subCategory: "cordless", rating: 4.7, reviewCount: 1234, features: ["올인원타워", "파워드라이브 무빙노즐"] },
  { id: "vc-2", name: "LG 코드제로 A9 Air", model: "A9581AIA", price: 890000, badges: [], category: "vacuum", subCategory: "cordless", rating: 4.5, reviewCount: 567 },
  { id: "vc-3", name: "LG 코드제로 A9 Air 라이트", model: "A9381AIA", price: 590000, badges: [], category: "vacuum", subCategory: "cordless", rating: 4.3, reviewCount: 789 },
  { id: "vc-4", name: "LG 코드제로 로봇청소기 R5", model: "R580HKA", price: 1690000, badges: ["신제품"], category: "vacuum", subCategory: "robot", rating: 4.6, reviewCount: 234, features: ["AI 장애물 인식", "자동 물걸레"] },
  { id: "vc-5", name: "LG 코드제로 로봇청소기 R3", model: "R380HKA", price: 990000, badges: ["인기"], category: "vacuum", subCategory: "robot", rating: 4.4, reviewCount: 567 },
  { id: "vc-6", name: "LG 유선 청소기", model: "VC7420NHAB", price: 290000, badges: [], category: "vacuum", subCategory: "corded", rating: 4.1, reviewCount: 234 },

  // ═══════════════ 에어컨/에어케어 ═══════════════
  // 에어컨
  { id: "ac-1", name: "LG 휘센 오브제컬렉션 2in1 에어컨", model: "FQ20HDKWB2", price: 3490000, badges: ["인기"], category: "aircon", subCategory: "2in1", rating: 4.6, reviewCount: 234, colors: ["베이지"], features: ["2in1", "에너지 1등급", "AI 쾌적"] },
  { id: "ac-2", name: "LG 휘센 오브제컬렉션 스탠드 에어컨", model: "FQ18SDKWB1", price: 2490000, badges: [], category: "aircon", subCategory: "stand", rating: 4.5, reviewCount: 345 },
  { id: "ac-3", name: "LG 휘센 벽걸이 에어컨 16평형", model: "SW16BDJWAS", price: 1290000, badges: [], category: "aircon", subCategory: "wall", rating: 4.4, reviewCount: 567 },
  { id: "ac-4", name: "LG 휘센 벽걸이 에어컨 13평형", model: "SW13BDJWAS", price: 1090000, badges: ["인기"], category: "aircon", subCategory: "wall", rating: 4.3, reviewCount: 891 },
  { id: "ac-5", name: "LG 휘센 벽걸이 에어컨 7평형", model: "SW07BDJWAS", price: 790000, badges: [], category: "aircon", subCategory: "wall", rating: 4.2, reviewCount: 456 },
  { id: "ac-6", name: "LG 휘센 이동식 에어컨", model: "PQ08DAWBS", price: 490000, badges: [], category: "aircon", subCategory: "portable", rating: 4.0, reviewCount: 789 },

  // 시스템 에어컨
  { id: "sa-1", name: "LG 휘센 시스템 에어컨 멀티V", model: "RPNW11S40S", price: 5900000, badges: [], category: "system-aircon", subCategory: "residential", rating: 4.5, reviewCount: 34 },
  { id: "sa-2", name: "LG 휘센 시스템 에어컨 1Way", model: "RPNW07S40S", price: 2990000, badges: ["인기"], category: "system-aircon", subCategory: "residential", rating: 4.4, reviewCount: 67 },

  // 공기청정기
  { id: "ap-1", name: "LG 퓨리케어 360˚ 공기청정기 알파 플러스", model: "AS186HWWL", price: 490000, originalPrice: 590000, badges: ["닷컴 ONLY"], category: "air-purifier", subCategory: "360", rating: 4.6, reviewCount: 567, features: ["360˚ 청정", "스마트센서", "펫 모드"] },
  { id: "ap-2", name: "LG 퓨리케어 360˚ 공기청정기 알파", model: "AS141HWWL", price: 390000, badges: [], category: "air-purifier", subCategory: "360", rating: 4.5, reviewCount: 456 },
  { id: "ap-3", name: "LG 에어로타워", model: "FS063PSSA", price: 890000, badges: ["인기"], category: "air-purifier", subCategory: "aero", rating: 4.7, reviewCount: 234, features: ["공기청정+온풍+선풍", "UVnano"] },
  { id: "ap-4", name: "LG 에어로퍼니처", model: "AS064PWFA1", price: 590000, badges: [], category: "air-purifier", subCategory: "aero", rating: 4.4, reviewCount: 345 },

  // 제습기
  { id: "dh-1", name: "LG 퓨리케어 제습기 20L", model: "DQ200PGAA", price: 590000, badges: ["인기"], category: "dehumidifier", rating: 4.5, reviewCount: 456 },
  { id: "dh-2", name: "LG 퓨리케어 제습기 15L", model: "DQ150PGAA", price: 490000, badges: [], category: "dehumidifier", rating: 4.4, reviewCount: 345 },

  // 가습기
  { id: "hm-1", name: "LG 퓨리케어 정수 가습기", model: "HW300BBN", price: 590000, badges: ["신제품"], category: "humidifier", subCategory: "purified", rating: 4.5, reviewCount: 123 },
  { id: "hm-2", name: "LG 퓨리케어 자연기화 가습기", model: "HW100BBNA", price: 290000, badges: [], category: "humidifier", subCategory: "natural", rating: 4.3, reviewCount: 234 },

  // ═══════════════ AI Home ═══════════════
  { id: "ah-1", name: "LG ThinQ ON AI 허브", model: "KBLS1S01", price: 199000, badges: ["신제품"], category: "ai-home", subCategory: "hub", rating: 4.3, reviewCount: 89, features: ["Matter 지원", "음성인식"] },
  { id: "ah-2", name: "LG 스마트 도어락", model: "KBLP1303", price: 390000, badges: [], category: "ai-home", subCategory: "doorlock", rating: 4.4, reviewCount: 123 },
  { id: "ah-3", name: "LG 스마트 도어락 미니", model: "KBLP0901", price: 190000, badges: ["인기"], category: "ai-home", subCategory: "doorlock", rating: 4.2, reviewCount: 234 },
  { id: "ah-4", name: "LG 스마트 센서 온습도", model: "KBSM0101", price: 39000, badges: [], category: "ai-home", subCategory: "sensor", rating: 4.1, reviewCount: 156 },
  { id: "ah-5", name: "LG 스마트 센서 도어", model: "KBSM0201", price: 29000, badges: [], category: "ai-home", subCategory: "sensor", rating: 4.0, reviewCount: 89 },
  { id: "ah-6", name: "LG 스마트 스위치", model: "KBSW0101", price: 69000, badges: [], category: "ai-home", subCategory: "switch", rating: 4.2, reviewCount: 67 },
  { id: "ah-7", name: "LG 스마트 플러그", model: "KBSP0101", price: 39000, badges: [], category: "ai-home", subCategory: "plug", rating: 4.1, reviewCount: 234 },
  { id: "ah-8", name: "LG 스마트 조명 LED", model: "KBSL0101", price: 49000, badges: [], category: "ai-home", subCategory: "lighting", rating: 4.0, reviewCount: 178 },

  // AI Home 솔루션
  { id: "sol-1", name: "LG 스마트스타트 스탠다드", model: "KBST0101", price: 390000, badges: ["신제품"], category: "solution", subCategory: "smart-standard", rating: 4.3, reviewCount: 23 },
  { id: "sol-2", name: "LG 스마트스타트 올인원", model: "KBST0201", price: 690000, badges: [], category: "solution", subCategory: "smart-allinone", rating: 4.4, reviewCount: 12 },
  { id: "sol-3", name: "LG 웰슬리핑 패키지", model: "KBST0301", price: 290000, badges: [], category: "solution", subCategory: "wellsleeping", rating: 4.2, reviewCount: 34 },
];

// 카테고리에 속하는 제품 가져오기
export function getProducts(category?: string, subCategory?: string): Product[] {
  if (!category) return PRODUCTS;
  if (subCategory) {
    return PRODUCTS.filter(
      (p) => p.category === category && p.subCategory === subCategory,
    );
  }
  return PRODUCTS.filter((p) => p.category === category);
}

// 탭에 속하는 전체 제품 가져오기
export function getProductsByTab(tab: string): Product[] {
  const tabCategoryMap: Record<string, string[]> = {
    "tv-audio": ["tv", "standbyme", "projector", "audio", "signage"],
    "pc-monitor": ["notebook", "desktop", "monitor"],
    kitchen: ["refrigerator", "convertible", "kimchi", "wine-cellar", "range", "dishwasher", "oven", "water-purifier", "beer", "tumbler"],
    living: ["washtower", "washcombo", "washer", "dryer", "clothing-care", "ironing", "shoe-care", "massage-chair", "vacuum"],
    air: ["aircon", "system-aircon", "air-purifier", "dehumidifier", "humidifier", "ventilation"],
    "ai-home": ["ai-home", "solution"],
    consumables: ["consumables"],
  };
  const categories = tabCategoryMap[tab];
  if (!categories) return [];
  return PRODUCTS.filter((p) => categories.includes(p.category));
}

export function formatPrice(price: number): string {
  return price.toLocaleString("ko-KR");
}
