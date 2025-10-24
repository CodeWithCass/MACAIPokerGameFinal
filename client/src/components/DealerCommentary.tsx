import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import cassieAvatar from "@assets/generated_images/Cassie_dealer_avatar_portrait_7c8f19c6.png";
import { Sparkles } from "lucide-react";

interface DealerCommentaryProps {
  message: string;
  isLoading?: boolean;
  className?: string;
}

export function DealerCommentary({ message, isLoading = false, className }: DealerCommentaryProps) {
  return (
    <div
      className={cn(
        "flex items-start gap-4 bg-card/95 backdrop-blur-sm border border-card-border rounded-2xl p-6 shadow-xl max-w-2xl",
        className
      )}
      data-testid="dealer-commentary"
    >
      <Avatar className="w-12 h-12 border-2 border-primary shrink-0">
        <AvatarImage src={cassieAvatar} alt="Cassie" />
        <AvatarFallback className="bg-primary text-primary-foreground font-bold">
          C
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-2">
          <span className="font-bold text-sm text-primary">Cassie</span>
          <Sparkles className="w-3 h-3 text-primary" />
        </div>
        
        {isLoading ? (
          <div className="flex gap-1">
            <span className="w-2 h-2 bg-amber-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-2 h-2 bg-amber-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-2 h-2 bg-amber-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        ) : (
          <p className="text-lg leading-relaxed font-display italic" data-testid="dealer-message">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
