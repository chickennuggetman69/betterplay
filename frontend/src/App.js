import { useState, useEffect } from "react";
import "./App.css";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Smart Search/Proxy Component (Google-like)
const SmartProxy = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [proxyContent, setProxyContent] = useState('');
  const [error, setError] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isUrl, setIsUrl] = useState(false);

  // Detect if input is URL or search query
  const detectInputType = (input) => {
    const trimmed = input.trim();
    const isUrlPattern = (
      trimmed.startsWith('http://') || 
      trimmed.startsWith('https://') ||
      trimmed.startsWith('www.') ||
      (trimmed.includes('.') && !trimmed.includes(' ') && trimmed.split('.').length >= 2)
    );
    setIsUrl(isUrlPattern);
    return isUrlPattern;
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    detectInputType(value);
    
    // Get suggestions for search queries (not URLs)
    if (value.length > 2 && !detectInputType(value)) {
      fetchSuggestions(value);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const fetchSuggestions = async (searchQuery) => {
    try {
      const response = await axios.get(`${API}/search-suggestions?q=${encodeURIComponent(searchQuery)}`);
      setSuggestions(response.data.suggestions || []);
      setShowSuggestions(true);
    } catch (err) {
      setSuggestions([]);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setLoading(true);
    setError('');
    setProxyContent('');
    setShowSuggestions(false);
    
    try {
      const response = await axios.post(`${API}/smart-proxy`, { url: query.trim() });
      setProxyContent(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to process request');
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    detectInputType(suggestion);
  };

  const clearSearch = () => {
    setQuery('');
    setProxyContent('');
    setError('');
    setSuggestions([]);
    setShowSuggestions(false);
    setIsUrl(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 p-6">
      <div className="max-w-4xl mx-auto">
        
        {/* Google-like header */}
        <div className="text-center mb-8 pt-12">
          <h1 className="text-6xl font-light text-white mb-8">
            Access<span className="text-blue-300">Anywhere</span>
          </h1>
        </div>

        {/* Smart search box */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 mb-6 border border-white/20 relative">
          <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-3 mb-4">
            <p className="text-yellow-100 text-sm">
              💡 <strong>Smart Search:</strong> Type anything! Search questions, topics, or enter websites directly (reddit.com, youtube.com, etc.)
            </p>
          </div>

          <form onSubmit={handleSearch} className="relative">
            <div className="relative">
              <div className="flex items-center bg-white/20 rounded-full border border-white/30 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-400/50 transition-all">
                <div className="pl-6 pr-3 text-white/60">
                  {isUrl ? '🌐' : '🔍'}
                </div>
                <input
                  type="text"
                  value={query}
                  onChange={handleInputChange}
                  onFocus={() => query.length > 2 && !isUrl && setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  placeholder={isUrl ? "Enter website URL..." : "Search anything or enter a website..."}
                  className="flex-1 px-2 py-4 bg-transparent text-white placeholder-white/60 focus:outline-none text-lg"
                />
                {query && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="pr-3 text-white/60 hover:text-white"
                  >
                    ✕
                  </button>
                )}
                <button
                  type="submit"
                  disabled={loading || !query.trim()}
                  className="mr-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-medium rounded-full transition-colors flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      {isUrl ? 'Loading...' : 'Searching...'}
                    </>
                  ) : (
                    <>{isUrl ? 'Visit' : 'Search'}</>
                  )}
                </button>
              </div>

              {/* Search suggestions dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-md rounded-lg border border-white/20 shadow-xl z-50">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full text-left px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-900 transition-colors flex items-center gap-3 border-b border-gray-200 last:border-b-0"
                    >
                      <span className="text-gray-400">🔍</span>
                      <span>{suggestion}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </form>

          {/* Input type indicator */}
          <div className="mt-4 text-center">
            <p className="text-white/70 text-sm">
              {isUrl ? (
                <>🌐 <strong>Website Mode:</strong> Will access the website directly</>
              ) : (
                <>🔍 <strong>Search Mode:</strong> Will search Google for your query</>
              )}
            </p>
          </div>
        </div>

        {/* Quick action buttons */}
        <div className="flex justify-center gap-3 mb-6">
          <button
            onClick={() => {setQuery('reddit.com'); setIsUrl(true);}}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors text-sm"
          >
            Reddit
          </button>
          <button
            onClick={() => {setQuery('youtube.com'); setIsUrl(true);}}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors text-sm"
          >
            YouTube
          </button>
          <button
            onClick={() => {setQuery('what is the weather today'); setIsUrl(false);}}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors text-sm"
          >
            Weather
          </button>
          <button
            onClick={() => {setQuery('latest tech news'); setIsUrl(false);}}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors text-sm"
          >
            Tech News
          </button>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6">
            <p className="text-red-200">❌ {error}</p>
          </div>
        )}

        {proxyContent && (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="bg-gray-100 px-4 py-2 border-b border-gray-200 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                {isUrl ? `Viewing: ${query}` : `Search results for: "${query}"`}
              </p>
              <button
                onClick={clearSearch}
                className="text-gray-500 hover:text-gray-700 text-sm"
              >
                ✕ Close
              </button>
            </div>
            <div className="h-96 overflow-auto">
              <div dangerouslySetInnerHTML={{ __html: proxyContent }} />
            </div>
          </div>
        )}

        {/* Tips section */}
        {!proxyContent && (
          <div className="mt-8 bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <h3 className="text-white font-semibold text-lg mb-4">💡 How to use:</h3>
            <div className="grid md:grid-cols-2 gap-4 text-white/80 text-sm">
              <div>
                <h4 className="text-white font-medium mb-2">🔍 Search Mode:</h4>
                <ul className="space-y-1">
                  <li>• "how to learn programming"</li>
                  <li>• "best pizza places near me"</li>
                  <li>• "latest movie reviews"</li>
                  <li>• "python tutorial for beginners"</li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-medium mb-2">🌐 Website Mode:</h4>
                <ul className="space-y-1">
                  <li>• reddit.com</li>
                  <li>• youtube.com</li>
                  <li>• github.com</li>
                  <li>• stackoverflow.com</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// GN-Math Games Portal (renamed to just "Games")
const GamesPortal = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-red-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 mb-6 border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-4">🎮 GN-Math Games</h2>
          <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4 mb-4">
            <p className="text-green-100 text-sm">
              ✅ <strong>Direct Access:</strong> This loads gn-math.dev directly - all games are instantly accessible!
              <br />🎮 <strong>All Games Available:</strong> Undertale, OMORI, Pizza Tower, Cuphead, ULTRAKILL, and many more.
            </p>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-xl overflow-hidden border border-white/10">
          <div className="bg-gray-900/50 px-4 py-2 border-b border-white/10">
            <p className="text-white text-sm">🎯 GN-Math Games Portal - All games ready to play</p>
          </div>
          <div className="relative">
            <iframe
              src={`${BACKEND_URL}/api/gnmath-proxy`}
              className="w-full h-[600px] border-0"
              title="GN-Math Games"
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
            />
          </div>
        </div>

        <div className="mt-6 bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
          <p className="text-white/80 text-sm">
            <strong>🎮 Available Games Include:</strong>
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2 text-white/70 text-sm">
            <div>• Undertale</div>
            <div>• OMORI</div>
            <div>• Pizza Tower</div>
            <div>• Cuphead</div>
            <div>• ULTRAKILL</div>
            <div>• Hotline Miami</div>
            <div>• Baldi's Basics</div>
            <div>• And many more...</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main App Component
function App() {
  const [currentView, setCurrentView] = useState('search');

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
                onClick={() => setCurrentView('search')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentView === 'search'
                    ? 'bg-white text-gray-900'
                    : 'text-white hover:bg-white/20'
                }`}
              >
                🔍 Search
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
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-20">
        {currentView === 'search' && <SmartProxy />}
        {currentView === 'games' && <GamesPortal />}
      </div>

      {/* Footer */}
      <footer className="bg-black/20 backdrop-blur-md border-t border-white/10 py-6">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-white/60 text-sm">
            AccessAnywhere - Smart search & web access + GN-Math games via gn-math.dev
          </p>
          <p className="text-white/40 text-xs mt-2">
            Educational use only. Search anything or access websites directly.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;