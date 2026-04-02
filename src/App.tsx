import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Button } from './components/ui/button';
import AuthScreen from './components/AuthScreen';
import closedChest from './assets/treasure_closed.png';
import treasureChest from './assets/treasure_opened.png';
import skeletonChest from './assets/treasure_opened_skeleton.png';
import chestOpenSound from './audios/chest_open.mp3';
import evilLaughSound from './audios/chest_open_with_evil_laugh.mp3';
import keyImage from './assets/key.png';

interface Box {
  id: number;
  isOpen: boolean;
  hasTreasure: boolean;
}

interface ScoreRecord {
  id: number;
  score: number;
  played_at: string;
}

export default function App() {
  const [boxes, setBoxes] = useState<Box[]>([]);
  const [score, setScore] = useState(0);
  const [gameEnded, setGameEnded] = useState(false);

  // Auth state: token + username for logged-in users, or null for guests/unauthenticated
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [username, setUsername] = useState<string | null>(() => localStorage.getItem('username'));
  const [isGuest, setIsGuest] = useState(false);

  const [pastScores, setPastScores] = useState<ScoreRecord[]>([]);
  const [scoreSaved, setScoreSaved] = useState(false);

  const initializeGame = () => {
    // Creates 3 boxes with one random treasure box; resets score and game state.
    const treasureBoxIndex = Math.floor(Math.random() * 3);
    const newBoxes: Box[] = Array.from({ length: 3 }, (_, index) => ({
      id: index,
      isOpen: false,
      hasTreasure: index === treasureBoxIndex,
    }));
    setBoxes(newBoxes);
    setScore(0);
    setGameEnded(false);
    setScoreSaved(false);
  };

  useEffect(() => {
    initializeGame();
  }, []);

  // Fetches the user's past scores from the API; requires a valid token.
  const fetchPastScores = async (authToken: string) => {
    try {
      const res = await fetch('/api/scores/me', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        setPastScores(data);
      }
    } catch {
      // Non-critical; silently fail
    }
  };

  // Saves the final score to the server for authenticated users; sets scoreSaved on success.
  const saveScore = async (finalScore: number) => {
    if (!token) return;
    try {
      const res = await fetch('/api/scores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ score: finalScore }),
      });
      if (res.ok) {
        setScoreSaved(true);
        fetchPastScores(token);
      }
    } catch {
      // Non-critical; silently fail
    }
  };

  const openBox = (boxId: number) => {
    // Opens a chest by id; updates score, plays audio, and ends game if treasure found or all boxes open.
    if (gameEnded) return;

    setBoxes(prevBoxes => {
      const updatedBoxes = prevBoxes.map(box => {
        if (box.id === boxId && !box.isOpen) {
          const newScore = box.hasTreasure ? score + 100 : score - 50;
          setScore(newScore);
          new Audio(box.hasTreasure ? chestOpenSound : evilLaughSound).play();
          return { ...box, isOpen: true };
        }
        return box;
      });

      const treasureFound = updatedBoxes.some(box => box.isOpen && box.hasTreasure);
      const allOpened = updatedBoxes.every(box => box.isOpen);
      if (treasureFound || allOpened) {
        setGameEnded(true);
        const finalScore = updatedBoxes.reduce((acc, box) => {
          if (box.isOpen) return acc + (box.hasTreasure ? 100 : -50);
          return acc;
        }, 0);
        if (token) saveScore(finalScore);
      }

      return updatedBoxes;
    });
  };

  const resetGame = () => {
    // Resets the game to a fresh state without changing auth.
    initializeGame();
  };

  // Handles successful auth: stores token + username in state and localStorage, fetches past scores.
  const handleAuth = (newToken: string, newUsername: string) => {
    setToken(newToken);
    setUsername(newUsername);
    setIsGuest(false);
    localStorage.setItem('token', newToken);
    localStorage.setItem('username', newUsername);
    fetchPastScores(newToken);
    initializeGame();
  };

  // Starts a guest session without authentication.
  const handleGuest = () => {
    setIsGuest(true);
    initializeGame();
  };

  // Logs out the current user and returns to the auth screen.
  const handleLogout = () => {
    setToken(null);
    setUsername(null);
    setIsGuest(false);
    setPastScores([]);
    localStorage.removeItem('token');
    localStorage.removeItem('username');
  };

  // Show auth screen if not logged in and not a guest
  if (!token && !isGuest) {
    return <AuthScreen onAuth={handleAuth} onGuest={handleGuest} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-amber-100 flex flex-col items-center justify-center p-8">
      {/* Header with user info */}
      <div className="w-full max-w-2xl flex justify-between items-center mb-4">
        <div className="text-sm text-amber-700">
          {username ? `👤 ${username}` : '🎭 Guest'}
        </div>
        <Button
          variant="outline"
          className="text-sm border-amber-300 text-amber-700 hover:bg-amber-100 px-3 py-1 h-auto"
          onClick={handleLogout}
        >
          {isGuest ? 'Exit' : 'Logout'}
        </Button>
      </div>

      <div className="text-center mb-8">
        <h1 className="text-4xl mb-4 text-amber-900">🏴‍☠️ Treasure Hunt Game 🏴‍☠️</h1>
        <p className="text-amber-800 mb-4">
          Click on the treasure chests to discover what's inside!
        </p>
        <p className="text-amber-700 text-sm">
          💰 Treasure: +$100 | 💀 Skeleton: -$50
        </p>
      </div>

      <div className="mb-8">
        <div className="text-2xl text-center p-4 bg-amber-200/80 backdrop-blur-sm rounded-lg shadow-lg border-2 border-amber-400">
          <span className="text-amber-900">Current Score: </span>
          <span className={`${score >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ${score}
          </span>
          <span className={`ml-3 text-lg font-bold ${score > 0 ? 'text-green-600' : score < 0 ? 'text-red-600' : 'text-amber-700'}`}>
            {score > 0 ? '🏆 WIN' : score < 0 ? '💀 LOSE' : ''}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {boxes.map((box) => (
              <motion.div
                key={box.id}
                className="flex flex-col items-center"
                style={{ cursor: box.isOpen ? 'default' : `url(${keyImage}) 16 16, pointer` }}
                whileHover={{ scale: box.isOpen ? 1 : 1.05 }}
                whileTap={{ scale: box.isOpen ? 1 : 0.95 }}
                onClick={() => openBox(box.id)}
              >
                <motion.div
                  initial={{ rotateY: 0 }}
                  animate={{
                    rotateY: box.isOpen ? 180 : 0,
                    scale: box.isOpen ? 1.1 : 1
                  }}
                  transition={{
                    duration: 0.6,
                    ease: "easeInOut"
                  }}
                  className="relative"
                >
                  <img
                    src={box.isOpen
                      ? (box.hasTreasure ? treasureChest : skeletonChest)
                      : closedChest
                    }
                    alt={box.isOpen
                      ? (box.hasTreasure ? "Treasure!" : "Skeleton!")
                      : "Treasure Chest"
                    }
                    className="w-48 h-48 object-contain drop-shadow-lg"
                  />

                  {box.isOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3, duration: 0.5 }}
                      className="absolute -top-8 left-1/2 transform -translate-x-1/2"
                    >
                      {box.hasTreasure ? (
                        <div className="text-2xl animate-bounce">✨💰✨</div>
                      ) : (
                        <div className="text-2xl animate-pulse">💀👻💀</div>
                      )}
                    </motion.div>
                  )}
                </motion.div>

                <div className="mt-4 text-center">
                  {box.isOpen ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.4, duration: 0.3 }}
                      className={`text-lg p-2 rounded-lg ${
                        box.hasTreasure
                          ? 'bg-green-100 text-green-800 border border-green-300'
                          : 'bg-red-100 text-red-800 border border-red-300'
                      }`}
                    >
                      {box.hasTreasure ? '+$100' : '-$50'}
                    </motion.div>
                  ) : (
                    <div className="text-amber-700 p-2">
                      Click to open!
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
      </div>

      {gameEnded && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center w-full max-w-md"
            >
              <div className="mb-4 p-6 bg-amber-200/80 backdrop-blur-sm rounded-xl shadow-lg border-2 border-amber-400">
                <h2 className="text-2xl mb-2 text-amber-900">Game Over!</h2>
                <p className="text-lg text-amber-800">
                  Final Score: <span className={`${score >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${score}
                  </span>
                </p>
                <p className="text-sm text-amber-600 mt-2">
                  {boxes.some(box => box.isOpen && box.hasTreasure)
                    ? 'Treasure found! Well done, treasure hunter! 🎉'
                    : 'No treasure found this time! Better luck next time! 💀'}
                </p>
                {token && scoreSaved && (
                  <p className="text-xs text-green-600 mt-2">✓ Score saved!</p>
                )}
                {isGuest && (
                  <p className="text-xs text-amber-500 mt-2">Sign in to save your scores</p>
                )}
              </div>

              {/* Past scores for logged-in users */}
              {token && pastScores.length > 0 && (
                <div className="mb-4 p-4 bg-white/70 rounded-xl border border-amber-200 text-left">
                  <h3 className="text-sm font-semibold text-amber-900 mb-2">📊 Your past scores</h3>
                  <table className="w-full text-sm">
                    <tbody>
                      {pastScores.slice(0, 5).map(s => (
                        <tr key={s.id} className="border-b border-amber-100 last:border-0">
                          <td className={`py-1 font-mono ${s.score >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            ${s.score}
                          </td>
                          <td className="py-1 text-amber-600 text-right text-xs">
                            {new Date(s.played_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <Button
                onClick={resetGame}
                className="text-lg px-8 py-4 bg-amber-600 hover:bg-amber-700 text-white"
              >
                Play Again
              </Button>
            </motion.div>
          )}
    </div>
  );
}
