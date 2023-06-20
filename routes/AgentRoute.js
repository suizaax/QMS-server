import express from "express"
import { addHistory, callClient, callClientManually, deleteAgent, emptyCounter, getAgent, getAgents, getHistory, logAgent, registerAgent, updateAgent, updateAgentPass } from "../controllers/AgentController.js";

const router = express.Router();

// create agent
router.post("/register", registerAgent);

// login agent
router.post("/login", logAgent);

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

// get history
router.get("/history/personal/:id", getHistory)

export default router