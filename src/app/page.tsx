"use client";
import Link from "next/link";
import styles from "./page.module.css";
import MusicPlayer from "../components/ui/music-player";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

// Game objects array
const games = [
  {
    id: "rock-paper-scissors",
    title: "Rock Paper Scissors",
    description:
      "Classic rock-paper-scissors game vs computer with outcome logic.",
    icon: "🎮",
  },
  {
    id: "number-guess",
    title: "Number Guess",
    description: "Guess a number with hints and win message.",
    icon: "🔢",
  },
  {
    id: "dice-roller",
    title: "Dice Roller",
    description: "Roll dice with image output and animation.",
    icon: "🎲",
  },
  {
    id: "memory-match",
    title: "Memory Match",
    description: "Match cards with score tracker and level up.",
    icon: "🃏",
  },
  {
    id: "trivia-quiz",
    title: "Trivia Quiz",
    description: "Answer questions with timed rounds and score summary.",
    icon: "❓",
  },
  {
    id: "word-unscramble",
    title: "Word Unscramble",
    description: "Unscramble words with hint button and points.",
    icon: "📝",
  },
  {
    id: "grid-puzzle",
    title: "Grid Puzzle",
    description: "Grid-based puzzle with tile state and win detection.",
    icon: "🧩",
  },
  {
    id: "idle-clicker",
    title: "Idle Clicker",
    description: "Idle clicker with upgrades and click/second logic.",
    icon: "👆",
  },
  {
    id: "card-battle",
    title: "Card Battle",
    description: "Card battle game with health bars and turn logic.",
    icon: "⚔️",
  },
  {
    id: "reaction-game",
    title: "Reaction Game",
    description: "Reaction speed game with ghost replay of top score.",
    icon: "⚡",
  },
];

export default function Home() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const router = useRouter();

  // Generate a continuous array of games for infinite scrolling effect
  const continuousGames = [...games, ...games, ...games]; // Repeat games array three times
  const virtualStartIndex = games.length; // Start from the middle set of games

  // Update currentIndex to add offset for the continuous array
  const actualIndex = virtualStartIndex + (currentIndex % games.length);

  const handlePrevious = () => {
    setCurrentIndex((prev) => prev - 1);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => prev + 1);
  };

  const handleRandomGame = () => {
    const randomIndex = Math.floor(Math.random() * games.length);
    router.push(`/games/${games[randomIndex].id}`);
  };

  // Center the current card and handle infinite scrolling logic
  useEffect(() => {
    if (sliderRef.current && cardRefs.current[actualIndex]) {
      const slider = sliderRef.current;
      const activeCard = cardRefs.current[actualIndex];

      if (activeCard) {
        const cardRect = activeCard.getBoundingClientRect();
        const sliderRect = slider.getBoundingClientRect();

        // Calculate position to center the card
        const scrollPosition =
          activeCard.offsetLeft - sliderRect.width / 2 + cardRect.width / 2;

        slider.scrollTo({
          left: scrollPosition,
          behavior: "smooth",
        });

        // Reset position if we're at the edge of our virtual list
        // This creates the infinite scroll illusion
        if (currentIndex <= -games.length) {
          // If we've gone too far left, jump to the middle set
          setCurrentIndex(0);
        } else if (currentIndex >= games.length) {
          // If we've gone too far right, jump to the middle set
          setCurrentIndex(0);
        }
      }
    }
  }, [currentIndex, actualIndex]);

  return (
    <div className={`${styles.page} scanlines`}>
      <div className={styles.arcadeCabinet}>
        <div className={styles.arcadeHeader}>
          <div className={styles.logoContainer}>
            <h1 className={styles.title}>8-BIT ARCADE</h1>
            <div className={styles.marquee}>
              <div className={styles.marqueeContent}>
                PRESS START TO PLAY • HIGH SCORES AWAIT • COIN UP • PRESS START
                TO PLAY
              </div>
            </div>
          </div>
        </div>

        <main className={styles.main}>
          <p className={styles.description}>SELECT YOUR GAME</p>

          <div className={styles.sliderContainer}>
            <button
              className={`${styles.sliderButton} ${styles.prevButton}`}
              onClick={handlePrevious}
              aria-label="Previous game"
            >
              ◄
            </button>

            <div className={styles.slider} ref={sliderRef}>
              {continuousGames.map((game, index) => (
                <Link
                  href={`/games/${game.id}`}
                  key={`${game.id}-${index}`}
                  className={`${styles.card} ${
                    index === actualIndex ? styles.activeCard : ""
                  }`}
                  ref={(el) => {
                    cardRefs.current[index] = el;
                  }}
                >
                  <div className={styles.cardInner}>
                    <div className={styles.gameImageContainer}>
                      <div className={styles.iconDisplay}>{game.icon}</div>
                    </div>
                    <div className={styles.gameTitle}>
                      <h2>{game.title}</h2>
                    </div>
                    <div className={styles.gameInfo}>
                      <p>{game.description}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <button
              className={`${styles.sliderButton} ${styles.nextButton}`}
              onClick={handleNext}
              aria-label="Next game"
            >
              ►
            </button>
          </div>

          <div className={styles.randomGameContainer}>
            <button
              className={styles.randomGameButton}
              onClick={handleRandomGame}
              aria-label="Play random game"
            >
              <span className={styles.randomIcon}>🎲</span>
              RANDOM GAME
            </button>
          </div>
        </main>

        <footer className={styles.footer}>
          <div className={styles.controls}>
            <div className={styles.joystick}></div>
            <div className={styles.buttonGroup}>
              <div className={styles.button}></div>
              <div className={styles.button}></div>
            </div>
          </div>
          <p className={styles.copyright}>© 2025 8-BIT ARCADE</p>
        </footer>
      </div>

      <MusicPlayer />
    </div>
  );
}
