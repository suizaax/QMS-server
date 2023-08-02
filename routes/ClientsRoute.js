import express from "express";
import { clientWaiting, clientWaitingPerAgent, clientWaitingPerService, createClient, getAllTickets, getTodayTickets, monthlyClients, monthlyServed, quarterlyClients, quarterlyServed, resetTodayClients, todayBusiness, todayClients, todayInd, todayServed, transferClient, updateClient, updateOtherClient, weeklyClients, weeklyServed, yearlyClients, yearlyServed, yesterdayBusiness, yesterdayClients, yesterdayInd, yesterdayServed } from "../controllers/ClientsController.js";

const router = express.Router();

// create client
router.post("/create", createClient)

// reset client to zero
router.put("/client/reset/:id", resetTodayClients)

// update client
router.put("/:id", updateClient)

// update client data
router.put("/all/:id", updateOtherClient)

// get client
router.post("/client/:id")

// get clients
router.get("/clients/:id", getAllTickets)

// get today clients
router.get("/clients/today/:id", getTodayTickets)

// count Clients
router.get('/count/waiting/:id', clientWaiting)

// count Clients per Service
router.get('/count/waiting/service/:id/:service', clientWaitingPerService)

// count Clients per agent
router.get('/count/waiting/agent/:id/:counterId/:agentId', clientWaitingPerAgent)

// transfer client
router.put("/client/transfer/:id", transferClient)

// today clients
router.get('/stats/clients/today/:id', todayClients)

// today serverd
router.get('/stats/served/today/:id', todayServed)

// yesterday clients
router.get('/stats/clients/yesterday/:id', yesterdayClients)

// yesterday serverd
router.get('/stats/served/yesterday/:id', yesterdayServed)

// today Individuel
router.get('/stats/individuel/today/:id', todayInd)

// today business
router.get('/stats/business/today/:id', todayBusiness)

// yesterday Individuel
router.get('/stats/individuel/yesterday/:id', yesterdayInd)

// yesterday business
router.get('/stats/business/yesterday/:id', yesterdayBusiness)

// weekly clients 
router.get('/stats/clients/weekly/:id', weeklyClients)

// weekly served 
router.get('/stats/served/weekly/:id', weeklyServed)

// monthly clients 
router.get('/stats/clients/monthly/:id', monthlyClients)

// monthly clients 
router.get('/stats/served/monthly/:id', monthlyServed)

// quarterly clients 
router.get('/stats/clients/quarterly/:id', quarterlyClients)

// quarterly served 
router.get('/stats/served/quarterly/:id', quarterlyServed)

// yearly clients
router.get("/stats/clients/yearly/:id", yearlyClients)

// yearly served
router.get("/stats/served/yearly/:id", yearlyServed)


export default router