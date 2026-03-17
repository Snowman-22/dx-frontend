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
  getBudgetPromptMessage,
  getBudgetQuickReplies,
  getGreetingMessage,
  getIntroMessage,
  getInvalidRoomTypeMessage,
  getLifestyleQuickReplies,
  getLifestyleSelectionMessage,
  getRoomTypeQuickReplies,
  getRoomTypeSelectionMessages,
  getRestartMessage,
  getSpaceSizeSelectionMessages,
  getSpaceSizeQuickReplies,
  isValidRoomTypeInput,
  type LifeTypeKey,
} from "./chatScenario";
import styles from "./Chatbot.module.css";

interface Message {
  id: string;
  sender: "bot" | "user";
  text: string;
}

type ChatStage =
  | "roomType"
  | "applianceSelection"
  | "spaceSize"
  | "lifestyle"
  | "budget"
  | "free";

const BOT_TOKEN_DELAY_MS = 110;

function Chatbot() {
  const location = useLocation();
  const navigate = useNavigate();
  const lifeType = (location.state as { lifeType?: LifeTypeKey } | null)?.lifeType;

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentStage, setCurrentStage] = useState<ChatStage>("roomType");
  const [applianceModalOpen, setApplianceModalOpen] = useState(false);
  const [shouldAutoOpenApplianceModal, setShouldAutoOpenApplianceModal] =
    useState(false);
  const [selectedAppliances, setSelectedAppliances] = useState<string[]>([]);
  const [selectedLifestyles, setSelectedLifestyles] = useState<string[]>([]);
  const [replyButtonsReady, setReplyButtonsReady] = useState(false);
  const [botQueueVersion, setBotQueueVersion] = useState(0);
  const [isBotTyping, setIsBotTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const botQueueRef = useRef<string[]>([]);
  const isBotQueueProcessingRef = useRef(false);
  const botQueueSessionRef = useRef(0);
  const applianceModalTimeoutRef = useRef<number | null>(null);

  const applianceOptions = getApplianceOptions();
  const roomTypeQuickReplies = getRoomTypeQuickReplies();
  const spaceSizeQuickReplies = getSpaceSizeQuickReplies();
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

  const enqueueBotMessages = (texts: string[]) => {
    if (texts.length === 0) return;
    botQueueRef.current.push(...texts);
    setBotQueueVersion((prev) => prev + 1);
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

  useEffect(() => {
    setCurrentStage("roomType");
    setApplianceModalOpen(false);
    setShouldAutoOpenApplianceModal(false);
    setSelectedAppliances([]);
    setSelectedLifestyles([]);
    setReplyButtonsReady(false);
    clearApplianceModalTimer();
    resetBotQueue();
    setMessages([]);
    enqueueBotMessages([getIntroMessage(lifeType), getGreetingMessage(lifeType)]);
  }, [lifeType]);

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
          const nextText = botQueueRef.current.shift();
          if (!nextText) continue;

          const nextMessageId = crypto.randomUUID();
          setMessages((prev) => [
            ...prev,
            {
              id: nextMessageId,
              sender: "bot",
              text: "",
            },
          ]);

          const tokens = nextText.match(/\S+\s*/g) ?? [nextText];
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
      appendUserMessage(trimmed);
      setCurrentStage("free");
      setInput("");
      return;
    }

    if (currentStage === "spaceSize") {
      appendUserMessage(trimmed);
      setCurrentStage("free");
      setInput("");
      return;
    }

    sendMessage(trimmed);
  };

  const handleNewChat = () => {
    setCurrentStage("roomType");
    setApplianceModalOpen(false);
    setShouldAutoOpenApplianceModal(false);
    setSelectedAppliances([]);
    setSelectedLifestyles([]);
    setReplyButtonsReady(false);
    clearApplianceModalTimer();
    resetBotQueue();
    setMessages([]);
    enqueueBotMessages([getRestartMessage(), getGreetingMessage(lifeType)]);
  };

  const toggleApplianceSelection = (id: string) => {
    setSelectedAppliances((prev) => {
      if (id === "none") {
        return prev.includes("none") ? [] : ["none"];
      }

      const withoutNone = prev.filter((item) => item !== "none");
      return withoutNone.includes(id)
        ? withoutNone.filter((item) => item !== id)
        : [...withoutNone, id];
    });
  };

  const handleRoomTypeSelect = (label: string) => {
    handleRoomTypeSubmit(label);
  };

  const handleApplianceComplete = () => {
    const selectedLabels = applianceOptions
      .filter((option) => selectedAppliances.includes(option.id))
      .map((option) => option.label);

    appendUserMessage(getApplianceSelectionUserMessage(selectedLabels));
    enqueueBotMessages(getApplianceSelectionMessages(selectedLabels));
    setApplianceModalOpen(false);
    setShouldAutoOpenApplianceModal(false);
    setSelectedAppliances([]);
    setSelectedLifestyles([]);
    setReplyButtonsReady(false);
    setCurrentStage("spaceSize");
  };

  const handleSpaceSizeSelect = (label: string) => {
    const trimmed = label.trim();
    if (!trimmed) return;

    appendUserMessage(trimmed);
    enqueueBotMessages(getSpaceSizeSelectionMessages(trimmed));
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

    appendUserMessage(trimmed);
    setReplyButtonsReady(false);
    setCurrentStage("free");
  };

  const showRoomTypeQuickReplies =
    currentStage === "roomType" && replyButtonsReady;
  const showSpaceSizeQuickReplies =
    currentStage === "spaceSize" && replyButtonsReady;
  const showLifestyleQuickReplies =
    currentStage === "lifestyle" && replyButtonsReady;
  const showBudgetQuickReplies =
    currentStage === "budget" && replyButtonsReady;
  const isTextInputDisabled = currentStage === "lifestyle";
  const isSendDisabled =
    currentStage === "lifestyle" ? selectedLifestyles.length === 0 : !input.trim();

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
                  <p className={styles.modalEyebrow}>보유 가전 체크</p>
                  <h2 className={styles.modalTitle}>현재 보유 중인 가전을 선택해 주세요</h2>
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
                  const selected = selectedAppliances.includes(option.id);

                  return (
                    <button
                      key={option.id}
                      type="button"
                      className={`${styles.applianceCard} ${
                        selected ? styles.applianceCardSelected : ""
                      }`}
                      onClick={() => toggleApplianceSelection(option.id)}
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
            <ChatMessage key={msg.id} message={msg} />
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className={styles.inputSection}>
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
                onChange={(e) => setInput(e.target.value)}
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
                  isTextInputDisabled
                    ? "라이프 스타일 버튼을 선택한 뒤 Enter를 눌러 주세요"
                    : "메시지를 입력하세요"
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
