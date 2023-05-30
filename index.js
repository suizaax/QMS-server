import cors from "cors"
import express from "express"
import dotenv from "dotenv"
import mongoose from "mongoose"
import companyRouter from "./routes/SuperAdminRoute.js"
import agentsRouter from "./routes/AgentRoute.js"
import servicesRouter from "./routes/ServiceRoute.js"


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

app.use(express.json({ limit: "20mb" }))
app.use(cors())
app.use("/api/companies", companyRouter)
app.use("/api/agents", agentsRouter)
app.use("/api/services", servicesRouter)


app.use((err, req, res, next) => {
    const errorStatus = err.status || 500
    const errorMessage = err.message || "Something went wrong!"

    return res.status(errorStatus).json({
        success: false,
        status: errorStatus,
        message: errorMessage
    })

})

app.listen(process.env.Port || 8800, () => {
    connect();
    console.log('Server is running')
})