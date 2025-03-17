interface User {
	name: string
	id: string
}

interface dataEntryUser {
	name: string | string[] | undefined
	type: "entry"
	id: string
}

interface dataExitUser {
	type: "exit"
	id: string
	name?: string | string[] | undefined
}

interface dataMessage {
	name: string
	message: string
	type: "message" | "image"
	idMessage: string
	hours: string
}

interface UserControlLog {
	name: string
}

type UserEntryType = "entry" | "exit"

interface logsAndMessages {
	messages: dataMessage[]
	logs: User[]
	idUser?: string
}

interface ServerToClientEvents {
	message: (data: dataEntryUser | dataExitUser | dataMessage) => void
	userDesconect: (data: string[]) => void
	userConnect: (data: string[]) => void
	usersOnline: (data: User[]) => void
	missingMessagesAndLogs: ({ id }: { id: string }) => void
	updatedLogsAndMessages: (data: logsAndMessages) => void
	userTyping: () => void
}

interface ClientToServerEvents {
	message: (data: { message: string; name: string; countUsers: number }) => void
	userEntry: (data: { name: string; type?: UserEntryType }) => void
	arrayUsersOnline: (data: User[]) => void
	tabopen: (data: string) => void
	sendMessagesAndLogs: (data: logsAndMessages) => void
	userTyping: () => void
	UserOffline: () => void
}

export { ServerToClientEvents, ClientToServerEvents, UserControlLog }
