# Chess Session

A temporary two-player chess website built with React, Vite, TypeScript, PeerJS, WebRTC and chess.js. It is designed to deploy as a Render Static Site and does not require an application backend or database.

## Local development

Requirements: Node.js 20.19+ and npm.

```bash
npm ci
npm run dev
```

## Production build

```bash
npm ci
npm run build
npm run preview
```

## Render Static Site deployment

The included `render.yaml` configures:

- Runtime: Static
- Build command: `npm ci && npm run build`
- Publish directory: `dist`
- SPA fallback: all routes rewrite to `/index.html`

You can create a new Render service from the repository and use the detected Blueprint configuration, or manually create a Static Site with those values.

## Multiplayer networking

The app uses PeerJS signaling to discover the other player, then sends game messages over a direct WebRTC DataChannel. There is no custom backend and no database. Public STUN servers are configured by default.

Some restrictive networks require a TURN relay. To add one, configure `VITE_ICE_SERVERS` as a JSON array in the Render environment settings and rebuild. Example format:

```json
[
  { "urls": "stun:stun.example.com:3478" },
  {
    "urls": "turn:turn.example.com:3478?transport=udp",
    "username": "TEMP_USERNAME",
    "credential": "TEMP_CREDENTIAL"
  }
]
```

Replace the example values with credentials from a TURN provider. **All `VITE_*` values are included in the public browser bundle. Do not use permanent/private TURN credentials.** Prefer short-lived credentials issued by your provider. TURN may have usage costs; it is not bundled with this project.

## Temporary rooms and reconnects

- Room state exists only in the host browser's memory.
- A guest's temporary reconnect token is held in that browser tab's `sessionStorage`, so a refresh in the same tab can reuse it.
- If the guest disconnects, the host keeps the room available for up to 10 minutes. A successful reconnect cancels expiry; otherwise the host closes the room.
- Closing the host tab ends the room because the host peer is no longer online.

## Notes

- Standard Chess Mode uses `chess.js` rules.
- Free Movement Mode permits unrestricted piece movement.
- Desktop supports click-to-move and drag-and-drop. Touch devices can use tap-to-select and tap-to-place.
- Piece and board appearances are local preferences; they do not affect the opponent's board.
