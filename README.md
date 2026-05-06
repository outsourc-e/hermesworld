# HermesWorld — Hermes Dashboard Plugin

Embed [HermesWorld](https://hermes-world.ai) directly as a tab in your Hermes Agent dashboard.

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
- Internet access to [hermes-world.ai](https://hermes-world.ai)

## What it does

Adds a **HermesWorld** tab to the dashboard sidebar that embeds the hosted HermesWorld runtime (`https://hermes-world.ai/play/?embed=dashboard`). You can override the base URL in the tiny settings panel if you run a private HermesWorld host.

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
