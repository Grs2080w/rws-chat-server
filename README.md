# RWS Chat Server

## Description

This is a real-time chat server built with Node.js, Express, and Socket.io. It allows the creation of chat rooms where users can connect, send messages, and receive real-time updates.

## Project Structure

- `src/config/config.ts`: Environment configuration using dotenv.
- `src/index.ts`: Main server file, where routes and the WebSocket server are configured.
- `src/logger/logger.ts`: Logger configuration using Winston.
- `src/types/types.ts`: TypeScript type definitions for server and client events.
- `src/utils/getRandomFromSet.ts`: Utility function to get a random item from a set.

## Routes

### Check Name Availability and Room Existence

**GET** `/:room/new/:name`

- **Parameters**:
  - `room`: Room name.
  - `name`: User name.
- **Responses**:
  - `200 OK`: Name available and room exists.
  - `400 Bad Request`: Name already in use.
  - `404 Not Found`: Room not found.

### Create a New Room

**GET** `/rooms/create/:code`

- **Parameters**:
  - `code`: Room code.
- **Responses**:
  - `200 OK`: Room successfully created.
  - `400 Bad Request`: Room already exists.

## How to Run

1. Clone the repository:

```sh
git clone https://github.com/Grs2080w/rws-chat-server.git
```

2. Change to repository dir

```sh
cd rws-chat-server
```

3. Install dependencies:

```sh
npm i
```

4. Create a `.env` file based on `.env.template` and configure your environment variables.

5. Start the server:

```sh
npm start
```

The server will be running on the port configured in the `.env` file.

## Dependencies

- Node.js
- Express
- Socket.io
- Winston
- Dotenv
- UUID
- JSON Web Token

## Front

This API is used to support the front-end available at the following url:

https://github.com/Grs2080w/rws-chat.git

Make sure you follow all the steps to ensure a successful installation.
