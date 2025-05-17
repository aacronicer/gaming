"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import styles from "./game-layout.module.css";
import MusicPlayer from "./music-player";
import InsertCoin from "../game-components/InsertCoin";

interface GameLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
}

export default function GameLayout({
  children,
  title,
  description,
}: GameLayoutProps) {
  const router = useRouter();
  const [poweredOn, setPoweredOn] = useState(false);
  const [randomGlitch, setRandomGlitch] = useState(false);

  // Power-on effect
  useEffect(() => {
    // Initial loading delay for power-on effect
    const timer = setTimeout(() => {
      setPoweredOn(true);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  // Random glitch effects
  useEffect(() => {
    // Create occasional random glitches
    const glitchInterval = setInterval(() => {
      if (Math.random() > 0.7) {
        setRandomGlitch(true);
        setTimeout(() => setRandomGlitch(false), 200);
      }
    }, 8000);

    return () => clearInterval(glitchInterval);
  }, []);

  return (
    <div
      className={`${styles.container} ${
        poweredOn ? styles.poweredOn : styles.poweredOff
      }`}
    >
      <div className={styles.cabinetTop}></div>
      <div
        className={`${styles.arcadeScreen} ${
          randomGlitch ? "temp-glitch" : ""
        }`}
      >
        <div className={styles.header}>
          <button
            className={styles.backButton}
            onClick={() => router.push("/")}
          >
            ← Back to Games
          </button>

          <div className={styles.titleContainer}>
            <div className={styles.titleArea}>
              <h1 className={styles.title}>{title}</h1>
              {description && (
                <p className={styles.description}>{description}</p>
              )}
            </div>
          </div>
        </div>

        <div className={styles.gameContent}>
          <InsertCoin />
          <div className={styles.content}>{children}</div>
        </div>
      </div>

      <div className={styles.cabinetControls}>
        <div className={`${styles.joystick} ${styles.wiggle}`}></div>
        <div className={styles.buttons}>
          <div className={`${styles.arcadeButton} ${styles.pulse}`}></div>
          <div className={`${styles.arcadeButton} ${styles.pulse}`}></div>
        </div>
      </div>

      <div className={styles.footer}>
        <p>© {new Date().getFullYear()} Retro Arcade</p>
      </div>

      <MusicPlayer />
    </div>
  );
}
