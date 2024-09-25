import ws from "ws";

const socket = new ws("wss://api.kblocks.io/api/events");

socket.on("open", () => {
  console.log("Connected to server");
});

socket.on("error", (error) => {
  console.error("Error:", error);
});

socket.on("close", (...args) => {
  console.log("Connection closed", args);
});

socket.on("message", (message) => {
  console.log("Received message:", message);
});