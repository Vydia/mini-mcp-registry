import './ServerCard.css';

export function ServerCard({ entry }) {
  const s = entry.server;
  const icon = s.icons?.[0]?.src;
  const repoUrl = s.repository?.url;
  const websiteUrl = s.websiteUrl;
  const isRemote = s.remotes?.length > 0;

  return (
    <div className="server-card">
      <div className="server-card-header">
        {icon ? (
          <img className="server-icon" src={icon} alt="" />
        ) : (
          <div className="server-icon-placeholder">{(s.title || s.name).charAt(s.name.lastIndexOf('/') + 1).toUpperCase()}</div>
        )}
        <div className="server-card-title">
          <h3>{s.title || s.name.split('/').pop()}</h3>
          <span className="server-name">{s.name}</span>
        </div>
        {isRemote && <span className="badge remote">Remote</span>}
      </div>

      {s.description && <p className="server-description">{s.description}</p>}

      <div className="server-card-footer">
        <span className="server-version">v{s.version}</span>
        <div className="server-links">
          {repoUrl && (
            <a href={repoUrl} target="_blank" rel="noreferrer">Repository</a>
          )}
          {websiteUrl && (
            <a href={websiteUrl} target="_blank" rel="noreferrer">Website</a>
          )}
        </div>
      </div>
    </div>
  );
}
