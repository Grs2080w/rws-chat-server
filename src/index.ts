import express from "express"
import { createServer } from "http"
import { Server } from "socket.io"
import cors from "cors"
import { v4 } from "uuid"

const jwt = require("jsonwebtoken")
import { PASSWORD_KEY, PORT } from "./config/config"

// utils
import getRandomFromSet from "./utils/getRandomFromSet"

// logger
import logger from "./logger/logger"

// types
import { ClientToServerEvents, ServerToClientEvents } from "./types/types"

const app = express()
const server = createServer(app)
const io = new Server<ClientToServerEvents, ServerToClientEvents>(server, {
	cors: {
		origin: "*",
	},
	path: "/ws",

	transports: ["websocket"],
	maxHttpBufferSize: 1e8,
})

app.use(cors())

let arrayRooms: string[] = []

/**
 *
 *
 *
 * ROUTES
 *
 *
 *
 */

/**
 * Route to check if name is available and if the room exists
 */

app.get("/:room/new/:name", async (req, res) => {
	const room = req.params.room as string
	const name = req.params.name as string

	if (arrayRooms.includes(room)) {
		await io
			.in(room!)
			.fetchSockets()
			.then((sockets) => {
				let namesCount = sockets.filter((socket) => socket.data.name.toLowerCase() === name.toLowerCase()).length
				namesCount === 1 && res.status(400).send({ status: "name already used" })
				namesCount === 0 && res.status(200).send({ status: "ok" })
			})
	} else {
		res.status(404).send({ status: "room not found" })
	}
})

/**
 * Route to Add a new Room
 * */

app.get("/rooms/create/:code", (req, res) => {
	const code = req.params.code

	arrayRooms.includes(code) && res.status(400).send({ err: "Room already exist" })
	!arrayRooms.includes(code) && res.status(200).send({ roomCreated: true, code }) && arrayRooms.push(code) && logger.info(`Room ${code} created`)
})

/**
 *
 *
 *
 * WEB SOCKET SERVER
 *
 *
 *
 */

io.on("connection", async (socket) => {
	const roomUser: string = Array.isArray(socket.handshake.query.rooms!) ? socket.handshake.query.rooms![0] : socket.handshake.query.rooms!
	const nameUser: string = Array.isArray(socket.handshake.query.name!) ? socket.handshake.query.name![0] : socket.handshake.query.name!

	// Set name user to instance socket server
	socket.data.name = nameUser

	logger.info(`Client connected ${socket.id} ${nameUser}`)
	logger.info(`Clients connected ${io.engine.clientsCount}`)

	socket.join(roomUser!)

	// Get info about room user
	const roomInfo = io.sockets.adapter.rooms.get(roomUser)

	/**
	 * If the client is the first on the room, the server sends a message to all clients in the room
	 * If not the first, send to all clients in the room except the current client
	 * To prevent the duplicate entry on front
	 */

	let ID_USER = jwt.sign({ id: socket.id }, PASSWORD_KEY, {
		expiresIn: "1d",
	})

	roomInfo!.size === 1 &&
		io.to(roomUser!).emit("message", {
			name: nameUser,
			type: "entry",
			id: ID_USER,
		})

	roomInfo!.size >= 2 &&
		io.to(roomUser!).except(socket.id).emit("message", {
			name: nameUser,
			type: "entry",
			id: ID_USER,
		})

	/**
	 * The server sends the missing messages and logs to the ramdom client
	 */

	if (roomInfo!.size >= 2) {
		const token = jwt.sign({ id: socket.id }, PASSWORD_KEY, {
			expiresIn: 5,
			issuer: "cserver-ws",
			audience: "cserver-ws",
		})

		let ramdomIdUser: string | undefined = getRandomFromSet(roomInfo!, socket.id, roomInfo!.size)
		io.to(ramdomIdUser!).emit("missingMessagesAndLogs", { id: token })
	}

	/**
	 * Some Client sends tge messages and Logs updated
	 * And this messages and logs are send to the recent client
	 */

	socket.on("sendMessagesAndLogs", async (data) => {
		const logSet = new Set(data.logs)
		const logArray = Array.from(logSet)

		try {
			const { id } = jwt.verify(data.idUser, PASSWORD_KEY)
			io.to(id!).emit("updatedLogsAndMessages", { messages: data.messages, logs: logArray })
		} catch (err) {
			if (err instanceof Error && err.name === "TokenExpiredError") {
				console.error("Token inválido ou expirado:", err.message)
			}
		}
	})

	/**
	 * Messages manager
	 */

	socket.on("message", (data) => {
		let hours = new Date().toLocaleTimeString("pt-BR", {
			timeZone: "America/Sao_Paulo",
			hour: "2-digit",
			minute: "2-digit",
		  })

		if (data.message.includes("data:image")) {
			io.to(roomUser!).emit("message", { ...data, type: "image", idMessage: v4(), hours })
		} else {
			io.to(roomUser!).emit("message", { ...data, type: "message", idMessage: v4(), hours })
		}
	})

	/**
	 * When Someone is typing, the others users are notifield
	 */

	socket.on("userTyping", () => {
		io.to(roomUser!).except(socket.id).emit("userTyping")
	})

	/**
	 * This event is returned when an user disconnect by Status Offline
	 */

	socket.on("UserOffline", () => {
		socket.disconnect()
		logger.info(`Client desconnected ${socket.id} ${nameUser} by Status Offline`)
	})

	/**
	 * This event is returned when an user disconnect from server
	 */

	socket.on("disconnect", async () => {
		logger.info(`Client desconnected ${socket.id} ${nameUser}`)

		// get update info about the room
		const roomInfo = io.sockets.adapter.rooms.get(roomUser)
		roomInfo === undefined && (arrayRooms = arrayRooms.filter((room) => room !== roomUser))

		io.to(roomUser!).emit("message", {
			type: "exit",
			id: socket.id,
			name: nameUser,
		})
	})
})

server.listen(PORT, () => {
	console.log("Server running on port " + PORT)
})
