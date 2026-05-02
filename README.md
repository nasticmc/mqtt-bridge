# mqtt-bridge

A lightweight Node.js bridge that forwards MQTT messages from a **WebSocket broker** to a **TCP broker**. It subscribes to all `meshcore/#` topics on the source broker and republishes them verbatim on the destination broker.

```
[WebSocket MQTT broker] ──meshcore/#──▶ [mqtt-bridge] ──meshcore/#──▶ [TCP MQTT broker]
```

## Requirements

- Node.js 16+
- npm

## Installation

```bash
git clone https://github.com/nasticmc/mqtt-bridge.git
cd mqtt-bridge
npm install
```

## Configuration

Before running, open `mqtt.js` and update the constants at the top of the file:

| Constant | Line | Description |
|---|---|---|
| `WS_BROKER_URL` | 10 | WebSocket source broker — use `ws://` or `wss://` |
| `TCP_BROKER_URL` | 11 | TCP destination broker |
| `username` / `password` | 17–18, 32–33 | Credentials for each broker |

**Plain WebSocket:**
```js
const WS_BROKER_URL = "ws://your-broker/mqtt";
```

**Secure WebSocket (WSS / TLS):**
```js
const WS_BROKER_URL = "wss://your-broker/mqtt";
```

When a `wss://` URL is used, TLS is enabled automatically. By default the server's certificate must be trusted by Node.js. For **self-signed certificates**, set `rejectUnauthorized` to `false` on line 24:

```js
wsOptions.rejectUnauthorized = false; // only for self-signed / private CA certs
```

## Running

```bash
node mqtt.js
```

Expected output once both brokers are reachable:

```
✓ Connected to WebSocket MQTT broker
Subscribed to meshcore/# on WS broker
✓ Connected to TCP MQTT broker
→ Forwarding: meshcore/some/topic
```

## How it works

1. On startup, two MQTT clients are created — one over WebSocket, one over plain TCP.
2. Once the WebSocket client connects, it subscribes to `meshcore/#` (all topics under the `meshcore/` prefix).
3. Every message received on the WebSocket broker is immediately published to the TCP broker on the same topic with the same payload.
4. Both clients use MQTT 3.1.1 (`protocolVersion: 4`) and auto-reconnect on disconnection (handled by the `mqtt` library).

## Notes

- **Debug logging** — `MQTTJS_DEBUG` is enabled by default, producing detailed internal MQTT library logs. Remove or set to `"false"` for quieter production output.
- **QoS** — Messages are forwarded at QoS 0 (fire-and-forget). No retain flag is set on published messages.
- **One-way** — Traffic flows WebSocket → TCP only. The TCP broker does not forward back to the WebSocket broker.

## Dependencies

| Package | Version | Purpose |
|---|---|---|
| [mqtt](https://github.com/mqttjs/MQTT.js) | ^5.14.1 | MQTT client (WebSocket + TCP support) |
