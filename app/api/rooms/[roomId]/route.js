import { Server } from "socket.io";
import { fetchIncompleteGoogleFeudQuestion } from "../../gemini.js";
import fetch from "node-fetch";

let rooms = {};

function setupSocket(server) {
  const io = new Server(server);

  io.on("connection", (socket) => {
    console.log("A user connected");

    socket.on("joinRoom", ({ roomId, playerName }) => {
      if (!rooms[roomId]) {
        rooms[roomId] = {
          players: [],
          gameStarted: false,
          scores: {},
          currentQuestionIndex: 0,
          questions: [],
          lives: 3,
        };
      }

      rooms[roomId].players.push({ id: socket.id, name: playerName });
      rooms[roomId].scores[socket.id] = 0;
      socket.join(roomId);

      io.to(roomId).emit("roomUpdate", rooms[roomId].players);
    });

    socket.on("startGame", async ({ roomId }) => {
      if (rooms[roomId]) {
        rooms[roomId].gameStarted = true;
        rooms[roomId].currentQuestionIndex = 0;
        rooms[roomId].questions = [];
        rooms[roomId].lives = 3;
        io.to(roomId).emit("gameStarted");
        await sendQuestion(io, roomId);
      }
    });

    socket.on("submitAnswer", ({ roomId, playerId, answer, matchedIndex }) => {
      const currentQuestion =
        rooms[roomId].questions[rooms[roomId].currentQuestionIndex];

      if (checkAnswer(roomId, answer, matchedIndex)) {
        rooms[roomId].scores[playerId] += 10;
        currentQuestion.revealed.push(matchedIndex);
        io.to(roomId).emit("scoreUpdate", rooms[roomId].scores);
      } else {
        rooms[roomId].lives -= 1;
      }

      // Check if all answers are revealed or player has no lives left
      const allRevealed =
        currentQuestion.revealed.length === currentQuestion.suggestions.length;

      if (allRevealed || rooms[roomId].lives <= 0) {
        io.to(roomId).emit("gameOver", { scores: rooms[roomId].scores });
        rooms[roomId].gameStarted = false;
        rooms[roomId].questions = [];
        rooms[roomId].currentQuestionIndex = 0;
      } else {
        // Update the revealed answers without sending a new question
        io.to(roomId).emit("newQuestion", {
          question: currentQuestion.question,
          suggestions: currentQuestion.suggestions,
          revealed: currentQuestion.revealed,
        });
      }
    });

    socket.on("disconnect", () => {
      console.log("A user disconnected");
      for (let roomId in rooms) {
        if (rooms[roomId] && rooms[roomId].players) {
          rooms[roomId].players = rooms[roomId].players.filter(
            (player) => player.id !== socket.id
          );
          if (rooms[roomId].scores) {
            delete rooms[roomId].scores[socket.id];
          }
          io.to(roomId).emit("roomUpdate", rooms[roomId].players);
          if (rooms[roomId].scores) {
            io.to(roomId).emit("scoreUpdate", rooms[roomId].scores);
          }

          // If the room is empty after this player left, delete the room
          if (rooms[roomId].players.length === 0) {
            delete rooms[roomId];
          }
        }
      }
    });
  });
  async function sendQuestion(io, roomId) {
    try {
      const incompleteQuestions = await fetchIncompleteGoogleFeudQuestion("");
      const question = incompleteQuestions[0];
      const response = await fetch(
        `https://www.google.com/complete/search?client=firefox&q=${encodeURIComponent(
          question
        )}`
      );
      const data = await response.json();
      const suggestions = data[1].map((item) =>
        Array.isArray(item) ? item[0] : item
      );
      const extraWords = suggestions.map((suggestion) =>
        suggestion.slice(question.length).trim()
      );

      rooms[roomId].questions.push({
        question,
        suggestions: extraWords,
        revealed: [],
      });

      console.log("Sending question:", question);
      io.to(roomId).emit("newQuestion", { question, suggestions: extraWords });
    } catch (error) {
      console.error("Error sending question:", error);
    }
  }

  function checkAnswer(roomId, answer, matchedIndex) {
    const currentQuestion =
      rooms[roomId].questions[rooms[roomId].currentQuestionIndex];
    const suggestions = currentQuestion.suggestions;
    const isCorrect = suggestions.some(
      (suggestion) =>
        suggestion
          .slice(currentQuestion.question.length)
          .trim()
          .toLowerCase() === answer.toLowerCase()
    );

    if (isCorrect) {
      currentQuestion.revealed.push(matchedIndex);
    }

    return isCorrect;
  }

  return io;
}

export { setupSocket };
