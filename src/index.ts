import express from "express"
import { createServer } from "http"
import { Server } from "socket.io"

import { ClientToServerEvents, ServerToClientEvents, UserControlLog } from "./types"
import logger from "./logger"

const app = express()
const server = createServer(app)
const io = new Server<ClientToServerEvents, ServerToClientEvents>(server, {
	cors: {
		origin: "*",
	},
	path: "/app",
})

app.use(
	express.static("build", {
		setHeaders: (res, path) => {
			if (path.endsWith(".css")) {
				res.setHeader("Content-Type", "text/css")
			}
		},
	})
)

io.on("connection", (socket) => {
	logger.info(`Client connected ${socket.id}`)
	logger.info(`Clients connected ${io.engine.clientsCount}`)

	socket.on("userEntry", (data: UserControlLog) => {
		io.emit("message", {
			name: data.name,
			type: "entry",
			id: socket.id,
		})
	})

	socket.on("message", (data) => {
		io.emit("message", { ...data, type: "message" })
	})

	socket.on("disconnect", () => {
		logger.info(`Client desconnected ${socket.id}`)
		io.emit("message", {
			type: "exit",
			id: socket.id,
		})
	})
})

server.listen(3000, () => {
	console.log("Server running on port 3000")
})
