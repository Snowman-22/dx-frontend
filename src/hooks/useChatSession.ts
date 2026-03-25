import { useCallback, useEffect, useState } from "react";
import {
  connectStomp,
  disconnectStomp,
  prestartChat,
  sendChatMessage,
  startChat,
  toStarterPackageType,
  type ChatSession,
} from "@/services/chatService";
import { getAccessToken } from "@/contexts/AuthContext";

interface UseChatSessionReturn {
  /** 세션이 준비되었는지 (STOMP 연결 완료) */
  isReady: boolean;
  /** 초기화 중 에러 */
  error: string | null;
  /** chat_uuid (convId) */
  convId: string | null;
  /** 전체 세션 정보 */
  session: ChatSession | null;
  /** 특정 stepCode로 메시지 전송 */
  send: (stepCode: string, userText: string | object, assistantText?: string | null) => void;
  /** 세션 초기화 (새 채팅 시작) */
  reset: () => void;
}

export function useChatSession(
  lifeType?: string,
  existingSession?: ChatSession | null,
): UseChatSessionReturn {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<ChatSession | null>(existingSession ?? null);
  const initialize = useCallback(async (signal: { aborted: boolean }) => {
    const token = getAccessToken();
    if (!token) {
      if (!signal.aborted) setError("로그인이 필요합니다.");
      return;
    }

    try {
      if (!signal.aborted) {
        setError(null);
        setIsReady(false);
      }

      let chatSession: ChatSession;

      if (existingSession) {
        chatSession = existingSession;
        console.log("[ChatSession] Using existing session:", chatSession.chatUuid);
      } else {
        const packageType = toStarterPackageType(lifeType);
        const starterPackageId = await prestartChat(packageType);
        if (signal.aborted) return;
        chatSession = await startChat(starterPackageId);
        if (signal.aborted) return;
        console.log("[ChatSession] Created new session:", chatSession.chatUuid);
      }

      if (signal.aborted) return;
      setSession(chatSession);

      // STOMP 연결
      await connectStomp();

      if (signal.aborted) {
        disconnectStomp();
        return;
      }

      setIsReady(true);
      console.log("[ChatSession] Ready:", chatSession.chatUuid);
    } catch (err) {
      if (signal.aborted) return;
      const msg = err instanceof Error ? err.message : "채팅 세션 초기화 실패";
      setError(msg);
      console.error("[ChatSession] Init failed:", err);
    }
  }, [lifeType, existingSession]);

  useEffect(() => {
    const signal = { aborted: false };

    initialize(signal);

    return () => {
      signal.aborted = true;
      disconnectStomp();
    };
  }, [initialize]);

  const send = useCallback(
    (stepCode: string, userText: string | object, assistantText: string | null = null) => {
      if (!session) {
        console.warn("[ChatSession] Session not ready, cannot send");
        return;
      }

      sendChatMessage({
        convId: session.chatUuid,
        stepCode,
        assistantText,
        userText,
      });
    },
    [session],
  );

  const reset = useCallback(() => {
    disconnectStomp();
    setSession(null);
    setIsReady(false);
    setError(null);
    const signal = { aborted: false };
    initialize(signal);
  }, [initialize]);

  return {
    isReady,
    error,
    convId: session?.chatUuid ?? null,
    session,
    send,
    reset,
  };
}
