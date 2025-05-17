# 8-BIT ARCADE

![8-BIT ARCADE Logo](public/file.svg)

A retro-styled arcade gaming platform built with Next.js and React. Experience the nostalgia of classic arcade games with modern web technology.

> 🎮 A collection of 10 retro-styled arcade games built with Next.js, React, and TypeScript. Features 8-bit UI design, game carousel, background music player, and fully responsive gameplay.

🔗 **GitHub Repository**: [https://github.com/aacronicer/gaming.git](https://github.com/aacronicer/gaming.git)

## 🎮 Available Games

This arcade features 10 classic-style games:

- **🎮 Rock Paper Scissors** - Classic rock-paper-scissors game vs computer with outcome logic
- **🔢 Number Guess** - Guess a number with hints and win message
- **🎲 Dice Roller** - Roll dice with image output and animation
- **🃏 Memory Match** - Match cards with score tracker and level up
- **❓ Trivia Quiz** - Answer questions with timed rounds and score summary
- **📝 Word Unscramble** - Unscramble words with hint button and points
- **🧩 Grid Puzzle** - Grid-based puzzle with tile state and win detection
- **👆 Idle Clicker** - Idle clicker with upgrades and click/second logic
- **⚔️ Card Battle** - Card battle game with health bars and turn logic
- **⚡ Reaction Game** - Reaction speed game with ghost replay of top score

## ✨ Features

- **Retro Arcade UI** - Authentic 8-bit style interface with scanlines and arcade cabinet design
- **Game Carousel** - Easily browse and select games with an interactive carousel
- **Background Music** - Enjoy retro game music with the built-in music player
- **Fully Responsive** - Play on any device from desktop to mobile
- **Random Game Option** - Can't decide? Let the arcade choose for you!

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or newer)
- [Bun](https://bun.sh/) (v1.0.30 or newer)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/gaming-website.git
   cd gaming-website
   ```

2. Install dependencies:

   ```bash
   bun install
   ```

3. Run the development server:

   ```bash
   bun dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the arcade!

## 🛠️ Built With

- [Next.js 15](https://nextjs.org/) - React framework with App Router
- [React 19](https://react.dev/) - UI library
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Bun](https://bun.sh/) - JavaScript runtime & package manager

## 📁 Project Structure

```
gaming-website/
├── public/            # Static assets
│   ├── audio/         # Game music and sound effects
│   ├── cursors/       # Custom cursor styles
│   └── game-bg/       # Game background images
├── src/
│   ├── app/           # Next.js App Router
│   │   └── games/     # Individual game pages
│   └── components/    # Reusable React components
│       ├── game-components/ # Shared game components
│       └── ui/        # UI components like MusicPlayer
```

## 🎯 Future Enhancements

- High score leaderboards
- User accounts and progress saving
- More games and game customization
- Multiplayer capabilities

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👏 Acknowledgements

- Inspired by classic arcade cabinets of the 80s and 90s
- Game sound effects and music from [source]
- Special thanks to all contributors and testers
