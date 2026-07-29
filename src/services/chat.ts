import { api } from "@/lib/api";
import type { ChatMessage, ConversationSummary } from "@/types/chat";

export type SendChatMessagePayload = {
  body: string;
  clientMsgId?: string;
};

export async function getCoachConversations() {
  const { data } = await api.get<ConversationSummary[]>("/chat/conversations");
  return data;
}

export async function getCoachConversationMessages(clientId: string) {
  const { data } = await api.get<ChatMessage[]>(
    `/chat/conversations/${clientId}/messages`,
  );
  return data;
}

export async function sendCoachMessage(clientId: string, payload: SendChatMessagePayload) {
  const { data } = await api.post<ChatMessage>(
    `/chat/conversations/${clientId}/messages`,
    payload,
  );
  return data;
}

export async function markCoachConversationRead(clientId: string) {
  const { data } = await api.post<{ count: number }>(
    `/chat/conversations/${clientId}/read`,
  );
  return data;
}

