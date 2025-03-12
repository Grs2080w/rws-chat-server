interface dataEntryUser {
	name: string
	type: "entry"
	id: string
}

interface dataExitUser {
	type: "exit"
	id: string
}

interface dataMessage {
	name: string
	message: string
	type: "message"
}

interface UserControlLog {
	name: string
}

type UserEntryType = "entry" | "exit"

interface ServerToClientEvents {
	message: (data: dataEntryUser | dataExitUser | dataMessage) => void
}

interface ClientToServerEvents {
	message: (data: { message: string; name: string; countUsers: number }) => void
	userEntry: (data: { name: string; type?: UserEntryType }) => void
}

export { ServerToClientEvents, ClientToServerEvents, UserControlLog }
