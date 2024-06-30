//app/api/game/route.js
"use client";
import { useState, useEffect } from "react";
import { io } from "socket.io-client";

// Ensure the URL matches your server's address if needed
const socket = io(); // This assumes your Socket.IO server is running on the same origin

export default function GamePage() {
  const [sentence, setSentence] = useState("");
  const [userInput, setUserInput] = useState("");
  const [results, setResults] = useState([]);

  useEffect(() => {
    socket.on("newSentence", (data) => {
      setSentence(data.sentence);
      setResults([]);
    });

    return () => socket.off("newSentence");
  }, []);

  const handleStartGame = () => {
    socket.emit("startGame");
  };

  const handleSubmit = () => {
    setResults((prev) => [...prev, userInput]);
    setUserInput("");
  };

  return (
    <div className="m-10">
      <h1>Multiplayer Google Feud Game</h1>
      <button onClick={handleStartGame}>Start Game</button>
      {sentence && <p>Complete the sentence: {sentence}</p>}
      <input
        type="text"
        value={userInput}
        onChange={(e) => setUserInput(e.target.value)}
      />
      <button onClick={handleSubmit}>Submit</button>
      <ul>
        {results.map((result, index) => (
          <li key={index}>{result}</li>
        ))}
      </ul>
    </div>
  );
}
