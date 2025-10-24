# Poker Game Usage Guide

## Getting Started

### Prerequisites
- Node.js 16+ installed
- npm or yarn package manager

### Installation
```bash
cd MACAIPokerGameFinal
npm install
```

### Running the Game
```bash
npm run dev
```

The game will open at `http://localhost:5000`

---

## How to Play

### Starting a New Game

1. **Game Setup Screen**
   - Select number of AI opponents (1-3)
   - Click "Start Game"
   - Each player starts with 1,500 chips

2. **Blinds**
   - Small Blind: $25
   - Big Blind: $50
   - Positions rotate clockwise after each hand

### Your Turn

When it's your turn, you'll see betting controls at the bottom of the screen:

#### Available Actions

**FOLD** 🚫
- Give up your hand
- Forfeit any chips already in the pot
- Use when your hand is weak

**CHECK** ✓ (when no bet to call)
- Pass to next player without betting
- Only available when current bet equals your bet
- Safe option to see more cards for free

**CALL** 💰 (when there's a bet)
- Match the current bet
- Amount shown on button (e.g., "Call $50")
- Required to stay in the hand

**RAISE** 📈
- Increase the current bet
- Use slider to select raise amount
- Minimum: $50 (big blind)
- Maximum: Your remaining chips

**GET HINT** 💡
- Request strategic advice (coming in Section 3.4)
- Currently shows placeholder

---

## Game Flow

### 1. Pre-Flop
- Each player receives 2 hole cards (face down)
- First betting round begins
- Action starts left of big blind

### 2. The Flop
- 3 community cards revealed
- Second betting round
- Action starts left of dealer button

### 3. The Turn
- 1 additional community card revealed
- Third betting round
- Action starts left of dealer button

### 4. The River
- Final community card revealed
- Fourth betting round
- Action starts left of dealer button

### 5. Showdown
- Remaining players reveal hands
- Best 5-card poker hand wins
- Pot awarded to winner
- Modal shows results

---

## Poker Hand Rankings
(Best to Worst)

1. **Royal Flush** 👑
   - A♥ K♥ Q♥ J♥ 10♥
   - Ace-high straight flush

2. **Straight Flush** 🌊
   - 9♠ 8♠ 7♠ 6♠ 5♠
   - Five consecutive cards, same suit

3. **Four of a Kind** 🎯
   - K♦ K♥ K♠ K♣ 7♠
   - Four cards of same rank

4. **Full House** 🏠
   - J♥ J♠ J♦ 3♣ 3♠
   - Three of a kind + pair

5. **Flush** 💎
   - A♠ J♠ 9♠ 5♠ 3♠
   - Five cards same suit

6. **Straight** ➡️
   - 8♥ 7♦ 6♠ 5♣ 4♥
   - Five consecutive cards

7. **Three of a Kind** 🎲
   - 9♣ 9♦ 9♥ K♠ 4♦
   - Three cards same rank

8. **Two Pair** 👥
   - Q♥ Q♠ 5♦ 5♣ A♠
   - Two different pairs

9. **One Pair** 🤝
   - 10♣ 10♥ K♠ 7♦ 2♥
   - Two cards same rank

10. **High Card** 🃏
    - A♠ K♦ 9♣ 6♥ 3♠
    - No matching cards

---

## Strategy Tips

### Early Position (Next to Big Blind)
- Play tight (fold more hands)
- Only play strong hands (high pairs, AK, AQ)
- Avoid marginal hands

### Late Position (Near Dealer Button)
- Can play more hands
- Have more information from other players
- Good for bluffing

### Hand Selection
**Strong Starting Hands:**
- Pocket pairs (AA, KK, QQ, JJ)
- High suited cards (AK, AQ, AJ)
- High cards (AK, AQ)

**Medium Hands:**
- Middle pairs (99, 88, 77)
- Suited connectors (J♥10♥, 9♠8♠)
- Face card + ten

**Weak Hands:**
- Low pairs (33, 22)
- Low suited cards (7♦5♦)
- Unconnected low cards

### Betting Strategy
- **Value Betting**: Bet strong hands to build pot
- **Bluffing**: Occasionally bet weak hands to win
- **Pot Odds**: Compare cost to call vs. pot size
- **Position**: Use late position advantage

---

## Understanding the UI

### Player Display
- **Avatar**: Player position
- **Name**: "You" or "AI Bot X"
- **Chips**: Current chip count
- **Cards**: Your cards visible, AI cards hidden
- **Bet**: Current bet amount
- **Badges**: D (Dealer), SB (Small Blind), BB (Big Blind)
- **Highlight**: Active player has colored border

### Community Cards
- Center of table
- 5 cards max (flop: 3, turn: 1, river: 1)
- Face down until revealed

### Pot Display
- Shows total chips in pot
- Updates after each action
- Awarded to winner at showdown

### Game Stats (Top Bar)
- Games Played
- Wins
- Losses
- Current Streak

### Dealer Commentary
- Sassy AI dealer "Cassie"
- Provides game narration
- Comments on actions and outcomes

---

## Common Scenarios

### Example 1: Strong Hand
```
You have: A♠ A♥ (Pocket Aces)
Flop: K♦ 7♣ 2♠

Strategy: RAISE
- You have the strongest starting hand
- Flop doesn't improve others likely
- Build the pot with your strong hand
```

### Example 2: Drawing Hand
```
You have: 9♥ 8♥
Flop: 10♠ 7♦ 2♥

Strategy: CALL (if cheap) or CHECK
- You have a straight draw (need J or 6)
- Also have backdoor flush draw (need 2 more hearts)
- Don't commit too many chips yet
```

### Example 3: Missed Flop
```
You have: K♣ Q♦
Flop: 9♠ 5♠ 3♥
Opponent bets big

Strategy: FOLD
- No pair, no draw
- Opponent showing strength
- Save your chips for better spots
```

---

## End of Hand

After showdown, you'll see:
- Winner announcement
- Winning hand type
- Cards revealed
- Pot amount
- Your chip change (+/-)

Click **"Play Again"** to start next hand or **"Exit"** to end session.

---

## Game Over

Game ends when:
- You lose all chips (bust out)
- All AI players lose chips (you win!)

Options:
- Start new game
- Adjust number of AI opponents
- Your session stats are displayed

---

## Technical Features

### Auto-Save
- Game automatically saves to browser
- Resume where you left off after closing
- No account needed (MVP version)

### AI Opponents
- Make realistic decisions
- Consider hand strength
- Calculate pot odds
- Occasionally bluff
- Varied play styles

### Responsive Design
- Works on desktop browsers
- Optimized for 1920x1080 and above
- Touch-friendly controls

---

## Keyboard Shortcuts

Currently, all actions require clicking. Future versions may include:
- `F` - Fold
- `C` - Call/Check
- `R` - Raise
- `H` - Get Hint

---

## Troubleshooting

### Game Won't Start
- Clear browser cache
- Check browser console for errors
- Ensure JavaScript enabled

### Game State Lost
- IndexedDB may be disabled
- Check browser privacy settings
- Try different browser

### AI Taking Too Long
- Normal delay is 1.5 seconds per action
- Ensures readable game flow
- Not a bug, by design

### Cards Not Displaying
- Check image assets loaded
- Refresh page
- Clear browser cache

---

## Advanced Play

### Pot Odds Example
```
Pot: $200
Call: $50
Pot Odds: 50 / (200 + 50) = 20%

If you estimate >20% chance to win, call is profitable.
```

### Expected Value (EV)
```
Win 30% of time: $300 gain
Lose 70% of time: $100 loss

EV = (0.3 × 300) - (0.7 × 100) = $90 - $70 = +$20
Positive EV = good call
```

---

## Tips for Beginners

1. **Be Patient**: Fold weak hands, wait for good ones
2. **Watch Position**: Play more hands in late position
3. **Observe Patterns**: Notice how AI bots play
4. **Manage Bankroll**: Don't risk all chips on one hand
5. **Practice**: Learn from each hand

---

## Tips for Advanced Players

1. **Mix Up Play**: Don't be predictable
2. **Bluff Strategically**: Choose good spots
3. **Value Bet**: Extract maximum from winning hands
4. **Read Board**: Consider possible hands for opponents
5. **Adjust to Opponents**: Exploit AI patterns

---

## Session Statistics

Currently tracked per browser session:
- Games Played: Total games started
- Wins: Games where you eliminated all opponents
- Losses: Games where you were eliminated
- Current Streak: Consecutive wins

Note: Section 3.1 (persistent user accounts) is optional for future release.

---

## Known Limitations (MVP)

1. **No All-In Side Pots**: Players can't call with less than required bet
2. **Basic AI**: Rule-based, not LLM-powered (yet)
3. **No Hand History**: Can't review previous hands
4. **Single Table**: Can't play multiple tables simultaneously
5. **Local Only**: No online multiplayer (yet)

---

## Future Features (Roadmap)

### Section 3.4 - AI Dealer & Hints
- Real-time LLM commentary
- Strategic hint system
- Personality-driven narration

### Section 3.1 - User Management (Optional)
- Account creation
- Persistent statistics
- Leaderboards
- Achievement system

### Beyond MVP
- Side pot calculations
- Tournament mode
- Hand history replay
- Mobile app version
- Online multiplayer

---

## Support & Feedback

This is an MVP implementation focusing on core gameplay (Section 3.3).

For technical details, see `IMPLEMENTATION_NOTES.md`

Enjoy the game! 🎰♠️♥️♣️♦️