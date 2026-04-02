// AuthScreen: shows sign up / sign in tabs and a guest play button; calls onAuth(token, username) or onGuest() on success.
import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface AuthScreenProps {
  onAuth: (token: string, username: string) => void;
  onGuest: () => void;
}

export default function AuthScreen({ onAuth, onGuest }: AuthScreenProps) {
  const [tab, setTab] = useState<'login' | 'signup'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Submits login or signup form; calls /api/auth/login or /api/auth/signup and returns JWT.
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const endpoint = tab === 'login' ? '/api/auth/login' : '/api/auth/signup';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Something went wrong');
      } else {
        onAuth(data.token, data.username);
      }
    } catch {
      setError('Could not connect to server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-amber-100 flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl mb-2 text-amber-900">🏴‍☠️ Treasure Hunt Game 🏴‍☠️</h1>
      <p className="text-amber-700 mb-8 text-sm">Sign in to track your scores, or play as a guest</p>

      <div className="w-full max-w-sm bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border-2 border-amber-200 p-6">
        {/* Tab switcher */}
        <div className="flex mb-6 rounded-lg overflow-hidden border border-amber-200">
          <button
            className={`flex-1 py-2 text-sm font-medium transition-colors ${
              tab === 'login'
                ? 'bg-amber-500 text-white'
                : 'bg-white text-amber-700 hover:bg-amber-50'
            }`}
            onClick={() => { setTab('login'); setError(''); }}
          >
            Sign In
          </button>
          <button
            className={`flex-1 py-2 text-sm font-medium transition-colors ${
              tab === 'signup'
                ? 'bg-amber-500 text-white'
                : 'bg-white text-amber-700 hover:bg-amber-50'
            }`}
            onClick={() => { setTab('signup'); setError(''); }}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="username" className="text-amber-900">Username</Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Enter username"
              className="border-amber-200 focus:border-amber-400"
              required
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="password" className="text-amber-900">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter password"
              className="border-amber-200 focus:border-amber-400"
              required
            />
          </div>

          {error && (
            <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-md p-2">
              {error}
            </p>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-600 hover:bg-amber-700 text-white"
          >
            {loading ? '...' : tab === 'login' ? 'Sign In' : 'Sign Up'}
          </Button>
        </form>

        <div className="mt-4 pt-4 border-t border-amber-100">
          <Button
            variant="outline"
            className="w-full border-amber-300 text-amber-700 hover:bg-amber-50"
            onClick={onGuest}
          >
            Play as Guest (no score saved)
          </Button>
        </div>
      </div>
    </div>
  );
}
