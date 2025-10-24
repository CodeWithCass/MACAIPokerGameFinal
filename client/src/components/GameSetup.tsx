import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ChipIcon } from "./ChipIcon";
import cassieAvatar from "@assets/generated_images/Cassie_dealer_avatar_portrait_7c8f19c6.png";
import { Users, Sparkles } from "lucide-react";
import { useState } from "react";

interface GameSetupProps {
  onStart: (botCount: number) => void;
}

export function GameSetup({ onStart }: GameSetupProps) {
  const [botCount, setBotCount] = useState("2");
  const startingChips = 1500;

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-background to-muted/30">
      <Card className="max-w-2xl w-full shadow-2xl" data-testid="game-setup">
        <CardHeader className="text-center space-y-4 pb-6">
          <div className="flex justify-center">
            <Avatar className="w-24 h-24 border-4 border-primary">
              <AvatarImage src={cassieAvatar} alt="Cassie" />
              <AvatarFallback className="bg-primary text-primary-foreground font-bold text-3xl">
                C
              </AvatarFallback>
            </Avatar>
          </div>
          
          <div className="space-y-2">
            <CardTitle className="text-4xl font-display">
              Project MAC
            </CardTitle>
            <div className="flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <p className="text-lg text-muted-foreground">
                AI-Powered Texas Hold'em with Cassie
              </p>
            </div>
          </div>

          <div className="bg-muted/50 rounded-xl p-4">
            <p className="text-lg font-display leading-relaxed">
              "Welcome back, hotshot. Let's see if you've learned to play smarter than my grandma today."
            </p>
            <p className="text-sm text-muted-foreground mt-2">— Cassie, your dealer</p>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label className="text-base font-semibold flex items-center gap-2">
              <Users className="w-4 h-4" />
              Number of AI Opponents
            </Label>
            <RadioGroup
              value={botCount}
              onValueChange={setBotCount}
              className="grid grid-cols-3 gap-3"
            >
              {["1", "2", "3"].map((count) => (
                <Label
                  key={count}
                  htmlFor={`bot-${count}`}
                  className="cursor-pointer"
                >
                  <div className="flex items-center space-x-2 border-2 border-card-border rounded-xl p-4 hover-elevate active-elevate-2 transition-all has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                    <RadioGroupItem value={count} id={`bot-${count}`} data-testid={`radio-bot-${count}`} />
                    <span className="font-semibold text-lg">{count} {count === "1" ? "Bot" : "Bots"}</span>
                  </div>
                </Label>
              ))}
            </RadioGroup>
          </div>

          <div className="bg-card border border-card-border rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Starting Chips:</span>
              <Badge variant="secondary" className="text-base px-3 py-1">
                <ChipIcon value={startingChips} className="w-4 h-4 mr-2" />
                ${startingChips.toLocaleString()}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Total Players:</span>
              <span className="font-semibold">{parseInt(botCount) + 1}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Game Type:</span>
              <span className="font-semibold">Texas Hold'em</span>
            </div>
          </div>

          <Button
            size="lg"
            onClick={() => onStart(parseInt(botCount))}
            className="w-full h-16 text-lg"
            data-testid="button-deal-me-in"
          >
            Deal Me In!
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
