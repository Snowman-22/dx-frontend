import airConditionerImage from "../../assets/images/lg_appliances/Air_Conditioner.avif";
import airPurifierImage from "../../assets/images/lg_appliances/Air_Purifier.avif";
import clothingCareImage from "../../assets/images/lg_appliances/Clothing_Care.avif";
import dehumidifierImage from "../../assets/images/lg_appliances/Dehumidifier.avif";
import dishwasherImage from "../../assets/images/lg_appliances/Dishwasher.avif";
import dryerImage from "../../assets/images/lg_appliances/Dryer.avif";
import humidifierImage from "../../assets/images/lg_appliances/Humidifier.avif";
import inductionImage from "../../assets/images/lg_appliances/Induction.avif";
import microwaveImage from "../../assets/images/lg_appliances/Microwave.avif";
import ovenImage from "../../assets/images/lg_appliances/Oven.avif";
import refrigeratorImage from "../../assets/images/lg_appliances/Refrigerator.avif";
import tvImage from "../../assets/images/lg_appliances/Tv.avif";
import vacuumCleanerImage from "../../assets/images/lg_appliances/Vacuum_Cleaner.avif";
import washingMachineImage from "../../assets/images/lg_appliances/Washing_Machine.avif";
import waterPurifierImage from "../../assets/images/lg_appliances/Water_Purifier.avif";

export type LifeTypeKey =
  | "single"
  | "couple"
  | "baby"
  | "kids"
  | "parents"
  | "restart";

interface ScenarioMessageGroup {
  default: string;
  byLifeType?: Partial<Record<LifeTypeKey, string>>;
}

interface ReplyTemplate {
  id: string;
  description: string;
  template: string;
}

interface QuickReplyOption {
  id: string;
  label: string;
}

export interface InteriorStyleOption {
  id: string;
  label: string;
}

interface ApplianceOption {
  id: string;
  label: string;
  imageSrc: string;
}

interface QuestionStep {
  order: number;
  id: string;
  title: string;
  answerType: "text-or-button" | "modal" | "button" | "selector";
}

interface ChatScenario {
  lifeTypeLabels: Record<LifeTypeKey, string>;
  unusedQuestionFlow: QuestionStep[];
  questionFlow: QuestionStep[];
  introMessage: ScenarioMessageGroup;
  greetingMessage: {
    default: string;
    budgetPrompt: string;
  };
  restartMessage: string;
  roomTypeInput: {
    allowedKeywords: string[];
    invalidMessage: string;
  };
  quickReplies: {
    roomType: QuickReplyOption[];
    spaceSize: QuickReplyOption[];
    furnitureRecommendation: QuickReplyOption[];
    lifestyle: QuickReplyOption[];
    budget: QuickReplyOption[];
  };
  interiorStyleOptions: InteriorStyleOption[];
  applianceOptions: ApplianceOption[];
  followUpMessages: {
    roomTypeSelected: ReplyTemplate;
    ownedApplianceCheck: string;
    applianceSelectionAcknowledged: ReplyTemplate;
    spaceSizeSelected: ReplyTemplate;
    spaceSizePrompt: string;
    spaceSizeInvalidMessage: string;
    furnitureRecommendationPrompt: string;
    furnitureRecommendationSkippedMessage: string;
    interiorStylePrompt: string;
    interiorStyleSelectedMessage: string;
    lifestylePrompt: string;
    lifestyleSelected: ReplyTemplate;
    budgetInvalidMessage: string;
    budgetPromptDetailed: string;
    budgetCompletedMessage: string;
  };
  replyTemplates: {
    default: ReplyTemplate;
  };
}

const INTRO_MESSAGE = `반가워요! 저는 고객님의 소중한 보금자리를 함께 채워나갈 든든한 홈 퍼니싱 파트너예요! 🏠✨
주거 유형이나 평수, 예산 같은 기본 정보만 알려주시면, 가전과 가구가 완벽한 톤앤매너를 이루는 맞춤형 공간을 큐레이션해 드릴게요. 채팅으로 편하게 제품 리스트를 수정하다 보면, 어느새 꿈꾸던 집의 도면도까지 짠! 하고 완성되어 있을 거예요!`;

export const CHATBOT_SCENARIO: ChatScenario = {
  lifeTypeLabels: {
    single: "싱글 라이프",
    couple: "함께 시작하는 집",
    baby: "아기가 있는 집",
    kids: "자녀와 함께하는 집",
    parents: "부모님과 함께하는 집",
    restart: "독립 후 다시 꾸미는 집",
  },
  unusedQuestionFlow: [
    {
      order: 1,
      id: "room-type",
      title: "어떤 공간을 바꾸고 싶으신가요?",
      answerType: "text-or-button",
    },
  ],
  questionFlow: [
    {
      order: 1,
      id: "space-size",
      title: "지금 살고 계신(혹은 이사 갈) 집의 평수는 어떻게 되나요?",
      answerType: "button",
    },
    {
      order: 2,
      id: "owned-appliances",
      title: "현재 보유하고 계신 가전들을 모두 체크해 주세요!",
      answerType: "modal",
    },
    {
      order: 3,
      id: "furniture-recommendation",
      title: `추천 가전에 어울릴 가구 또는 인테리어 소품도 추천해 드릴까요?
필요하신 품목이 있다면 말씀해 주세요.`,
      answerType: "text-or-button",
    },
    {
      order: 4.1,
      id: "interior-style",
      title: `선호하는 인테리어 스타일을 선택해 주세요!
아래 이미지를 참고하여 선택하시면 더 정확한 추천이 가능합니다.`,
      answerType: "selector",
    },
    {
      order: 5,
      id: "lifestyle",
      title: "아래 선택지에서 고객님의 라이프 스타일을 골라주세요!",
      answerType: "button",
    },
    {
      order: 6,
      id: "budget",
      title: "거의 다 왔어요! 총 예산은 어느 정도 생각하고 계세요?",
      answerType: "text-or-button",
    },
  ],
  introMessage: {
    default: INTRO_MESSAGE,
  },
  greetingMessage: {
    default: "지금 살고 계신(혹은 이사 갈) 집의 평수는 어떻게 되나요?",
    budgetPrompt:
      "가장 중요한 총 예산을 알려주세요 💸 정해진 금액 안에서 효율적으로 공간을 채울 수 있게 계산해 드릴게요! 단위는 '만원'으로 계산합니다. 숫자만 입력해 주세요! (예: 100)",
  },
  restartMessage:
    "안녕하세요! 새로운 채팅을 시작합니다. 지금 살고 계신(혹은 이사 갈) 집의 평수를 알려주세요!",
  roomTypeInput: {
    allowedKeywords: [
      "방 전체/원룸",
      "원룸",
      "거실",
      "침실",
      "주방",
      "세탁실",
      "아이방",
      "욕실",
      "투룸",
      "오피스텔",
      "아파트",
      "베란다",
      "안방",
      "사무공간",
    ],
    invalidMessage: `올바른 공간을 입력해주세요!
(버튼으로 선택도 가능합니다!)`,
  },
  quickReplies: {
    roomType: [
      { id: "whole-room", label: "방 전체/원룸" },
      { id: "living-room", label: "거실" },
      { id: "bedroom", label: "침실" },
      { id: "kitchen", label: "주방" },
      { id: "utility-room", label: "세탁실/다용도실" },
      { id: "other", label: "기타" },
    ],
    spaceSize: [
      { id: "under-10", label: "10평 미만" },
      { id: "10s", label: "10평형대" },
      { id: "20s", label: "20평형대" },
      { id: "30s", label: "30평형대" },
      { id: "over-30", label: "30평 이상" },
    ],
    furnitureRecommendation: [
      { id: "yes", label: "네! 추천 해주세요" },
      { id: "no", label: "아직 필요 없어요" },
    ],
    lifestyle: [
      { id: "minimal", label: "미니멀 자취" },
      { id: "emotional", label: "감성 자취방" },
      { id: "space", label: "공간 활용 중요" },
      { id: "simple-cooking", label: "간단 요리 선호" },
      { id: "pets", label: "반려동물과 함께" },
      { id: "homebody", label: "주말 집콕러" },
      { id: "remote-work", label: "재택 많음" },
      { id: "home-cafe", label: "홈카페 자취" },
      { id: "value", label: "가성비 중시" },
      { id: "efficiency", label: "에너지 효율 중요" },
    ],
    budget: [
      { id: "under-50", label: "50만 원 이하" },
      { id: "50-to-150", label: "50 ~ 150만 원" },
      { id: "150-to-300", label: "150 ~ 300만 원" },
      { id: "over-300", label: "300만원 이상" },
    ],
  },
  interiorStyleOptions: [
    { id: "modern-minimal", label: "모던/미니멀" },
    { id: "natural-wood", label: "내추럴/우드" },
    { id: "vintage-retro", label: "빈티지/레트로" },
    { id: "nordic-scandi", label: "북유럽/스칸디" },
    { id: "provence-romantic", label: "프로방스&로멘틱" },
    { id: "classic-antique", label: "클래식&엔틱" },
  ],
  applianceOptions: [
    { id: "washer", label: "세탁기", imageSrc: washingMachineImage },
    { id: "air-conditioner", label: "에어컨", imageSrc: airConditionerImage },
    { id: "refrigerator", label: "냉장고", imageSrc: refrigeratorImage },
    { id: "tv", label: "TV", imageSrc: tvImage },
    { id: "microwave", label: "전자레인지", imageSrc: microwaveImage },
    { id: "vacuum", label: "청소기", imageSrc: vacuumCleanerImage },
    { id: "air-purifier", label: "공기청정기", imageSrc: airPurifierImage },
    { id: "dishwasher", label: "식기세척기", imageSrc: dishwasherImage },
    { id: "dryer", label: "건조기", imageSrc: dryerImage },
    { id: "water-purifier", label: "정수기", imageSrc: waterPurifierImage },
    { id: "clothing-care", label: "스타일러", imageSrc: clothingCareImage },
    { id: "induction", label: "인덕션", imageSrc: inductionImage },
    { id: "humidifier", label: "가습기", imageSrc: humidifierImage },
    { id: "dehumidifier", label: "제습기", imageSrc: dehumidifierImage },
    { id: "oven", label: "오븐", imageSrc: ovenImage },
  ],
  followUpMessages: {
    roomTypeSelected: {
      id: "room-type-selected",
      description: "공간 유형 선택 후 안내 문구",
      template: "{selectedLabel}에 맞는 공간을 깔끔하게 디자인 해드릴게요!",
    },
    ownedApplianceCheck: `현재 보유하고 계신 가전과 필요한 가전들을 모두 체크해 주세요!
중복 구매 없이 예산을 알뜰하게 쓰실 수 있도록 제가 먼저 확인해 드릴게요 ✅`,
    applianceSelectionAcknowledged: {
      id: "appliance-selection-acknowledged",
      description: "보유 가전 확인 응답 문구",
      template: "입력해주신 제품 기억하겠습니다!",
    },
    spaceSizeSelected: {
      id: "space-size-selected",
      description: "평수 선택 후 안내 문구",
      template: "{selectedSize}에 필요한 가전, 가구 위주로 추천드릴게요!",
    },
    spaceSizePrompt: `지금 살고 계신(혹은 이사 갈) 집의 평수는 어떻게 되나요?
실제 평수를 잘 모르신다면 대략적으로 선택하셔도 됩니다!`,
    spaceSizeInvalidMessage: "평수 정보를 숫자로 입력해주세요!",
    furnitureRecommendationPrompt: `추천 가전에 어울릴 가구 또는 인테리어 소품도 추천해 드릴까요?
필요하신 품목이 있다면 말씀해 주세요.`,
    furnitureRecommendationSkippedMessage:
      "나중에 계획이 바뀌면 언제든 알려주세요!",
    interiorStylePrompt: `선호하는 인테리어 스타일을 선택해 주세요!
아래 이미지를 참고하여 선택하시면 더 정확한 추천이 가능합니다.`,
    interiorStyleSelectedMessage: "고객님의 인테리어 정보를 기억하겠습니다!",
    lifestylePrompt: `고객님의 소중한 일상을 더 빛나게 해줄 가구와 가전을 골라드릴게요! ✨
아래 선택지에서 고객님의 라이프 스타일을 골라주세요!`,
    lifestyleSelected: {
      id: "lifestyle-selected",
      description: "라이프스타일 선택 후 안내 문구",
      template: "{selectedStyles} 취향저격한 제품으로 안내해드릴게요!",
    },
    budgetInvalidMessage: "숫자만 입력해주세요!",
    budgetPromptDetailed: `거의 다 왔어요! 총 예산은 어느 정도 생각하고 계세요?
💸 정해진 금액 안에서 효율적으로 공간을 채울 수 있게 계산해 드릴게요!
직접 입력하실 경우 숫자만 입력해 주세요! 단위는 '만원'으로 계산합니다. (예: 100)`,
    budgetCompletedMessage: `여기까지 알려주신 정보들 모두 잘 받았어요! 😊
이제 고객님만의 완벽한 공간을 위한 추천리스트를 확인해보세요! ✨
추천리스트를 확인하고 나서도 계속 대화를 이어갈 수 있어요!`,
  },
  replyTemplates: {
    default: {
      id: "default-echo",
      description: "임시 기본 응답 템플릿",
      template: "{userInput}",
    },
  },
};

export function getIntroMessage(lifeType?: LifeTypeKey): string {
  return (
    CHATBOT_SCENARIO.introMessage.byLifeType?.[lifeType ?? "single"] ??
    CHATBOT_SCENARIO.introMessage.default
  );
}

export function getQuestionFlow(): QuestionStep[] {
  return CHATBOT_SCENARIO.questionFlow;
}

export function getUnusedQuestionFlow(): QuestionStep[] {
  return CHATBOT_SCENARIO.unusedQuestionFlow;
}

export function getGreetingMessage(lifeType?: LifeTypeKey): string {
  void lifeType;
  return CHATBOT_SCENARIO.greetingMessage.default;
}

export function getRestartMessage(): string {
  return CHATBOT_SCENARIO.restartMessage;
}

export function getRoomTypeQuickReplies(): QuickReplyOption[] {
  return CHATBOT_SCENARIO.quickReplies.roomType;
}

export function getSpaceSizeQuickReplies(): QuickReplyOption[] {
  return CHATBOT_SCENARIO.quickReplies.spaceSize;
}

export function getFurnitureRecommendationQuickReplies(): QuickReplyOption[] {
  return CHATBOT_SCENARIO.quickReplies.furnitureRecommendation;
}

export function getInteriorStyleOptions(): InteriorStyleOption[] {
  return CHATBOT_SCENARIO.interiorStyleOptions;
}

export function getSpaceSizeInvalidMessage(): string {
  return CHATBOT_SCENARIO.followUpMessages.spaceSizeInvalidMessage;
}

export function getLifestyleQuickReplies(): QuickReplyOption[] {
  return CHATBOT_SCENARIO.quickReplies.lifestyle;
}

export function getBudgetQuickReplies(): QuickReplyOption[] {
  return CHATBOT_SCENARIO.quickReplies.budget;
}

export function getApplianceOptions(): ApplianceOption[] {
  return CHATBOT_SCENARIO.applianceOptions;
}

export function isValidRoomTypeInput(input: string): boolean {
  return CHATBOT_SCENARIO.roomTypeInput.allowedKeywords.includes(input.trim());
}

export function getInvalidRoomTypeMessage(): string {
  return CHATBOT_SCENARIO.roomTypeInput.invalidMessage;
}

export function getRoomTypeSelectionMessages(selectedLabel: string): string[] {
  return [
    CHATBOT_SCENARIO.followUpMessages.roomTypeSelected.template.replace(
      "{selectedLabel}",
      selectedLabel,
    ),
    CHATBOT_SCENARIO.followUpMessages.ownedApplianceCheck,
  ];
}

export function getApplianceSelectionUserMessage(selectedLabels: string[]): string {
  if (selectedLabels.length === 0) {
    return "없음";
  }

  return selectedLabels.join(", ");
}

export function getApplianceSelectionMessages(selectedLabels: string[]): string[] {
  const selectedItems = getApplianceSelectionUserMessage(selectedLabels);

  return [
    CHATBOT_SCENARIO.followUpMessages.applianceSelectionAcknowledged.template.replace(
      "{selectedItems}",
      selectedItems,
    ),
    CHATBOT_SCENARIO.followUpMessages.furnitureRecommendationPrompt,
  ];
}

export function getSpaceSizeSelectionMessages(
  selectedSize: string,
  isDirectInput = false,
): string[] {
  const formattedSize = isDirectInput ? `${selectedSize}평형` : selectedSize;

  return [
    CHATBOT_SCENARIO.followUpMessages.spaceSizeSelected.template.replace(
      "{selectedSize}",
      formattedSize,
    ),
    CHATBOT_SCENARIO.followUpMessages.ownedApplianceCheck,
  ];
}

export function getLifestylePromptMessage(): string {
  return CHATBOT_SCENARIO.followUpMessages.lifestylePrompt;
}

export function getInteriorStylePromptMessage(): string {
  return CHATBOT_SCENARIO.followUpMessages.interiorStylePrompt;
}

export function getFurnitureRecommendationSkippedMessage(): string {
  return CHATBOT_SCENARIO.followUpMessages.furnitureRecommendationSkippedMessage;
}

export function getInteriorStyleSelectedMessage(): string {
  return CHATBOT_SCENARIO.followUpMessages.interiorStyleSelectedMessage;
}

export function getLifestyleSelectionMessage(selectedStyles: string[]): string {
  return CHATBOT_SCENARIO.followUpMessages.lifestyleSelected.template.replace(
    "{selectedStyles}",
    selectedStyles.join(", "),
  );
}

export function getBudgetPromptMessage(): string {
  return CHATBOT_SCENARIO.followUpMessages.budgetPromptDetailed;
}

export function getBudgetInvalidMessage(): string {
  return CHATBOT_SCENARIO.followUpMessages.budgetInvalidMessage;
}

export function getBudgetCompletedMessage(): string {
  return CHATBOT_SCENARIO.followUpMessages.budgetCompletedMessage;
}

export function buildBotReply(userInput: string): string {
  return CHATBOT_SCENARIO.replyTemplates.default.template.replace("{userInput}", userInput);
}
