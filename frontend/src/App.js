import { useState, useEffect } from "react";
import "./App.css";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Proxy Component
const ProxyBrowser = () => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [proxyContent, setProxyContent] = useState('');
  const [error, setError] = useState('');
  const [useEnhanced, setUseEnhanced] = useState(false);

  const handleProxy = async (e) => {
    e.preventDefault();
    if (!url) return;
    
    setLoading(true);
    setError('');
    setProxyContent('');
    
    try {
      const endpoint = useEnhanced ? 'proxy-enhanced' : 'proxy';
      const response = await axios.post(`${API}/${endpoint}`, { url });
      setProxyContent(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load website');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 mb-6 border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-4">🌐 Web Proxy</h2>
          <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-4 mb-4">
            <p className="text-yellow-100 text-sm">
              ⚠️ <strong>Disclaimer:</strong> This proxy is for educational purposes only. 
              Please respect website terms of service and local laws.
            </p>
          </div>

          <div className="mb-4">
            <label className="flex items-center gap-3 text-white">
              <input
                type="checkbox"
                checked={useEnhanced}
                onChange={(e) => setUseEnhanced(e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
              />
              <span className="text-sm">
                🚀 Enhanced Mode (Better network bypass - try this for blocked sites like Reddit)
              </span>
            </label>
          </div>
          
          <form onSubmit={handleProxy} className="flex gap-3">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter website URL (e.g., reddit.com, example.com)"
              className="flex-1 px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={loading || !url}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Loading...
                </>
              ) : (
                <>🚀 Access</>
              )}
            </button>
          </form>

          <div className="mt-4 text-sm text-white/70">
            <p><strong>💡 Tips for bypassing network blocks:</strong></p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Use Enhanced Mode for better bypass capabilities</li>
              <li>Try different URLs: reddit.com, old.reddit.com, np.reddit.com</li>
              <li>Some enterprise firewalls may still block certain domains</li>
            </ul>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6">
            <p className="text-red-200">❌ {error}</p>
          </div>
        )}

        {proxyContent && (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="bg-gray-100 px-4 py-2 border-b border-gray-200">
              <p className="text-sm text-gray-600">
                Viewing: {url} {useEnhanced && "(Enhanced Mode)"}
              </p>
            </div>
            <div className="h-96 overflow-auto">
              <div dangerouslySetInnerHTML={{ __html: proxyContent }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// GN-Math Portal Component  
const GNMathPortal = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-red-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 mb-6 border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-4">🎯 GN-Math Games Portal</h2>
          <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4 mb-4">
            <p className="text-green-100 text-sm">
              ✅ <strong>Clever Bypass:</strong> This loads clever.college which appears as an educational site but reveals GN-Math games when clicked.
              <br />🖱️ <strong>How to use:</strong> The page will auto-click to reveal hidden games, or you can click around the screen yourself.
            </p>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-xl overflow-hidden border border-white/10">
          <div className="bg-gray-900/50 px-4 py-2 border-b border-white/10">
            <p className="text-white text-sm">🎮 GN-Math Games - Click anywhere on the screen to reveal games</p>
          </div>
          <div className="relative">
            <iframe
              src={`${BACKEND_URL}/api/clever-proxy`}
              className="w-full h-[600px] border-0"
              title="GN-Math Games Portal"
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
            />
          </div>
        </div>

        <div className="mt-6 bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
          <p className="text-white/80 text-sm">
            <strong>💡 Tips:</strong>
          </p>
          <ul className="text-white/70 text-sm list-disc list-inside mt-2 space-y-1">
            <li>The page auto-clicks to reveal games, but you can also click manually</li>
            <li>If games don't appear, try clicking different areas of the screen</li>
            <li>This method bypasses school filters by appearing as a legitimate educational site</li>
            <li>All the GN-Math games (Undertale, OMORI, Pizza Tower, etc.) are available through this portal</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

// Updated Games Component with GN-Math integration
const GamesBrowser = () => {
  const [games, setGames] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGames();
    fetchCategories();
    initializeCleverGames();
  }, []);

  const initializeCleverGames = async () => {
    try {
      await axios.post(`${API}/games/init-clever`);
    } catch (err) {
      console.log('Games might already be initialized');
    }
  };

  const fetchGames = async (category = '') => {
    try {
      const response = await axios.get(`${API}/games${category ? `?category=${category}` : ''}`);
      setGames(response.data);
    } catch (err) {
      console.error('Failed to fetch games:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API}/games/categories`);
      setCategories(response.data);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const handleCategoryFilter = (category) => {
    setSelectedCategory(category);
    fetchGames(category);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-teal-900 to-blue-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading GN-Math games... 🎮</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-teal-900 to-blue-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 mb-6 border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-4">🎮 GN-Math Games Collection</h2>
          <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-4 mb-4">
            <p className="text-blue-100 text-sm">
              🌟 <strong>Now featuring clever.college integration!</strong> Access all GN-Math games through the hidden portal method.
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => handleCategoryFilter('')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedCategory === '' 
                  ? 'bg-white text-gray-900' 
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              All Games ({games.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat.category}
                onClick={() => handleCategoryFilter(cat.category)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedCategory === cat.category
                    ? 'bg-white text-gray-900'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                {cat.category} ({cat.count})
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map((game) => (
            <div key={game.id} className="bg-white/10 backdrop-blur-md rounded-xl overflow-hidden border border-white/20 hover:bg-white/20 transition-all group">
              <div className="aspect-video bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                {game.thumbnail ? (
                  <img 
                    src={game.thumbnail} 
                    alt={game.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-white text-4xl">🎮</div>
                )}
                {game.title.includes('Portal') && (
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 flex items-center justify-center">
                    <div className="text-white text-6xl">🎯</div>
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="text-white font-bold text-lg mb-2">{game.title}</h3>
                <p className="text-white/80 text-sm mb-3 line-clamp-2">{game.description}</p>
                <div className="flex items-center justify-between">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    game.category === 'Portal' 
                      ? 'bg-purple-500/20 text-purple-200' 
                      : 'bg-white/20 text-white'
                  }`}>
                    {game.category}
                  </span>
                  <a
                    href={game.game_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
                      game.title.includes('Portal')
                        ? 'bg-purple-600 hover:bg-purple-700 text-white'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    {game.title.includes('Portal') ? 'Open Portal 🎯' : 'Play ▶️'}
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {games.length === 0 && (
          <div className="text-center py-12">
            <div className="text-white text-xl mb-4">No games found 😔</div>
            <p className="text-white/80">Try selecting a different category or check back later!</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Main App Component
function App() {
  const [currentView, setCurrentView] = useState('proxy');

  return (
    <div className="App">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">AA</span>
              </div>
              <h1 className="text-white font-bold text-xl">AccessAnywhere</h1>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentView('proxy')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentView === 'proxy'
                    ? 'bg-white text-gray-900'
                    : 'text-white hover:bg-white/20'
                }`}
              >
                🌐 Proxy
              </button>
              <button
                onClick={() => setCurrentView('games')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentView === 'games'
                    ? 'bg-white text-gray-900'
                    : 'text-white hover:bg-white/20'
                }`}
              >
                🎮 Games
              </button>
              <button
                onClick={() => setCurrentView('gnmath')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentView === 'gnmath'
                    ? 'bg-white text-gray-900'
                    : 'text-white hover:bg-white/20'
                }`}
              >
                🎯 GN-Math Portal
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-20">
        {currentView === 'proxy' && <ProxyBrowser />}
        {currentView === 'games' && <GamesBrowser />}
        {currentView === 'gnmath' && <GNMathPortal />}
      </div>

      {/* Footer */}
      <footer className="bg-black/20 backdrop-blur-md border-t border-white/10 py-6">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-white/60 text-sm">
            AccessAnywhere - Unblock websites and access GN-Math games via clever.college
          </p>
          <p className="text-white/40 text-xs mt-2">
            Educational use only. Clever.college integration for bypassing school filters.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;