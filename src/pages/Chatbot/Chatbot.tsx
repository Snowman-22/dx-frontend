import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FiArrowUp, FiPlus } from "react-icons/fi";
import ChatMessage from "./ChatMessage";
import ChatSidebar from "./ChatSidebar";
import {
  buildBotReply,
  getApplianceOptions,
  getApplianceSelectionMessages,
  getApplianceSelectionUserMessage,
  getBudgetCompletedMessage,
  getBudgetInvalidMessage,
  getBudgetPromptMessage,
  getBudgetQuickReplies,
  getFurnitureRecommendationQuickReplies,
  getFurnitureRecommendationSkippedMessage,
  getGreetingMessage,
  getIntroMessage,
  getInteriorStyleOptions,
  getInteriorStylePromptMessage,
  getInteriorStyleSelectedMessage,
  getInvalidRoomTypeMessage,
  getLifestyleQuickReplies,
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
  | "lifestyle"
  | "budget"
  | "free";

type ApplianceTab = "owned" | "needed";

const BOT_TOKEN_DELAY_MS = 110;

function Chatbot() {
  const location = useLocation();
  const navigate = useNavigate();
  const lifeType = (location.state as { lifeType?: LifeTypeKey } | null)?.lifeType;

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentStage, setCurrentStage] = useState<ChatStage>("spaceSize");
  const [applianceModalOpen, setApplianceModalOpen] = useState(false);
  const [shouldAutoOpenApplianceModal, setShouldAutoOpenApplianceModal] =
    useState(false);
  const [activeApplianceTab, setActiveApplianceTab] =
    useState<ApplianceTab>("owned");
  const [selectedOwnedAppliances, setSelectedOwnedAppliances] = useState<string[]>([]);
  const [selectedNeededAppliances, setSelectedNeededAppliances] = useState<string[]>([]);
  const [selectedInteriorStyle, setSelectedInteriorStyle] = useState<string | null>(
    null,
  );
  const [selectedLifestyles, setSelectedLifestyles] = useState<string[]>([]);
  const [replyButtonsReady, setReplyButtonsReady] = useState(false);
  const [botQueueVersion, setBotQueueVersion] = useState(0);
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [showRecommendCta, setShowRecommendCta] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const botQueueRef = useRef<BotQueueItem[]>([]);
  const isBotQueueProcessingRef = useRef(false);
  const botQueueSessionRef = useRef(0);
  const applianceModalTimeoutRef = useRef<number | null>(null);
  const spaceSizeInvalidNoticeShownRef = useRef(false);
  const budgetInvalidNoticeShownRef = useRef(false);

  const applianceOptions = getApplianceOptions();
  const roomTypeQuickReplies = getRoomTypeQuickReplies();
  const spaceSizeQuickReplies = getSpaceSizeQuickReplies();
  const furnitureRecommendationQuickReplies =
    getFurnitureRecommendationQuickReplies();
  const interiorStyleOptions = getInteriorStyleOptions();
  const lifestyleQuickReplies = getLifestyleQuickReplies();
  const budgetQuickReplies = getBudgetQuickReplies();

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
        id: crypto.randomUUID(),
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
    setSelectedOwnedAppliances([]);
    setSelectedNeededAppliances([]);
    setSelectedInteriorStyle(null);
    setSelectedLifestyles([]);
    setShowRecommendCta(false);
    setReplyButtonsReady(false);
    clearApplianceModalTimer();
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
                id: crypto.randomUUID(),
                sender: "bot",
                type: "interior-style-selector",
                options: nextItem.options,
              },
            ]);
            continue;
          }

          const nextMessageId = crypto.randomUUID();
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
    }, 2000);

    return () => {
      clearApplianceModalTimer();
    };
  }, [applianceModalOpen, currentStage, isBotTyping, shouldAutoOpenApplianceModal]);

  useEffect(() => {
    const shouldShowReplyButtons =
      !applianceModalOpen &&
      !isBotTyping &&
      botQueueRef.current.length === 0 &&
      (currentStage === "roomType" ||
        currentStage === "spaceSize" ||
        currentStage === "furnitureRecommendation" ||
        currentStage === "lifestyle" ||
        currentStage === "budget");

    setReplyButtonsReady(shouldShowReplyButtons);
  }, [applianceModalOpen, botQueueVersion, currentStage, isBotTyping]);

  useEffect(() => {
    if (currentStage !== "lifestyle") return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Enter" || event.shiftKey || selectedLifestyles.length === 0) {
        return;
      }

      event.preventDefault();
      submitLifestyleSelection();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [currentStage, selectedLifestyles]);

  const sendMessage = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    appendUserMessage(trimmed);
    enqueueBotMessages([buildBotReply(trimmed)]);
    setInput("");
  };

  const completeBudgetStep = (answer: string) => {
    appendUserMessage(answer);
    enqueueBotMessages([getBudgetCompletedMessage()]);
    budgetInvalidNoticeShownRef.current = false;
    setReplyButtonsReady(false);
    setShowRecommendCta(true);
    setCurrentStage("free");
    setInput("");
  };

  const submitLifestyleSelection = () => {
    if (selectedLifestyles.length === 0) return;

    appendUserMessage(selectedLifestyles.join(", "));
    enqueueBotMessages([
      getLifestyleSelectionMessage(selectedLifestyles),
      getBudgetPromptMessage(),
    ]);
    setSelectedLifestyles([]);
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
    setSelectedOwnedAppliances([]);
    setSelectedNeededAppliances([]);
    setSelectedInteriorStyle(null);
    setSelectedLifestyles([]);
    setShowRecommendCta(false);
    setReplyButtonsReady(false);
    clearApplianceModalTimer();
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

    appendUserMessage(userSelectionSummary);
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

  const handleSpaceSizeSelect = (label: string, isDirectInput = false) => {
    const trimmed = label.trim();
    if (!trimmed) return;

    appendUserMessage(trimmed);
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

    enqueueBotMessages([
      getFurnitureRecommendationSkippedMessage(),
      getLifestylePromptMessage(),
    ]);
    setCurrentStage("lifestyle");
  };

  const handleInteriorStyleSelect = (label: string) => {
    const trimmed = label.trim();
    if (!trimmed || currentStage !== "interiorStyle") return;

    setSelectedInteriorStyle(trimmed);
    appendUserMessage(trimmed);
    enqueueBotMessages([
      getInteriorStyleSelectedMessage(),
      getLifestylePromptMessage(),
    ]);
    setReplyButtonsReady(false);
    setCurrentStage("lifestyle");
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
  const showLifestyleQuickReplies =
    currentStage === "lifestyle" && replyButtonsReady;
  const showBudgetQuickReplies =
    currentStage === "budget" && replyButtonsReady;
  const applianceTabPrompt =
    activeApplianceTab === "owned"
      ? "현재 보유 중인 가전을 선택해 주세요"
      : "현재 필요한 가전을 선택해 주세요";
  const isTextInputDisabled =
    currentStage === "furnitureRecommendation" ||
    currentStage === "interiorStyle" ||
    currentStage === "lifestyle";
  const isSendDisabled =
    currentStage === "lifestyle"
      ? selectedLifestyles.length === 0
      : isTextInputDisabled || !input.trim();

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
          <div className={styles.modalOverlay} onClick={handleApplianceComplete}>
            <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <div>
                  <div className={styles.applianceTabs} role="tablist" aria-label="가전 선택 탭">
                    <button
                      type="button"
                      role="tab"
                      aria-selected={activeApplianceTab === "owned"}
                      className={`${styles.applianceTabBtn} ${
                        activeApplianceTab === "owned" ? styles.applianceTabBtnActive : ""
                      }`}
                      onClick={() => setActiveApplianceTab("owned")}
                    >
                      보유
                    </button>
                    <button
                      type="button"
                      role="tab"
                      aria-selected={activeApplianceTab === "needed"}
                      className={`${styles.applianceTabBtn} ${
                        activeApplianceTab === "needed" ? styles.applianceTabBtnActive : ""
                      }`}
                      onClick={() => setActiveApplianceTab("needed")}
                    >
                      필요
                    </button>
                  </div>
                  <h2 className={styles.modalTitle}>{applianceTabPrompt}</h2>
                </div>
                <button
                  type="button"
                  className={styles.modalCloseBtn}
                  onClick={handleApplianceComplete}
                  aria-label="모달 닫기"
                >
                  ×
                </button>
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
                <button
                  type="button"
                  className={styles.modalActionBtn}
                  onClick={handleApplianceComplete}
                >
                  선택 완료
                </button>
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
                onClick={() => navigate("/recommendchatbot")}
              >
                추천 리스트 보기
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

          {showLifestyleQuickReplies && (
            <div className={`${styles.quickReplyList} ${styles.quickReplyListFive}`}>
              {lifestyleQuickReplies.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className={`${styles.quickReplyBtn} ${
                    selectedLifestyles.includes(option.label)
                      ? styles.quickReplyBtnSelected
                      : ""
                  }`}
                  onClick={() => handleLifestyleSelect(option.label)}
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
                        ? "라이프 스타일 버튼을 선택한 뒤 Enter를 눌러 주세요"
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
