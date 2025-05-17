"use client";

import { useState } from "react";
import GameLayout from "@/components/ui/game-layout";
import styles from "./page.module.css";

type Choice = "rock" | "paper" | "scissors" | null;
type Result = "win" | "lose" | "draw" | null;

export default function RockPaperScissors() {
  const [playerChoice, setPlayerChoice] = useState<Choice>(null);
  const [computerChoice, setComputerChoice] = useState<Choice>(null);
  const [result, setResult] = useState<Result>(null);
  const [playerScore, setPlayerScore] = useState(0);
  const [computerScore, setComputerScore] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const choices: Choice[] = ["rock", "paper", "scissors"];

  const makeChoice = (choice: Choice) => {
    if (isAnimating) return;

    setIsAnimating(true);
    setPlayerChoice(choice);
    setComputerChoice(null);
    setResult(null);

    // Simulate computer "thinking"
    let timer = 0;
    const animationInterval = setInterval(() => {
      setComputerChoice(choices[Math.floor(Math.random() * 3)]);
      timer += 100;

      if (timer > 1000) {
        clearInterval(animationInterval);
        const computer = choices[Math.floor(Math.random() * 3)];
        setComputerChoice(computer);
        const roundResult = determineWinner(choice, computer);
        setResult(roundResult);

        // Update scores
        if (roundResult === "win") {
          setPlayerScore((prev) => prev + 1);
        } else if (roundResult === "lose") {
          setComputerScore((prev) => prev + 1);
        }

        setIsAnimating(false);
      }
    }, 100);
  };

  const determineWinner = (player: Choice, computer: Choice): Result => {
    if (player === computer) return "draw";
    if (
      (player === "rock" && computer === "scissors") ||
      (player === "paper" && computer === "rock") ||
      (player === "scissors" && computer === "paper")
    ) {
      return "win";
    }
    return "lose";
  };

  const resetGame = () => {
    setPlayerChoice(null);
    setComputerChoice(null);
    setResult(null);
    setPlayerScore(0);
    setComputerScore(0);
  };

  const getResultMessage = () => {
    if (result === "win") return "You win!";
    if (result === "lose") return "Computer wins!";
    if (result === "draw") return "It's a draw!";
    return "Choose your move!";
  };

  const getChoiceEmoji = (choice: Choice) => {
    if (choice === "rock") return "✊";
    if (choice === "paper") return "✋";
    if (choice === "scissors") return "✌️";
    return "❓";
  };

  return (
    <GameLayout
      title="Rock Paper Scissors"
      description="Classic game of chance - can you beat the computer?"
    >
      <div className={styles.container}>
        <div className={styles.scoreBoard}>
          <div className={styles.scoreItem}>
            <span className={styles.scoreLabel}>You</span>
            <span className={styles.scoreValue}>{playerScore}</span>
          </div>
          <div className={styles.scoreItem}>
            <span className={styles.scoreLabel}>Computer</span>
            <span className={styles.scoreValue}>{computerScore}</span>
          </div>
        </div>

        <div className={styles.gameArea}>
          <div className={styles.hands}>
            <div className={styles.hand}>
              <div
                className={`${styles.choiceDisplay} ${
                  playerChoice ? styles.selected : ""
                }`}
              >
                {playerChoice ? (
                  <span className={styles.emoji}>
                    {getChoiceEmoji(playerChoice)}
                  </span>
                ) : (
                  <span className={styles.placeholder}>?</span>
                )}
              </div>
              <span className={styles.handLabel}>You</span>
            </div>

            <div className={styles.versus}>VS</div>

            <div className={styles.hand}>
              <div
                className={`${styles.choiceDisplay} ${
                  isAnimating ? styles.thinking : ""
                } ${computerChoice ? styles.selected : ""}`}
              >
                {computerChoice ? (
                  <span className={styles.emoji}>
                    {getChoiceEmoji(computerChoice)}
                  </span>
                ) : (
                  <span className={styles.placeholder}>?</span>
                )}
              </div>
              <span className={styles.handLabel}>Computer</span>
            </div>
          </div>

          <div
            className={`${styles.resultMessage} ${
              result === "win"
                ? styles.win
                : result === "lose"
                ? styles.lose
                : result === "draw"
                ? styles.draw
                : ""
            }`}
          >
            {getResultMessage()}
          </div>

          <div className={styles.choices}>
            {choices.map((choice) => (
              <button
                key={choice}
                className={styles.choiceButton}
                onClick={() => makeChoice(choice)}
                disabled={isAnimating}
              >
                <span className={styles.buttonEmoji}>
                  {getChoiceEmoji(choice)}
                </span>
                <span className={styles.buttonLabel}>{choice}</span>
              </button>
            ))}
          </div>

          <button className={styles.resetButton} onClick={resetGame}>
            Reset Game
          </button>
        </div>
      </div>
    </GameLayout>
  );
}
