import express from "express";
import { addNews, companyLogin, createCompany, deleteCompany, deleteNews, getCompanies, getCompany, updateCompany } from "../controllers/SuperAdminController.js";


const router = express.Router()

// create company
router.post("/register", createCompany);

// company Login
router.post("/login", companyLogin);

// update company
router.put("/:id", updateCompany);

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

export default router;