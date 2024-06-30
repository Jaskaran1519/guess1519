"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Page() {
  const [playerName, setPlayerName] = useState("");
  const router = useRouter();

  const handleCreateRoom = async () => {
    const roomId = Math.random().toString(36).substring(2, 9); // Generate a random room ID
    router.push(`/rooms/${roomId}`);
  };

  const handleJoinRoom = async (event) => {
    event.preventDefault();
    const roomId = event.target.elements.roomId.value;
    router.push(`/rooms/${roomId}`);
  };

  return (
    <div className="m-10">
      <h1>Create or Join a Game Room</h1>
      <button onClick={handleCreateRoom}>Create Room</button>
      <form onSubmit={handleJoinRoom}>
        <input type="text" name="roomId" placeholder="Enter Room ID" />
        <button type="submit">Join Room</button>
      </form>
    </div>
  );
}
