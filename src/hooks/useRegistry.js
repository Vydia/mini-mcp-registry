import { useState, useEffect, useCallback } from 'react';

const REGISTRY_URL = 'https://registry.modelcontextprotocol.io/v0.1/servers';

export function useRegistry(search) {
  const [servers, setServers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSearch = useCallback(async () => {
    setLoading(true);
    setError(null);
    setServers([]);

    const results = [];
    let cursor = null;

    try {
      do {
        const url = new URL(REGISTRY_URL);
        url.searchParams.set('search', search);
        url.searchParams.set('version', 'latest');
        url.searchParams.set('limit', '100');
        if (cursor) url.searchParams.set('cursor', cursor);

        const res = await fetch(url.toString());
        if (!res.ok) throw new Error(`Registry API error: ${res.status}`);

        const data = await res.json();
        results.push(...(data.servers ?? []));
        cursor = data.metadata?.nextCursor ?? null;
      } while (cursor);

      setServers(results);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchSearch();
  }, [fetchSearch]);

  return { servers, loading, error, refetch: fetchSearch };
}
