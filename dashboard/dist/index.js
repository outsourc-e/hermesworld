(() => {
  const sdk = window.__HERMES_PLUGIN_SDK__;
  const registry = window.__HERMES_PLUGINS__;
  if (!sdk || !registry || typeof registry.register !== 'function') {
    console.error('[hermesworld-plugin] Hermes plugin SDK/registry unavailable');
    return;
  }

  const { React } = sdk;
  const { useMemo, useState, useCallback } = React;
  const LS_KEY = 'hermesworld-plugin:base-url';
  const ADMIN_KEY = 'hermesworld-plugin:admin-view';

  function defaultBaseUrl() {
    const { protocol, hostname } = window.location;
    return `${protocol}//${hostname}:3002`;
  }

  function normalizeBaseUrl(value) {
    const trimmed = String(value || '').trim();
    return trimmed ? trimmed.replace(/\/+$/, '') : '';
  }

  function HermesWorldPlugin() {
    const [baseUrl, setBaseUrl] = useState(() => {
      try {
        return normalizeBaseUrl(localStorage.getItem(LS_KEY)) || defaultBaseUrl();
      } catch {
        return defaultBaseUrl();
      }
    });
    const [showSettings, setShowSettings] = useState(false);
    const [draftUrl, setDraftUrl] = useState(baseUrl);
    const [adminView, setAdminView] = useState(() => {
      try {
        return localStorage.getItem(ADMIN_KEY) === '1';
      } catch {
        return false;
      }
    });

    const worldUrl = useMemo(() => {
      const base = normalizeBaseUrl(baseUrl);
      if (!base) return '';
      return `${base}/playground?embed=1${adminView ? '&admin=1' : ''}`;
    }, [baseUrl, adminView]);

    const saveUrl = useCallback(() => {
      const next = normalizeBaseUrl(draftUrl);
      if (next) {
        setBaseUrl(next);
        try { localStorage.setItem(LS_KEY, next); } catch {}
      }
      setShowSettings(false);
    }, [draftUrl]);

    const openExternal = () => {
      if (worldUrl) window.open(worldUrl, '_blank', 'noopener,noreferrer');
    };

    const toggleAdmin = () => {
      const next = !adminView;
      setAdminView(next);
      try { localStorage.setItem(ADMIN_KEY, next ? '1' : '0'); } catch {}
    };

    return React.createElement(
      'div',
      {
        style: {
          height: 'calc(100vh - 118px)',
          margin: '-16px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          background: '#020617',
        },
      },
      // Settings bar (collapsible)
      showSettings
        ? React.createElement(
            'div',
            {
              style: {
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                background: 'rgba(255,255,255,0.03)',
                flexShrink: 0,
              },
            },
            React.createElement('span', {
              style: { fontSize: '11px', color: 'rgba(255,255,255,0.5)', whiteSpace: 'nowrap' },
            }, 'Workspace URL:'),
            React.createElement('input', {
              value: draftUrl,
              onChange: (e) => setDraftUrl(e.target.value),
              placeholder: defaultBaseUrl(),
              style: {
                flex: 1,
                padding: '4px 8px',
                fontSize: '12px',
                border: '1px solid rgba(255,255,255,0.12)',
                background: 'rgba(255,255,255,0.04)',
                color: '#f8fafc',
                borderRadius: '4px',
                outline: 'none',
              },
            }),
            React.createElement('button', {
              onClick: saveUrl,
              style: {
                padding: '4px 10px',
                fontSize: '11px',
                background: 'rgba(255,255,255,0.08)',
                color: '#f8fafc',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              },
            }, 'Save'),
            React.createElement('button', {
              onClick: () => setShowSettings(false),
              style: {
                padding: '4px 8px',
                fontSize: '11px',
                background: 'none',
                color: 'rgba(255,255,255,0.4)',
                border: 'none',
                cursor: 'pointer',
              },
            }, '✕'),
          )
        : React.createElement(
            'div',
            {
              style: {
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '4px',
                padding: '4px 8px',
                flexShrink: 0,
              },
            },
            React.createElement('button', {
              onClick: () => setShowSettings(true),
              title: 'Settings',
              style: {
                padding: '2px 6px',
                fontSize: '10px',
                background: 'none',
                color: 'rgba(255,255,255,0.25)',
                border: 'none',
                cursor: 'pointer',
              },
            }, '⚙'),
            React.createElement('button', {
              onClick: toggleAdmin,
              title: adminView ? 'Disable admin overlay' : 'Enable admin overlay',
              style: {
                padding: '2px 6px',
                fontSize: '10px',
                background: 'none',
                color: adminView ? '#facc15' : 'rgba(255,255,255,0.25)',
                border: 'none',
                cursor: 'pointer',
              },
            }, '🛡'),
            React.createElement('button', {
              onClick: openExternal,
              title: 'Open in new tab',
              style: {
                padding: '2px 6px',
                fontSize: '10px',
                background: 'none',
                color: 'rgba(255,255,255,0.25)',
                border: 'none',
                cursor: 'pointer',
              },
            }, '↗'),
          ),
      // Iframe — always rendered, no probe needed
      React.createElement('iframe', {
        title: 'HermesWorld',
        src: worldUrl,
        allow: 'autoplay; microphone; camera; fullscreen',
        style: {
          flex: 1,
          border: 'none',
          background: '#020617',
          minHeight: 0,
        },
      }),
    );
  }

  registry.register('hermesworld', HermesWorldPlugin);
})();
