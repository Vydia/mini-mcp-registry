import { useState, useEffect } from 'react';
import { ServerCard } from './components/ServerCard';
import './App.css';

export default function App() {
  const [servers, setServers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = () => {
    setLoading(true);
    setError(null);
    fetch('./allowed-servers.json')
      .then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then((d) => setServers(d.servers ?? []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div>
            <h1>MCP Registry</h1>
            <p className="subtitle">Allowed MCP servers for this organization</p>
          </div>
          <a
            href="https://registry.modelcontextprotocol.io"
            target="_blank"
            rel="noreferrer"
            className="registry-link"
          >
            Official Registry ↗
          </a>
        </div>
      </header>

      <main className="app-main">
        {loading && (
          <div className="status"><span className="spinner" /> Loading…</div>
        )}

        {error && (
          <div className="status error">
            Error: {error} — <button onClick={load}>Retry</button>
          </div>
        )}

        {!loading && !error && (
          <div className="results-header">
            <span>{servers.length} allowed server{servers.length !== 1 ? 's' : ''}</span>
          </div>
        )}

        <div className="server-grid">
          {servers.map((entry) => (
            <ServerCard key={`${entry.server.name}:${entry.server.version}`} entry={entry} />
          ))}
        </div>
      </main>
    </div>
  );
}
