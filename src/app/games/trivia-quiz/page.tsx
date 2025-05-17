"use client";

import { useState, useEffect } from "react";
import GameLayout from "@/components/ui/game-layout";
import styles from "./page.module.css";

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
  category: string;
}

type QuizState = "start" | "playing" | "result";

export default function TriviaQuiz() {
  const [quizState, setQuizState] = useState<QuizState>("start");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [answerResults, setAnswerResults] = useState<boolean[]>([]);
  const [categorySelection, setCategorySelection] = useState("all");

  // Available categories
  const categories = [
    { id: "all", name: "All Categories" },
    { id: "general", name: "General Knowledge" },
    { id: "science", name: "Science" },
    { id: "history", name: "History" },
    { id: "geography", name: "Geography" },
    { id: "entertainment", name: "Entertainment" },
  ];

  // Sample questions database
  const questionsDB: Question[] = [
    {
      question: "What is the capital of France?",
      options: ["London", "Berlin", "Paris", "Madrid"],
      correctAnswer: 2,
      category: "geography",
    },
    {
      question: "Which planet is known as the Red Planet?",
      options: ["Jupiter", "Mars", "Venus", "Mercury"],
      correctAnswer: 1,
      category: "science",
    },
    {
      question: "Who painted the Mona Lisa?",
      options: [
        "Vincent Van Gogh",
        "Pablo Picasso",
        "Leonardo da Vinci",
        "Michelangelo",
      ],
      correctAnswer: 2,
      category: "history",
    },
    {
      question: "What year did World War II end?",
      options: ["1943", "1944", "1945", "1946"],
      correctAnswer: 2,
      category: "history",
    },
    {
      question: "Which element has the chemical symbol 'O'?",
      options: ["Gold", "Oxygen", "Osmium", "Oganesson"],
      correctAnswer: 1,
      category: "science",
    },
    {
      question: "Which country has the largest population in the world?",
      options: ["India", "China", "United States", "Russia"],
      correctAnswer: 1,
      category: "geography",
    },
    {
      question: "Who wrote 'Romeo and Juliet'?",
      options: [
        "Charles Dickens",
        "William Shakespeare",
        "Jane Austen",
        "Mark Twain",
      ],
      correctAnswer: 1,
      category: "entertainment",
    },
    {
      question: "What is the largest ocean on Earth?",
      options: [
        "Atlantic Ocean",
        "Indian Ocean",
        "Arctic Ocean",
        "Pacific Ocean",
      ],
      correctAnswer: 3,
      category: "geography",
    },
    {
      question: "What is the primary language spoken in Brazil?",
      options: ["Spanish", "Portuguese", "English", "French"],
      correctAnswer: 1,
      category: "general",
    },
    {
      question: "Which band performed the album 'Dark Side of the Moon'?",
      options: [
        "Led Zeppelin",
        "Pink Floyd",
        "The Beatles",
        "The Rolling Stones",
      ],
      correctAnswer: 1,
      category: "entertainment",
    },
    {
      question: "What is the chemical formula for water?",
      options: ["CO2", "H2O", "O2", "N2"],
      correctAnswer: 1,
      category: "science",
    },
    {
      question: "Who is known as the father of modern physics?",
      options: [
        "Isaac Newton",
        "Galileo Galilei",
        "Albert Einstein",
        "Nikola Tesla",
      ],
      correctAnswer: 2,
      category: "science",
    },
  ];

  useEffect(() => {
    // Timer for the question
    if (quizState === "playing" && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);

      return () => clearTimeout(timer);
    } else if (quizState === "playing" && timeLeft === 0) {
      // Time's up, move to next question
      handleNextQuestion();
    }
  }, [quizState, timeLeft]);

  const startQuiz = () => {
    // Filter questions based on selected category
    let filteredQuestions = questionsDB;
    if (categorySelection !== "all") {
      filteredQuestions = questionsDB.filter(
        (q) => q.category === categorySelection
      );
    }

    // Shuffle questions
    const shuffledQuestions = [...filteredQuestions]
      .sort(() => 0.5 - Math.random())
      .slice(0, 10);

    setQuestions(shuffledQuestions);
    setCurrentQuestionIndex(0);
    setScore(0);
    setTimeLeft(30);
    setQuizState("playing");
    setAnswerResults([]);
  };

  const handleAnswer = (optionIndex: number) => {
    if (selectedAnswer !== null) return; // Already answered

    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = optionIndex === currentQuestion.correctAnswer;

    setSelectedAnswer(optionIndex);

    if (isCorrect) {
      // Award more points for quick answers
      const timeBonus = Math.floor(timeLeft / 3);
      setScore(score + 10 + timeBonus);
    }

    // Store result
    setAnswerResults([...answerResults, isCorrect]);

    // Move to next question after a brief delay
    setTimeout(() => {
      handleNextQuestion();
    }, 1500);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex >= questions.length - 1) {
      // End of quiz
      setQuizState("result");
    } else {
      // Next question
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setTimeLeft(30);
    }
  };

  const restartQuiz = () => {
    setQuizState("start");
  };

  return (
    <GameLayout
      title="Trivia Quiz"
      description="Test your knowledge with timed rounds"
    >
      <div className={styles.container}>
        {quizState === "start" && (
          <div className={styles.startScreen}>
            <h2>Ready to test your knowledge?</h2>
            <div className={styles.categorySelect}>
              <label htmlFor="category">Select a category:</label>
              <select
                id="category"
                className={styles.select}
                value={categorySelection}
                onChange={(e) => setCategorySelection(e.target.value)}
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <button className={styles.startButton} onClick={startQuiz}>
              Start Quiz
            </button>
          </div>
        )}

        {quizState === "playing" && questions.length > 0 && (
          <div className={styles.quizContainer}>
            <div className={styles.quizHeader}>
              <div className={styles.progress}>
                Question {currentQuestionIndex + 1} of {questions.length}
              </div>
              <div className={styles.timer}>
                <div
                  className={`${styles.timerBar} ${
                    timeLeft < 10 ? styles.warning : ""
                  }`}
                  style={{ width: `${(timeLeft / 30) * 100}%` }}
                ></div>
                <span>{timeLeft}s</span>
              </div>
              <div className={styles.score}>Score: {score}</div>
            </div>

            <div className={styles.questionCard}>
              <h2 className={styles.questionText}>
                {questions[currentQuestionIndex].question}
              </h2>

              <div className={styles.options}>
                {questions[currentQuestionIndex].options.map(
                  (option, index) => (
                    <button
                      key={index}
                      onClick={() => handleAnswer(index)}
                      className={`${styles.option} ${
                        selectedAnswer !== null &&
                        index === questions[currentQuestionIndex].correctAnswer
                          ? styles.correct
                          : selectedAnswer === index &&
                            selectedAnswer !==
                              questions[currentQuestionIndex].correctAnswer
                          ? styles.incorrect
                          : ""
                      }`}
                      disabled={selectedAnswer !== null}
                    >
                      {option}
                    </button>
                  )
                )}
              </div>
            </div>
          </div>
        )}

        {quizState === "result" && (
          <div className={styles.resultScreen}>
            <h2>Quiz Completed!</h2>
            <div className={styles.finalScore}>
              <span>Final Score:</span>
              <span className={styles.scoreValue}>{score}</span>
            </div>

            <div className={styles.summary}>
              <h3>Summary</h3>
              <div className={styles.summaryStats}>
                <div className={styles.statItem}>
                  <span>Correct Answers:</span>
                  <span>{answerResults.filter(Boolean).length}</span>
                </div>
                <div className={styles.statItem}>
                  <span>Incorrect Answers:</span>
                  <span>
                    {answerResults.filter((result) => !result).length}
                  </span>
                </div>
                <div className={styles.statItem}>
                  <span>Accuracy:</span>
                  <span>
                    {Math.round(
                      (answerResults.filter(Boolean).length /
                        questions.length) *
                        100
                    )}
                    %
                  </span>
                </div>
              </div>

              <button className={styles.restartButton} onClick={restartQuiz}>
                Play Again
              </button>
            </div>
          </div>
        )}
      </div>
    </GameLayout>
  );
}
