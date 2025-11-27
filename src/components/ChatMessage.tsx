import { cn } from "@/lib/utils";
import { Bot, User } from "lucide-react";

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
        <div
          className={cn(
            "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-semibold shadow-md",
            role === "user"
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground"
          )}
        >
          {role === "user" ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
        </div>
        <div className="flex-1 space-y-2 pt-2">
          <p className="text-foreground whitespace-pre-wrap leading-relaxed">{content}</p>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
