export interface ChatMessage {
  id: string;
  tenantId: string;
  clientId: string;
  senderType: "coach" | "client";
  body: string;
  readAt: string | null;
  createdAt: string;
  clientMsgId?: string | null;
}

export interface ConversationSummary {
  clientId: string;
  client: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatarUrl: string | null;
  };
  lastMessage: ChatMessage | null;
  unreadCount?: number;
  updatedAt?: string;
}

