"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import io from "socket.io-client";

let socket;

export default function RoomPage({ params }) {
  const { roomId } = params;
  const [players, setPlayers] = useState([]);
  const [playerName, setPlayerName] = useState("");
  const router = useRouter();

  useEffect(() => {
    socket = io();

    socket.emit("joinRoom", { roomId, playerName });

    socket.on("roomUpdate", (players) => {
      setPlayers(players);
    });

    return () => {
      socket.disconnect();
    };
  }, [roomId, playerName]);

  const handleNameChange = (event) => {
    setPlayerName(event.target.value);
  };

  return (
    <div className="m-10">
      <h1>Room ID: {roomId}</h1>
      <input
        type="text"
        placeholder="Enter your name"
        value={playerName}
        onChange={handleNameChange}
      />
      <ul>
        {players.map((player) => (
          <li key={player.id}>{player.name}</li>
        ))}
      </ul>
    </div>
  );
}
