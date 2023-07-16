import cors from "cors"
import express from "express"
import dotenv from "dotenv"
import mongoose from "mongoose"
import companyRouter from "./routes/SuperAdminRoute.js"
import agentsRouter from "./routes/AgentRoute.js"
import servicesRouter from "./routes/ServiceRoute.js"
import clientsRouter from "./routes/ClientsRoute.js"
import uploadRouter from "./controllers/UploadController.js"
import http from 'http';
import { Server } from 'socket.io';
import { createError } from "./util/error.js"


dotenv.config();

const connect = async () => {
    try {

        await mongoose.connect(process.env.Database_link)
        console.log("connected with mongoDB link")

    } catch (error) {
        throw error
    }
}

mongoose.connection.on("disconnected", () => {
    console.log(" MongoDB disconnected :(")
})

const app = express();

app.use(cors());


// CORS middleware
app.use(
    cors({
        origin: '*',
    })
);

// CORS middleware for Socket.IO route
app.options('/socket.io/*', cors());

app.use(express.json({ limit: "20mb" }))
app.use("/api/companies", companyRouter)
app.use("/api/agents", agentsRouter)
app.use("/api/services", servicesRouter)
app.use("/api/tickets", clientsRouter)
app.use("/api/upload", uploadRouter)

app.get("/internet", (req, res, next) => {
    try {

        res.status(200).send("Internet Connection is available")

    } catch (error) {
        next(error)
    }
})


app.use((err, req, res, next) => {
    const errorStatus = err.status || 500
    const errorMessage = err.message || "Something went wrong!"

    return res.status(errorStatus).json({
        success: false,
        status: errorStatus,
        message: errorMessage
    })

})


const server = http.createServer(app);
const io = new Server(server);

io.on('connection', (socket) => {
    console.log(`clinet ID: ${socket.id}`);

    socket.on('sendMessage', (data) => {
        socket.broadcast.emit('receiveMessage', data)
    })

    socket.on('disconnect', () => {
        console.log('A client disconnected.');
    });
});



server.listen(process.env.Port || 8800, () => {
    connect();
    console.log('Server is running');
});
