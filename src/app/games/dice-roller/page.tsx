"use client";

import { useState } from "react";
import GameLayout from "@/components/ui/game-layout";
import styles from "./page.module.css";

type DiceType = 4 | 6 | 8 | 10 | 12 | 20;

interface DiceRoll {
  type: DiceType;
  value: number;
  id: string;
}

export default function DiceRoller() {
  const [dice, setDice] = useState<DiceRoll[]>([]);
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const [total, setTotal] = useState<number>(0);

  const diceTypes: DiceType[] = [4, 6, 8, 10, 12, 20];

  const addDie = (type: DiceType) => {
    const newDie: DiceRoll = {
      type,
      value: 1,
      id: `die-${Date.now()}-${Math.random()}`,
    };

    setDice((prevDice) => [...prevDice, newDie]);
  };

  const removeDie = (id: string) => {
    setDice((prevDice) => prevDice.filter((die) => die.id !== id));
  };

  const rollDice = () => {
    if (dice.length === 0) return;

    setIsRolling(true);

    // Simulate rolling animation
    const animationDuration = 1000; // 1 second
    const framesPerSecond = 10;
    const totalFrames = (animationDuration / 1000) * framesPerSecond;
    let frameCount = 0;

    const animateRoll = setInterval(() => {
      setDice((prevDice) =>
        prevDice.map((die) => ({
          ...die,
          value: Math.floor(Math.random() * die.type) + 1,
        }))
      );

      frameCount++;

      if (frameCount >= totalFrames) {
        clearInterval(animateRoll);
        setIsRolling(false);

        // Calculate final values and total
        setDice((prevDice) => {
          const finalDice = prevDice.map((die) => ({
            ...die,
            value: Math.floor(Math.random() * die.type) + 1,
          }));

          const newTotal = finalDice.reduce((sum, die) => sum + die.value, 0);
          setTotal(newTotal);

          return finalDice;
        });
      }
    }, 1000 / framesPerSecond);
  };

  const clearDice = () => {
    setDice([]);
    setTotal(0);
  };

  // Render the face of the die based on type and value
  const renderDieFace = (type: DiceType, value: number) => {
    // For D6, we'll use standard dice faces
    if (type === 6) {
      return (
        <div className={`${styles.dieFace} ${styles.d6}`}>
          {[...Array(value)].map((_, i) => (
            <span key={i} className={styles.dot}></span>
          ))}
        </div>
      );
    }

    // For other dice, just show the number
    return (
      <div className={`${styles.dieFace} ${styles["d" + type]}`}>
        <span className={styles.dieValue}>{value}</span>
      </div>
    );
  };

  return (
    <GameLayout
      title="Dice Roller"
      description="Roll virtual dice with animations"
    >
      <div className={styles.container}>
        <div className={styles.controls}>
          <div className={styles.diceButtons}>
            {diceTypes.map((type) => (
              <button
                key={type}
                className={styles.diceButton}
                onClick={() => addDie(type)}
              >
                Add D{type}
              </button>
            ))}
          </div>

          <div className={styles.actionButtons}>
            <button
              className={`${styles.rollButton} ${
                dice.length === 0 ? styles.disabled : ""
              }`}
              onClick={rollDice}
              disabled={dice.length === 0 || isRolling}
            >
              {isRolling ? "Rolling..." : "Roll Dice"}
            </button>

            <button
              className={styles.clearButton}
              onClick={clearDice}
              disabled={dice.length === 0 || isRolling}
            >
              Clear All
            </button>
          </div>
        </div>

        <div
          className={`${styles.diceArea} ${isRolling ? styles.rolling : ""}`}
        >
          {dice.length > 0 ? (
            dice.map((die) => (
              <div key={die.id} className={styles.dieContainer}>
                {renderDieFace(die.type, die.value)}
                <span className={styles.dieType}>D{die.type}</span>
                <button
                  className={styles.removeButton}
                  onClick={() => removeDie(die.id)}
                  disabled={isRolling}
                >
                  ×
                </button>
              </div>
            ))
          ) : (
            <p className={styles.emptyMessage}>Add dice to get started</p>
          )}
        </div>

        {dice.length > 0 && (
          <div className={styles.resultArea}>
            <div className={styles.total}>
              <span>Total:</span>
              <span className={styles.totalValue}>{total}</span>
            </div>
          </div>
        )}
      </div>
    </GameLayout>
  );
}
