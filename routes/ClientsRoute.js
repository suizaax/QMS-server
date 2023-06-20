import express from "express";
import { clientWaiting, createClient, getAllTickets, getTodayTickets, transferClient, updateClient } from "../controllers/ClientsController.js";

const router = express.Router();

// create client
router.post("/create", createClient)

// update client
router.put("/:id", updateClient)

// get client
router.post("/client/:id")

// get clients
router.get("/clients/:id", getAllTickets)

// get today clients
router.get("/clients/today/:id", getTodayTickets)

// count Clients
router.get('/count/waiting/:id', clientWaiting)

// transfer client
router.put("/client/transfer/:id", transferClient)




export default router