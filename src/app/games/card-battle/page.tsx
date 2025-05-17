"use client";

import { useState, useEffect, useCallback } from "react";
import GameLayout from "@/components/ui/game-layout";
import styles from "./page.module.css";

// Card types and interfaces
type CardType = "attack" | "defense" | "magic" | "heal";

interface Card {
  id: number;
  name: string;
  type: CardType;
  power: number;
  description: string;
  icon: string;
}

interface Player {
  health: number;
  maxHealth: number;
  shield: number;
  deck: Card[];
  hand: Card[];
  discard: Card[];
}

export default function CardBattle() {
  // Game state
  const [playerTurn, setPlayerTurn] = useState(true);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState<"player" | "enemy" | null>(null);
  const [message, setMessage] = useState("Choose a card to play!");
  const [animation, setAnimation] = useState<string | null>(null);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);

  // Player and enemy state
  const [player, setPlayer] = useState<Player>({
    health: 100,
    maxHealth: 100,
    shield: 0,
    deck: [],
    hand: [],
    discard: [],
  });

  const [enemy, setEnemy] = useState<Player>({
    health: 100,
    maxHealth: 100,
    shield: 0,
    deck: [],
    hand: [],
    discard: [],
  });

  // Generate a deck of cards
  const generateDeck = (deckType: "player" | "enemy"): Card[] => {
    const deck: Card[] = [];
    const totalCards = 20;

    // Create different card distributions based on if it's player or enemy
    const cardTypes: CardType[] = ["attack", "defense", "magic", "heal"];

    for (let i = 0; i < totalCards; i++) {
      const typeIndex = Math.floor(Math.random() * cardTypes.length);
      const type = cardTypes[typeIndex];

      let power = 0;
      let name = "";
      let description = "";
      let icon = "";

      switch (type) {
        case "attack":
          power = Math.floor(Math.random() * 15) + 10; // 10-25
          name = deckType === "player" ? "Slash" : "Enemy Strike";
          description = `Deal ${power} damage`;
          icon = "⚔️";
          break;
        case "defense":
          power = Math.floor(Math.random() * 10) + 8; // 8-18
          name = deckType === "player" ? "Shield" : "Enemy Block";
          description = `Gain ${power} shield`;
          icon = "🛡️";
          break;
        case "magic":
          power = Math.floor(Math.random() * 12) + 15; // 15-27
          name = deckType === "player" ? "Fireball" : "Dark Magic";
          description = `Deal ${power} magic damage`;
          icon = "✨";
          break;
        case "heal":
          power = Math.floor(Math.random() * 8) + 5; // 5-13
          name = deckType === "player" ? "Heal" : "Enemy Heal";
          description = `Restore ${power} health`;
          icon = "❤️";
          break;
      }

      deck.push({
        id: i,
        name,
        type,
        power,
        description,
        icon,
      });
    }

    return shuffle(deck);
  };

  // Fisher-Yates shuffle algorithm
  const shuffle = (array: Card[]): Card[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  // Draw cards for player or enemy
  const drawCards = (who: "player" | "enemy", count: number) => {
    if (who === "player") {
      setPlayer((prev) => {
        // Create copies to avoid mutating the original state
        const deck = [...prev.deck];
        const hand = [...prev.hand];
        const discard = [...prev.discard];

        // Check how many cards we can draw
        const cardsToAdd = Math.min(count, deck.length);

        if (cardsToAdd === 0 && discard.length > 0) {
          // No cards in deck but we have discard pile, shuffle discard into deck
          const newDeck = shuffle([...discard]);

          // Now draw from newly shuffled deck
          const drawnCards = newDeck.splice(0, Math.min(count, newDeck.length));

          return {
            ...prev,
            deck: newDeck,
            hand: [...hand, ...drawnCards],
            discard: [], // Empty the discard pile
          };
        } else if (cardsToAdd === 0) {
          // No cards in deck or discard
          return prev; // Can't draw any cards
        }

        // Draw from current deck
        const drawnCards = deck.splice(0, cardsToAdd);

        return {
          ...prev,
          deck,
          hand: [...hand, ...drawnCards],
        };
      });
    } else {
      setEnemy((prev) => {
        // Create copies to avoid mutating the original state
        const deck = [...prev.deck];
        const hand = [...prev.hand];
        const discard = [...prev.discard];

        // Check how many cards we can draw
        const cardsToAdd = Math.min(count, deck.length);

        if (cardsToAdd === 0 && discard.length > 0) {
          // No cards in deck but we have discard pile, shuffle discard into deck
          const newDeck = shuffle([...discard]);

          // Now draw from newly shuffled deck
          const drawnCards = newDeck.splice(0, Math.min(count, newDeck.length));

          return {
            ...prev,
            deck: newDeck,
            hand: [...hand, ...drawnCards],
            discard: [], // Empty the discard pile
          };
        } else if (cardsToAdd === 0) {
          // No cards in deck or discard
          return prev; // Can't draw any cards
        }

        // Draw from current deck
        const drawnCards = deck.splice(0, cardsToAdd);

        return {
          ...prev,
          deck,
          hand: [...hand, ...drawnCards],
        };
      });
    }
  };

  // Play a card from player's hand
  const playPlayerCard = (cardIndex: number) => {
    if (!playerTurn || gameOver) return;

    // Get the current player state
    const card = player.hand[cardIndex];
    setSelectedCard(card);

    // Remove card from hand and add to discard - using functional update to avoid race conditions
    setPlayer((prevPlayer) => {
      const updatedHand = [...prevPlayer.hand];
      const playedCard = updatedHand.splice(cardIndex, 1)[0];

      return {
        ...prevPlayer,
        hand: updatedHand,
        discard: [...prevPlayer.discard, playedCard],
      };
    });

    // Apply card effects - using functional update to ensure we have latest state
    switch (card.type) {
      case "attack":
        // If enemy has shield, damage shield first
        setEnemy((prevEnemy) => {
          if (prevEnemy.shield > 0) {
            const shieldDamage = Math.min(card.power, prevEnemy.shield);
            const remainingDamage = card.power - shieldDamage;

            setMessage(
              `You dealt ${shieldDamage} damage to shield and ${Math.max(
                0,
                remainingDamage
              )} damage to enemy!`
            );

            return {
              ...prevEnemy,
              shield: prevEnemy.shield - shieldDamage,
              health: prevEnemy.health - Math.max(0, remainingDamage),
            };
          } else {
            setMessage(`You dealt ${card.power} damage to enemy!`);

            return {
              ...prevEnemy,
              health: prevEnemy.health - card.power,
            };
          }
        });
        setAnimation("playerAttack");
        break;

      case "defense":
        setPlayer((prevPlayer) => ({
          ...prevPlayer,
          shield: prevPlayer.shield + card.power,
        }));

        setMessage(`You gained ${card.power} shield!`);
        setAnimation("playerDefend");
        break;

      case "magic":
        // Magic bypasses shields
        setEnemy((prevEnemy) => ({
          ...prevEnemy,
          health: prevEnemy.health - card.power,
        }));

        setMessage(`Your magic dealt ${card.power} damage to enemy!`);
        setAnimation("playerMagic");
        break;

      case "heal":
        setPlayer((prevPlayer) => {
          const newHealth = Math.min(
            prevPlayer.maxHealth,
            prevPlayer.health + card.power
          );
          const healedAmount = newHealth - prevPlayer.health;

          setMessage(`You healed for ${healedAmount} health!`);

          return {
            ...prevPlayer,
            health: newHealth,
          };
        });

        setAnimation("playerHeal");
        break;
    }

    // Clear animation after a delay
    setTimeout(() => {
      setAnimation(null);
      setSelectedCard(null);

      // Check if enemy is defeated - using functional check to ensure we have the latest state
      setEnemy((prevEnemy) => {
        if (prevEnemy.health <= 0) {
          endGame("player");
          return prevEnemy;
        }

        // End player turn and start enemy turn after a delay
        setPlayerTurn(false);
        setMessage("Enemy turn...");

        setTimeout(() => {
          playEnemyTurn();
        }, 1000);

        return prevEnemy;
      });
    }, 1000);
  };

  // Enemy AI plays a card
  const playEnemyTurn = () => {
    if (enemy.hand.length === 0) {
      drawCards("enemy", 1);
      setPlayerTurn(true);
      setMessage("Your turn!");
      return;
    }

    // Simple AI: choose a card based on current situation
    let bestCardIndex = 0;
    let bestScore = -1;

    // We need to capture the latest player state for AI decision making
    setEnemy((prevEnemy) => {
      setPlayer((prevPlayer) => {
        // Use the captured states for AI logic
        prevEnemy.hand.forEach((card, index) => {
          let score = 0;

          switch (card.type) {
            case "attack":
            case "magic":
              // Prioritize attack when player has low health
              score = prevPlayer.health < 30 ? card.power * 1.5 : card.power;
              break;

            case "defense":
              // Prioritize defense when enemy has low health
              score = prevEnemy.health < 30 ? card.power * 1.5 : card.power;
              break;

            case "heal":
              // Prioritize healing when health is low but not too low
              score = prevEnemy.health < 50 ? card.power * 2 : card.power * 0.5;
              // Don't heal if already at max health
              if (prevEnemy.health >= prevEnemy.maxHealth - 5) {
                score = 0;
              }
              break;
          }

          // Add a bit of randomness
          score += Math.random() * 5;

          if (score > bestScore) {
            bestScore = score;
            bestCardIndex = index;
          }
        });

        return prevPlayer; // Return the unchanged player state
      });

      return prevEnemy; // Return the unchanged enemy state to avoid mutations here
    });

    // Wait for state updates to complete before continuing
    setTimeout(() => {
      // Play the chosen card
      const card = enemy.hand[bestCardIndex];
      setSelectedCard(card);

      // Remove card from hand and add to discard - using functional update pattern
      setEnemy((prevEnemy) => {
        const updatedHand = [...prevEnemy.hand];
        const playedCard = updatedHand.splice(bestCardIndex, 1)[0];

        return {
          ...prevEnemy,
          hand: updatedHand,
          discard: [...prevEnemy.discard, playedCard],
        };
      });

      // Apply card effects - using functional update to ensure we have latest state
      switch (card.type) {
        case "attack":
          // If player has shield, damage shield first
          setPlayer((prevPlayer) => {
            if (prevPlayer.shield > 0) {
              const shieldDamage = Math.min(card.power, prevPlayer.shield);
              const remainingDamage = card.power - shieldDamage;

              setMessage(
                `Enemy dealt ${shieldDamage} damage to your shield and ${Math.max(
                  0,
                  remainingDamage
                )} damage to you!`
              );

              return {
                ...prevPlayer,
                shield: prevPlayer.shield - shieldDamage,
                health: prevPlayer.health - Math.max(0, remainingDamage),
              };
            } else {
              setMessage(`Enemy dealt ${card.power} damage to you!`);

              return {
                ...prevPlayer,
                health: prevPlayer.health - card.power,
              };
            }
          });
          setAnimation("enemyAttack");
          break;

        case "defense":
          setEnemy((prevEnemy) => ({
            ...prevEnemy,
            shield: prevEnemy.shield + card.power,
          }));

          setMessage(`Enemy gained ${card.power} shield!`);
          setAnimation("enemyDefend");
          break;

        case "magic":
          // Magic bypasses shields
          setPlayer((prevPlayer) => ({
            ...prevPlayer,
            health: prevPlayer.health - card.power,
          }));

          setMessage(`Enemy magic dealt ${card.power} damage to you!`);
          setAnimation("enemyMagic");
          break;

        case "heal":
          setEnemy((prevEnemy) => {
            const newHealth = Math.min(
              prevEnemy.maxHealth,
              prevEnemy.health + card.power
            );
            const healedAmount = newHealth - prevEnemy.health;

            setMessage(`Enemy healed for ${healedAmount} health!`);

            return {
              ...prevEnemy,
              health: newHealth,
            };
          });
          setAnimation("enemyHeal");
          break;
      }

      // Clear animation after a delay
      setTimeout(() => {
        setAnimation(null);
        setSelectedCard(null);

        // Check if player is defeated - using functional update to get latest state
        setPlayer((prevPlayer) => {
          if (prevPlayer.health <= 0) {
            endGame("enemy");
            return prevPlayer;
          }

          // Draw cards if needed
          if (enemy.hand.length < 3) {
            drawCards("enemy", 1);
          }

          if (player.hand.length < 5) {
            drawCards("player", 1);
          }

          // End enemy turn
          setPlayerTurn(true);
          setMessage("Your turn!");

          return prevPlayer;
        });
      }, 1000);
    }, 50); // Small delay to ensure state updates complete
  };

  // End the game and declare a winner
  const endGame = (winnerSide: "player" | "enemy") => {
    // Use a functional update to ensure we don't miss any state changes
    setGameOver(true);
    setWinner(winnerSide);
    setMessage(
      winnerSide === "player"
        ? "Victory! You won the battle!"
        : "Defeat! You lost the battle!"
    );

    // Ensure player can't continue playing cards
    setPlayerTurn(false);
  };

  // Restart the game
  const restartGame = () => {
    initializeGame();
  };

  // Render health bar with percentage
  const renderHealthBar = (current: number, max: number, type: string) => {
    const percentage = Math.max(0, Math.min(100, (current / max) * 100));

    return (
      <div className={`${styles.healthBarContainer} ${styles[type]}`}>
        <div
          className={styles.healthBar}
          style={{ width: `${percentage}%` }}
        ></div>
        <div className={styles.healthText}>
          {current} / {max}
        </div>
      </div>
    );
  };

  // Render shield indicator
  const renderShield = (amount: number, type: string) => {
    if (amount <= 0) return null;

    return (
      <div className={`${styles.shieldIndicator} ${styles[type]}`}>
        <span className={styles.shieldIcon}>🛡️</span>
        <span className={styles.shieldValue}>{amount}</span>
      </div>
    );
  };

  // Initialize game
  const initializeGame = useCallback(() => {
    // Create player deck
    const playerDeck = generateDeck("player");

    // Create enemy deck
    const enemyDeck = generateDeck("enemy");

    // Setup player
    setPlayer({
      health: 100,
      maxHealth: 100,
      shield: 0,
      deck: playerDeck,
      hand: [],
      discard: [],
    });

    // Setup enemy
    setEnemy({
      health: 100,
      maxHealth: 100,
      shield: 0,
      deck: enemyDeck,
      hand: [],
      discard: [],
    });

    // Reset game state
    setGameOver(false);
    setWinner(null);
    setPlayerTurn(true);
    setMessage("Choose a card to play!");

    // Draw initial hands
    setTimeout(() => {
      drawCards("player", 5);
      drawCards("enemy", 5);
    }, 500);
  }, []); // Empty dependency array since this function doesn't rely on state that changes

  // Initialize game on component mount
  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  return (
    <GameLayout
      title="Card Battle"
      description="Strategic card battle with different abilities"
    >
      <div className={styles.container}>
        {/* Game info and messages */}
        <div className={styles.gameInfo}>
          <div className={styles.turnIndicator}>
            {playerTurn ? "Your Turn" : "Enemy Turn"}
          </div>
          <div className={styles.messageBox}>{message}</div>
        </div>

        {/* Battle area */}
        <div className={styles.battleArea}>
          {/* Enemy section */}
          <div className={styles.characterSection}>
            <div className={styles.characterContainer}>
              <div
                className={`${styles.character} ${styles.enemy} ${
                  animation === "enemyAttack" ? styles.attacking : ""
                } ${animation === "enemyDefend" ? styles.defending : ""} ${
                  animation === "enemyMagic" ? styles.castingMagic : ""
                } ${animation === "enemyHeal" ? styles.healing : ""}`}
              >
                <div className={styles.characterIcon}>👹</div>
                {renderShield(enemy.shield, "enemy")}
              </div>
              <div className={styles.characterInfo}>
                <div className={styles.characterName}>Evil Wizard</div>
                <div className={styles.healthContainer}>
                  {renderHealthBar(enemy.health, enemy.maxHealth, "enemy")}
                </div>
              </div>
            </div>
            <div className={styles.deckInfo}>
              <div className={styles.deckCount}>Deck: {enemy.deck.length}</div>
              <div className={styles.discardCount}>
                Discard: {enemy.discard.length}
              </div>
            </div>
          </div>

          {/* Battle effects */}
          <div className={styles.battleEffects}>
            {animation && (
              <div className={`${styles.effectAnimation} ${styles[animation]}`}>
                {selectedCard?.icon}
              </div>
            )}
          </div>

          {/* Player section */}
          <div className={styles.characterSection}>
            <div className={styles.characterContainer}>
              <div
                className={`${styles.character} ${styles.player} ${
                  animation === "playerAttack" ? styles.attacking : ""
                } ${animation === "playerDefend" ? styles.defending : ""} ${
                  animation === "playerMagic" ? styles.castingMagic : ""
                } ${animation === "playerHeal" ? styles.healing : ""}`}
              >
                <div className={styles.characterIcon}>🧙</div>
                {renderShield(player.shield, "player")}
              </div>
              <div className={styles.characterInfo}>
                <div className={styles.characterName}>Card Warrior</div>
                <div className={styles.healthContainer}>
                  {renderHealthBar(player.health, player.maxHealth, "player")}
                </div>
              </div>
            </div>
            <div className={styles.deckInfo}>
              <div className={styles.deckCount}>Deck: {player.deck.length}</div>
              <div className={styles.discardCount}>
                Discard: {player.discard.length}
              </div>
            </div>
          </div>
        </div>

        {/* Player hand */}
        <div className={styles.handContainer}>
          <div className={styles.handTitle}>Your Hand</div>
          <div className={styles.hand}>
            {player.hand.map((card, index) => (
              <div
                key={card.id}
                className={`${styles.card} ${styles[card.type]}`}
                onClick={() => playerTurn && !gameOver && playPlayerCard(index)}
                style={{
                  cursor: playerTurn && !gameOver ? "pointer" : "default",
                }}
              >
                <div className={styles.cardHeader}>
                  <div className={styles.cardName}>{card.name}</div>
                  <div className={styles.cardIcon}>{card.icon}</div>
                </div>
                <div className={styles.cardBody}>
                  <div className={styles.cardPower}>{card.power}</div>
                </div>
                <div className={styles.cardFooter}>
                  <div className={styles.cardDescription}>
                    {card.description}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Game over modal */}
        {gameOver && (
          <div className={styles.gameOverModal}>
            <div className={styles.gameOverContent}>
              <h2
                className={winner === "player" ? styles.victory : styles.defeat}
              >
                {winner === "player" ? "Victory!" : "Defeat!"}
              </h2>
              <p>
                {winner === "player"
                  ? "You defeated the enemy!"
                  : "You were defeated!"}
              </p>
              <button className={styles.restartButton} onClick={restartGame}>
                Play Again
              </button>
            </div>
          </div>
        )}
      </div>
    </GameLayout>
  );
}
