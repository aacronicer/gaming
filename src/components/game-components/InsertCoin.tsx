"use client";

import { useState, useEffect, useRef } from "react";
import styles from "./InsertCoin.module.css";

export default function InsertCoin() {
  const [visible, setVisible] = useState(true);
  const [inserted, setInserted] = useState(false);
  const [coinAnimation, setCoinAnimation] = useState(false);
  const [credits, setCredits] = useState(0);
  const [glitchText, setGlitchText] = useState(false);
  const coinSoundRef = useRef<HTMLAudioElement | null>(null);

  // Initialize coin sound
  useEffect(() => {
    // Use an existing short music file for the coin sound
    coinSoundRef.current = new Audio("/audio/homeScreen.mp3");
    coinSoundRef.current.volume = 0.2;

    // Only play a brief part of it for the coin effect
    coinSoundRef.current.addEventListener("play", () => {
      // Stop after 300ms to just get the initial "ding" sound
      setTimeout(() => {
        if (coinSoundRef.current && !coinSoundRef.current.paused) {
          coinSoundRef.current.pause();
          coinSoundRef.current.currentTime = 0;
        }
      }, 300);
    });

    return () => {
      if (coinSoundRef.current) {
        coinSoundRef.current = null;
      }
    };
  }, []);

  // Blinking effect for "INSERT COIN" text
  useEffect(() => {
    if (inserted) return;

    const interval = setInterval(() => {
      setVisible((prev) => !prev);
    }, 800);

    return () => clearInterval(interval);
  }, [inserted]);

  // Random text glitch effect
  useEffect(() => {
    const glitchInterval = setInterval(() => {
      if (Math.random() > 0.9) {
        setGlitchText(true);
        setTimeout(() => setGlitchText(false), 200);
      }
    }, 5000);

    return () => clearInterval(glitchInterval);
  }, []);

  const handleInsertCoin = () => {
    // Start the coin animation
    setCoinAnimation(true);

    // Play coin sound with proper promise handling
    if (coinSoundRef.current) {
      try {
        // Reset sound to beginning in case it was played before
        coinSoundRef.current.currentTime = 0;

        const playPromise = coinSoundRef.current.play();

        if (playPromise !== undefined) {
          playPromise.catch((error) => {
            console.error("Audio playback prevented by browser:", error);
            // Continue with visual feedback even if sound fails
          });
        }
      } catch (err) {
        console.error("Error playing coin sound:", err);
      }
    }

    // After coin animation completes, update credit state
    setTimeout(() => {
      setCoinAnimation(false);
      setInserted(true);
      setVisible(true);
      setCredits((prev) => prev + 1);

      // Reset after 3 seconds
      setTimeout(() => {
        setInserted(false);
      }, 3000);
    }, 600); // Animation time
  };

  return (
    <div className={styles.insertCoinContainer}>
      <div
        className={`${styles.insertCoin} ${
          visible ? styles.visible : styles.hidden
        } ${glitchText ? styles.textGlitch : ""}`}
        onClick={handleInsertCoin}
      >
        {inserted ? `CREDIT: ${credits}` : "INSERT COIN"}
      </div>

      {!inserted && (
        <div className={styles.coinSlotContainer}>
          <div
            className={`${styles.coinSlot} ${
              coinAnimation ? styles.insertingCoin : ""
            }`}
            onClick={handleInsertCoin}
          >
            <div className={styles.slot}></div>
          </div>

          {coinAnimation && (
            <div className={styles.coin}>
              <div className={styles.coinInner}>$</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
