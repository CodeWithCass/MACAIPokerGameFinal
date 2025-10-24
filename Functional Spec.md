# Functional Specification: Project MAC (Master of All Cards)

**Version:** 1.1
**Date:** 2024-06-11
**Status:** Approved
**Change Log:** Made Section 3.1 (User Management & Dashboard) optional.

---

## 1. Introduction

### 1.1. Project Overview

Project MAC is a web-based, single-player Texas Hold'em poker experience. The player competes against one or more AI-controlled opponents. The core differentiator is an integrated AI Dealer that provides real-time, sassy commentary and strategic hints, creating an engaging and dynamic atmosphere.

### 1.2. Goals

- **Primary Goal:** Deliver a fast, functional, and flashy mini poker game.
- **AI Showstopper:** Integrate an LLM (GPT/Gemini) to power a charismatic AI Dealer for narration and coaching.
- **Architectural Goal:** Build a codebase that is extensible to support future multi-human player features.

## 2. System Overview

### 2.1. Actors

- **Player:** The human user. Can join a game, make betting decisions, and receive AI commentary.
- **AI Dealer:** A system actor responsible for shuffling, dealing cards, managing the pot, and providing LLM-generated narration.
- **AI Bot(s):** One or more non-human players that make automated decisions (fold, call, raise) based on game state and hand strength.

### 2.2. Tech Stack

- **Frontend:** React + Typescript
- **Backend:** Supabase
- **AI Integration:** OpenAI GPT API or Google Gemini API
- **Assets:** Attached

## 3. Functional Requirements

### [OPTIONAL] 3.1. User Management & Dashboard

_This section is considered a post-MVP feature. It is not required for the initial launch but should be architecturally planned for._
**FR-1: User Registration/Login**

- The system shall allow a user to create a new account using a unique username and password.
- The system shall allow a returning user to log in.

**FR-2: Player Dashboard**

- Upon login, the user shall be presented with a dashboard.
- The dashboard shall display:
  - Player's username.
  - Current chip count.
  - Win/Loss record (e.g., Games Played: X, Wins: Y, Losses: Z).
  - A button to "Join a New Game".

### 3.2. Game Setup & Lobby

**FR-3: Game Lobby**

- Upon starting a new game, the player shall select the number of AI opponents (1 to 3).
- The system shall initialize a new Texas Hold'em table with the player and the selected number of AI bots.
- Each player (human and AI) shall start with a predefined number of chips (e.g., 1500 chips).

**FR-4: Blinds Management**

- The system shall assign a "Dealer Button" (D), "Small Blind" (SB), and "Big Blind" (BB) positions to the players.
- The blinds shall automatically be posted by the respective players at the start of each hand.
- The blinds positions shall rotate clockwise after each hand.

### 3.3. Core Texas Hold'em Gameplay

**FR-5: Card Dealing**

- The AI Dealer shall shuffle a standard 52-card deck at the beginning of each hand.
- The AI Dealer shall deal two private cards (hole cards) to each player (human and AI).
- The AI Dealer shall deal five community cards in three stages:
  - **The Flop:** Three cards, face up.
  - **The Turn:** One card, face up.
  - **The River:** One card, face up.

**FR-6: Betting Rounds**
The system shall manage four betting rounds, maintaining the pot and enforcing betting rules.

1.  **Pre-Flop:** Betting starts with the player after the Big Blind.
2.  **Post-Flop:** Betting starts with the first player still in the hand to the left of the dealer button.
3.  **Post-Turn:** Betting starts with the first player still in the hand to the left of the dealer button.
4.  **Post-River:** Betting starts with the first player still in the hand to the left of the dealer button.

**FR-7: Player Actions**
During their turn in a betting round, the human player shall be able to:

- **Fold:** Forfeit their hand and any chips they have contributed to the pot.
- **Call:** Match the current highest bet.
- **Raise:** Increase the current highest bet by a valid amount (minimum raise = the big blind).
- **Check:** Bet zero, if no bet is currently required to stay in the hand.

**FR-8: AI Bot Actions**

- AI Bots shall automatically perform an action (Fold, Call, Check, Raise) on their turn based on an algorithm that considers their hole cards, the community cards, pot odds, and betting history.

**FR-9: Hand Evaluation & Showdown**

- At the showdown (after the final betting round), the system shall evaluate the best 5-card poker hand for each player still in the game, using their two hole cards and the five community cards.
- The system shall correctly identify the winning hand(s) based on standard poker hand rankings.
- The pot shall be awarded to the player with the best hand. In case of a tie, the pot shall be split equally.

### 3.4. AI Dealer Narration & Hint System

**FR-10: Context-Aware Narration**

- The AI Dealer shall generate and display LLM-powered commentary at key points in the game, including but not limited to:
  - Start of a new hand.
  - After hole cards are dealt.
  - After each betting round.
  - After the flop, turn, and river are revealed.
  - When a player folds, raises, or makes a notable move.
  - At the showdown, revealing the winner.

**FR-11: Dealer Personality**

- The narration shall be delivered in a "sassy" and charismatic tone, personified as "Cassie," to enhance user engagement.

**FR-12: Strategic Hint System**

- The player shall have a "Get Hint" button available during their turn.
- Upon clicking, the AI Dealer shall provide a strategic suggestion based on the current game state (player's hole cards, community cards, current bet, and stack sizes).
- Hints shall be framed within the "Cassie" personality (e.g., "Well, sugar, if I were you, I'd probably...").

### 3.5. Game Conclusion & Statistics

**FR-13: Hand Conclusion**

- After a hand is complete, a summary screen shall display:
  - The winning player and their hand.
  - The amount won.
  - Updated chip counts for all players.

**FR-14: Session Management**

- The game shall continue until the human player either:
  - Loses all their chips.
  - Wins all the AI chips.
  - Voluntarily exits the game.
- For the MVP, player statistics (win/loss) will be maintained for the current browser session only and will not persist after the window is closed.

## 4. Non-Functional Requirements

- **Performance:** The game should feel responsive. AI narration should have a latency of less than 3 seconds.
- **Usability:** The UI must be intuitive, clearly displaying cards, chips, pot size, and player actions.
- **Reliability:** The game logic for hand evaluation and betting must be 100% accurate.
- **Extensibility:** The system architecture must be modular to allow for the future addition of multi-human player functionality and user management without a complete rewrite.

## 5. Open Questions & Assumptions

- **Assumption:** The initial MVP will not include "all-in" logic or side pots for simplicity. A player can only bet up to their current stack, but if they cannot call a bet, they are forced to fold.
- **Assumption:** The AI Bot logic will be a simplified, rule-based system for the MVP, not a complex LLM-driven strategy.
- **Assumption:** User Management is a post-MVP feature. The MVP will be a single-session experience.
- **Open Question:** What is the specific budget/cost limit for LLM API calls per user session?
