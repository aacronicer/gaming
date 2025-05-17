"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { usePathname } from "next/navigation";
import styles from "./music-player.module.css";

export default function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(true); // Set to true by default
  const [error, setError] = useState(false);
  const [musicFile, setMusicFile] = useState("");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const initializedRef = useRef(false);
  const pathname = usePathname();

  // Get the appropriate music file based on current path
  const getMusicFile = useCallback(() => {
    if (pathname === "/") {
      return "/audio/homeScreen.mp3";
    }

    // Extract game name from path like /games/rock-paper-scissors
    const gamePath = pathname.split("/");
    if (gamePath.length >= 3 && gamePath[1] === "games") {
      const gameIndex = [
        "rock-paper-scissors",
        "number-guess",
        "dice-roller",
        "memory-match",
        "trivia-quiz",
        "word-unscramble",
        "grid-puzzle",
        "idle-clicker",
        "card-battle",
        "reaction-game",
      ].indexOf(gamePath[2]);

      if (gameIndex !== -1) {
        return `/audio/game${gameIndex + 1}.mp3`;
      }
    }

    // Default fallback
    return "/audio/homeScreen.mp3";
  }, [pathname]);

  // Separate useEffect for file selection
  useEffect(() => {
    setMusicFile(getMusicFile());
  }, [getMusicFile]);

  // Auto-play music when component mounts
  useEffect(() => {
    const autoPlayAudio = () => {
      if (audioRef.current) {
        try {
          const playPromise = audioRef.current.play();

          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                setIsPlaying(true);
                setError(false);
              })
              .catch((err) => {
                console.warn("Auto-play failed:", err);
                setError(true);
              });
          }
        } catch (e) {
          console.warn("Auto-play error:", e);
          setError(true);
        }
      }
    };

    // Try auto-play on first interaction with the page
    const handleFirstInteraction = () => {
      autoPlayAudio();
      // Remove the event listeners after first interaction
      document.removeEventListener("click", handleFirstInteraction);
      document.removeEventListener("keydown", handleFirstInteraction);
      document.removeEventListener("touchstart", handleFirstInteraction);
    };

    // Add event listeners for first user interaction to overcome browser autoplay policies
    document.addEventListener("click", handleFirstInteraction, { once: true });
    document.addEventListener("keydown", handleFirstInteraction, {
      once: true,
    });
    document.addEventListener("touchstart", handleFirstInteraction, {
      once: true,
    });

    return () => {
      // Clean up event listeners
      document.removeEventListener("click", handleFirstInteraction);
      document.removeEventListener("keydown", handleFirstInteraction);
      document.removeEventListener("touchstart", handleFirstInteraction);
    };
  }, []);

  // Separate useEffect for audio handling
  useEffect(() => {
    if (!musicFile) return;

    // Clear any existing fade interval
    if (fadeIntervalRef.current) {
      clearInterval(fadeIntervalRef.current);
      fadeIntervalRef.current = null;
    }

    let isMounted = true;

    // If we already have audio playing, fade it out
    const oldAudio = audioRef.current;

    const createNewAudio = () => {
      if (!isMounted) return;

      try {
        const audio = new Audio();

        // Setup event listeners before setting src
        audio.addEventListener(
          "canplaythrough",
          () => {
            if (!isMounted) return;
            console.log("Audio loaded and ready to play");
            initializedRef.current = true;

            // Auto-play if isPlaying is true
            if (isPlaying) {
              try {
                const playPromise = audio.play();
                if (playPromise !== undefined) {
                  playPromise.catch((err) => {
                    console.warn("Auto-resume failed:", err);
                    if (isMounted) setError(true);
                  });
                }
              } catch (e) {
                console.warn("Play error:", e);
                if (isMounted) setError(true);
              }
            }
          },
          { once: true }
        );

        audio.addEventListener("error", () => {
          if (!isMounted) return;
          const err = audio.error;
          console.warn("Audio error:", err?.message || "Unknown error");
          setError(true);

          // If we can't load the specific game music, try falling back to homeScreen
          if (musicFile !== "/audio/homeScreen.mp3") {
            console.log("Falling back to homeScreen music");
            setTimeout(() => {
              if (isMounted) setMusicFile("/audio/homeScreen.mp3");
            }, 1000);
          }
        });

        // Configure audio
        audio.loop = true;
        audio.volume = 0.5;
        audio.preload = "auto";

        // Set the source last
        audio.src = musicFile;

        // Store reference to the audio element
        audioRef.current = audio;
      } catch (err) {
        console.error("Error creating audio:", err);
        if (isMounted) setError(true);
      }
    };

    if (oldAudio && isPlaying) {
      // Fade out current audio before switching
      try {
        fadeIntervalRef.current = setInterval(() => {
          if (!isMounted || !oldAudio) {
            if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
            return;
          }

          if (oldAudio.volume > 0.05) {
            oldAudio.volume -= 0.05;
          } else {
            if (fadeIntervalRef.current) {
              clearInterval(fadeIntervalRef.current);
              fadeIntervalRef.current = null;
            }

            oldAudio.pause();
            oldAudio.src = "";
            createNewAudio();
          }
        }, 50);
      } catch (e) {
        console.warn("Fade error:", e);
        // If fade fails, just create new audio
        if (oldAudio) {
          try {
            oldAudio.pause();
            oldAudio.src = "";
          } catch (e) {
            console.warn("Old audio cleanup error:", e);
          }
        }
        createNewAudio();
      }
    } else {
      // No fade needed, create new audio directly
      if (oldAudio) {
        try {
          oldAudio.pause();
          oldAudio.src = "";
        } catch (e) {
          console.warn("Old audio cleanup error:", e);
        }
      }
      createNewAudio();
    }

    return () => {
      isMounted = false;

      if (fadeIntervalRef.current) {
        clearInterval(fadeIntervalRef.current);
        fadeIntervalRef.current = null;
      }
    };
  }, [musicFile, isPlaying]); // These dependencies are needed

  const toggleMusic = async () => {
    if (!audioRef.current) {
      console.log("No audio to toggle");
      return;
    }

    try {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        setError(false); // Reset error state on new attempt

        // Handle autoplay policy
        const playPromise = audioRef.current.play();

        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setIsPlaying(true);
              setError(false);
            })
            .catch((err) => {
              console.warn("Playback failed:", err);
              setError(true);
              setIsPlaying(false);
            });
        }
      }
    } catch (err) {
      console.error("Toggle music error:", err);
      setError(true);
      setIsPlaying(false);
    }
  };

  return (
    <div className={styles.musicPlayer}>
      <button
        onClick={toggleMusic}
        className={`${styles.musicButton} ${isPlaying ? styles.playing : ""} ${
          error ? styles.error : ""
        }`}
        aria-label={isPlaying ? "Mute music" : "Play music"}
      >
        {error ? "❌" : isPlaying ? "🔊" : "🔈"} 8-BIT
      </button>
      {error && (
        <div className={styles.errorTooltip}>Click to retry playing music</div>
      )}
    </div>
  );
}
