import express from "express"
import { deleteAgent, getAgent, getAgents, getNonAsignedAgents, logAgent, registerAgent, updateAgent } from "../controllers/AgentController.js";

const router = express.Router();

// create agent
router.post("/register", registerAgent);

// login agent
router.post("/login", logAgent);

// update agent
router.put("/:id", updateAgent);

// delete agent
router.delete("/:id", deleteAgent);

// get agent
router.get("/agent/:id", getAgent);

// get agents
router.get("/agents/:id", getAgents);

// get unassigned agents
router.get("/agents/unassigned/:id", getNonAsignedAgents)

export default router