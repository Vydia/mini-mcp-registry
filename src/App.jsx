import { useState } from 'react';
import { useRegistry } from './hooks/useRegistry';
import { ServerCard } from './components/ServerCard';
import { PRESETS } from './presets';
import './App.css';

export default function App() {
  const [activePreset, setActivePreset] = useState(PRESETS[0]);
  const [customQuery, setCustomQuery] = useState('');

  const search = customQuery.trim() || activePreset.search;

  const { servers, loading, error, refetch } = useRegistry(search);

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div>
            <h1>MCP Registry Explorer</h1>
            <p className="subtitle">Browse filtered MCP servers from the official registry</p>
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
        <section className="filter-section">
          <div className="preset-tabs">
            {PRESETS.map((preset) => (
              <button
                key={preset.id}
                className={`preset-tab ${activePreset.id === preset.id && !customQuery ? 'active' : ''}`}
                onClick={() => {
                  setActivePreset(preset);
                  setCustomQuery('');
                }}
              >
                {preset.label}
              </button>
            ))}
          </div>

          <div className="custom-filter">
            <input
              type="text"
              placeholder="Custom search…"
              value={customQuery}
              onChange={(e) => setCustomQuery(e.target.value)}
            />
          </div>

          <p className="filter-description">
            {customQuery.trim() ? `Searching for: "${customQuery.trim()}"` : activePreset.description}
          </p>
        </section>

        {loading && (
          <div className="status">
            <span className="spinner" /> Searching registry…
          </div>
        )}

        {error && (
          <div className="status error">
            Error: {error} — <button onClick={refetch}>Retry</button>
          </div>
        )}

        {!loading && !error && (
          <div className="results-header">
            <span>{servers.length} server{servers.length !== 1 ? 's' : ''} found</span>
          </div>
        )}

        <div className="server-grid">
          {servers.map((entry) => (
            <ServerCard key={`${entry.server.name}:${entry.server.version}`} entry={entry} />
          ))}
        </div>

        {!loading && !error && servers.length === 0 && (
          <div className="empty">No servers matched the current filter.</div>
        )}
      </main>
    </div>
  );
}
