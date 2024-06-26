import { Server } from "socket.io";
import http from "http";
import { Room } from "./models/room.model.js";

const initializeSocketConnection = (app) => {
  const server = http.createServer(app);
  const io = new Server(server, {
    pingTimeout: 70000,
    cors: {
      origin: process.env.CORS_ORIGIN,
    },
  });

  // Socket.IO connection handler
  io.on("connection", (socket) => {
    console.log("New user connected");

    //Room joining
    socket.on("createRoom", async (userData) => {
      try {
        const { userId, userName } = userData;
        const room = new Room({
          user1: { userId: userId, name: userName },
          status: "open",
        });

        await room.save();
        const roomId = room._id;

        socket.join(roomId);
        console.log(`Room created and ${userName} joined: ${roomId}`);
        io.to(socket.id).emit("roomJoined1", { roomId, userName });
      } catch (err) {
        console.error("Error joining room:", err);
      }
    });

    //Join Room
    socket.on("joinRoom", async (data) => {
      try {
        const { userId, userName, roomId } = data;

        // Check if the room exists
        const existingRoom = await Room.findById(roomId);
        if (!existingRoom) {
          io.to(socket.id).emit("roomNotFound", roomId);
          return;
        }

        // Check if the room status is open
        if (existingRoom.status !== "open") {
          io.to(socket.id).emit("roomNotOpen", roomId);
          return;
        }

        // Update the room
        existingRoom.user2 = { userId: userId, name: userName };
        existingRoom.status = "full";
        await existingRoom.save();

        socket.join(roomId);
        console.log(`${userName} joined room: ${roomId}`);
        io.to(socket.id).emit("roomJoined2", { roomId, userName });
      } catch (err) {
        console.error("Error joining room as user2:", err);
      }
    });

    // Toss functionality
    socket.on("conductToss", async (data) => {
      try {
        const { roomId, tossChoice, userId } = data;
        const room = await Room.findById(roomId);
        if (!room) {
          io.to(socket.id).emit("errorMessage", "Room not found");
          console.log("Room not found");
          return;
        }

        if (room.status !== "full") {
          io.to(socket.id).emit("errorMessage", "Room is not full");
          console.log("Room is not full yet");
          return;
        }

        // Validate that the user attempting to conduct the toss is user1
        if (userId.toString() !== room.user1.userId.toString()) {
          // Adjusted this condition
          io.to(socket.id).emit(
            "errorMessage",
            "Only user1 can conduct the toss"
          );
          console.log("Only user1 can conduct the toss");
          return;
        }

        const tossResult = Math.random() < 0.5 ? "head" : "tail";
        const winner = tossResult === tossChoice ? "user1" : "user2";

        // Update toss result in the room
        room.tossResult = winner;
        await room.save();

        console.log(`Toss conducted in room ${roomId}: ${winner} wins`);

        // Broadcast toss result to all users in the room
        io.to(roomId).emit("tossResult", { result: tossResult, winner });
      } catch (err) {
        console.error("Error conducting toss:", err);
        io.to(socket.id).emit("errorMessage", "Error conducting toss");
      }
    });

    // Pick player functionality
    socket.on("pickPlayer", async (data) => {
      try {
        const { roomId, player, userId } = data;
        const dummyPlayers = [
          "Player1",
          "Player2",
          "Player3",
          "Player4",
          "Player5",
          "Player6",
          "Player7",
        ];

        const room = await Room.findById(roomId);
        if (!room) {
          io.to(socket.id).emit("errorMessage", "Room not found");
          console.log("Room not found");
          return;
        }

        if (userId.toString() !== room.user1.userId.toString() && userId.toString() !== room.user2.userId.toString()) {
          io.to(socket.id).emit("errorMessage", "Invalid user");
          console.log("Invalid user");
          return;
        }    

        // Check if the player is already picked
        const isPlayerPicked =
          userId === "user1"
            ? room.pickedPlayersUser1.includes(player)
            : room.pickedPlayersUser2.includes(player);

        if (isPlayerPicked) {
          io.to(socket.id).emit("errorMessage", "Player already picked");
          return;
        }

        // Update picked player list for the user
        if (userId.toString() !== room.user1.userId.toString()) {
          room.pickedPlayersUser1.push(player);
        } else {
          room.pickedPlayersUser2.push(player);
        }
        await room.save();

        io.to(roomId).emit("playerPicked", { user: userId, player });

        // Check if all players are picked
        if (
          room.pickedPlayersUser1.length + room.pickedPlayersUser2.length ===
          dummyPlayers.length
        ) {
          io.to(roomId).emit("allPlayersPicked");
        }
      } catch (err) {
        console.error("Error picking player:", err);
        io.to(socket.id).emit("errorMessage", "Error picking player");
      }
    });

    // Handle disconnect
    socket.on("disconnect", () => {
      console.log("User disconnected");
    });
  });

  return server;
};

export default initializeSocketConnection;
