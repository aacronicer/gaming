"use client";

import { useState, useEffect, useCallback } from "react";
import GameLayout from "@/components/ui/game-layout";
import styles from "./page.module.css";

interface Tile {
  id: number;
  value: number;
  position: number;
}

export default function GridPuzzle() {
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [emptyPosition, setEmptyPosition] = useState<number>(0);
  const [gridSize, setGridSize] = useState<number>(3); // 3x3 grid by default
  const [moves, setMoves] = useState<number>(0);
  const [isComplete, setIsComplete] = useState<boolean>(false);
  const [timer, setTimer] = useState<number>(0);
  const [timerActive, setTimerActive] = useState<boolean>(false);
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">(
    "easy"
  );

  // Define resetPuzzle function first
  const resetPuzzle = useCallback(() => {
    const totalTiles = gridSize * gridSize - 1;
    const initialTiles: Tile[] = Array.from({ length: totalTiles }, (_, i) => ({
      id: i + 1,
      value: i + 1,
      position: i,
    }));

    // Add empty tile at the end
    const newEmptyPosition = totalTiles;

    setTiles(initialTiles);
    setEmptyPosition(newEmptyPosition);
    setMoves(0);
    setTimer(0);
    setIsComplete(false);
    setTimerActive(false);
  }, [gridSize]);

  // Initialize the puzzle
  useEffect(() => {
    resetPuzzle();
  }, [gridSize, resetPuzzle]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (timerActive) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer + 1);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerActive]);

  // Determine grid size based on difficulty
  useEffect(() => {
    if (difficulty === "easy") setGridSize(3);
    else if (difficulty === "medium") setGridSize(4);
    else if (difficulty === "hard") setGridSize(5);
  }, [difficulty]);

  const shufflePuzzle = () => {
    const totalTiles = gridSize * gridSize;
    const shuffleMoves = 1000; // Number of random moves to shuffle

    // Start from solved state
    const initialTiles: Tile[] = Array.from(
      { length: totalTiles - 1 },
      (_, i) => ({
        id: i + 1,
        value: i + 1,
        position: i,
      })
    );

    let currentEmptyPos = totalTiles - 1;
    let shuffledTiles = [...initialTiles];

    // Make random valid moves to shuffle
    for (let i = 0; i < shuffleMoves; i++) {
      const possibleMoves = getValidMoves(currentEmptyPos, gridSize);
      if (possibleMoves.length > 0) {
        const randomMove =
          possibleMoves[Math.floor(Math.random() * possibleMoves.length)];

        // Find the tile at the position we want to move
        const tileToMove = shuffledTiles.find(
          (tile) => tile.position === randomMove
        );

        if (tileToMove) {
          // Swap positions
          shuffledTiles = shuffledTiles.map((tile) =>
            tile.id === tileToMove.id
              ? { ...tile, position: currentEmptyPos }
              : tile
          );

          currentEmptyPos = randomMove;
        }
      }
    }

    setTiles(shuffledTiles);
    setEmptyPosition(currentEmptyPos);
    setMoves(0);
    setTimer(0);
    setIsComplete(false);
    setTimerActive(true);
  };

  const getValidMoves = (emptyPos: number, size: number): number[] => {
    const row = Math.floor(emptyPos / size);
    const col = emptyPos % size;
    const validMoves: number[] = [];

    // Check up
    if (row > 0) validMoves.push(emptyPos - size);
    // Check down
    if (row < size - 1) validMoves.push(emptyPos + size);
    // Check left
    if (col > 0) validMoves.push(emptyPos - 1);
    // Check right
    if (col < size - 1) validMoves.push(emptyPos + 1);

    return validMoves;
  };

  const handleTileClick = (position: number) => {
    if (isComplete) return;

    // Start timer on first move if not already active
    if (!timerActive) {
      setTimerActive(true);
    }

    // Check if the clicked tile is adjacent to the empty space
    const validMoves = getValidMoves(emptyPosition, gridSize);

    if (validMoves.includes(position)) {
      // Find the tile at this position
      const tileToMove = tiles.find((tile) => tile.position === position);

      if (tileToMove) {
        // Update tiles array to move the tile to the empty position
        const updatedTiles = tiles.map((tile) =>
          tile.id === tileToMove.id
            ? { ...tile, position: emptyPosition }
            : tile
        );

        setTiles(updatedTiles);
        setEmptyPosition(position);
        setMoves(moves + 1);

        // Check if puzzle is solved after the move
        checkPuzzleCompletion(updatedTiles);
      }
    }
  };

  const checkPuzzleCompletion = (currentTiles: Tile[]) => {
    // Puzzle is solved if each tile is in its correct position (position equals value - 1)
    const isSolved = currentTiles.every(
      (tile) => tile.position === tile.value - 1
    );

    if (isSolved) {
      setIsComplete(true);
      setTimerActive(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  };

  const renderTile = (position: number) => {
    const tile = tiles.find((t) => t.position === position);
    const isEmpty = position === emptyPosition;

    if (isEmpty) {
      return <div key={position} className={styles.emptyTile}></div>;
    }

    if (tile) {
      const isCorrectPosition = tile.position === tile.value - 1;

      return (
        <div
          key={tile.id}
          className={`${styles.tile} ${
            isCorrectPosition ? styles.correctPosition : ""
          }`}
          onClick={() => handleTileClick(position)}
        >
          {tile.value}
        </div>
      );
    }

    return null;
  };

  return (
    <GameLayout
      title="Grid Puzzle"
      description="Sliding puzzle with tile state management"
    >
      <div className={styles.container}>
        <div className={styles.controls}>
          <div className={styles.difficultySelector}>
            <span>Difficulty: </span>
            <div className={styles.difficultyButtons}>
              <button
                onClick={() => setDifficulty("easy")}
                className={`${styles.difficultyButton} ${
                  difficulty === "easy" ? styles.active : ""
                }`}
              >
                Easy (3×3)
              </button>
              <button
                onClick={() => setDifficulty("medium")}
                className={`${styles.difficultyButton} ${
                  difficulty === "medium" ? styles.active : ""
                }`}
              >
                Medium (4×4)
              </button>
              <button
                onClick={() => setDifficulty("hard")}
                className={`${styles.difficultyButton} ${
                  difficulty === "hard" ? styles.active : ""
                }`}
              >
                Hard (5×5)
              </button>
            </div>
          </div>

          <div className={styles.gameButtons}>
            <button className={styles.startButton} onClick={shufflePuzzle}>
              {timerActive ? "Restart" : "Start Game"}
            </button>
            <button className={styles.resetButton} onClick={resetPuzzle}>
              Reset
            </button>
          </div>
        </div>

        <div className={styles.statsBar}>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Moves:</span>
            <span className={styles.statValue}>{moves}</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Time:</span>
            <span className={styles.statValue}>{formatTime(timer)}</span>
          </div>
        </div>

        <div
          className={styles.grid}
          style={{
            gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
            maxWidth: `${gridSize * 80}px`,
          }}
        >
          {Array.from({ length: gridSize * gridSize }).map((_, index) =>
            renderTile(index)
          )}
        </div>

        {isComplete && (
          <div className={styles.completionMessage}>
            <h3>Puzzle Solved!</h3>
            <p>Moves: {moves}</p>
            <p>Time: {formatTime(timer)}</p>
          </div>
        )}
      </div>
    </GameLayout>
  );
}
