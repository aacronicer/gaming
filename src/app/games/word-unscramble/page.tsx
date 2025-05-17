"use client";

import { useState, useEffect } from "react";
import GameLayout from "@/components/ui/game-layout";
import styles from "./page.module.css";

interface Word {
  original: string;
  scrambled: string;
  hint: string;
  category: string;
}

export default function WordUnscramble() {
  const [words, setWords] = useState<Word[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [userGuess, setUserGuess] = useState("");
  const [message, setMessage] = useState("");
  const [score, setScore] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(60);
  const [gameActive, setGameActive] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const wordList: Word[] = [
    {
      original: "banana",
      scrambled: "nabana",
      hint: "Yellow fruit",
      category: "food",
    },
    {
      original: "elephant",
      scrambled: "eatelhnp",
      hint: "Large mammal with a trunk",
      category: "animals",
    },
    {
      original: "computer",
      scrambled: "ptcomrue",
      hint: "Electronic device for processing data",
      category: "technology",
    },
    {
      original: "bicycle",
      scrambled: "yiclbec",
      hint: "Two-wheeled vehicle",
      category: "transportation",
    },
    {
      original: "mountain",
      scrambled: "onmitanu",
      hint: "Large natural elevation",
      category: "nature",
    },
    {
      original: "football",
      scrambled: "alootblf",
      hint: "Popular team sport",
      category: "sports",
    },
    {
      original: "chocolate",
      scrambled: "htcocloe",
      hint: "Sweet brown food",
      category: "food",
    },
    {
      original: "orchestra",
      scrambled: "roatchesr",
      hint: "Large group of musicians",
      category: "music",
    },
    {
      original: "telephone",
      scrambled: "pnheeeotl",
      hint: "Device for voice communication",
      category: "technology",
    },
    {
      original: "butterfly",
      scrambled: "yrtlfbute",
      hint: "Insect with colorful wings",
      category: "animals",
    },
    {
      original: "restaurant",
      scrambled: "rtstaeaunr",
      hint: "Place to eat food",
      category: "places",
    },
    {
      original: "universe",
      scrambled: "eiuervns",
      hint: "All of space and time",
      category: "science",
    },
    {
      original: "detective",
      scrambled: "etidcvete",
      hint: "Person who investigates crimes",
      category: "professions",
    },
    {
      original: "dinosaur",
      scrambled: "srauiodn",
      hint: "Extinct reptile",
      category: "animals",
    },
    {
      original: "hospital",
      scrambled: "hsipoalt",
      hint: "Medical facility",
      category: "places",
    },
  ];

  useEffect(() => {
    // Shuffle and set the words when the game starts
    const shuffledWords = [...wordList].sort(() => 0.5 - Math.random());
    setWords(shuffledWords);
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (gameActive && timeRemaining > 0) {
      timer = setTimeout(() => {
        setTimeRemaining(timeRemaining - 1);
      }, 1000);
    } else if (gameActive && timeRemaining === 0) {
      endGame();
    }

    return () => clearTimeout(timer);
  }, [gameActive, timeRemaining]);

  const startGame = () => {
    setCurrentWordIndex(0);
    setScore(0);
    setHintsUsed(0);
    setTimeRemaining(60);
    setGameActive(true);
    setGameOver(false);
    setUserGuess("");
    setMessage("Unscramble the word!");
    setShowHint(false);

    const shuffledWords = [...wordList].sort(() => 0.5 - Math.random());
    setWords(shuffledWords);
  };

  const checkAnswer = () => {
    if (!gameActive) return;

    const currentWord = words[currentWordIndex];

    if (userGuess.toLowerCase().trim() === currentWord.original.toLowerCase()) {
      // Correct answer
      let pointsEarned = 10;

      // Bonus points for not using hint
      if (!showHint) {
        pointsEarned += 5;
      }

      setScore(score + pointsEarned);
      setMessage(`Correct! +${pointsEarned} points`);

      // Move to next word or end game if no more words
      setTimeout(() => {
        if (currentWordIndex < words.length - 1) {
          setCurrentWordIndex(currentWordIndex + 1);
          setUserGuess("");
          setShowHint(false);
          setMessage("Unscramble the word!");
        } else {
          endGame();
        }
      }, 1500);
    } else {
      setMessage("Incorrect, try again!");
    }
  };

  const showHintHandler = () => {
    if (!gameActive) return;

    setShowHint(true);
    setHintsUsed(hintsUsed + 1);
  };

  const endGame = () => {
    setGameActive(false);
    setGameOver(true);
    setMessage(`Game over! Your score: ${score}`);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      checkAnswer();
    }
  };

  return (
    <GameLayout
      title="Word Unscramble"
      description="Unscramble words with hints and earn points"
    >
      <div className={styles.container}>
        {!gameActive && !gameOver ? (
          <div className={styles.startScreen}>
            <h2>Word Unscramble Challenge</h2>
            <p>Unscramble as many words as you can within 60 seconds!</p>
            <p>Get 10 points for each correct word.</p>
            <p>Bonus 5 points if you don't use a hint.</p>
            <button className={styles.startButton} onClick={startGame}>
              Start Game
            </button>
          </div>
        ) : gameActive ? (
          <div className={styles.gameArea}>
            <div className={styles.gameHeader}>
              <div className={styles.scoreboard}>
                <div className={styles.score}>Score: {score}</div>
                <div className={styles.timer}>Time: {timeRemaining}s</div>
              </div>

              <div className={styles.progress}>
                Word {currentWordIndex + 1} of {words.length}
              </div>
            </div>

            <div className={styles.wordCard}>
              <div className={styles.scrambledWord}>
                {words[currentWordIndex]?.scrambled
                  .toUpperCase()
                  .split("")
                  .map((letter, index) => (
                    <span key={index} className={styles.letter}>
                      {letter}
                    </span>
                  ))}
              </div>

              <div className={styles.category}>
                Category: {words[currentWordIndex]?.category}
              </div>

              {showHint && (
                <div className={styles.hint}>
                  Hint: {words[currentWordIndex]?.hint}
                </div>
              )}

              <div className={styles.inputArea}>
                <input
                  type="text"
                  className={styles.guessInput}
                  value={userGuess}
                  onChange={(e) => setUserGuess(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Type your answer..."
                  autoFocus
                />
                <button className={styles.submitButton} onClick={checkAnswer}>
                  Submit
                </button>
              </div>

              <div className={styles.message}>{message}</div>

              {!showHint && (
                <button className={styles.hintButton} onClick={showHintHandler}>
                  Show Hint
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className={styles.gameOverScreen}>
            <h2>Game Over!</h2>
            <div className={styles.finalScore}>
              <div>
                Final Score: <span>{score}</span>
              </div>
              <div>
                Words Solved: <span>{currentWordIndex}</span>
              </div>
              <div>
                Hints Used: <span>{hintsUsed}</span>
              </div>
            </div>

            <div className={styles.gameOverButtons}>
              <button className={styles.playAgainButton} onClick={startGame}>
                Play Again
              </button>
            </div>
          </div>
        )}
      </div>
    </GameLayout>
  );
}
