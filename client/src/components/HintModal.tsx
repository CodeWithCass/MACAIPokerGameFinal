import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import cassieAvatar from "@assets/generated_images/Cassie_dealer_avatar_portrait_7c8f19c6.png";
import { Lightbulb, Sparkles } from "lucide-react";

interface HintModalProps {
  open: boolean;
  onClose: () => void;
  hint: string;
  isLoading?: boolean;
}

export function HintModal({ open, onClose, hint, isLoading = false }: HintModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md" data-testid="hint-modal">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Lightbulb className="w-5 h-5 text-primary" />
            Cassie's Strategic Insight
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex items-start gap-4 mt-4">
          <Avatar className="w-20 h-20 border-2 border-primary shrink-0">
            <AvatarImage src={cassieAvatar} alt="Cassie" />
            <AvatarFallback className="bg-primary text-primary-foreground font-bold text-2xl">
              C
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <span className="font-bold text-primary">Cassie says:</span>
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            
            {isLoading ? (
              <div className="flex gap-1 py-4">
                <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            ) : (
              <p className="text-base leading-relaxed" data-testid="hint-text">
                {hint}
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <Button onClick={onClose} data-testid="button-close-hint">
            Got it!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
