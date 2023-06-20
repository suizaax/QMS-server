import express from "express";
import { createClient, getAllTickets, getTodayTickets, updateClient } from "../controllers/ClientsController.js";

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




export default router