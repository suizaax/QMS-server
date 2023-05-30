import bcrypt from "bcryptjs"
import superAdmin from "../models/SuperAdmin.js"
import { createError } from "../util/error.js"
import jwt from "jsonwebtoken"

export const createCompany = async (req, res, next) => {

    try {
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(req.body.password, salt);

        const newCompany = new superAdmin({
            ...req.body,
            password: hash
        });

        await newCompany.save();

        res.status(200).json(newCompany);

    } catch (error) {
        next(error)
    }

}

export const companyLogin = async (req, res, next) => {

    try {
        const company = await superAdmin.findOne({ email: req.body.email })
        if (!company) return next(createError(400, "Company doesn't exist"))

        const validPass = await bcrypt.compare(req.body.password, company.password)
        if (!validPass) return next(createError(400, "E-mail or password is wrong"))

        await superAdmin.findByIdAndUpdate(company._id, { $set: { lastLogin: Date.now() } })

        const token = jwt.sign({ _id: company._id, isAdmin: company.isAdmin }, process.env.jwt_secret)
        const { password, ...otherDetails } = company._doc

        res.cookie("company_token", token, {
            httpOnly: true
        }).status(200).json({ ...otherDetails, token })

    } catch (error) {
        next(error)
    }

}

export const updateCompany = async (req, res, next) => {
    try {
        const updatedCompanyInfo = await superAdmin.findByIdAndUpdate(req.params.id, { $set: { ...req.body } }, { new: true })
        res.status(200).json(updatedCompanyInfo)
    } catch (error) {
        next(error)
    }
}

export const deleteCompany = async (req, res, next) => {
    try {
        await superAdmin.findByIdAndDelete(req.params.id)
        res.status(200).send("company was deleted")
    } catch (error) {
        next(error)
    }
}

export const getCompany = async (req, res, next) => {
    try {
        const companyInfo = await superAdmin.findById(req.params.id)
        const { password, ...otherDetails } = companyInfo._doc
        res.status(200).json({ ...otherDetails })
    } catch (error) {
        next(error)
    }
}

export const getCompanies = async (req, res, next) => {
    try {
        const companiesInfo = await superAdmin.find()
        res.status(200).json(companiesInfo)
    } catch (error) {
        next(error)
    }
}


export const addNews = async (req, res, next) => {
    try {
        const company = await superAdmin.findByIdAndUpdate({ _id: req.params.id }, { $push: { SBnews: req.body.news } }, { new: true })
        res.status(200).json(company)
    } catch (error) {
        next(error)
    }
}

export const deleteNews = async (req, res, next) => {
    try {
        const company = await superAdmin.findByIdAndUpdate(req.params.id, { $pull: { SBnews: req.body.index } }, { new: true })
        res.status(200).json(company)
    } catch (error) {
        next(error)
    }
}