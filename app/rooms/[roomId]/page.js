"use client";

import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

let socket;

export default function RoomPage({ params }) {
  const { roomId } = params;
  const [players, setPlayers] = useState([]);
  const [playerName, setPlayerName] = useState("");
  const [joined, setJoined] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [lives, setLives] = useState(3);
  const [scores, setScores] = useState({});
  const [gameOver, setGameOver] = useState(false);
  const [revealedAnswers, setRevealedAnswers] = useState([]);
  const [loading, setLoading] = useState(false);

  const socketRef = useRef();

  useEffect(() => {
    socketRef.current = io();

    socketRef.current.on("roomUpdate", (players) => {
      setPlayers(players);
    });

    socketRef.current.on("gameStarted", () => {
      setGameStarted(true);
      setGameOver(false);
    });

    socketRef.current.on(
      "newQuestion",
      async ({ question, suggestions, revealed }) => {
        setQuestion(question);
        setSuggestions(suggestions);
        setRevealedAnswers(revealed || []);
        setLoading(false);
        setLives(3);
      }
    );

    socketRef.current.on("scoreUpdate", (scores) => {
      setScores(scores);
    });

    socketRef.current.on("gameOver", ({ scores }) => {
      setScores(scores);
      setGameOver(true);
      setGameStarted(false);
      setQuestion("");
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  const handleJoinRoom = () => {
    if (playerName) {
      socketRef.current.emit("joinRoom", { roomId, playerName });
      setJoined(true);
    }
  };

  const handleStartGame = () => {
    setLoading(true);
    socketRef.current.emit("startGame", { roomId });
  };

  const handleSubmitAnswer = () => {
    const matchedIndex = suggestions.findIndex(
      (suggestion) => suggestion.toLowerCase() === answer.toLowerCase()
    );
    if (matchedIndex !== -1) {
      const newRevealedAnswers = [...revealedAnswers, matchedIndex];
      setRevealedAnswers(newRevealedAnswers);
      socketRef.current.emit("submitAnswer", {
        roomId,
        playerId: socketRef.current.id,
        answer,
        matchedIndex,
      });
    } else {
      setLives(lives - 1);
      if (lives - 1 <= 0) {
        socketRef.current.emit("submitAnswer", {
          roomId,
          playerId: socketRef.current.id,
          answer: "",
        });
      }
    }
    setAnswer("");
  };

  return (
    <div className="m-10">
      <h1>Room ID: {roomId}</h1>
      {!joined ? (
        <div>
          <input
            type="text"
            placeholder="Enter your name"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
          />
          <button onClick={handleJoinRoom}>Join Room</button>
        </div>
      ) : (
        <div>
          <h2>Players in the room:</h2>
          <ul>
            {players.map((player) => (
              <li key={player.id}>{player.name}</li>
            ))}
          </ul>
          {!gameStarted ? (
            gameOver ? (
              <div>
                <h3>Game Over! Final Scores:</h3>
                <ul>
                  {Object.entries(scores).map(([id, score]) => (
                    <li key={id}>
                      {players.find((player) => player.id === id)?.name}:{" "}
                      {score}
                    </li>
                  ))}
                </ul>
                <button onClick={handleStartGame}>Start New Game</button>
              </div>
            ) : (
              <button onClick={handleStartGame} disabled={loading}>
                {loading ? "Loading..." : "Start Game"}
              </button>
            )
          ) : (
            <div>
              <h3>Current Question:</h3>
              <p>{loading ? "Loading question..." : question}</p>
              <ul>
                {suggestions.map((suggestion, index) => (
                  <li key={index}>
                    {revealedAnswers.includes(index)
                      ? suggestion
                      : "__________"}
                  </li>
                ))}
              </ul>
              <input
                type="text"
                placeholder="Enter your answer"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
              />
              <button onClick={handleSubmitAnswer}>Submit Answer</button>
              <p>Lives: {lives}</p>
              <h3>Scores:</h3>
              <ul>
                {Object.entries(scores).map(([id, score]) => (
                  <li key={id}>
                    {players.find((player) => player.id === id)?.name}: {score}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
