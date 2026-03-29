import axios from "axios";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { getAccessToken } from "@/contexts/AuthContext";

// ─── Types ───

export type StarterPackageType =
  | "SINGLE"
  | "NEWLYWEDS"
  | "WITH_BABY"
  | "WITH_STUDENT"
  | "WITH_PARENTS"
  | "OTHER";

export interface ChatSession {
  chatUuid: string;
  userId: number;
  userName: string;
  starterPackageId: number;
  starterPackageType: StarterPackageType;
  starterPackageDescription: string;
}

export interface ChatMessage {
  convId: string;
  stepCode: string;
  assistantText: string | null;
  userText: string | object;
}

// ─── LifeType → StarterPackageType 매핑 ───

const LIFE_TYPE_MAP: Record<string, StarterPackageType> = {
  single: "SINGLE",
  couple: "NEWLYWEDS",
  baby: "WITH_BABY",
  kids: "WITH_STUDENT",
  parents: "WITH_PARENTS",
  restart: "OTHER",
};

export function toStarterPackageType(lifeType?: string): StarterPackageType {
  return (lifeType && LIFE_TYPE_MAP[lifeType]) || "SINGLE";
}

// ─── REST API (인증 필요) ───

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || "/api",
  headers: { "Content-Type": "application/json" },
  timeout: 120_000,
});

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/** prestart → starter_package_id 획득 */
export async function prestartChat(type: StarterPackageType): Promise<number> {
  const { data } = await api.post<{ starter_package_id: number }>("/chats/prestart", {
    starter_package_type: type,
  });
  return data.starter_package_id;
}

/** start → chat session 생성 */
export async function startChat(starterPackageId: number): Promise<ChatSession> {
  const { data } = await api.post<{
    chat_uuid: string;
    user_id: number;
    user_name: string;
    starter_package_id: number;
    starter_package_type: StarterPackageType;
    starter_package_description: string;
  }>("/chats/start", {
    starter_package_id: starterPackageId,
  });

  return {
    chatUuid: data.chat_uuid,
    userId: data.user_id,
    userName: data.user_name,
    starterPackageId: data.starter_package_id,
    starterPackageType: data.starter_package_type,
    starterPackageDescription: data.starter_package_description,
  };
}

// ─── STOMP Client ───

// ─── STOMP Client ───

let stompClient: Client | null = null;
let connectPromise: Promise<void> | null = null;
const pendingMessages: ChatMessage[] = [];
let onDisconnectCallback: (() => void) | null = null;

/** STOMP 연결 끊김 콜백 등록 */
export function onStompDisconnect(cb: (() => void) | null): void {
  onDisconnectCallback = cb;
}

export function connectStomp(): Promise<void> {
  // 이미 연결 중이면 그 Promise 재사용
  if (connectPromise) return connectPromise;

  // 이미 연결됐으면 즉시 resolve
  if (stompClient?.connected) return Promise.resolve();

  connectPromise = new Promise<void>((resolve, reject) => {
    const token = getAccessToken();
    if (!token) {
      connectPromise = null;
      reject(new Error("JWT 토큰이 없습니다."));
      return;
    }

    // 기존 클라이언트 정리
    if (stompClient) {
      try { stompClient.deactivate(); } catch { /* ignore */ }
      stompClient = null;
    }

    const wsUrl = import.meta.env.VITE_WS_BASE || `${window.location.origin}/ws`;
    let settled = false;

    const settle = (success: boolean, error?: Error) => {
      if (settled) return;
      settled = true;
      if (success) {
        // 큐에 쌓인 메시지 전송
        flushPendingMessages();
        resolve();
      } else {
        connectPromise = null;
        reject(error);
      }
    };

    stompClient = new Client({
      webSocketFactory: () => new SockJS(wsUrl),
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      debug: (msg) => {
        if (import.meta.env.DEV) {
          console.log("[STOMP]", msg);
        }
      },
      reconnectDelay: 5000,
      onConnect: () => {
        console.log("[STOMP] Connected successfully");
        settle(true);
      },
      onStompError: (frame) => {
        console.error("[STOMP] Error:", frame.headers.message);
        settle(false, new Error(frame.headers.message || "STOMP 연결 실패"));
      },
      onDisconnect: () => {
        console.log("[STOMP] Disconnected");
        connectPromise = null;
      },
      onWebSocketClose: () => {
        console.warn("[STOMP] WebSocket closed unexpectedly");
        connectPromise = null;
        if (onDisconnectCallback) onDisconnectCallback();
      },
    });

    stompClient.activate();

    // 15초 타임아웃
    setTimeout(() => {
      settle(false, new Error("STOMP 연결 시간 초과 (15s)"));
    }, 15000);
  });

  return connectPromise;
}

function flushPendingMessages(): void {
  if (!stompClient?.connected) return;

  const token = getAccessToken();
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  while (pendingMessages.length > 0) {
    const msg = pendingMessages.shift()!;
    stompClient.publish({
      destination: "/app/chat.send",
      headers,
      body: JSON.stringify(msg),
    });
    console.log("[STOMP] Sent queued:", msg.stepCode);
  }
}

/** STOMP로 채팅 메시지 전송 (연결 안 됐으면 큐에 저장) */
export function sendChatMessage(message: ChatMessage): void {
  if (!stompClient?.connected) {
    console.warn("[STOMP] Not connected, queuing:", message.stepCode);
    pendingMessages.push(message);
    // connectStomp을 다시 호출하지 않음 - useChatSession이 관리
    return;
  }

  const token = getAccessToken();
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  stompClient.publish({
    destination: "/app/chat.send",
    headers,
    body: JSON.stringify(message),
  });

  console.log("[STOMP] Sent:", message.stepCode);
}

/** STOMP 연결 해제 */
export function disconnectStomp(): void {
  connectPromise = null;
  if (stompClient) {
    try { stompClient.deactivate(); } catch { /* ignore */ }
    stompClient = null;
    console.log("[STOMP] Disconnected");
  }
}

/** STOMP 연결 상태 확인 */
export function isStompConnected(): boolean {
  return stompClient?.connected ?? false;
}

/** STOMP 토픽 구독 — 서버 응답 수신 */
export function subscribeTopic(
  convId: string,
  onMessage: (body: Record<string, unknown>) => void,
): (() => void) | null {
  if (!stompClient?.connected) {
    console.warn("[STOMP] Cannot subscribe, not connected");
    return null;
  }

  const token = getAccessToken();
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  const subscription = stompClient.subscribe(
    `/topic/chat/${convId}`,
    (frame) => {
      try {
        const body = JSON.parse(frame.body);
        console.log("[STOMP] Received:", body);
        onMessage(body);
      } catch {
        console.error("[STOMP] Failed to parse message:", frame.body);
      }
    },
    headers,
  );

  console.log(`[STOMP] Subscribed to /topic/chat/${convId}`);

  return () => {
    subscription.unsubscribe();
    console.log(`[STOMP] Unsubscribed from /topic/chat/${convId}`);
  };
}

/** RECOMMEND_RAG 메시지 전송 */
export function sendRecommendRag(convId: string, userText: string): void {
  sendChatMessage({
    convId,
    stepCode: "RECOMMEND_RAG",
    assistantText: null,
    userText,
  });
}

// ─── Recommendations API ───

export interface RecommendationDTO {
  recommendation_id: number;
  chat_uuid: string;
  package_name: string;
  reason: string;
  products: string;
  is_selected: boolean;
  recommendationplus?: string | null;
  recommendationPlus?: string | null;
  recommendation_plus?: string | null;
}

export interface RecommendationsPageResponse {
  recommendations: RecommendationDTO[];
  page: number;
  page_size: number;
  total_count: number;
  has_next: boolean;
}

/** 추천 목록 조회 (폴링 — 빈 응답이면 최대 60초간 재시도) */
export async function fetchRecommendations(
  chatId: string,
  page: number = 1,
  maxRetries: number = 20,
  retryInterval: number = 5000,
): Promise<RecommendationsPageResponse> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const { data } = await api.get<RecommendationsPageResponse>(
      `/recommendations/${chatId}/page`,
      { params: { page } },
    );

    if (data.recommendations.length > 0) {
      return data;
    }

    // 마지막 시도가 아니면 대기 후 재시도
    if (attempt < maxRetries - 1) {
      console.log(`[Recommendations] 빈 응답, ${retryInterval / 1000}초 후 재시도 (${attempt + 1}/${maxRetries})`);
      await new Promise((resolve) => setTimeout(resolve, retryInterval));
    }
  }

  // 최대 재시도 후에도 빈 응답이면 그대로 반환
  const { data } = await api.get<RecommendationsPageResponse>(
    `/recommendations/${chatId}/page`,
    { params: { page } },
  );
  return data;
}
