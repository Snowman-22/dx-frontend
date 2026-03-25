import type { ReactNode } from "react";
import snowLogoImage from "../../assets/images/snow_logo.png";
import type { InteriorStyleOption } from "./chatScenario";
import styles from "./ChatMessage.module.css";

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

interface ChatMessageProps {
  message: Message;
  selectedInteriorStyle: string | null;
  interiorStyleSelectionEnabled: boolean;
  onInteriorStyleSelect: (label: string) => void;
  onRefreshInteriorImages?: () => void;
}

function isInteriorStyleSelectorMessage(
  message: Message,
): message is InteriorStyleSelectorMessage {
  return "type" in message && message.type === "interior-style-selector";
}

function renderInteriorStyleSelector(
  message: InteriorStyleSelectorMessage,
  selectedInteriorStyle: string | null,
  interiorStyleSelectionEnabled: boolean,
  onInteriorStyleSelect: (label: string) => void,
  onRefreshInteriorImages?: () => void,
) {
  return (
    <div className={`${styles.bubble} ${styles.bubbleBot} ${styles.selectorBubble}`}>
      <div className={styles.selectorGrid}>
        {message.options.map((option) => {
          const isSelected = selectedInteriorStyle === option.label;

          return (
            <button
              key={option.id}
              type="button"
              className={`${styles.styleCard} ${
                isSelected ? styles.styleCardSelected : ""
              }`}
              onClick={() => onInteriorStyleSelect(option.label)}
              disabled={!interiorStyleSelectionEnabled}
            >
              <div className={styles.stylePreview}>
                <img
                  src={option.imageSrc}
                  alt={option.label}
                  className={styles.stylePreviewImage}
                />
              </div>
              <span className={styles.styleLabel}>{option.label}</span>
            </button>
          );
        })}
      </div>
      {interiorStyleSelectionEnabled && onRefreshInteriorImages && (
        <div className={styles.refreshRow}>
          <button
            type="button"
            className={styles.refreshBtn}
            onClick={onRefreshInteriorImages}
          >
            🔄 다른 사진 보기
          </button>
          <span className={styles.refreshHint}>다른 예시가 보고 싶다면 눌러주세요</span>
        </div>
      )}
    </div>
  );
}

function ChatMessage({
  message,
  selectedInteriorStyle,
  interiorStyleSelectionEnabled,
  onInteriorStyleSelect,
  onRefreshInteriorImages,
}: ChatMessageProps) {
  const isBot = message.sender === "bot";
  let content: ReactNode;

  if (isInteriorStyleSelectorMessage(message)) {
    content = renderInteriorStyleSelector(
      message,
      selectedInteriorStyle,
      interiorStyleSelectionEnabled,
      onInteriorStyleSelect,
      onRefreshInteriorImages,
    );
  } else {
    content = (
      <div
        className={`${styles.bubble} ${isBot ? styles.bubbleBot : styles.bubbleUser}`}
      >
        {message.text}
      </div>
    );
  }

  return (
    <div className={`${styles.row} ${isBot ? styles.rowBot : styles.rowUser}`}>
      {isBot && (
        <div className={styles.avatar}>
          <img src={snowLogoImage} alt="챗봇 아이콘" className={styles.avatarImage} />
        </div>
      )}
      {content}
    </div>
  );
}

export default ChatMessage;
