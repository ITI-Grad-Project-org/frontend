import { useQuery } from "@tanstack/react-query";
import { getCoachConversations } from "@/services/chat";

export function useUnreadMessages() {
  return useQuery({
    queryKey: ["chat", "unread"],
    queryFn: getCoachConversations,
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
    staleTime: 0,
    select: (conversations) =>
      conversations.reduce((sum, conversation) => sum + (conversation.unreadCount ?? 0), 0),
  });
}
