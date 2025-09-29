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