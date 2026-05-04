(() => {
  const sdk = window.__HERMES_PLUGIN_SDK__;
  const registry = window.__HERMES_PLUGINS__;
  if (!sdk || !registry || typeof registry.register !== 'function') {
    console.error('[hermesworld-plugin] Hermes plugin SDK/registry unavailable');
    return;
  }

  const { React } = sdk;
  const { useEffect, useMemo, useState } = React;
  const LS_KEY = 'hermesworld-plugin:base-url';

  function normalizeBaseUrl(value) {
    const trimmed = String(value || '').trim();
    return trimmed ? trimmed.replace(/\/+$/, '') : '';
  }

  function candidateWorkspaceUrls() {
    const { protocol, hostname } = window.location;
    return [
      `${protocol}//${hostname}:3002`,
      `${protocol}//${hostname}:3001`,
      `${protocol}//${hostname}:3000`,
    ];
  }

  async function probeWorkspace(baseUrl) {
    const base = normalizeBaseUrl(baseUrl);
    if (!base) return false;
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 2500);
      const res = await fetch(`${base}/api/healthcheck`, {
        signal: controller.signal,
        credentials: 'include',
      });
      clearTimeout(timer);
      return res.ok;
    } catch {
      return false;
    }
  }

  function HermesWorldPlugin() {
    const [baseUrl, setBaseUrl] = useState(() => {
      try {
        return normalizeBaseUrl(localStorage.getItem(LS_KEY) || candidateWorkspaceUrls()[0]);
      } catch {
        return candidateWorkspaceUrls()[0];
      }
    });
    const [draftBaseUrl, setDraftBaseUrl] = useState(baseUrl);
    const [workspaceReady, setWorkspaceReady] = useState(false);

    useEffect(() => {
      let cancelled = false;
      async function detectWorkspace() {
        const candidates = [normalizeBaseUrl(baseUrl), ...candidateWorkspaceUrls()]
          .filter(Boolean)
          .filter((value, index, arr) => arr.indexOf(value) === index);
        for (const candidate of candidates) {
          const ok = await probeWorkspace(candidate);
          if (ok) {
            if (!cancelled) {
              setWorkspaceReady(true);
              setBaseUrl(candidate);
              setDraftBaseUrl(candidate);
              try { localStorage.setItem(LS_KEY, candidate); } catch {}
            }
            return;
          }
        }
        if (!cancelled) setWorkspaceReady(false);
      }
      detectWorkspace();
      return () => {
        cancelled = true;
      };
    }, [baseUrl]);

    const worldUrl = useMemo(() => {
      const base = normalizeBaseUrl(baseUrl);
      return base ? `${base}/playground?embed=1` : '';
    }, [baseUrl]);

    const openExternal = () => {
      if (!worldUrl) return;
      window.open(worldUrl, '_blank', 'noopener,noreferrer');
    };

    const saveBaseUrl = async () => {
      const next = normalizeBaseUrl(draftBaseUrl);
      setBaseUrl(next);
      try { localStorage.setItem(LS_KEY, next); } catch {}
      setWorkspaceReady(await probeWorkspace(next));
    };

    return React.createElement(
      'div',
      {
        className: 'min-h-0 h-full overflow-hidden',
        style: {
          height: 'calc(100vh - 118px)',
          margin: '-16px',
          background: '#020617',
        },
      },
      React.createElement(
        'div',
        {
          className: 'flex h-full min-h-0 flex-col overflow-hidden',
          style: {
            background: 'linear-gradient(180deg, #0f172a 0%, #111827 100%)',
            color: '#f8fafc',
          },
        },
        React.createElement(
          'div',
          {
            className: 'flex shrink-0 items-center justify-between gap-3 border-b px-4 py-2.5',
            style: { borderColor: 'rgba(255,255,255,0.08)' },
          },
          React.createElement(
            'div',
            { className: 'min-w-0 flex-1' },
            React.createElement('div', { className: 'text-sm font-semibold tracking-wide' }, 'HermesWorld'),
            React.createElement(
              'div',
              { className: 'truncate text-xs', style: { color: workspaceReady ? '#facc15' : 'rgba(255,255,255,0.65)' } },
              workspaceReady
                ? `Ready on ${baseUrl}/playground`
                : 'Workspace not yet reachable, set the correct URL below',
            ),
          ),
          React.createElement(
            'div',
            { className: 'flex items-center gap-2' },
            React.createElement('input', {
              value: draftBaseUrl,
              onChange: (e) => setDraftBaseUrl(e.target.value),
              placeholder: 'http://127.0.0.1:3002',
              className: 'w-64 rounded-xl border px-3 py-2 text-xs',
              style: {
                borderColor: 'rgba(255,255,255,0.12)',
                background: 'rgba(255,255,255,0.04)',
                color: '#f8fafc',
              },
            }),
            React.createElement('button', {
              onClick: saveBaseUrl,
              className: 'rounded-xl px-3 py-2 text-xs font-medium',
              style: { background: 'rgba(255,255,255,0.08)', color: '#f8fafc' },
            }, 'Set URL'),
            React.createElement('button', {
              onClick: openExternal,
              disabled: !worldUrl,
              className: 'rounded-xl px-3 py-2 text-xs font-medium',
              style: {
                background: '#f59e0b',
                color: 'black',
                opacity: worldUrl ? 1 : 0.5,
              },
            }, 'Open ↗'),
          ),
        ),
        worldUrl
          ? React.createElement('iframe', {
              title: 'HermesWorld',
              src: worldUrl,
              className: 'min-h-0 flex-1 border-0 bg-black',
            })
          : React.createElement(
              'div',
              { className: 'p-6 text-sm', style: { color: 'rgba(255,255,255,0.7)' } },
              'Set a Hermes Workspace URL to embed HermesWorld here.',
            ),
      ),
    );
  }

  registry.register('hermesworld', HermesWorldPlugin);
})();
