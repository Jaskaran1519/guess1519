import express from "express";
import { createServer } from "http";
import next from "next";
import { setupSocket } from "./app/api/rooms/[roomId]/route.js";

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();
  const httpServer = createServer(server);
  setupSocket(httpServer); // Setup Socket.io server

  server.all("*", (req, res) => {
    return handle(req, res);
  });

  httpServer.listen(3000, (err) => {
    if (err) throw err;
    console.log("> Ready on http://localhost:3000");
  });
});
