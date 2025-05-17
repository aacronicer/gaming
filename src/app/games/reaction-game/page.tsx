"use client";

import { useState, useEffect, useRef } from "react";
import GameLayout from "@/components/ui/game-layout";
import styles from "./page.module.css";

// Game states
type GameState = "waiting" | "ready" | "click" | "finished" | "tooSoon";

export default function ReactionGame() {
  // Game state
  const [gameState, setGameState] = useState<GameState>("waiting");
  const [startTime, setStartTime] = useState<number | null>(null);
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const [countdown, setCountdown] = useState<number>(3);

  // Refs for timers
  const readyTimerRef = useRef<NodeJS.Timeout | null>(null);
  const gameTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Store current game state in a ref to avoid stale closures in timeouts
  const currentGameStateRef = useRef<GameState>("waiting");

  // Update ref whenever gameState changes
  useEffect(() => {
    currentGameStateRef.current = gameState;
  }, [gameState]);

  // Prepare the game when user starts
  const startGame = () => {
    // Reset all states for a new game
    setGameState("ready");
    setReactionTime(null);
    setStartTime(null);
    setCountdown(3);

    // Clear any existing timers
    if (readyTimerRef.current) clearTimeout(readyTimerRef.current);
    if (gameTimerRef.current) clearTimeout(gameTimerRef.current);
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);

    // Start countdown
    countdownTimerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          // When countdown reaches 0, start the actual game
          if (countdownTimerRef.current)
            clearInterval(countdownTimerRef.current);
          prepareClickPhase();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Set up the random delay before showing the target
  const prepareClickPhase = () => {
    // Random delay between 1-5 seconds
    const randomDelay = Math.floor(Math.random() * 4000) + 1000;

    // After countdown, set a timer for when to show the target
    readyTimerRef.current = setTimeout(() => {
      setGameState("click");
      setStartTime(Date.now());

      // Safety timer: if user doesn't click within 10 seconds, end the game
      gameTimerRef.current = setTimeout(() => {
        // Use ref to check current state, not the stale closure
        if (currentGameStateRef.current === "click") {
          setGameState("finished");
          setReactionTime(10000); // Max 10 seconds
        }
      }, 10000);
    }, randomDelay);
  };

  // Handle user click during game
  const handleClick = () => {
    // Handle click based on current game state
    switch (gameState) {
      case "waiting":
        // Start the game if it's waiting
        startGame();
        break;

      case "ready":
        // If they click during the ready phase (too soon)
        if (readyTimerRef.current) clearTimeout(readyTimerRef.current);
        if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
        setGameState("tooSoon");
        break;

      case "click":
        // Calculate reaction time
        if (startTime) {
          const endTime = Date.now();
          const timeTaken = endTime - startTime;
          setReactionTime(timeTaken);

          // Clear game timer
          if (gameTimerRef.current) clearTimeout(gameTimerRef.current);

          // Show results
          setGameState("finished");
        }
        break;

      case "finished":
      case "tooSoon":
        // Restart the game
        startGame();
        break;
    }
  };

  // Clean up timers when unmounting
  useEffect(() => {
    return () => {
      if (readyTimerRef.current) clearTimeout(readyTimerRef.current);
      if (gameTimerRef.current) clearTimeout(gameTimerRef.current);
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    };
  }, []);

  // Get appropriate classes and text based on game state
  const getTargetClass = () => {
    switch (gameState) {
      case "waiting":
        return styles.waiting;
      case "ready":
        return styles.ready;
      case "click":
        return styles.click;
      case "finished":
        return styles.finished;
      case "tooSoon":
        return styles.tooSoon;
      default:
        return "";
    }
  };

  const getTargetText = () => {
    switch (gameState) {
      case "waiting":
        return "Start";
      case "ready":
        return countdown > 0 ? countdown : "Wait...";
      case "click":
        return "Click Now!";
      case "finished":
        return reactionTime !== null ? `${reactionTime} ms` : "";
      case "tooSoon":
        return "Too Soon!";
      default:
        return "";
    }
  };

  const getInstructions = () => {
    switch (gameState) {
      case "waiting":
        return "Click the target to begin";
      case "ready":
        return "Wait for the target to turn green, then click as fast as you can!";
      case "click":
        return "Click now!";
      case "finished":
        return "Click to play again";
      case "tooSoon":
        return "You clicked too early! Click to try again";
      default:
        return "";
    }
  };

  return (
    <GameLayout title="Reaction Test" description="Test your reaction speed">
      <div className={styles.container}>
        <div className={styles.instructions}>{getInstructions()}</div>

        <div className={styles.gameArea}>
          <div
            className={`${styles.target} ${getTargetClass()}`}
            onClick={handleClick}
          >
            <span className={styles.targetText}>{getTargetText()}</span>
          </div>
        </div>
      </div>
    </GameLayout>
  );
}
