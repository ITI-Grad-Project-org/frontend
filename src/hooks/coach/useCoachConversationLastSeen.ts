import { useQuery } from "@tanstack/react-query";
import { getCoachConversations } from "@/services/chat";

/**
 * Shares the `["chat","unread"]` query with `useUnreadMessages` (same key +
 * queryFn, so it adds no network traffic) but exposes the newest client-sent
 * message timestamp per client instead of the summed unread count. Used to
 * keep "recently active" client lists fresh even when the connection's
 * `lastActiveAt` field lags behind.
 */
export function useCoachConversationLastSeen() {
  return useQuery({
    queryKey: ["chat", "unread"],
    queryFn: getCoachConversations,
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
    staleTime: 0,
    select: (conversations) =>
      conversations.reduce<Map<string, number>>((map, conversation) => {
        const message = conversation.lastMessage;
        if (!message || message.senderType !== "client") return map;
        const time = new Date(message.createdAt).getTime();
        if (Number.isNaN(time)) return map;
        const previous = map.get(conversation.clientId);
        if (previous === undefined || time > previous) {
          map.set(conversation.clientId, time);
        }
        return map;
      }, new Map()),
  });
}