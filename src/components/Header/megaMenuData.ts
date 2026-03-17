export interface SubCategory {
  title: string;
  path: string;
  items: { label: string; path: string }[];
}

export interface MegaMenuTab {
  label: string;
  path: string;
  categories: SubCategory[];
  tags?: string[];
  rightTitle?: string;
  rightSubItem?: string;
}

export interface MegaMenuData {
  label: string;
  tabs?: MegaMenuTab[];
  simpleItems?: { label: string; path: string }[];
  groupedItems?: {
    title: string;
    path: string;
    items: { label: string; path: string }[];
  }[];
}

export const MEGA_MENU_DATA: Record<string, MegaMenuData> = {
  "제품/소모품": {
    label: "제품/소모품",
    tabs: [
      {
        label: "TV/오디오",
        path: "/products/tv-audio",
        rightTitle: "마인드웰니스",
        rightSubItem: "brid.zzz",
        categories: [
          {
            title: "TV",
            path: "/products/tv-audio/tv",
            items: [
              { label: "올레드", path: "/products/tv-audio/tv/oled" },
              { label: "QNED", path: "/products/tv-audio/tv/qned" },
              { label: "나노셀", path: "/products/tv-audio/tv/nanocell" },
              { label: "울트라 HD", path: "/products/tv-audio/tv/ultra-hd" },
              { label: "일반 LED", path: "/products/tv-audio/tv/led" },
              { label: "라이프스타일 스크린", path: "/products/tv-audio/tv/lifestyle" },
              { label: "TV 세트", path: "/products/tv-audio/tv/sets" },
            ],
          },
          {
            title: "스탠바이미",
            path: "/products/tv-audio/standbyme",
            items: [],
          },
          {
            title: "프로젝터",
            path: "/products/tv-audio/projector",
            items: [
              { label: "시네빔", path: "/products/tv-audio/projector/cinebeam" },
              { label: "시네빔 세트", path: "/products/tv-audio/projector/cinebeam-set" },
              { label: "시네빔 액세서리", path: "/products/tv-audio/projector/accessories" },
              { label: "무드메이트", path: "/products/tv-audio/projector/moodmate" },
              { label: "프로빔(상업용)", path: "/products/tv-audio/projector/probeam" },
            ],
          },
          {
            title: "오디오",
            path: "/products/tv-audio/audio",
            items: [
              { label: "사운드스위트", path: "/products/tv-audio/audio/soundsuite" },
              { label: "사운드스위트 세트", path: "/products/tv-audio/audio/soundsuite-set" },
              { label: "블루투스 이어폰", path: "/products/tv-audio/audio/earphone" },
              { label: "무선 스피커", path: "/products/tv-audio/audio/speaker" },
              { label: "사운드바", path: "/products/tv-audio/audio/soundbar" },
              { label: "오디오/플레이어", path: "/products/tv-audio/audio/player" },
            ],
          },
          {
            title: "사이니지",
            path: "/products/tv-audio/signage",
            items: [
              { label: "LED", path: "/products/tv-audio/signage/led" },
              { label: "단독형", path: "/products/tv-audio/signage/standalone" },
              { label: "전자칠판", path: "/products/tv-audio/signage/board" },
              { label: "키오스크", path: "/products/tv-audio/signage/kiosk" },
              { label: "고휘도/스트레치", path: "/products/tv-audio/signage/stretch" },
              { label: "올레드", path: "/products/tv-audio/signage/oled" },
              { label: "비디오월", path: "/products/tv-audio/signage/videowall" },
            ],
          },
        ],
        tags: ["#갤러리디자인", "#홈 엔터테인먼트", "#캠핑영화관"],
      },
      {
        label: "PC/모니터",
        path: "/products/pc-monitor",
        rightTitle: "PC 액세서리",
        rightSubItem: "노트북 가방/파우치",
        categories: [
          {
            title: "노트북",
            path: "/products/pc-monitor/notebook",
            items: [
              { label: "그램 Pro", path: "/products/pc-monitor/notebook/gram-pro" },
              { label: "그램 Pro 360", path: "/products/pc-monitor/notebook/gram-pro-360" },
              { label: "그램", path: "/products/pc-monitor/notebook/gram" },
              { label: "그램북", path: "/products/pc-monitor/notebook/grambook" },
              { label: "노트북 세트", path: "/products/pc-monitor/notebook/set" },
              { label: "Intel Core Ultra", path: "/products/pc-monitor/notebook/intel" },
              { label: "Copilot+ PC", path: "/products/pc-monitor/notebook/copilot" },
            ],
          },
          {
            title: "일체형/데스크톱",
            path: "/products/pc-monitor/desktop",
            items: [
              { label: "일체형 PC", path: "/products/pc-monitor/desktop/aio" },
              { label: "데스크톱", path: "/products/pc-monitor/desktop/tower" },
              { label: "태블릿 기타", path: "/products/pc-monitor/desktop/tablet" },
            ],
          },
          {
            title: "모니터",
            path: "/products/pc-monitor/monitor",
            items: [
              { label: "올레드 게이밍", path: "/products/pc-monitor/monitor/oled-gaming" },
              { label: "게이밍모니터", path: "/products/pc-monitor/monitor/gaming" },
              { label: "스마트모니터", path: "/products/pc-monitor/monitor/smart" },
              { label: "스마트모니터 스윙", path: "/products/pc-monitor/monitor/smart-swing" },
              { label: "울트라파인 evo", path: "/products/pc-monitor/monitor/ultrafine" },
              { label: "UHD모니터", path: "/products/pc-monitor/monitor/uhd" },
              { label: "와이드모니터", path: "/products/pc-monitor/monitor/wide" },
              { label: "PC모니터", path: "/products/pc-monitor/monitor/pc" },
            ],
          },
        ],
        tags: ["#게임", "#재택"],
      },
      {
        label: "주방가전",
        path: "/products/kitchen",
        rightTitle: "빌트인가전",
        rightSubItem: "시그니처 키친 스위트",
        categories: [
          {
            title: "냉장고",
            path: "/products/kitchen/refrigerator",
            items: [
              { label: "STEM", path: "/products/kitchen/refrigerator/stem" },
              { label: "상냉장/하냉동", path: "/products/kitchen/refrigerator/top-bottom" },
              { label: "양문형", path: "/products/kitchen/refrigerator/side-by-side" },
              { label: "일반형", path: "/products/kitchen/refrigerator/standard" },
              { label: "페어설치키트", path: "/products/kitchen/refrigerator/pair-kit" },
              { label: "냉장고 세트", path: "/products/kitchen/refrigerator/set" },
            ],
          },
          {
            title: "컨버터블 패키지",
            path: "/products/kitchen/convertible",
            items: [
              { label: "냉장전용고", path: "/products/kitchen/convertible/fridge" },
              { label: "냉동전용고", path: "/products/kitchen/convertible/freezer" },
              { label: "김치냉장고", path: "/products/kitchen/convertible/kimchi" },
              { label: "페어설치키트", path: "/products/kitchen/convertible/pair-kit" },
              { label: "컨버터블 패키지 세트", path: "/products/kitchen/convertible/set" },
            ],
          },
          {
            title: "김치냉장고",
            path: "/products/kitchen/kimchi",
            items: [
              { label: "스탠드형", path: "/products/kitchen/kimchi/stand" },
              { label: "뚜껑형", path: "/products/kitchen/kimchi/top-open" },
              { label: "페어설치키트", path: "/products/kitchen/kimchi/pair-kit" },
              { label: "김치냉장고 세트", path: "/products/kitchen/kimchi/set" },
            ],
          },
          {
            title: "와인셀러",
            path: "/products/kitchen/wine-cellar",
            items: [],
          },
          {
            title: "전기레인지",
            path: "/products/kitchen/range",
            items: [
              { label: "인덕션", path: "/products/kitchen/range/induction" },
              { label: "하이브리드", path: "/products/kitchen/range/hybrid" },
              { label: "전기레인지 세트", path: "/products/kitchen/range/set" },
            ],
          },
          {
            title: "식기세척기",
            path: "/products/kitchen/dishwasher",
            items: [
              { label: "14인용", path: "/products/kitchen/dishwasher/14" },
              { label: "12인용", path: "/products/kitchen/dishwasher/12" },
              { label: "식기세척기 세트", path: "/products/kitchen/dishwasher/set" },
            ],
          },
          {
            title: "광파오븐/전자레인지",
            path: "/products/kitchen/oven",
            items: [
              { label: "광파오븐", path: "/products/kitchen/oven/lightwave" },
              { label: "전자레인지", path: "/products/kitchen/oven/microwave" },
            ],
          },
          {
            title: "정수기",
            path: "/products/kitchen/water-purifier",
            items: [
              { label: "얼음정수기", path: "/products/kitchen/water-purifier/ice" },
              { label: "냉온정수기", path: "/products/kitchen/water-purifier/hot-cold" },
              { label: "냉정수기", path: "/products/kitchen/water-purifier/cold" },
              { label: "정수전용", path: "/products/kitchen/water-purifier/purify" },
              { label: "온정수기", path: "/products/kitchen/water-purifier/hot" },
            ],
          },
          {
            title: "맥주제조기",
            path: "/products/kitchen/beer",
            items: [
              { label: "맥주 원료 패키지", path: "/products/kitchen/beer/ingredients" },
            ],
          },
          {
            title: "텀블러 세척기",
            path: "/products/kitchen/tumbler",
            items: [
              { label: "myCup", path: "/products/kitchen/tumbler/mycup" },
            ],
          },
        ],
        tags: ["#결혼", "#홈쿡"],
      },
      {
        label: "생활가전",
        path: "/products/living",
        rightTitle: "식물생활가전",
        rightSubItem: "틔운 미니",
        categories: [
          {
            title: "워시타워",
            path: "/products/living/washtower",
            items: [
              { label: "워시타워", path: "/products/living/washtower/standard" },
              { label: "워시타워 세트", path: "/products/living/washtower/set" },
            ],
          },
          {
            title: "워시콤보",
            path: "/products/living/washcombo",
            items: [
              { label: "워시콤보", path: "/products/living/washcombo/standard" },
              { label: "워시콤보 세트", path: "/products/living/washcombo/set" },
            ],
          },
          {
            title: "세탁기",
            path: "/products/living/washer",
            items: [
              { label: "드럼세탁기", path: "/products/living/washer/drum" },
              { label: "통돌이", path: "/products/living/washer/top-load" },
              { label: "미니세탁기", path: "/products/living/washer/mini" },
              { label: "세탁기+건조기", path: "/products/living/washer/combo" },
            ],
          },
          {
            title: "의류건조기",
            path: "/products/living/dryer",
            items: [
              { label: "건조기", path: "/products/living/dryer/standard" },
              { label: "건조기 세트", path: "/products/living/dryer/set" },
            ],
          },
          {
            title: "의류관리기",
            path: "/products/living/clothing-care",
            items: [
              { label: "스타일러", path: "/products/living/clothing-care/styler" },
            ],
          },
          {
            title: "시스템아이어닝",
            path: "/products/living/ironing",
            items: [],
          },
          {
            title: "신발관리기",
            path: "/products/living/shoe-care",
            items: [
              { label: "슈케이스", path: "/products/living/shoe-care/shoecase" },
              { label: "슈케어", path: "/products/living/shoe-care/shoecare" },
            ],
          },
          {
            title: "안마의자",
            path: "/products/living/massage-chair",
            items: [
              { label: "전신형", path: "/products/living/massage-chair/full" },
              { label: "가구형", path: "/products/living/massage-chair/furniture" },
            ],
          },
          {
            title: "청소기",
            path: "/products/living/vacuum",
            items: [
              { label: "무선청소기", path: "/products/living/vacuum/cordless" },
              { label: "로봇청소기", path: "/products/living/vacuum/robot" },
              { label: "유선청소기", path: "/products/living/vacuum/corded" },
              { label: "상업용 청소기", path: "/products/living/vacuum/commercial" },
              { label: "액세서리", path: "/products/living/vacuum/accessories" },
            ],
          },
        ],
        tags: ["#칼 주름", "#드레스룸"],
      },
      {
        label: "에어컨/에어케어",
        path: "/products/air",
        rightTitle: "바스에어시스템",
        categories: [
          {
            title: "에어컨",
            path: "/products/air/aircon",
            items: [
              { label: "2in1", path: "/products/air/aircon/2in1" },
              { label: "스탠드형", path: "/products/air/aircon/stand" },
              { label: "벽걸이형", path: "/products/air/aircon/wall" },
              { label: "창호형/이동식", path: "/products/air/aircon/portable" },
            ],
          },
          {
            title: "시스템 에어컨",
            path: "/products/air/system-aircon",
            items: [
              { label: "주거용 시스템 에어컨", path: "/products/air/system-aircon/residential" },
              { label: "상업용 시스템 에어컨", path: "/products/air/system-aircon/commercial" },
              { label: "상업용 스탠드 에어컨", path: "/products/air/system-aircon/stand" },
            ],
          },
          {
            title: "공기청정기",
            path: "/products/air/air-purifier",
            items: [
              { label: "360˚ 공기청정기", path: "/products/air/air-purifier/360" },
              { label: "에어로시리즈", path: "/products/air/air-purifier/aero" },
              { label: "스탠드 공기청정기", path: "/products/air/air-purifier/stand" },
            ],
          },
          {
            title: "제습기",
            path: "/products/air/dehumidifier",
            items: [],
          },
          {
            title: "가습기",
            path: "/products/air/humidifier",
            items: [
              { label: "정수 가습기", path: "/products/air/humidifier/purified" },
              { label: "자연기화 가습기", path: "/products/air/humidifier/natural" },
            ],
          },
          {
            title: "환기 시스템",
            path: "/products/air/ventilation",
            items: [],
          },
        ],
        tags: ["#미세먼지", "#반려동물"],
      },
      {
        label: "AI Home",
        path: "/products/ai-home",
        rightTitle: "LG ThinQ",
        rightSubItem: "LG ThinQ 알아보기",
        categories: [
          {
            title: "AI Home",
            path: "/products/ai-home/ai-home",
            items: [
              { label: "허브", path: "/products/ai-home/ai-home/hub" },
              { label: "도어락", path: "/products/ai-home/ai-home/doorlock" },
              { label: "센서", path: "/products/ai-home/ai-home/sensor" },
              { label: "스위치", path: "/products/ai-home/ai-home/switch" },
              { label: "버튼", path: "/products/ai-home/ai-home/button" },
              { label: "플러그", path: "/products/ai-home/ai-home/plug" },
              { label: "조명", path: "/products/ai-home/ai-home/lighting" },
              { label: "컨트롤러", path: "/products/ai-home/ai-home/controller" },
              { label: "AI Home 세트", path: "/products/ai-home/ai-home/set" },
            ],
          },
          {
            title: "AI Home 솔루션",
            path: "/products/ai-home/solution",
            items: [
              { label: "스마트스타트 스탠다드", path: "/products/ai-home/solution/smart-standard" },
              { label: "스마트스타트 올인원", path: "/products/ai-home/solution/smart-allinone" },
              { label: "웰슬리핑", path: "/products/ai-home/solution/wellsleeping" },
            ],
          },
        ],
        tags: [],
      },
      {
        label: "케어용품/소모품",
        path: "/products/consumables",
        categories: [
          {
            title: "카테고리별",
            path: "/products/consumables/all",
            items: [
              { label: "전체", path: "/products/consumables/all" },
              { label: "특가 Zone", path: "/products/consumables/all/sale" },
              { label: "LG UP Kit", path: "/products/consumables/all/up-kit" },
            ],
          },
          {
            title: "청소기",
            path: "/products/consumables/vacuum",
            items: [
              { label: "A9/A9S/A7", path: "/products/consumables/vacuum/a9" },
              { label: "A9 Air/A5", path: "/products/consumables/vacuum/a9air" },
              { label: "로봇청소기", path: "/products/consumables/vacuum/robot" },
              { label: "로보킹 AI 올인원", path: "/products/consumables/vacuum/roboking" },
            ],
          },
          {
            title: "에어컨",
            path: "/products/consumables/aircon",
            items: [
              { label: "스탠드", path: "/products/consumables/aircon/stand" },
              { label: "벽걸이", path: "/products/consumables/aircon/wall" },
              { label: "시스템/천장형", path: "/products/consumables/aircon/system" },
              { label: "창호형/이동식", path: "/products/consumables/aircon/portable" },
            ],
          },
          {
            title: "공기청정기/제습기",
            path: "/products/consumables/air",
            items: [
              { label: "360º", path: "/products/consumables/air/360" },
              { label: "에어로타워/퍼니처", path: "/products/consumables/air/aero" },
              { label: "제습기", path: "/products/consumables/air/dehumidifier" },
              { label: "가습기/에어워셔", path: "/products/consumables/air/humidifier" },
            ],
          },
          {
            title: "톤프리",
            path: "/products/consumables/tonefree",
            items: [],
          },
          {
            title: "정수기",
            path: "/products/consumables/water",
            items: [],
          },
          {
            title: "세탁기/건조기",
            path: "/products/consumables/laundry",
            items: [],
          },
          {
            title: "의류관리기",
            path: "/products/consumables/styler",
            items: [],
          },
        ],
        tags: [],
      },
    ],
  },
  "가전 구독": {
    label: "가전 구독",
    groupedItems: [
      {
        title: "주방가전",
        path: "/subscription/kitchen",
        items: [
          { label: "정수기", path: "/subscription/water-purifier" },
          { label: "냉장고", path: "/subscription/refrigerator" },
          { label: "김치냉장고", path: "/subscription/kimchi" },
          { label: "식기세척기", path: "/subscription/dishwasher" },
          { label: "전기레인지", path: "/subscription/range" },
          { label: "광파오븐", path: "/subscription/oven" },
        ],
      },
      {
        title: "에어컨/에어케어",
        path: "/subscription/air",
        items: [
          { label: "에어컨", path: "/subscription/aircon" },
          { label: "시스템 에어컨", path: "/subscription/system-aircon" },
          { label: "공기청정기", path: "/subscription/air-purifier" },
          { label: "가습기", path: "/subscription/humidifier" },
          { label: "제습기", path: "/subscription/dehumidifier" },
          { label: "바스에어시스템", path: "/subscription/bath-air" },
        ],
      },
      {
        title: "생활가전",
        path: "/subscription/living",
        items: [
          { label: "세탁기", path: "/subscription/washer" },
          { label: "워시타워", path: "/subscription/washtower" },
          { label: "워시콤보", path: "/subscription/washcombo" },
          { label: "의류건조기", path: "/subscription/dryer" },
          { label: "의류관리기", path: "/subscription/clothing-care" },
          { label: "신발관리기", path: "/subscription/shoe-care" },
          { label: "청소기", path: "/subscription/vacuum" },
          { label: "안마의자", path: "/subscription/massage-chair" },
        ],
      },
      {
        title: "TV/IT",
        path: "/subscription/tv-it",
        items: [
          { label: "TV", path: "/subscription/tv" },
          { label: "스탠바이미", path: "/subscription/standbyme" },
          { label: "노트북", path: "/subscription/notebook" },
        ],
      },
      {
        title: "구독 관리",
        path: "/subscription/manage",
        items: [
          { label: "구독 이용 가이드", path: "/subscription/guide" },
          { label: "케어 서비스", path: "/subscription/care-service" },
          { label: "구독 요금 확인", path: "/subscription/pricing" },
          { label: "혜택 안내", path: "/subscription/benefits" },
          { label: "FAQ", path: "/subscription/faq" },
          { label: "계약 관리", path: "/subscription/contract" },
        ],
      },
    ],
  },
  "고객지원": {
    label: "고객지원",
    groupedItems: [
      {
        title: "스스로 해결",
        path: "/support/self",
        items: [],
      },
      {
        title: "매뉴얼/소프트웨어",
        path: "/support/manual",
        items: [
          { label: "다운로드", path: "/support/manual/download" },
          { label: "소프트웨어 업데이트 소식", path: "/support/manual/update" },
        ],
      },
      {
        title: "서비스 전문 상담",
        path: "/support/consultation",
        items: [
          { label: "상담 예약/문의", path: "/support/consultation/reservation" },
          { label: "예약 조회/변경", path: "/support/consultation/check" },
        ],
      },
      {
        title: "서비스 예약",
        path: "/support/reservation",
        items: [
          { label: "출장 서비스", path: "/support/reservation/visit" },
          { label: "센터 방문 예약", path: "/support/reservation/center" },
          { label: "센터찾기", path: "/support/reservation/find" },
          { label: "예약 조회/변경", path: "/support/reservation/check" },
        ],
      },
      {
        title: "LG 베스트 케어",
        path: "/support/best-care",
        items: [
          { label: "소개", path: "/support/best-care/intro" },
          { label: "가전세척", path: "/support/best-care/cleaning" },
          { label: "이전설치", path: "/support/best-care/install" },
          { label: "가전 구독/케어십", path: "/support/best-care/subscription" },
        ],
      },
      {
        title: "고객의 소리",
        path: "/support/voice",
        items: [
          { label: "칭찬해요", path: "/support/voice/praise" },
          { label: "개선해 주세요", path: "/support/voice/improve" },
          { label: "경영진에게 제안", path: "/support/voice/suggest" },
          { label: "1:1 문의", path: "/support/voice/inquiry" },
          { label: "나의 글 보기", path: "/support/voice/my-posts" },
        ],
      },
      {
        title: "고객지원 안내",
        path: "/support/info",
        items: [
          { label: "공지사항", path: "/support/info/notice" },
          { label: "요금/보증", path: "/support/info/warranty" },
          { label: "재생부품 가격", path: "/support/info/parts" },
        ],
      },
    ],
  },
  "혜택/이벤트": {
    label: "혜택/이벤트",
    simpleItems: [
      { label: "혜택/이벤트", path: "/events/all" },
      { label: "멤버십", path: "/events/membership" },
      { label: "카드혜택", path: "/events/card" },
      { label: "라이브", path: "/events/live" },
      { label: "제휴혜택", path: "/events/partnership" },
    ],
  },
  "스토리": {
    label: "스토리",
    groupedItems: [
      {
        title: "콘텐츠",
        path: "/story",
        items: [
          { label: "1분퀵뷰", path: "/story/quickview" },
          { label: "Living Story", path: "/story/living" },
          { label: "가전인사이트", path: "/story/insight" },
          { label: "생활팁", path: "/story/tips" },
          { label: "레시피", path: "/story/recipe" },
          { label: "리얼리뷰", path: "/story/review" },
        ],
      },
      {
        title: "가이드",
        path: "/story/guide",
        items: [
          { label: "구매가이드", path: "/story/guide/purchase" },
          { label: "설치가이드", path: "/story/guide/install" },
          { label: "사용가이드", path: "/story/guide/usage" },
          { label: "FAQ", path: "/story/guide/faq" },
        ],
      },
      {
        title: "커뮤니티",
        path: "/story/community",
        items: [
          { label: "제품 카탈로그", path: "/story/catalog" },
          { label: "Jammy 커뮤니티", path: "/story/jammy" },
        ],
      },
    ],
  },
};
