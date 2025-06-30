
# Talk-A-Tive

A sleek, modern real-time chat application built with React, Express, Socket.IO, and MongoDB.

**[Live Demo](https://talk-a-tive-eight.vercel.app/login)** | **[Demo Video](https://drive.google.com/file/d/1twGuzaWU0NhtOCqH_KiVDLZpqHtEvJh4/view?usp=sharing)**

## How to Run Locally

### 1. Clone the repo:

```bash
git clone https://github.com/vijay-kumar-79/Talk-A-Tive.git
cd Talk-A-Tive
```
### 2. Setup .env Files

```bash
cd client
mv .env.example .env
cd ../server
mv .env.example .env
```

### 3. Install dependencies
Setup server
```bash
cd server
npm install
nodemon index.js
```
Setup client
```bash
cd client
npm install
npm start
```

## Features

**User Authentication**  
- Register and login system with hashed passwords using bcrypt

**Real-Time Messaging**  
- Instant message delivery using `socket.io`

**Message Persistence**  
- Messages stored in MongoDB and retrieved on reload

**Avatar Support**  
- Users can set their profile picture from a selection of generated avatars

**Emoji Picker**  
- Insert Unicode emojis directly into messages using `emoji-picker-react`

## Technologies Used

| Tech | Description |
|------|-------------|
| **React** | Frontend UI framework |
| **Node/Express** | Backend API server |
| **Socket.IO** | Real-time communication |
| **MongoDB / Mongoose** | Database for storing users and messages |
| **Bcrypt** | Password hashing |
| **styled-components** | Component-based styling |
| **emoji-picker-react** | Emoji support |

###  Contact
If you have any questions or want help improving the app, feel free to reach out at:

Email: gvijay2403@gmail.com

GitHub: https://github.com/vijay-kumar-79/
