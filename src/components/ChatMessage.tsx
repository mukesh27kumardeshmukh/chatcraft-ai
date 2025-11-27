import { cn } from "@/lib/utils";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
}

const ChatMessage = ({ role, content }: ChatMessageProps) => {
  return (
    <div
      className={cn(
        "py-8 px-4 animate-in fade-in-0 slide-in-from-bottom-4 duration-700",
        role === "user" ? "bg-chat-user" : "bg-chat-assistant"
      )}
    >
      <div className="max-w-3xl mx-auto flex gap-6">
        <div className="flex-shrink-0 w-8 h-8 rounded-sm bg-accent text-accent-foreground flex items-center justify-center font-semibold">
          {role === "user" ? "U" : "AI"}
        </div>
        <div className="flex-1 space-y-2 pt-1">
          <p className="text-foreground whitespace-pre-wrap leading-relaxed">{content}</p>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
