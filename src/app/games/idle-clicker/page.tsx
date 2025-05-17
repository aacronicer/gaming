"use client";

import { useState, useEffect, useCallback } from "react";
import GameLayout from "@/components/ui/game-layout";
import styles from "./page.module.css";

interface Upgrade {
  id: string;
  name: string;
  description: string;
  cost: number;
  multiplier: number;
  unlocked: boolean;
  purchased: number;
}

export default function IdleClicker() {
  const [coins, setCoins] = useState(0);
  const [coinsPerSecond, setCoinsPerSecond] = useState(0);
  const [coinsPerClick, setCoinsPerClick] = useState(1);
  const [totalClicks, setTotalClicks] = useState(0);
  const [totalEarned, setTotalEarned] = useState(0);
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  const [animatingCoins, setAnimatingCoins] = useState<
    { id: number; x: number; y: number; value: number }[]
  >([]);

  // Upgrades available in the game
  const [upgrades, setUpgrades] = useState<Upgrade[]>([
    {
      id: "cursor",
      name: "Better Cursor",
      description: "Double your click power",
      cost: 10,
      multiplier: 2,
      unlocked: true,
      purchased: 0,
    },
    {
      id: "assistant",
      name: "Coding Assistant",
      description: "Generates 1 coin per second",
      cost: 50,
      multiplier: 1,
      unlocked: true,
      purchased: 0,
    },
    {
      id: "bot",
      name: "Coin Bot",
      description: "Generates 5 coins per second",
      cost: 200,
      multiplier: 5,
      unlocked: false,
      purchased: 0,
    },
    {
      id: "mine",
      name: "Coin Mine",
      description: "Generates 25 coins per second",
      cost: 1000,
      multiplier: 25,
      unlocked: false,
      purchased: 0,
    },
    {
      id: "factory",
      name: "Coin Factory",
      description: "Generates 100 coins per second",
      cost: 5000,
      multiplier: 100,
      unlocked: false,
      purchased: 0,
    },
  ]);

  // Update game state (called 10 times per second)
  const updateGame = useCallback(() => {
    const now = Date.now();
    const deltaTime = (now - lastUpdate) / 1000; // time in seconds
    setLastUpdate(now);

    if (coinsPerSecond > 0) {
      const earned = coinsPerSecond * deltaTime;
      setCoins((prev) => prev + earned);
      setTotalEarned((prev) => prev + earned);
    }

    // Check for unlockable upgrades
    setUpgrades((prevUpgrades) =>
      prevUpgrades.map((upgrade) => {
        if (!upgrade.unlocked && totalEarned >= upgrade.cost * 0.5) {
          return { ...upgrade, unlocked: true };
        }
        return upgrade;
      })
    );
  }, [coinsPerSecond, lastUpdate, totalEarned]);

  // Initialize game
  useEffect(() => {
    const timer = setInterval(updateGame, 100);
    return () => clearInterval(timer);
  }, [updateGame]);

  // Handle coin click
  const handleCoinClick = () => {
    setCoins((prev) => prev + coinsPerClick);
    setTotalEarned((prev) => prev + coinsPerClick);
    setTotalClicks((prev) => prev + 1);

    // Create coin animation
    const coinId = Date.now();
    const randomOffsetX = Math.random() * 60 - 30;
    setAnimatingCoins((prev) => [
      ...prev,
      {
        id: coinId,
        x: randomOffsetX,
        y: 0,
        value: coinsPerClick,
      },
    ]);

    // Remove coin animation after it completes
    setTimeout(() => {
      setAnimatingCoins((prev) => prev.filter((coin) => coin.id !== coinId));
    }, 1000);
  };

  // Purchase upgrade
  const purchaseUpgrade = (id: string) => {
    const upgrade = upgrades.find((u) => u.id === id);
    if (!upgrade || coins < upgrade.cost) return;

    // Apply upgrade effects
    setCoins((prev) => prev - upgrade.cost);

    setUpgrades((prevUpgrades) =>
      prevUpgrades.map((u) => {
        if (u.id === id) {
          // Increase cost for next purchase
          const newPurchased = u.purchased + 1;
          const newCost = Math.floor(u.cost * Math.pow(1.5, newPurchased));

          return {
            ...u,
            cost: newCost,
            purchased: newPurchased,
          };
        }
        return u;
      })
    );

    // Apply upgrade effects based on type
    switch (id) {
      case "cursor":
        setCoinsPerClick((prev) => prev * 2);
        break;
      case "assistant":
      case "bot":
      case "mine":
      case "factory":
        const upgradeItem = upgrades.find((u) => u.id === id);
        if (upgradeItem) {
          setCoinsPerSecond((prev) => prev + upgradeItem.multiplier);
        }
        break;
    }
  };

  // Format large numbers
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return Math.floor(num).toString();
  };

  return (
    <GameLayout
      title="Idle Clicker"
      description="Click to earn coins, buy upgrades to earn more!"
    >
      <div className={styles.container}>
        <div className={styles.gameStats}>
          <div className={styles.statBox}>
            <span className={styles.statValue}>{formatNumber(coins)}</span>
            <span className={styles.statLabel}>Coins</span>
          </div>

          <div className={styles.statBox}>
            <span className={styles.statValue}>
              {formatNumber(coinsPerSecond)}/s
            </span>
            <span className={styles.statLabel}>Coins per Second</span>
          </div>

          <div className={styles.statBox}>
            <span className={styles.statValue}>
              {formatNumber(coinsPerClick)}
            </span>
            <span className={styles.statLabel}>Coins per Click</span>
          </div>
        </div>

        <div className={styles.gameArea}>
          <div className={styles.coinArea}>
            <button
              className={styles.coinButton}
              onClick={handleCoinClick}
              aria-label="Click to earn coins"
            >
              <div className={styles.coinInner}>
                <span className={styles.coinText}>💰</span>
              </div>
            </button>

            {animatingCoins.map((coin) => (
              <div
                key={coin.id}
                className={styles.floatingCoin}
                style={{
                  transform: `translate(${coin.x}px, ${coin.y - 100}px)`,
                }}
              >
                +{coin.value}
              </div>
            ))}
          </div>

          <div className={styles.upgradeArea}>
            <h2 className={styles.upgradeTitle}>Upgrades</h2>
            <div className={styles.upgradeList}>
              {upgrades
                .filter((upgrade) => upgrade.unlocked)
                .map((upgrade) => (
                  <button
                    key={upgrade.id}
                    className={`${styles.upgradeButton} ${
                      coins >= upgrade.cost ? styles.canBuy : ""
                    }`}
                    onClick={() => purchaseUpgrade(upgrade.id)}
                    disabled={coins < upgrade.cost}
                  >
                    <div className={styles.upgradeName}>
                      {upgrade.name}{" "}
                      {upgrade.purchased > 0 && (
                        <span className={styles.upgradeLevel}>
                          Lv.{upgrade.purchased}
                        </span>
                      )}
                    </div>
                    <div className={styles.upgradeDesc}>
                      {upgrade.description}
                    </div>
                    <div className={styles.upgradeCost}>
                      Cost: {formatNumber(upgrade.cost)} coins
                    </div>
                  </button>
                ))}
            </div>
          </div>
        </div>

        <div className={styles.gameFooter}>
          <div>Total Clicks: {formatNumber(totalClicks)}</div>
          <div>Total Earned: {formatNumber(totalEarned)} coins</div>
        </div>
      </div>
    </GameLayout>
  );
}
