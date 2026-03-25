import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FiArrowUp, FiPlus } from "react-icons/fi";
import ChatMessage from "./ChatMessage";
import ChatSidebar from "./ChatSidebar";

function genId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}
import { useChatSession } from "@/hooks/useChatSession";
import { fetchRecommendations, onStompDisconnect } from "@/services/chatService";
import {
  buildBotReply,
  getApplianceOptions,
  getApplianceSelectionMessages,
  getApplianceSelectionUserMessage,
  getBudgetCompletedMessage,
  getBudgetInvalidMessage,
  getBudgetPromptMessage,
  getBudgetQuickReplies,
  getFurnitureOptions,
  getFurnitureRecommendationQuickReplies,
  getFurnitureRecommendationSkippedMessage,
  getFurnitureSelectionAcknowledgedMessage,
  getFurnitureSelectionPromptMessage,
  getGreetingMessage,
  getIntroMessage,
  getInteriorStyleOptions,
  getInteriorStylePromptMessage,
  getInteriorStyleSelectedMessage,
  getInvalidRoomTypeMessage,
  getLifestyleCategories,
  getLifestylePromptMessage,
  getLifestyleSelectionMessage,
  getRoomTypeQuickReplies,
  getRoomTypeSelectionMessages,
  getRestartMessage,
  getSpaceSizeInvalidMessage,
  getSpaceSizeSelectionMessages,
  getSpaceSizeQuickReplies,
  isValidRoomTypeInput,
  type InteriorStyleOption,
  type LifestyleCategory,
  type LifeTypeKey,
} from "./chatScenario";
import styles from "./Chatbot.module.css";

interface TextMessage {
  id: string;
  sender: "bot" | "user";
  text: string;
}

interface InteriorStyleSelectorMessage {
  id: string;
  sender: "bot";
  type: "interior-style-selector";
  options: InteriorStyleOption[];
}

type Message = TextMessage | InteriorStyleSelectorMessage;

interface BotQueueTextItem {
  type: "text";
  text: string;
}

interface BotQueueInteriorStyleItem {
  type: "interior-style-selector";
  options: InteriorStyleOption[];
}

type BotQueueItem = BotQueueTextItem | BotQueueInteriorStyleItem;

type ChatStage =
  | "roomType"
  | "applianceSelection"
  | "spaceSize"
  | "furnitureRecommendation"
  | "interiorStyle"
  | "furnitureSelection"
  | "lifestyle"
  | "budget"
  | "free";

type ApplianceTab = "owned" | "needed";
type LifestyleTab = 1 | 2;

const BOT_TOKEN_DELAY_MS = 110;

// ─── Stage → stepCode 매핑 ───
const STAGE_STEP_MAP: Record<ChatStage, string> = {
  spaceSize: "CHAT_0",
  roomType: "CHAT_1",
  applianceSelection: "CHAT_2",
  furnitureRecommendation: "CHAT_3",
  interiorStyle: "CHAT_4",
  furnitureSelection: "CHAT_7",
  lifestyle: "CHAT_5",
  budget: "CHAT_6",
  free: "CHAT_0",
};

function Chatbot() {
  const location = useLocation();
  const navigate = useNavigate();
  const locationState = location.state as {
    lifeType?: LifeTypeKey;
    chatSession?: import("@/services/chatService").ChatSession;
  } | null;
  const lifeType = locationState?.lifeType;
  const existingSession = locationState?.chatSession ?? null;

  // ─── 서버 세션 (STOMP) ───
  const { send: stompSend, convId, isReady: _isSessionReady } = useChatSession(lifeType, existingSession);

  // STOMP 연결 끊김 감지 → 메인으로 이동
  useEffect(() => {
    let disconnected = false;
    onStompDisconnect(() => {
      if (disconnected) return;
      disconnected = true;
      alert("인터넷 연결이 끊겼습니다. 메인 화면으로 이동합니다.");
      navigate("/");
    });
    return () => {
      disconnected = true;
      onStompDisconnect(null);
    };
  }, [navigate]);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentStage, setCurrentStage] = useState<ChatStage>("spaceSize");
  const [applianceModalOpen, setApplianceModalOpen] = useState(false);
  const [shouldAutoOpenApplianceModal, setShouldAutoOpenApplianceModal] =
    useState(false);
  const [activeApplianceTab, setActiveApplianceTab] =
    useState<ApplianceTab>("owned");
  const [lifestyleModalOpen, setLifestyleModalOpen] = useState(false);
  const [shouldAutoOpenLifestyleModal, setShouldAutoOpenLifestyleModal] =
    useState(false);
  const [activeLifestyleTab, setActiveLifestyleTab] = useState<LifestyleTab>(1);
  const [selectedOwnedAppliances, setSelectedOwnedAppliances] = useState<string[]>([]);
  const [selectedNeededAppliances, setSelectedNeededAppliances] = useState<string[]>([]);
  const [selectedInteriorStyle, setSelectedInteriorStyle] = useState<string | null>(
    null,
  );
  const [selectedLifestyles, setSelectedLifestyles] = useState<string[]>([]);
  const [confirmedOwnedLabels, setConfirmedOwnedLabels] = useState<string[]>([]);
  const [furnitureModalOpen, setFurnitureModalOpen] = useState(false);
  const [shouldAutoOpenFurnitureModal, setShouldAutoOpenFurnitureModal] = useState(false);
  const [selectedFurniture, setSelectedFurniture] = useState<string[]>([]);
  const [replyButtonsReady, setReplyButtonsReady] = useState(false);
  const [botQueueVersion, setBotQueueVersion] = useState(0);
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [showRecommendCta, setShowRecommendCta] = useState(false);
  const [isLoadingRecommend, setIsLoadingRecommend] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const botQueueRef = useRef<BotQueueItem[]>([]);
  const isBotQueueProcessingRef = useRef(false);
  const botQueueSessionRef = useRef(0);
  const applianceModalTimeoutRef = useRef<number | null>(null);
  const lifestyleModalTimeoutRef = useRef<number | null>(null);
  const spaceSizeInvalidNoticeShownRef = useRef(false);
  const budgetInvalidNoticeShownRef = useRef(false);

  const applianceOptions = getApplianceOptions();
  const roomTypeQuickReplies = getRoomTypeQuickReplies();
  const spaceSizeQuickReplies = getSpaceSizeQuickReplies();
  const furnitureRecommendationQuickReplies =
    getFurnitureRecommendationQuickReplies();
  const [interiorStyleOptions, setInteriorStyleOptions] = useState(() => getInteriorStyleOptions());
  const refreshInteriorImages = () => {
    const newOptions = getInteriorStyleOptions();
    setInteriorStyleOptions(newOptions);
    // 이미 표시된 메시지의 이미지도 교체
    setMessages((prev) =>
      prev.map((msg) =>
        "type" in msg && msg.type === "interior-style-selector"
          ? { ...msg, options: newOptions }
          : msg,
      ),
    );
  };
  const furnitureOptions = getFurnitureOptions();
  const lifestyleCategories = getLifestyleCategories();
  const budgetQuickReplies = getBudgetQuickReplies();
  const lifestyleCategoriesByTab = lifestyleCategories.reduce<
    Record<LifestyleTab, LifestyleCategory[]>
  >(
    (acc, category) => {
      acc[category.page].push(category);
      return acc;
    },
    { 1: [], 2: [] },
  );

  const wait = (delay: number) =>
    new Promise<void>((resolve) => {
      window.setTimeout(resolve, delay);
    });

  const clearApplianceModalTimer = () => {
    if (applianceModalTimeoutRef.current !== null) {
      window.clearTimeout(applianceModalTimeoutRef.current);
      applianceModalTimeoutRef.current = null;
    }
  };

  const clearLifestyleModalTimer = () => {
    if (lifestyleModalTimeoutRef.current !== null) {
      window.clearTimeout(lifestyleModalTimeoutRef.current);
      lifestyleModalTimeoutRef.current = null;
    }
  };

  const resetBotQueue = () => {
    botQueueSessionRef.current += 1;
    botQueueRef.current = [];
    isBotQueueProcessingRef.current = false;
    setIsBotTyping(false);
    setBotQueueVersion((prev) => prev + 1);
  };

  const enqueueBotQueueItems = (items: BotQueueItem[]) => {
    if (items.length === 0) return;
    botQueueRef.current.push(...items);
    setBotQueueVersion((prev) => prev + 1);
  };

  const enqueueBotMessages = (texts: string[]) => {
    enqueueBotQueueItems(texts.map((text) => ({ type: "text", text })));
  };

  const appendUserMessage = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    setMessages((prev) => [
      ...prev,
      {
        id: genId(),
        sender: "user",
        text: trimmed,
      },
    ]);
  };

  const handleInputChange = (nextValue: string) => {
    if (currentStage === "spaceSize") {
      const digitsOnly = nextValue.replace(/\D+/g, "");
      const hasInvalidInput = nextValue !== digitsOnly;

      if (hasInvalidInput && !spaceSizeInvalidNoticeShownRef.current) {
        enqueueBotMessages([getSpaceSizeInvalidMessage()]);
        spaceSizeInvalidNoticeShownRef.current = true;
      }

      if (!hasInvalidInput) {
        spaceSizeInvalidNoticeShownRef.current = false;
      }

      setInput(digitsOnly);
      return;
    }

    if (currentStage !== "budget") {
      spaceSizeInvalidNoticeShownRef.current = false;
      budgetInvalidNoticeShownRef.current = false;
      setInput(nextValue);
      return;
    }

    const digitsOnly = nextValue.replace(/\D+/g, "");
    const hasInvalidInput = nextValue !== digitsOnly;

    if (hasInvalidInput && !budgetInvalidNoticeShownRef.current) {
      enqueueBotMessages([getBudgetInvalidMessage()]);
      budgetInvalidNoticeShownRef.current = true;
    }

    if (!hasInvalidInput) {
      budgetInvalidNoticeShownRef.current = false;
    }

    setInput(digitsOnly);
  };

  useEffect(() => {
    setCurrentStage("spaceSize");
    setApplianceModalOpen(false);
    setShouldAutoOpenApplianceModal(false);
    setActiveApplianceTab("owned");
    setLifestyleModalOpen(false);
    setShouldAutoOpenLifestyleModal(false);
    setActiveLifestyleTab(1);
    setSelectedOwnedAppliances([]);
    setSelectedNeededAppliances([]);
    setSelectedInteriorStyle(null);
    setSelectedLifestyles([]);
    setShowRecommendCta(false);
    setReplyButtonsReady(false);
    clearApplianceModalTimer();
    clearLifestyleModalTimer();
    resetBotQueue();
    setMessages([]);
    enqueueBotMessages([getIntroMessage(lifeType), getGreetingMessage(lifeType)]);
  }, [lifeType]);

  useEffect(() => {
    spaceSizeInvalidNoticeShownRef.current = false;
    budgetInvalidNoticeShownRef.current = false;
  }, [currentStage]);

  useEffect(() => {
    return () => {
      clearApplianceModalTimer();
      clearLifestyleModalTimer();
      resetBotQueue();
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const textarea = textAreaRef.current;
    if (!textarea) return;

    textarea.style.height = "0px";

    const computedStyle = window.getComputedStyle(textarea);
    const lineHeight = Number.parseFloat(computedStyle.lineHeight) || 22;
    const paddingTop = Number.parseFloat(computedStyle.paddingTop) || 0;
    const paddingBottom = Number.parseFloat(computedStyle.paddingBottom) || 0;
    const borderTop = Number.parseFloat(computedStyle.borderTopWidth) || 0;
    const borderBottom = Number.parseFloat(computedStyle.borderBottomWidth) || 0;
    const maxHeight =
      lineHeight * 5 + paddingTop + paddingBottom + borderTop + borderBottom;

    textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`;
    textarea.style.overflowY = textarea.scrollHeight > maxHeight ? "auto" : "hidden";
  }, [input]);

  useEffect(() => {
    if (isBotQueueProcessingRef.current || botQueueRef.current.length === 0) return;

    const processBotQueue = async () => {
      const sessionId = botQueueSessionRef.current;
      isBotQueueProcessingRef.current = true;
      setIsBotTyping(true);

      try {
        while (
          botQueueRef.current.length > 0 &&
          sessionId === botQueueSessionRef.current
        ) {
          const nextItem = botQueueRef.current.shift();
          if (!nextItem) continue;

          if (nextItem.type === "interior-style-selector") {
            setMessages((prev) => [
              ...prev,
              {
                id: genId(),
                sender: "bot",
                type: "interior-style-selector",
                options: nextItem.options,
              },
            ]);
            continue;
          }

          const nextMessageId = genId();
          setMessages((prev) => [
            ...prev,
            {
              id: nextMessageId,
              sender: "bot",
              text: "",
            },
          ]);

          const tokens = nextItem.text.match(/\S+\s*/g) ?? [nextItem.text];
          let displayedText = "";

          for (const token of tokens) {
            if (sessionId !== botQueueSessionRef.current) return;

            displayedText += token;
            setMessages((prev) =>
              prev.map((message) =>
                message.id === nextMessageId
                  ? { ...message, text: displayedText }
                  : message,
              ),
            );
            await wait(BOT_TOKEN_DELAY_MS);
          }
        }
      } finally {
        if (sessionId === botQueueSessionRef.current) {
          isBotQueueProcessingRef.current = false;
          setIsBotTyping(false);
        }
      }
    };

    void processBotQueue();
  }, [botQueueVersion]);

  useEffect(() => {
    if (
      !shouldAutoOpenApplianceModal ||
      currentStage !== "applianceSelection" ||
      applianceModalOpen ||
      isBotTyping ||
      botQueueRef.current.length > 0
    ) {
      return;
    }

    clearApplianceModalTimer();
    applianceModalTimeoutRef.current = window.setTimeout(() => {
      setApplianceModalOpen(true);
      setShouldAutoOpenApplianceModal(false);
      applianceModalTimeoutRef.current = null;
    }, 1500);

    return () => {
      clearApplianceModalTimer();
    };
  }, [applianceModalOpen, currentStage, isBotTyping, shouldAutoOpenApplianceModal]);

  useEffect(() => {
    if (
      !shouldAutoOpenLifestyleModal ||
      currentStage !== "lifestyle" ||
      lifestyleModalOpen ||
      isBotTyping ||
      botQueueRef.current.length > 0
    ) {
      return;
    }

    clearLifestyleModalTimer();
    lifestyleModalTimeoutRef.current = window.setTimeout(() => {
      setLifestyleModalOpen(true);
      setShouldAutoOpenLifestyleModal(false);
      lifestyleModalTimeoutRef.current = null;
    }, 1500);

    return () => {
      clearLifestyleModalTimer();
    };
  }, [
    botQueueVersion,
    currentStage,
    isBotTyping,
    lifestyleModalOpen,
    shouldAutoOpenLifestyleModal,
  ]);

  useEffect(() => {
    if (
      !shouldAutoOpenFurnitureModal ||
      currentStage !== "furnitureSelection" ||
      furnitureModalOpen ||
      isBotTyping ||
      botQueueRef.current.length > 0
    ) {
      return;
    }

    const timer = window.setTimeout(() => {
      setFurnitureModalOpen(true);
      setShouldAutoOpenFurnitureModal(false);
    }, 1500);

    return () => { window.clearTimeout(timer); };
  }, [
    botQueueVersion,
    currentStage,
    isBotTyping,
    furnitureModalOpen,
    shouldAutoOpenFurnitureModal,
  ]);

  useEffect(() => {
    const shouldShowReplyButtons =
      !applianceModalOpen &&
      !lifestyleModalOpen &&
      !furnitureModalOpen &&
      !isBotTyping &&
      botQueueRef.current.length === 0 &&
      (currentStage === "roomType" ||
        currentStage === "spaceSize" ||
        currentStage === "furnitureRecommendation" ||
        currentStage === "budget");

    setReplyButtonsReady(shouldShowReplyButtons);
  }, [applianceModalOpen, botQueueVersion, currentStage, isBotTyping, lifestyleModalOpen]);

  const sendMessage = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    appendUserMessage(trimmed);
    enqueueBotMessages([buildBotReply(trimmed)]);
    setInput("");
  };

  const BUDGET_VALUE_MAP: Record<string, string> = {
    "150만원 이하": "150",
    "300만원 이하": "300",
    "450만원 이하": "450",
    "600만원 이하": "600",
    "그 이상": "1000",
  };

  const completeBudgetStep = (answer: string) => {
    appendUserMessage(answer);
    stompSend(STAGE_STEP_MAP.budget, BUDGET_VALUE_MAP[answer] ?? answer, "총 예산은 어느 정도 생각하고 계세요?");
    enqueueBotMessages([getBudgetCompletedMessage()]);
    budgetInvalidNoticeShownRef.current = false;
    setReplyButtonsReady(false);
    setShowRecommendCta(true);
    setCurrentStage("free");
    setInput("");
  };

  const submitLifestyleSelection = () => {
    const count = selectedLifestyles.length;
    const lifestyleText = count === 0
      ? "선택한 항목 없음"
      : count <= 3
        ? selectedLifestyles.join(", ")
        : `${selectedLifestyles.slice(0, 3).join(", ")} 외 ${count - 3}개`;
    appendUserMessage(lifestyleText);
    stompSend(STAGE_STEP_MAP.lifestyle, selectedLifestyles, "생활 방식과 취향에 맞는 조건을 선택해 주세요");
    enqueueBotMessages([
      getLifestyleSelectionMessage(selectedLifestyles),
      getBudgetPromptMessage(),
    ]);
    setSelectedLifestyles([]);
    setLifestyleModalOpen(false);
    setShouldAutoOpenLifestyleModal(false);
    setActiveLifestyleTab(1);
    setReplyButtonsReady(false);
    setCurrentStage("budget");
  };

  const handleRoomTypeSubmit = (roomTypeText: string) => {
    const trimmed = roomTypeText.trim();
    if (!trimmed) return;

    appendUserMessage(trimmed);

    if (!isValidRoomTypeInput(trimmed)) {
      enqueueBotMessages([getInvalidRoomTypeMessage()]);
      setInput("");
      return;
    }

    stompSend(STAGE_STEP_MAP.roomType, trimmed, "어떤 공간 유형에 살고 계세요?");
    enqueueBotMessages(getRoomTypeSelectionMessages(trimmed));
    setReplyButtonsReady(false);
    setCurrentStage("applianceSelection");
    setShouldAutoOpenApplianceModal(true);
    setInput("");
  };

  const handleSend = () => {
    if (currentStage === "lifestyle") {
      submitLifestyleSelection();
      return;
    }

    const trimmed = input.trim();
    if (!trimmed) return;

    if (currentStage === "roomType") {
      handleRoomTypeSubmit(trimmed);
      return;
    }

    if (currentStage === "budget") {
      if (!/^\d+$/.test(trimmed) || Number(trimmed) <= 0) {
        enqueueBotMessages([getBudgetInvalidMessage()]);
        return;
      }

      completeBudgetStep(trimmed);
      return;
    }

    if (currentStage === "spaceSize") {
      if (!/^\d+$/.test(trimmed) || Number(trimmed) <= 0) {
        enqueueBotMessages([getSpaceSizeInvalidMessage()]);
        return;
      }

      spaceSizeInvalidNoticeShownRef.current = false;
      handleSpaceSizeSelect(trimmed, true);
      return;
    }

    if (currentStage === "furnitureRecommendation") {
      setInput("");
      return;
    }

    if (currentStage === "interiorStyle") {
      setInput("");
      return;
    }

    sendMessage(trimmed);
  };

  const handleNewChat = () => {
    setCurrentStage("spaceSize");
    setApplianceModalOpen(false);
    setShouldAutoOpenApplianceModal(false);
    setActiveApplianceTab("owned");
    setLifestyleModalOpen(false);
    setShouldAutoOpenLifestyleModal(false);
    setActiveLifestyleTab(1);
    setSelectedOwnedAppliances([]);
    setSelectedNeededAppliances([]);
    setSelectedInteriorStyle(null);
    setSelectedLifestyles([]);
    setShowRecommendCta(false);
    setReplyButtonsReady(false);
    clearApplianceModalTimer();
    clearLifestyleModalTimer();
    resetBotQueue();
    setMessages([]);
    enqueueBotMessages([getRestartMessage(), getGreetingMessage(lifeType)]);
  };

  const toggleApplianceSelection = (id: string) => {
    if (activeApplianceTab === "owned") {
      if (selectedNeededAppliances.includes(id)) return;

      setSelectedOwnedAppliances((prev) =>
        prev.includes(id)
          ? prev.filter((item) => item !== id)
          : [...prev, id],
      );
      return;
    }

    if (selectedOwnedAppliances.includes(id)) return;

    setSelectedNeededAppliances((prev) =>
      prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id],
    );
  };

  const handleRoomTypeSelect = (label: string) => {
    handleRoomTypeSubmit(label);
  };

  const handleApplianceComplete = () => {
    const selectedOwnedLabels = applianceOptions
      .filter((option) => selectedOwnedAppliances.includes(option.id))
      .map((option) => option.label);
    const selectedNeededLabels = applianceOptions
      .filter((option) => selectedNeededAppliances.includes(option.id))
      .map((option) => option.label);
    const selectedLabels = [...selectedOwnedLabels, ...selectedNeededLabels];
    const userSelectionSummary =
      selectedLabels.length === 0
        ? getApplianceSelectionUserMessage([])
        : [
            selectedOwnedLabels.length > 0
              ? `보유 가전: ${selectedOwnedLabels.join(", ")}`
              : null,
            selectedNeededLabels.length > 0
              ? `필요 가전: ${selectedNeededLabels.join(", ")}`
              : null,
          ]
            .filter(Boolean)
            .join("\n");

    setConfirmedOwnedLabels(selectedOwnedLabels);
    appendUserMessage(userSelectionSummary);
    stompSend(STAGE_STEP_MAP.applianceSelection, {
      owned: selectedOwnedLabels,
      needed: selectedNeededLabels,
    }, "현재 보유 중인 가전과 필요한 가전을 선택해 주세요");
    enqueueBotMessages(getApplianceSelectionMessages(selectedLabels));
    setApplianceModalOpen(false);
    setShouldAutoOpenApplianceModal(false);
    setActiveApplianceTab("owned");
    setSelectedOwnedAppliances([]);
    setSelectedNeededAppliances([]);
    setSelectedInteriorStyle(null);
    setSelectedLifestyles([]);
    setReplyButtonsReady(false);
    setCurrentStage("furnitureRecommendation");
  };

  const SPACE_SIZE_VALUE_MAP: Record<string, string> = {
    "10평 미만": "8",
    "10평형대": "15",
    "20평형대": "25",
    "30평형대": "35",
    "30평 이상": "45",
  };

  const handleSpaceSizeSelect = (label: string, isDirectInput = false) => {
    const trimmed = label.trim();
    if (!trimmed) return;

    appendUserMessage(trimmed);
    stompSend(STAGE_STEP_MAP.spaceSize, SPACE_SIZE_VALUE_MAP[trimmed] ?? trimmed, "집의 평수는 어떻게 되나요?");
    enqueueBotMessages(getSpaceSizeSelectionMessages(trimmed, isDirectInput));
    setReplyButtonsReady(false);
    setCurrentStage("applianceSelection");
    setShouldAutoOpenApplianceModal(true);
    setInput("");
  };

  const handleFurnitureRecommendationSelect = (label: string) => {
    const trimmed = label.trim();
    if (!trimmed) return;

    appendUserMessage(trimmed);
    stompSend(STAGE_STEP_MAP.furnitureRecommendation, trimmed, "가구 또는 인테리어 소품도 추천해 드릴까요?");
    setSelectedInteriorStyle(null);
    setReplyButtonsReady(false);

    if (trimmed === "네! 추천 해주세요") {
      enqueueBotQueueItems([
        { type: "text", text: getInteriorStylePromptMessage() },
        { type: "interior-style-selector", options: interiorStyleOptions },
      ]);
      setCurrentStage("interiorStyle");
      return;
    }

    // 가구 추천 스킵 시 CHAT_4, CHAT_7 모두 null/null로 전송
    stompSend(STAGE_STEP_MAP.interiorStyle, "", null);
    stompSend(STAGE_STEP_MAP.furnitureSelection, "", null);

    enqueueBotMessages([
      getFurnitureRecommendationSkippedMessage(),
      getLifestylePromptMessage(),
    ]);
    setCurrentStage("lifestyle");
    setShouldAutoOpenLifestyleModal(true);
  };

  const handleInteriorStyleSelect = (label: string) => {
    const trimmed = label.trim();
    if (!trimmed || currentStage !== "interiorStyle") return;

    setSelectedInteriorStyle(trimmed);
    appendUserMessage(trimmed);
    stompSend(STAGE_STEP_MAP.interiorStyle, trimmed, "선호하는 인테리어 스타일을 선택해 주세요");
    enqueueBotMessages([
      getInteriorStyleSelectedMessage(),
      getFurnitureSelectionPromptMessage(),
    ]);
    setReplyButtonsReady(false);
    setCurrentStage("furnitureSelection");
    setShouldAutoOpenFurnitureModal(true);
  };

  const handleFurnitureSelectionComplete = () => {
    setFurnitureModalOpen(false);
    const selectedLabels = selectedFurniture;
    const userText = selectedLabels.length === 0 ? "없음" : selectedLabels.join(", ");
    appendUserMessage(userText);
    stompSend(STAGE_STEP_MAP.furnitureSelection, selectedLabels, "필요하신 가구를 선택해 주세요");
    enqueueBotMessages([
      selectedLabels.length > 0
        ? getFurnitureSelectionAcknowledgedMessage()
        : "나중에 필요하시면 언제든 알려주세요!",
      getLifestylePromptMessage(),
    ]);
    setCurrentStage("lifestyle");
    setShouldAutoOpenLifestyleModal(true);
  };

  const handleFurnitureToggle = (label: string) => {
    setSelectedFurniture((prev) =>
      prev.includes(label)
        ? prev.filter((item) => item !== label)
        : [...prev, label],
    );
  };

  const handleLifestyleSelect = (label: string) => {
    const trimmed = label.trim();
    if (!trimmed) return;

    setSelectedLifestyles((prev) =>
      prev.includes(trimmed)
        ? prev.filter((item) => item !== trimmed)
        : [...prev, trimmed],
    );
  };

  const handleBudgetSelect = (label: string) => {
    const trimmed = label.trim();
    if (!trimmed) return;

    completeBudgetStep(trimmed);
  };

  const showRoomTypeQuickReplies =
    currentStage === "roomType" && replyButtonsReady;
  const showSpaceSizeQuickReplies =
    currentStage === "spaceSize" && replyButtonsReady;
  const showFurnitureRecommendationQuickReplies =
    currentStage === "furnitureRecommendation" && replyButtonsReady;
  const showBudgetQuickReplies =
    currentStage === "budget" && replyButtonsReady;
  const showLifestyleModalTrigger = false; // 모달이 자동으로 뜨므로 버튼 불필요
  const applianceTabPrompt =
    activeApplianceTab === "owned"
      ? "현재 보유 중인 가전을 선택해 주세요"
      : "현재 필요한 가전을 선택해 주세요";
  const isTextInputDisabled =
    currentStage === "furnitureRecommendation" ||
    currentStage === "interiorStyle" ||
    currentStage === "furnitureSelection" ||
    currentStage === "lifestyle";
  const isSendDisabled = isTextInputDisabled || !input.trim();

  return (
    <div className={styles.page}>
      <ChatSidebar
        open={sidebarOpen}
        onToggle={() => setSidebarOpen((prev) => !prev)}
        onNewChat={handleNewChat}
        onExit={() => navigate("/")}
      />

      <div className={styles.chatArea}>
        {applianceModalOpen && (
          <div className={styles.modalOverlay}>
            <div className={styles.modalCard}>
              <div className={styles.modalHeader}>
                <div>
                  <p className={styles.modalEyebrow}>STEP 2</p>
                  <h2 className={styles.modalTitle}>{applianceTabPrompt}</h2>
                  <p className={styles.modalHelper}>
                    {activeApplianceTab === "owned"
                      ? "현재 보유 중인 가전을 선택한 뒤 다음 페이지로 넘어가세요."
                      : "추가로 필요한 가전을 선택한 뒤 선택 완료를 눌러주세요."}
                  </p>
                  <p className={styles.modalPageIndicator}>
                    {activeApplianceTab === "owned" ? "1" : "2"} / 2 페이지
                  </p>
                </div>
              </div>

              <div className={styles.applianceGrid}>
                {applianceOptions.map((option) => {
                  const selected =
                    activeApplianceTab === "owned"
                      ? selectedOwnedAppliances.includes(option.id)
                      : selectedNeededAppliances.includes(option.id);
                  const disabled =
                    activeApplianceTab === "owned"
                      ? selectedNeededAppliances.includes(option.id)
                      : selectedOwnedAppliances.includes(option.id);

                  return (
                    <button
                      key={option.id}
                      type="button"
                      className={`${styles.applianceCard} ${
                        selected ? styles.applianceCardSelected : ""
                      } ${disabled ? styles.applianceCardDisabled : ""}`}
                      disabled={disabled}
                      aria-pressed={selected}
                      aria-disabled={disabled}
                      onClick={() => toggleApplianceSelection(option.id)}
                    >
                      <span className={styles.applianceSelectionBadge} aria-hidden="true">
                        {selected ? "선택됨" : ""}
                      </span>
                      <div className={styles.applianceImageWrap}>
                        <img
                          src={option.imageSrc}
                          alt={option.label}
                          className={styles.applianceImage}
                        />
                      </div>
                      <span className={styles.applianceLabel}>{option.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className={styles.modalFooter}>
                {activeApplianceTab === "owned" ? (
                  <button
                    type="button"
                    className={styles.modalActionBtn}
                    onClick={() => setActiveApplianceTab("needed")}
                  >
                    다음 페이지
                  </button>
                ) : (
                  <div className={styles.modalActionGroup}>
                    <button
                      type="button"
                      className={styles.modalSecondaryBtn}
                      onClick={() => setActiveApplianceTab("owned")}
                    >
                      뒤로가기
                    </button>
                    <button
                      type="button"
                      className={styles.modalActionBtn}
                      onClick={handleApplianceComplete}
                    >
                      선택 완료
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {furnitureModalOpen && (
          <div className={styles.modalOverlay}>
            <div className={styles.modalCard}>
              <div className={styles.modalHeader}>
                <div>
                  <p className={styles.modalEyebrow}>STEP 4-2</p>
                  <h2 className={styles.modalTitle}>
                    필요하신 가구를 선택해 주세요
                  </h2>
                  <p className={styles.modalHelper}>
                    여러 개를 선택하실 수 있고, 필요 없으시면 바로 선택 완료를 눌러주세요.
                  </p>
                </div>
              </div>

              <div className={styles.applianceGrid}>
                {furnitureOptions.map((option) => {
                  const selected = selectedFurniture.includes(option.label);

                  return (
                    <button
                      key={option.id}
                      type="button"
                      className={`${styles.applianceCard} ${
                        selected ? styles.applianceCardSelected : ""
                      }`}
                      aria-pressed={selected}
                      onClick={() => handleFurnitureToggle(option.label)}
                    >
                      <span className={styles.applianceIcon}>{option.icon}</span>
                      <span className={styles.applianceLabel}>{option.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className={styles.modalFooter}>
                <button
                  type="button"
                  className={styles.modalActionBtn}
                  onClick={handleFurnitureSelectionComplete}
                >
                  선택 완료
                </button>
              </div>
            </div>
          </div>
        )}

        {lifestyleModalOpen && (
          <div className={styles.modalOverlay}>
            <div className={styles.modalCard}>
              <div className={styles.modalHeader}>
                <div>
                  <p className={styles.modalEyebrow}>STEP 5</p>
                  <h2 className={styles.modalTitle}>
                    생활 방식과 취향에 맞는 조건을 자유롭게 선택해 주세요
                  </h2>
                  <p className={styles.modalHelper}>
                    하단 버튼으로 다음 페이지와 이전 페이지를 오가며 원하는 항목을 모두 체크할
                    수 있어요. 선택하지 않고 그대로 넘어가도 괜찮습니다.
                  </p>
                  <p className={styles.modalPageIndicator}>{activeLifestyleTab} / 2 페이지</p>
                </div>
              </div>

              <div className={styles.lifestyleCategoryGrid}>
                {lifestyleCategoriesByTab[activeLifestyleTab].map((category) => (
                  <section key={category.id} className={styles.lifestyleCategoryCard}>
                    <h3 className={styles.lifestyleCategoryTitle}>{category.title}</h3>
                    <div className={styles.lifestyleOptionList}>
                      {category.options.map((option) => {
                        const selected = selectedLifestyles.includes(option.label);

                        return (
                          <button
                            key={option.id}
                            type="button"
                            className={`${styles.lifestyleOptionBtn} ${
                              selected ? styles.lifestyleOptionBtnSelected : ""
                            }`}
                            aria-pressed={selected}
                            onClick={() => handleLifestyleSelect(option.label)}
                          >
                            {option.label}
                          </button>
                        );
                      })}
                    </div>
                  </section>
                ))}
              </div>

              <div className={styles.modalFooter}>
                {activeLifestyleTab === 1 ? (
                  <button
                    type="button"
                    className={styles.modalActionBtn}
                    onClick={() => setActiveLifestyleTab(2)}
                  >
                    다음 페이지
                  </button>
                ) : (
                  <div className={styles.modalActionGroup}>
                    <button
                      type="button"
                      className={styles.modalSecondaryBtn}
                      onClick={() => setActiveLifestyleTab(1)}
                    >
                      뒤로가기
                    </button>
                    <button
                      type="button"
                      className={styles.modalActionBtn}
                      onClick={submitLifestyleSelection}
                    >
                      선택 완료
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className={styles.messages}>
          {messages.map((msg) => (
            <ChatMessage
              key={msg.id}
              message={msg}
              selectedInteriorStyle={selectedInteriorStyle}
              interiorStyleSelectionEnabled={currentStage === "interiorStyle"}
              onInteriorStyleSelect={handleInteriorStyleSelect}
              onRefreshInteriorImages={refreshInteriorImages}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className={styles.inputSection}>
          {showRecommendCta && (
            <div className={styles.ctaBar}>
              <button
                type="button"
                className={styles.recommendCtaBtn}
                disabled={isLoadingRecommend}
                onClick={async () => {
                  if (isLoadingRecommend) return;
                  if (!convId) {
                    enqueueBotMessages(["로그인 후 이용 가능합니다. 로그인 해주세요."]);
                    return;
                  }
                  setIsLoadingRecommend(true);
                  try {
                    const result = await fetchRecommendations(convId, 1);
                    if (result.recommendations.length === 0) {
                      enqueueBotMessages(["추천 결과가 아직 준비되지 않았어요. 잠시 후 다시 시도해 주세요."]);
                      setIsLoadingRecommend(false);
                      return;
                    }
                    console.log("[Chatbot] confirmedOwnedLabels:", confirmedOwnedLabels);
                    navigate("/recommendchatbot", {
                      state: { convId, lifeType, interiorStyle: selectedInteriorStyle, ownedAppliances: confirmedOwnedLabels, recommendations: result },
                    });
                  } catch (err) {
                    console.error("추천 조회 실패:", err);
                    enqueueBotMessages(["추천 목록을 불러오는데 실패했어요. 다시 시도해 주세요."]);
                    setIsLoadingRecommend(false);
                  }
                }}
              >
                {isLoadingRecommend ? (
                  <>
                    <span className={styles.loadingSpinner} />
                    추천 리스트 생성 중...
                  </>
                ) : "추천 리스트 보기"}
              </button>
            </div>
          )}

          {showLifestyleModalTrigger && (
            <div className={styles.ctaBar}>
              <button
                type="button"
                className={styles.recommendCtaBtn}
                onClick={() => setLifestyleModalOpen(true)}
              >
                라이프스타일 선택 열기
              </button>
            </div>
          )}

          {showRoomTypeQuickReplies && (
            <div className={styles.quickReplyList}>
              {roomTypeQuickReplies.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className={styles.quickReplyBtn}
                  onClick={() => handleRoomTypeSelect(option.label)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}

          {showSpaceSizeQuickReplies && (
            <div className={styles.quickReplyList}>
              {spaceSizeQuickReplies.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className={styles.quickReplyBtn}
                  onClick={() => handleSpaceSizeSelect(option.label)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}

          {showFurnitureRecommendationQuickReplies && (
            <div className={styles.quickReplyList}>
              {furnitureRecommendationQuickReplies.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className={styles.quickReplyBtn}
                  onClick={() => handleFurnitureRecommendationSelect(option.label)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}

          {showBudgetQuickReplies && (
            <div className={styles.quickReplyList}>
              {budgetQuickReplies.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className={styles.quickReplyBtn}
                  onClick={() => handleBudgetSelect(option.label)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}

          <form
            className={styles.inputBar}
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
          >
            <div className={styles.inputWrap}>
              <button type="button" className={styles.plusBtn} aria-label="추가">
                <FiPlus size={20} />
              </button>
              <textarea
                ref={textAreaRef}
                className={styles.textInput}
                value={input}
                disabled={isTextInputDisabled}
                onChange={(e) => handleInputChange(e.target.value)}
                onKeyDown={(e) => {
                  if (isTextInputDisabled) {
                    e.preventDefault();
                    return;
                  }

                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder={
                  currentStage === "furnitureRecommendation"
                      ? "아래 버튼을 선택해 주세요"
                    : currentStage === "interiorStyle"
                      ? "채팅창의 스타일 이미지를 선택해 주세요"
                      : currentStage === "lifestyle"
                        ? "라이프스타일 선택 창에서 조건을 골라 주세요"
                        : "메시지를 입력하세요"
                }
                inputMode={
                  currentStage === "spaceSize" || currentStage === "budget"
                    ? "numeric"
                    : undefined
                }
                rows={1}
              />
              <button
                type="submit"
                className={styles.sendBtn}
                disabled={isSendDisabled}
                aria-label="전송"
              >
                <FiArrowUp size={18} />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Chatbot;
