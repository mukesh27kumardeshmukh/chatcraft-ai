import { useState } from "react";
import ChatMessage from "@/components/ChatMessage";
import ChatInput from "@/components/ChatInput";
import { useToast } from "@/hooks/use-toast";
import pharmacyLogo from "@/assets/pharmacy-logo.jpg";
import { Pill, Heart, Activity } from "lucide-react";

type Message = { role: "user" | "assistant"; content: string };

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const sendMessage = async (input: string) => {
    const userMsg: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    let assistantContent = "";
    const updateAssistant = (chunk: string) => {
      assistantContent += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) =>
            i === prev.length - 1 ? { ...m, content: assistantContent } : m
          );
        }
        return [...prev, { role: "assistant", content: assistantContent }];
      });
    };

    try {
      const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: [...messages, userMsg] }),
      });

      if (!resp.ok) {
        const errorData = await resp.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(errorData.error || `HTTP error! status: ${resp.status}`);
      }

      if (!resp.body) throw new Error("No response body");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let streamDone = false;

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") {
            streamDone = true;
            break;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) updateAssistant(content);
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }

      // Flush remaining buffer
      if (buffer.trim()) {
        for (let raw of buffer.split("\n")) {
          if (!raw) continue;
          if (raw.endsWith("\r")) raw = raw.slice(0, -1);
          if (raw.startsWith(":") || raw.trim() === "") continue;
          if (!raw.startsWith("data: ")) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === "[DONE]") continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) updateAssistant(content);
          } catch {
            /* ignore partial leftovers */
          }
        }
      }

      setIsLoading(false);
    } catch (e) {
      console.error("Error:", e);
      toast({
        title: "त्रुटि",
        description: e instanceof Error ? e.message : "संदेश भेजने में विफल",
        variant: "destructive",
      });
      setIsLoading(false);
      setMessages((prev) => prev.slice(0, -1));
    }
  };

  const examplePrompts = [
    { text: "दवा की जानकारी", icon: Pill },
    { text: "स्वास्थ्य सलाह", icon: Heart },
    { text: "लक्षण विश्लेषण", icon: Activity },
  ];

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="border-b bg-gradient-to-r from-primary to-secondary shadow-lg sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center gap-4">
            <img 
              src={pharmacyLogo} 
              alt="MK Pharmacy Hub Logo" 
              className="w-12 h-12 object-contain rounded-lg bg-white p-1 shadow-md"
            />
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white">MK Pharmacy Hub</h1>
              <p className="text-xs text-white/90">आपकी स्वास्थ्य सहायक</p>
            </div>
          </div>
          <div className="mt-2 text-xs text-white/95 border-t border-white/20 pt-2">
            <p className="font-medium">स्वामी: मुकेश कुमार देशमुख</p>
            <p>ग्राम चंगोरी, दुर्ग, छत्तीसगढ़</p>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full p-8">
            <div className="text-center space-y-8 max-w-3xl">
              <div className="space-y-3">
                <h2 className="text-4xl font-bold text-primary">नमस्ते! 👋</h2>
                <p className="text-xl text-muted-foreground">
                  मैं आपकी स्वास्थ्य सेवा में कैसे मदद कर सकता हूं?
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                {examplePrompts.map((prompt, idx) => {
                  const Icon = prompt.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => sendMessage(prompt.text)}
                      className="group p-6 bg-card border-2 border-border rounded-xl hover:border-primary hover:shadow-lg transition-all duration-300 hover:scale-105"
                    >
                      <div className="flex flex-col items-center gap-3">
                        <div className="p-3 bg-primary/10 rounded-full group-hover:bg-primary/20 transition-colors">
                          <Icon className="w-8 h-8 text-primary" />
                        </div>
                        <span className="font-semibold text-foreground">{prompt.text}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="pb-4">
            {messages.map((msg, idx) => (
              <ChatMessage key={idx} role={msg.role} content={msg.content} />
            ))}
          </div>
        )}
      </main>

      <ChatInput onSend={sendMessage} disabled={isLoading} />
    </div>
  );
};

export default Index;
