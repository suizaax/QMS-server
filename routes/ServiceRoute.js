import express from "express";
import { createService, getService, getServices, updateService } from "../controllers/ServiceController.js";

const router = express.Router();

// create service
router.post("/createService", createService);

// update service
router.put("/:id", updateService);

// get service
router.get("/service/:id", getService);

// get services
router.get("/services/:id", getServices);

export default router