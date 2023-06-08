import express from "express";
import { createService, deleteService, getService, getServices, updateService } from "../controllers/ServiceController.js";

const router = express.Router();

// create service
router.post("/createService", createService);

// update service
router.put("/:id", updateService);

// delete service
router.delete("/:id", deleteService)

// get service
router.get("/service/:id", getService);

// get services
router.get("/services/:id", getServices);

// services for kiosk
router.get("/kiosk/:id")

// print ticket

export default router