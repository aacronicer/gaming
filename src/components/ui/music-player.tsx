"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import styles from "./music-player.module.css";

export default function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(true); // Changed to true for autoplay
  const [volume, setVolume] = useState(0.5);
  const [currentSong, setCurrentSong] = useState("homeScreen");
  const [audioError, setAudioError] = useState("");
  const [collapsed, setCollapsed] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const loadingRef = useRef(false);
  const pathname = usePathname();

  // Initialize audio on client-side
  useEffect(() => {
    // Initialize with background music
    try {
      audioRef.current = new Audio();
      audioRef.current.src = `/audio/${currentSong}.mp3`;
      audioRef.current.loop = true;
      audioRef.current.volume = volume;

      // Add error event listener
      audioRef.current.addEventListener("error", (e) => {
        console.error("Audio loading error:", e);
        setAudioError("Audio failed to load");
        // Clear error after 3 seconds
        setTimeout(() => setAudioError(""), 3000);
      });
    } catch (err) {
      console.error("Error initializing audio:", err);
    }

    // Cleanup
    return () => {
      if (audioRef.current) {
        // Remove event listeners
        audioRef.current.onplay = null;
        audioRef.current.onpause = null;
        audioRef.current.onerror = null;

        // Properly clean up the audio element
        audioRef.current.pause();
        audioRef.current.src = "";
        audioRef.current = null;
      }
    };
  }, []);

  // Check if we can access the audio files - add this for debugging
  useEffect(() => {
    const checkAudioFile = async (file: string) => {
      try {
        const response = await fetch(file, { method: "HEAD" });
        console.log(`Audio file ${file} status:`, response.status);
        return response.status === 200;
      } catch (e) {
        console.error(`Error checking audio file ${file}:`, e);
        return false;
      }
    };

    // Check the home music file as a test
    checkAudioFile("/audio/homeScreen.mp3").then((exists) => {
      console.log("Home screen audio exists:", exists);
    });
  }, []);

  // Get the appropriate music file based on current path
  useEffect(() => {
    const getMusicFile = () => {
      if (pathname === "/") {
        return "homeScreen";
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
          // Check if we have a specific music file for this game
          // Ensure we only use files that actually exist (1-10)
          const adjustedIndex = (gameIndex % 9) + 1; // We have game1.mp3 to game10.mp3
          return `game${adjustedIndex}`;
        }
      }

      // Default fallback
      return "homeScreen";
    };

    // Get new music file for current page
    const newMusicFile = getMusicFile();
    console.log(`Setting new music file: ${newMusicFile}`);

    // Only change if it's different
    if (newMusicFile !== currentSong) {
      setCurrentSong(newMusicFile);
    }
  }, [pathname, currentSong]);

  // Handle play state changes
  useEffect(() => {
    if (!audioRef.current) return;

    try {
      if (isPlaying && !loadingRef.current) {
        const playPromise = audioRef.current.play();

        // Handle promise to catch autoplay restrictions
        if (playPromise !== undefined) {
          playPromise.catch((error) => {
            console.error("Audio playback prevented:", error);
            setIsPlaying(false);
            setAudioError("Click to enable audio");
            // Clear error after 3 seconds
            setTimeout(() => setAudioError(""), 3000);
          });
        }
      } else if (!isPlaying && audioRef.current) {
        audioRef.current.pause();
      }
    } catch (err) {
      console.error("Error controlling audio:", err);
      setIsPlaying(false);
    }
  }, [isPlaying]);

  // Handle volume changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Handle song changes
  useEffect(() => {
    if (!audioRef.current) return;

    // Prevent rapid song changes
    loadingRef.current = true;

    try {
      // Store current playing state
      const wasPlaying = !audioRef.current.paused;

      // First pause and reset the current audio
      audioRef.current.pause();

      // Change the source with proper error handling
      const handleAudioLoad = () => {
        loadingRef.current = false;

        // Resume playback if it was playing before
        if (wasPlaying && isPlaying) {
          const playPromise = audioRef.current!.play();

          if (playPromise !== undefined) {
            playPromise.catch((error) => {
              console.error("Audio change prevented:", error);
              setIsPlaying(false);
            });
          }
        }

        // Remove this handler after execution
        if (audioRef.current) {
          audioRef.current.removeEventListener(
            "canplaythrough",
            handleAudioLoad
          );
        }
      };

      // Add event listener for when the audio is ready
      audioRef.current.addEventListener("canplaythrough", handleAudioLoad);

      // Set new source and start loading
      audioRef.current.src = `/audio/${currentSong}.mp3`;
      audioRef.current.load();

      // Set a timeout in case the audio never loads
      setTimeout(() => {
        if (loadingRef.current && audioRef.current) {
          loadingRef.current = false;
          audioRef.current.removeEventListener(
            "canplaythrough",
            handleAudioLoad
          );
          console.log("Audio loading timeout - forcing recovery");

          if (wasPlaying && isPlaying) {
            const playPromise = audioRef.current.play();
            if (playPromise !== undefined) {
              playPromise.catch((error) => {
                console.error("Audio recovery failed:", error);
                setIsPlaying(false);
              });
            }
          }
        }
      }, 3000); // 3 second timeout
    } catch (err) {
      loadingRef.current = false;
      console.error("Error changing audio source:", err);
      setAudioError("Error changing track");
      // Clear error after 3 seconds
      setTimeout(() => setAudioError(""), 3000);
    }
  }, [currentSong, isPlaying]);

  const togglePlay = () => {
    setIsPlaying((prev) => !prev);
    setAudioError(""); // Clear any errors when user manually toggles
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
  };

  const toggleCollapsed = () => {
    setCollapsed((prev) => !prev);
  };

  return (
    <div
      className={`${styles.musicPlayer} ${collapsed ? styles.collapsed : ""}`}
    >
      <button
        className={styles.expandToggle}
        onClick={toggleCollapsed}
        aria-label={collapsed ? "Expand music player" : "Collapse music player"}
      >
        {collapsed ? "🎵" : "▶"}{" "}
        {/* Changed from "◀" to "▶" for correct direction */}
      </button>

      {!collapsed && (
        <div className={styles.playerControls}>
          <button
            className={styles.playButton}
            onClick={togglePlay}
            aria-label={isPlaying ? "Pause music" : "Play music"}
          >
            {isPlaying ? "❚❚" : "▶"}
          </button>

          <div className={styles.songInfo}>
            {currentSong === "homeScreen" ? "Arcade Theme" : currentSong}
          </div>

          <div className={styles.volumeContainer}>
            <span className={styles.volumeIcon}>🔊</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
              className={styles.volumeSlider}
              aria-label="Volume control"
            />
          </div>

          {audioError && (
            <div className={styles.errorTooltip}>{audioError}</div>
          )}
        </div>
      )}
    </div>
  );
}
