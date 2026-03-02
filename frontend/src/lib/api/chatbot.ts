const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
}

export interface ProductSuggestion {
  id: string;
  name: string;
  price: number;
  category: string;
}

export interface ChatResponse {
  message: string;
  session_id: string;
  timestamp: string;
  suggested_products?: ProductSuggestion[];
}

export interface ChatHistoryResponse {
  session_id: string;
  messages: ChatMessage[];
  message_count: number;
}

export async function sendChatMessage(
  token: string,
  message: string,
  sessionId?: string | null
): Promise<ChatResponse> {
  const res = await fetch(`${API_BASE}/api/v1/chatbot/message`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ message, session_id: sessionId }),
  });
  if (!res.ok) throw new Error(`Chat request failed: ${res.status}`);
  return res.json();
}

export async function getChatHistory(
  token: string,
  sessionId: string
): Promise<ChatHistoryResponse> {
  const res = await fetch(
    `${API_BASE}/api/v1/chatbot/history?session_id=${encodeURIComponent(sessionId)}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!res.ok) throw new Error("Failed to fetch chat history");
  return res.json();
}

export async function clearChatSession(token: string, sessionId: string): Promise<void> {
  await fetch(
    `${API_BASE}/api/v1/chatbot/session?session_id=${encodeURIComponent(sessionId)}`,
    {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    }
  );
}
