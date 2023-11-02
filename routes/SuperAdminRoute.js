import express from "express";
import { addNews, companyLogin, countersList, createCompany, createCounter, deleteCompany, deleteCounter, deleteImage, deleteNews, getCompanies, getCompany, updateCompany, updateCompanyPass, updateCounter, updateCounterManually, updateTicket } from "../controllers/SuperAdminController.js";


const router = express.Router()

// create company
router.post("/register", createCompany);

// company Login
router.post("/login", companyLogin);

// update company
router.put("/:id", updateCompany);

// update agent password
router.put("/password/:id", updateCompanyPass)

// delete company
router.delete("/:id", deleteCompany);

// get company
router.get("/company/:id", getCompany);

// get companies
router.get("/", getCompanies);

// add data
router.put("/news/add/:id", addNews)

// remove data
router.put("/news/delete/:id", deleteNews)

// remove data
router.put("/image/delete/:id", deleteImage)

// update ticket info
router.put("/ticket/info/:id", updateTicket)

// create Counter
router.post("/counter/createCounter", createCounter)

// counters list
router.get("/counter/:id", countersList)

// delete counter
router.delete("/counter/:id", deleteCounter)

// Update counter
router.put("/counter/:id", updateCounter)

// Update Manually counter
router.put("/counter/manual/:id/:counterId", updateCounterManually)

export default router;