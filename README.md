# HermesWorld — Hermes Dashboard Plugin

Embed [HermesWorld](https://github.com/outsourc-e/hermes-workspace) (the playground/training-grounds surface) directly as a tab in your Hermes Agent dashboard.

## Install

**Dashboard UI:**
1. Open your Hermes dashboard → **Plugins** page
2. Paste: `outsourc-e/hermesworld`
3. Click **Install** → enable

**CLI:**
```bash
hermes plugins install outsourc-e/hermesworld --enable
hermes gateway restart
```

## Requirements

- [Hermes Agent](https://github.com/NousResearch/hermes-agent) with dashboard (`hermes dashboard`)
- [Hermes Workspace](https://github.com/outsourc-e/hermes-workspace) running locally (default: `http://localhost:3001`)

## What it does

Adds a **HermesWorld** tab to the dashboard sidebar that embeds the Workspace playground in embedded mode (`/playground?embed=1`). Auto-detects your Workspace URL on ports 3000–3002, or you can set it manually.

## Structure

```
hermesworld/
├── plugin.yaml              # Agent plugin manifest
├── __init__.py              # No-op register (dashboard-only)
├── dashboard/
│   ├── manifest.json        # Dashboard tab metadata
│   └── dist/
│       └── index.js         # Plugin UI bundle
└── README.md
```

## License

MIT
