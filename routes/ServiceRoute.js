import express from "express";
import { addAgentsToService, createService, deleteService, getService, getServices, removeAgentFromService, serviceStats, updateService } from "../controllers/ServiceController.js";

const router = express.Router();

// create service
router.post("/createService", createService);

// update service
router.put("/:id", updateService);

// delete service
router.delete("/:id", deleteService)

// get service
router.get("/service/:id", getService);

// delete agent from service
router.put("/agent/delete/:id", removeAgentFromService)

// Add agent from service
router.put("/agent/add/:id", addAgentsToService)

// get services
router.get("/services/:id", getServices);

// services for kiosk
router.get("/kiosk/:id")

// services stats
router.get("/stats/service/:id", serviceStats)

export default router