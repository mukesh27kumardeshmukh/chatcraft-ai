import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2 } from "lucide-react";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

const ChatInput = ({ onSend, disabled }: ChatInputProps) => {
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !disabled) {
      onSend(input.trim());
      setInput("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="border-t bg-background shadow-lg">
      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto p-4">
        <div className="flex gap-4 items-end">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="अपना संदेश लिखें..."
            disabled={disabled}
            className="min-h-[56px] max-h-[200px] resize-none text-base"
            rows={1}
          />
          <Button
            type="submit"
            size="icon"
            disabled={!input.trim() || disabled}
            className="h-[56px] w-[56px] flex-shrink-0 bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            {disabled ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ChatInput;
