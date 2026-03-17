import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FiPlus, FiArrowUp } from "react-icons/fi";
import ChatSidebar from "./ChatSidebar";
import ChatMessage from "./ChatMessage";
import styles from "./Chatbot.module.css";

interface Message {
  id: string;
  sender: "bot" | "user";
  text: string;
}

const LIFE_TYPE_LABELS: Record<string, string> = {
  single: "싱글 라이프",
  couple: "함께 시작하는 집",
  baby: "아기가 있는 집",
  kids: "자녀와 함께하는 집",
  parents: "부모님과 함께하는 집",
  restart: "독립 후 다시 꾸미는 집",
};

function getGreeting(lifeType?: string): string {
  const label = lifeType ? LIFE_TYPE_LABELS[lifeType] : null;
  if (label) {
    return `가장 중요한 총 예산을 알려주세요 💸 정해진 금액 안에서 효율적으로 공간을 채울 수 있게 계산해 드릴게요! 단위는 '만원'으로 계산합니다. 숫자만 입력해 주세요! (예: 100)`;
  }
  return "어떤 공간을 꾸미고 싶으신지 알려주세요!";
}

function Chatbot() {
  const location = useLocation();
  const navigate = useNavigate();
  const lifeType = (location.state as { lifeType?: string } | null)?.lifeType;

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const label = lifeType ? LIFE_TYPE_LABELS[lifeType] : null;
    const intro = label
      ? `반가워요! 저는 고객님의 소중한 보금자리를 함께 채워나갈 든든한 홈 퍼니싱 파트너예요!🏠✨ 주거 유형이나 평수, 예산 같은 기본 정보만 알려주시면, 가전과 가구가 완벽한 톤앤매너를 이루는 맞춤형 공간을 큐레이션해 드릴게요.`
      : "안녕하세요! LG 가전 추천 도우미입니다. 주거 유형이나 예산을 알려주시면 맞춤 추천을 해드릴게요.";

    setMessages([
      { id: crypto.randomUUID(), sender: "bot", text: intro },
      { id: crypto.randomUUID(), sender: "bot", text: getGreeting(lifeType ?? undefined) },
    ]);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      sender: "user",
      text: trimmed,
    };

    const botReply: Message = {
      id: crypto.randomUUID(),
      sender: "bot",
      text: trimmed,
    };

    setMessages((prev) => [...prev, userMsg, botReply]);
    setInput("");
  };

  const handleNewChat = () => {
    setMessages([
      {
        id: crypto.randomUUID(),
        sender: "bot",
        text: "안녕하세요! 새로운 채팅을 시작합니다. 어떤 공간을 꾸미고 싶으신지 알려주세요!",
      },
    ]);
  };

  return (
    <div className={styles.page}>
      <ChatSidebar
        open={sidebarOpen}
        onToggle={() => setSidebarOpen((prev) => !prev)}
        onNewChat={handleNewChat}
        onExit={() => navigate("/")}
      />

      <div className={styles.chatArea}>
        <div className={styles.messages}>
          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}
          <div ref={messagesEndRef} />
        </div>

        <form
          className={styles.inputBar}
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
        >
          <div className={styles.inputWrap}>
            <button
              type="button"
              className={styles.plusBtn}
              aria-label="첨부"
            >
              <FiPlus size={20} />
            </button>
            <input
              className={styles.textInput}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="메시지를 입력하세요"
            />
            <button
              type="submit"
              className={styles.sendBtn}
              disabled={!input.trim()}
              aria-label="전송"
            >
              <FiArrowUp size={18} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Chatbot;
