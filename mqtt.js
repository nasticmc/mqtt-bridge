// Enable detailed MQTT debug logs
process.env.MQTTJS_DEBUG = "true";

const mqtt = require("mqtt");

// -------------------------------
// Configuration
// Change ws:// to wss:// for a secure WebSocket connection.
// For self-signed certificates, set rejectUnauthorized to false below.
// -------------------------------
const WS_BROKER_URL  = "wss://mqtt2.eastmeesh.au/mqtt";
const TCP_BROKER_URL = "mqtt://update-me:1883";

// -------------------------------
// WebSocket MQTT broker (source)
// -------------------------------
const wsOptions = {
  username: "user",
  password: "pass",
  protocolVersion: 4, // MQTT 3.1.1 (most common)
  clientId: "bridge-ws-" + Math.random().toString(16).slice(2),
};

if (WS_BROKER_URL.startsWith("wss://")) {
  wsOptions.rejectUnauthorized = true; // set to false for self-signed certificates
}

const wsClient = mqtt.connect(WS_BROKER_URL, wsOptions);

// -------------------------------
// TCP MQTT broker (destination)
// -------------------------------
const tcpClient = mqtt.connect(TCP_BROKER_URL, {
  username: "user",
  password: "pass",
  protocolVersion: 4,
  clientId: "bridge-tcp-" + Math.random().toString(16).slice(2),
});

// -------------------------------
// WebSocket broker events
// -------------------------------
wsClient.on("connect", () => {
  console.log("✓ Connected to WebSocket MQTT broker");
  wsClient.subscribe("meshcore/#", (err) => {
    if (err) console.log("WS subscribe error:", err.message);
    else console.log("Subscribed to meshcore/# on WS broker");
  });
});

wsClient.on("error", (err) => {
  console.log("WS error:", err.message);
});

wsClient.on("close", () => {
  console.log("WS connection closed");
});

// -------------------------------
// TCP broker events
// -------------------------------
tcpClient.on("connect", () => {
  console.log("✓ Connected to TCP MQTT broker");
});

tcpClient.on("error", (err) => {
  console.log("TCP error:", err.message);
});

tcpClient.on("close", () => {
  console.log("TCP connection closed");
});

// -------------------------------
// One-way forwarding: WS → TCP
// -------------------------------
wsClient.on("message", (topic, message) => {
  console.log(`→ Forwarding: ${topic}`);
  tcpClient.publish(topic, message);
});
