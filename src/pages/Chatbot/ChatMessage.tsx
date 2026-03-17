import styles from "./ChatMessage.module.css";

interface ChatMessageProps {
  message: {
    id: string;
    sender: "bot" | "user";
    text: string;
  };
}

function ChatMessage({ message }: ChatMessageProps) {
  const isBot = message.sender === "bot";

  return (
    <div className={`${styles.row} ${isBot ? styles.rowBot : styles.rowUser}`}>
      {isBot && (
        <div className={styles.avatar}>
          <span className={styles.avatarText}>h</span>
        </div>
      )}
      <div
        className={`${styles.bubble} ${isBot ? styles.bubbleBot : styles.bubbleUser}`}
      >
        {message.text}
      </div>
    </div>
  );
}

export default ChatMessage;
