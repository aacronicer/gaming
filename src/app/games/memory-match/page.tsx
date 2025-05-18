"use client";

import { useState, useEffect } from "react";
import GameLayout from "@/components/ui/game-layout";
import styles from "./page.module.css";

// Define card types
interface Card {
  id: number;
  icon: string;
  flipped: boolean;
  matched: boolean;
}

// Array of emoji for cards - removed the duplicate "🎪" icon
const cardIcons = [
  "🎮",
  "👾",
  "🕹️",
  "🎯",
  "🏆",
  "🎲",
  "🃏",
  "🎪",
  "🎨",
  "🎭",
  "🎰",
  "🧩",
  "🎼",
  "🎹",
  "📱",
  "💻",
  "🖥️",
  "🎧",
  "📷",
  "📺",
  "🎬",
  "💿",
  "🔋",
  "📡",
  "🎸",
  "🎮",
  "🏈",
  "⚽",
  "🏀",
  "🎾",
  "🎱",
  "🏓",
];

export default function MemoryMatch() {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<number>(0);
  const [moves, setMoves] = useState<number>(0);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [level, setLevel] = useState<number>(1);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Grid size based on level
  const gridSize = level === 1 ? 4 : level === 2 ? 6 : 8;
  const pairsToMatch = Math.pow(gridSize, 2) / 2;

  // Initialize game
  useEffect(() => {
    initializeGame();
  }, [level]);

  // Initialize game cards
  const initializeGame = () => {
    const pairs = pairsToMatch;
    const selectedIcons = cardIcons.slice(0, pairs);

    // Create pairs of cards
    let newCards: Card[] = [];
    selectedIcons.forEach((icon, index) => {
      // Create two cards for each icon (a pair)
      newCards.push({ id: index * 2, icon, flipped: false, matched: false });
      newCards.push({ id: index * 2 + 1, icon, flipped: false, matched: false });
    });

    // Shuffle cards
    newCards = shuffleArray(newCards);

    // Reset game state
    setCards(newCards);
    setFlippedCards([]);
    setMatchedPairs(0);
    setMoves(0);
    setGameOver(false);
    setIsProcessing(false);
  };

  // Fisher-Yates shuffle algorithm
  const shuffleArray = (array: Card[]): Card[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  // Handle card click
  const handleCardClick = (id: number) => {
    // Ignore clicks if there are already two cards flipped, card is already flipped or matched, or we're processing
    if (
      isProcessing ||
      flippedCards.length === 2 ||
      cards.find((card) => card.id === id)?.flipped ||
      cards.find((card) => card.id === id)?.matched
    ) {
      return;
    }

    // Flip the card
    const updatedCards = cards.map((card) =>
      card.id === id ? { ...card, flipped: true } : card
    );
    setCards(updatedCards);

    // Add to flipped cards
    const newFlippedCards = [...flippedCards, id];
    setFlippedCards(newFlippedCards);

    // If two cards are flipped, check for match
    if (newFlippedCards.length === 2) {
      setIsProcessing(true);
      setMoves((prevMoves) => prevMoves + 1);

      const [firstId, secondId] = newFlippedCards;
      const firstCard = updatedCards.find((card) => card.id === firstId);
      const secondCard = updatedCards.find((card) => card.id === secondId);

      if (firstCard?.icon === secondCard?.icon) {
        // Match!
        setTimeout(() => {
          // Use the functional update form to ensure we're working with the latest state
          setCards((prevCards) =>
            prevCards.map((card) =>
              card.id === firstId || card.id === secondId
                ? { ...card, matched: true }
                : card
            )
          );

          setFlippedCards([]);

          // Update matched pairs count
          const newMatchedPairs = matchedPairs + 1;
          setMatchedPairs(newMatchedPairs);

          // Check if game is over
          if (newMatchedPairs === pairsToMatch) {
            setGameOver(true);
          }

          setIsProcessing(false);
        }, 500);
      } else {
        // No match, flip cards back
        setTimeout(() => {
          setCards((prevCards) =>
            prevCards.map((card) =>
              card.id === firstId || card.id === secondId
                ? { ...card, flipped: false }
                : card
            )
          );

          setFlippedCards([]);
          setIsProcessing(false);
        }, 1000);
      }
    }
  };

  // Handle level up
  const handleNextLevel = () => {
    if (level < 3) {
      setLevel(level + 1);
    } else {
      // Reset to level 1 if at max level
      setLevel(1);
    }
  };

  // Restart current level
  const handleRestart = () => {
    initializeGame();
  };

  // Calculate card size based on grid
  const getCardSize = () => {
    if (gridSize === 4) return "75px"; // Smaller for Level 1
    if (gridSize === 6) return "65px"; // Even smaller for Level 2
    return "55px"; // Smallest for Level 3
  };

  return (
    <GameLayout title="Memory Match" description="Match the pairs of cards">
      <div className={styles.container}>
        <div className={styles.gameInfo}>
          <div className={styles.levelInfo}>
            Level: {level} | Cards: {gridSize}x{gridSize}
          </div>
          <div className={styles.scoreInfo}>
            <span>
              Pairs: {matchedPairs}/{pairsToMatch}
            </span>
            <span>Moves: {moves}</span>
          </div>
        </div>

        <div
          className={`${styles.gameBoard} ${
            gridSize === 4
              ? styles.grid4
              : gridSize === 6
              ? styles.grid6
              : styles.grid8
          }`}
          style={{
            gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
            gap: gridSize > 4 ? "5px" : "8px",
          }}
        >
          {cards.map((card) => (
            <div
              key={card.id}
              className={`${styles.card} ${
                card.flipped ? styles.flipped : ""
              } ${card.matched ? styles.matched : ""}`}
              onClick={() => handleCardClick(card.id)}
              style={{
                width: getCardSize(),
                height: getCardSize(),
                fontSize: gridSize > 6 ? "0.8rem" : "1rem",
              }}
            >
              <div className={styles.cardInner}>
                <div className={styles.cardFront}>?</div>
                <div className={styles.cardBack}>
                  <span>{card.icon}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {gameOver && (
          <div className={styles.gameOver}>
            <div className={styles.gameOverContent}>
              <h2>Level Complete!</h2>
              <p>
                You completed level {level} in {moves} moves!
              </p>
              <div className={styles.gameOverButtons}>
                {level < 3 ? (
                  <button
                    className={styles.nextLevelButton}
                    onClick={handleNextLevel}
                  >
                    Next Level
                  </button>
                ) : (
                  <button
                    className={styles.nextLevelButton}
                    onClick={() => setLevel(1)}
                  >
                    Start Over (Level 1)
                  </button>
                )}
                <button
                  className={styles.restartButton}
                  onClick={handleRestart}
                >
                  Replay Level
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </GameLayout>
  );
}
