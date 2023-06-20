import moment from "moment"
import clients from "../models/Client.js"
import { createError } from "../util/error.js"
import Service from "../models/Service.js";
import Client from "../models/Client.js";

export const createClient = async (req, res, next) => {

    try {

        const today = moment().startOf('day');

        if (clients.find()) {
            const checkExistance = await clients.findOne({ number: req.body.number, letter: req.body.letter }).lean().exec()

            if (checkExistance) return next(createError(400, 'Ticket with same number already issued'))
        }

        const getBiggestNumber = await clients.findOne({ letter: req.body.letter, issuedTime: { $gte: today.toDate() } }).sort({ number: -1 });
        console.log(getBiggestNumber)

        if (getBiggestNumber) {
            const registerClient = new clients({
                ...req.body,
                // agentId: req.body.agentId,
                agentName: req.body.agentName,
                companyId: req.body.companyId,
                number: getBiggestNumber.number + 1
            })

            await registerClient.save()

            res.status(200).json(registerClient);
        } else {
            const registerClient = new clients({
                ...req.body,
                agentId: req.body.agentId,
                agentName: req.body.agentName,
                companyId: req.body.companyId,
                number: 1
            })

            await registerClient.save()

            res.status(200).json(registerClient);
        }



    } catch (error) {
        console.log(error)
        next(error)
    }

}

export const getAllTickets = async (req, res, next) => {
    try {
        const allTickets = await clients.find({ companyId: req.params.id })
        res.status(200).json(allTickets)
    } catch (error) {
        next(error)
    }
}

export const getTodayTickets = async (req, res, next) => {
    try {
        const today = moment().startOf('day');

        const allTickets = await clients.find({
            companyId: req.params.id,
            issuedTime: { $gte: today.toDate() }
        });

        res.status(200).json(allTickets);
    } catch (error) {
        next(error)
    }
}

export const updateClient = async (req, res, next) => {
    try {
        const updateClient = await clients.findByIdAndUpdate(req.params.id, { $set: { isActive: false } }, { new: true })
        res.status(200).json(updateClient)
    } catch (error) {
        next(error)
    }
}

export const clientWaiting = async (req, res, next) => {
    const today = moment().startOf('day');
    try {
        const findClients = await clients.find({ companyId: req.params.id, isActive: true, issuedTime: { $gte: today } })
        res.status(200).json(findClients)
    } catch (error) {
        next(error)
    }
}

export const transferClient = async (req, res, next) => {
    const today = moment().startOf('day');
    try {
        const serviceInfo = await Service.findById(req.body.id)
        const getBiggestNumber = await clients.findOne({ letter: serviceInfo.letter, issuedTime: { $gte: today.toDate() } }).sort({ number: -1 });
        if (getBiggestNumber) {
            const clientToTransfer = await Client.findByIdAndUpdate(req.params.id, { $set: { letter: serviceInfo.letter, number: getBiggestNumber + 1, service: serviceInfo.name } })
            res.status(200).json(clientToTransfer)
        } else {
            const clientToTransfer = await Client.findByIdAndUpdate(req.params.id, { $set: { letter: serviceInfo.letter, number: 1, service: serviceInfo.name } })
            res.status(200).json(clientToTransfer)
        }


    } catch (error) {
        next(error)
    }
}