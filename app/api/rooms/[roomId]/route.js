import { NextResponse } from "next/server";
import { Server } from "socket.io";

let rooms = {};

export function setupSocket(server) {
  const io = new Server(server);

  io.on("connection", (socket) => {
    console.log("A user connected");

    socket.on("joinRoom", ({ roomId, playerName }) => {
      if (!rooms[roomId]) {
        rooms[roomId] = { players: [] };
      }

      rooms[roomId].players.push({ id: socket.id, name: playerName });
      socket.join(roomId);

      io.to(roomId).emit("roomUpdate", rooms[roomId].players);
    });

    socket.on("disconnect", () => {
      console.log("A user disconnected");
      for (let roomId in rooms) {
        rooms[roomId].players = rooms[roomId].players.filter(
          (player) => player.id !== socket.id
        );
        io.to(roomId).emit("roomUpdate", rooms[roomId].players);
      }
    });
  });

  return io;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const roomId = searchParams.get("roomId");

  if (roomId && rooms[roomId]) {
    return NextResponse.json(rooms[roomId]);
  }

  return NextResponse.json({ error: "Room not found" }, { status: 404 });
}
