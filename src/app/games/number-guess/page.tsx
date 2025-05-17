"use client";

import { useState, useEffect } from "react";
import GameLayout from "@/components/ui/game-layout";
import styles from "./page.module.css";

export default function NumberGuess() {
  const [targetNumber, setTargetNumber] = useState<number>(0);
  const [guess, setGuess] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [attempts, setAttempts] = useState<number>(0);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [hintShown, setHintShown] = useState<boolean>(false);
  const [maxNumber, setMaxNumber] = useState<number>(100);

  useEffect(() => {
    startNewGame();
  }, []);

  const startNewGame = () => {
    const newTarget = Math.floor(Math.random() * maxNumber) + 1;
    setTargetNumber(newTarget);
    setGuess("");
    setMessage(`Guess a number between 1 and ${maxNumber}`);
    setAttempts(0);
    setGameOver(false);
    setHintShown(false);
  };

  const handleGuess = () => {
    const userGuess = parseInt(guess);

    if (isNaN(userGuess)) {
      setMessage("Please enter a valid number");
      return;
    }

    setAttempts(attempts + 1);

    if (userGuess === targetNumber) {
      setMessage(
        `Congratulations! You guessed the number in ${attempts + 1} attempts!`
      );
      setGameOver(true);
    } else if (userGuess < targetNumber) {
      setMessage("Too low! Try a higher number");
    } else {
      setMessage("Too high! Try a lower number");
    }

    setGuess("");
  };

  const showHint = () => {
    const range = Math.floor(targetNumber / 10);
    const lowerBound = Math.max(1, targetNumber - range);
    const upperBound = Math.min(maxNumber, targetNumber + range);
    setMessage(`Hint: The number is between ${lowerBound} and ${upperBound}`);
    setHintShown(true);
  };

  const increaseMaxNumber = () => {
    setMaxNumber((prevMax) => prevMax + 100);
    startNewGame();
  };

  return (
    <GameLayout
      title="Number Guessing Game"
      description="Guess the number with hints"
    >
      <div className={styles.container}>
        <div className={styles.gameArea}>
          <p className={styles.message}>{message}</p>

          {!gameOver ? (
            <div className={styles.inputArea}>
              <input
                type="number"
                value={guess}
                onChange={(e) => setGuess(e.target.value)}
                className={styles.input}
                placeholder="Enter your guess"
                min="1"
                max={maxNumber}
                onKeyDown={(e) => e.key === "Enter" && handleGuess()}
              />
              <button onClick={handleGuess} className={styles.button}>
                Guess
              </button>

              {!hintShown && (
                <button onClick={showHint} className={styles.hintButton}>
                  Give me a hint
                </button>
              )}
            </div>
          ) : (
            <div className={styles.gameOverArea}>
              <p className={styles.targetNumber}>
                The number was: {targetNumber}
              </p>
              <div className={styles.optionsArea}>
                <button onClick={startNewGame} className={styles.button}>
                  Play Again
                </button>
                <button onClick={increaseMaxNumber} className={styles.button}>
                  Increase Range to {maxNumber + 100}
                </button>
              </div>
            </div>
          )}

          <div className={styles.stats}>
            <p>Attempts: {attempts}</p>
            <p>Range: 1 to {maxNumber}</p>
          </div>
        </div>
      </div>
    </GameLayout>
  );
}
