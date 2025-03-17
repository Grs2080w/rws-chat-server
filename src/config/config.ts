import dotenv from "dotenv"
dotenv.config()

const PASSWORD_KEY = process.env.PASSWORD_KEY
const PORT = process.env.PORT

export { PASSWORD_KEY, PORT }
