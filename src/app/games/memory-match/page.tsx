"use client";

import { useState, useEffect } from "react";
import GameLayout from "@/components/ui/game-layout";
import styles from "./page.module.css";

interface Card {
  id: number;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
}

interface Level {
  gridSize: number;
  name: string;
}

export default function MemoryMatch() {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [currentLevel, setCurrentLevel] = useState(0);

  const levels: Level[] = [
    { gridSize: 4, name: "Easy" }, // 4x4 grid (8 pairs)
    { gridSize: 6, name: "Medium" }, // 6x6 grid (18 pairs, correct calculation: 36/2 = 18 pairs)
    { gridSize: 8, name: "Hard" }, // 8x8 grid (32 pairs)
  ];

  const emojis = [
    "🐶",
    "🐱",
    "🐭",
    "🐹",
    "🐰",
    "🦊",
    "🐻",
    "🐼",
    "🐨",
    "🐯",
    "🦁",
    "🐮",
    "🐷",
    "🐸",
    "🐵",
    "🐔",
    "🐧",
    "🐦",
    "🦆",
    "🦅",
    "🦉",
    "🦇",
    "🐺",
    "🐗",
    "🐴",
    "🦄",
    "🐝",
    "🐛",
    "🦋",
    "🐌",
    "🐞",
    "🐜",
    "🦟",
    "🦗",
    "🕷️",
    "🦂",
    "🦕",
    "🦖",
    "🦎",
    "🐙",
    "🦑",
    "🦐",
    "🦞",
    "🦀",
    "🐠",
    "🐡",
    "🐬",
    "🐳",
    "🐊",
    "🐆",
  ];

  useEffect(() => {
    initializeGame();
  }, [currentLevel]);

  const initializeGame = () => {
    const gridSize = levels[currentLevel].gridSize;
    const totalPairs = (gridSize * gridSize) / 2;

    // Select random emojis for this level
    const selectedEmojis = [...emojis]
      .sort(() => 0.5 - Math.random())
      .slice(0, totalPairs);

    // Create pairs of cards
    const cardPairs = [...selectedEmojis, ...selectedEmojis]
      .map((emoji, index) => ({
        id: index,
        emoji,
        isFlipped: false,
        isMatched: false,
      }))
      .sort(() => 0.5 - Math.random());

    setCards(cardPairs);
    setFlippedCards([]);
    setMoves(0);
    setGameOver(false);
  };

  const handleCardClick = (id: number) => {
    // Don't allow more than 2 cards to be flipped at once or clicking matched/already flipped cards
    if (flippedCards.length >= 2) return;

    const clickedCard = cards.find((card) => card.id === id);
    if (!clickedCard || clickedCard.isFlipped || clickedCard.isMatched) return;

    // Flip the card
    const updatedCards = cards.map((card) =>
      card.id === id ? { ...card, isFlipped: true } : card
    );

    const updatedFlippedCards = [...flippedCards, id];

    setCards(updatedCards);
    setFlippedCards(updatedFlippedCards);

    // If two cards are flipped, check for a match
    if (updatedFlippedCards.length === 2) {
      setMoves(moves + 1);

      const [firstId, secondId] = updatedFlippedCards;
      const firstCard = updatedCards.find((card) => card.id === firstId);
      const secondCard = updatedCards.find((card) => card.id === secondId);

      if (firstCard && secondCard && firstCard.emoji === secondCard.emoji) {
        // Match found!
        setTimeout(() => {
          const matchedCards = updatedCards.map((card) =>
            card.id === firstId || card.id === secondId
              ? { ...card, isMatched: true }
              : card
          );

          setCards(matchedCards);
          setFlippedCards([]);
          setScore(score + 100);

          // Check if all cards are matched (game over)
          if (matchedCards.every((card) => card.isMatched)) {
            setGameOver(true);
          }
        }, 500);
      } else {
        // No match - Fix: Use the specific IDs from updatedFlippedCards instead of flippedCards
        setTimeout(() => {
          const resetFlippedCards = updatedCards.map((card) =>
            card.id === firstId || card.id === secondId
              ? { ...card, isFlipped: false }
              : card
          );

          setCards(resetFlippedCards);
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  const handleNextLevel = () => {
    if (currentLevel < levels.length - 1) {
      // Keep the accumulated score when advancing to next level
      const currentScore = score;
      setCurrentLevel(currentLevel + 1);

      // We'll reset other state in initializeGame, but
      // need to preserve the score across levels
      setTimeout(() => {
        setScore(currentScore);
      }, 100);
    }
  };

  const handleRestart = () => {
    initializeGame();
  };

  return (
    <GameLayout title="Memory Match" description="Match pairs of cards to win">
      <div className={styles.container}>
        <div className={styles.gameInfo}>
          <div className={styles.levelInfo}>
            <span>Level: {levels[currentLevel].name}</span>
          </div>
          <div className={styles.scoreInfo}>
            <span>Score: {score}</span>
            <span>Moves: {moves}</span>
          </div>
        </div>

        <div
          className={`${styles.gameBoard} ${
            styles["grid" + levels[currentLevel].gridSize]
          }`}
          style={{
            gridTemplateColumns: `repeat(${levels[currentLevel].gridSize}, 1fr)`,
          }}
        >
          {cards.map((card) => (
            <div
              key={card.id}
              className={`${styles.card} ${
                card.isFlipped || card.isMatched ? styles.flipped : ""
              } ${card.isMatched ? styles.matched : ""}`}
              onClick={() => handleCardClick(card.id)}
            >
              <div className={styles.cardInner}>
                <div className={styles.cardFront}></div>
                <div className={styles.cardBack}>
                  <span>{card.emoji}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {gameOver && (
          <div className={styles.gameOver}>
            <div className={styles.gameOverContent}>
              <h2>Level Complete!</h2>
              <p>Score: {score}</p>
              <p>Moves: {moves}</p>

              <div className={styles.gameOverButtons}>
                {currentLevel < levels.length - 1 ? (
                  <button
                    className={styles.nextLevelButton}
                    onClick={handleNextLevel}
                  >
                    Next Level
                  </button>
                ) : (
                  <p>You completed all levels!</p>
                )}
                <button
                  className={styles.restartButton}
                  onClick={handleRestart}
                >
                  Restart Level
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </GameLayout>
  );
}
