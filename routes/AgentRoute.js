import express from "express"
import { addHistory, adminGetInfo, adminLogin, callClient, callClientManually, currentServingClient, deleteAgent, emptyCounter, getAgent, getAgents, getAllCurrentServing, getFullHistory, getHistory, getServedToday, logAgent, registerAgent, updateAgent, updateAgentPass } from "../controllers/AgentController.js";

const router = express.Router();

// create agent
router.post("/register", registerAgent);

// login agent
router.post("/login", logAgent);

// login admin
router.post("/login/admin", adminLogin)

// get company data for agent
router.get("/company/info/:id", adminGetInfo)

// update agent
router.put("/:id", updateAgent);

// update agent password
router.put("/password/:id", updateAgentPass)

// delete agent
router.delete("/:id", deleteAgent);

// get agent
router.get("/agent/:id", getAgent);

// get agents
router.get("/agents/:id", getAgents);

// get unassigned agents
router.get("/agents/unassigned/:id")

// Empty Counter
router.post("/counter/:id", emptyCounter)

// call client
router.post("/client/:id", callClient)

// call client manually
router.post("/client/manual/:id", callClientManually)

// add history
router.post("/history/:id", addHistory)

// get history (10)
router.get("/history/personal/:id", getHistory)

// get history
router.get("/history/personal/all/:id", getFullHistory)

// served per dat
router.get("/served/:id", getServedToday)

// current Serving
router.post("/current/serving/:id", currentServingClient)

// current Serving
router.get("/current/serving/:id", getAllCurrentServing)

export default router