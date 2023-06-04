import bcrypt from "bcryptjs"
import superAdmin from "../models/SuperAdmin.js"
import { createError } from "../util/error.js"
import jwt from "jsonwebtoken"
import Ticket from "../models/Ticket.js"
import Counter from "../models/Counter.js"
import Service from "../models/Service.js"

export const createCompany = async (req, res, next) => {

    try {
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(req.body.password, salt);

        const newCompany = new superAdmin({
            ...req.body,
            password: hash
        });

        const ticketInfo = new Ticket({
            companyId: newCompany._id,
            companyName: newCompany.name
        })

        await newCompany.save();
        await ticketInfo.save();

        const finalCompany = { ...newCompany.toObject(), ticket: ticketInfo };

        res.status(200).json(finalCompany);

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
        const ticketInfo = await Ticket.findOne({ companyId: companyInfo._id })
        const { password, ...otherDetails } = companyInfo._doc


        if (ticketInfo) {
            const finalData = { ...otherDetails, ticket: ticketInfo }
            res.status(200).json(finalData)
        } else {
            const finalData = { ...otherDetails }
            res.status(200).json(finalData)
        }


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


export const updateTicket = async (req, res, next) => {
    try {
        const ticketInfo = await Ticket.findOneAndUpdate({ companyId: req.params.id }, { $set: { ...req.body } }, { new: true })
        res.status(200).json(ticketInfo)
    } catch (error) {
        next(error)
    }
}

export const createCounter = async (req, res, next) => {
    try {
        const counterData = new Counter({
            companyId: req.params.id,
            ...req.body
        })

        const checkExistence = await Counter.findOne({ counterNumber: req.body.counterNumber }).lean().exec()

        if (checkExistence) {
            return next(createError(403, "Counter with same number already exist."))
        } else {
            await counterData.save()
            res.status(200).json(counterData)
        }

    } catch (error) {
        next(error)
    }
}

export const countersList = async (req, res, next) => {
    try {
        const allCounters = await Counter.find({ companyId: req.params.id })
        const services = await Promise.all(
            allCounters.map((service) => {
                if (service.serviceId) {
                    return Service.findById(service.serviceId);
                }
                return null;
            })
        );
        const countersWithServices = allCounters.map((service, index) => {
            const agent = services[index];
            return { ...service.toObject(), agent };
        });
        res.status(200).json(countersWithServices)
    } catch (error) {
        next(error)
    }
}

export const deleteCounter = async (req, res, next) => {
    try {
        await Counter.findByIdAndDelete(req.params.id)

        res.status(200).send("Deleted with success")

    } catch (error) {
        next(error)
    }
}