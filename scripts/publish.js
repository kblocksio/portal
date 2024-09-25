import ws from "ws";

const socket = new ws("wss://api.kblocks.io/api/events/upstream");

socket.on("open", () => {
  console.log("Connected to server");

  socket.send(JSON.stringify({
    type: "event",
    data: {
      type: "test",
      data: "test"
    }
  }));
});

socket.on("error", (error) => {
  console.error("Error:", error);
});

socket.on("close", () => {
  console.log("Connection closed");
});

socket.on("message", (message) => {
  console.log("Received message:", message);
});