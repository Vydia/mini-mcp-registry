import { useState, useEffect, useCallback } from 'react';

const REGISTRY_URL = 'https://registry.modelcontextprotocol.io/v0/servers';

export function useRegistry(keywords) {
  const [servers, setServers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);

    const results = [];
    let cursor = null;

    try {
      do {
        const url = new URL(REGISTRY_URL);
        url.searchParams.set('limit', '100');
        if (cursor) url.searchParams.set('after', cursor);

        const res = await fetch(url.toString());
        if (!res.ok) throw new Error(`Registry API error: ${res.status}`);

        const data = await res.json();
        results.push(...(data.servers || []));
        cursor = data.metadata?.nextCursor ?? null;
      } while (cursor);

      setServers(results);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const filtered = servers.filter((entry) => {
    const s = entry.server;
    const searchable = `${s.name} ${s.title ?? ''} ${s.description ?? ''}`.toLowerCase();
    return keywords.some((kw) => searchable.includes(kw.toLowerCase()));
  });

  return { servers: filtered, total: servers.length, loading, error, refetch: fetchAll };
}
