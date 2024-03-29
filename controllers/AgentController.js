import bcrypt from "bcryptjs"
import agent from "../models/Agent.js"
import { createError } from "../util/error.js";
import superAdmin from "../models/SuperAdmin.js"
import Service from "../models/Service.js";
import Counter from "../models/Counter.js"
import Agent from "../models/Agent.js";
import Client from "../models/Client.js";
import History from "../models/History.js";
import moment from "moment";
import CurrentServing from "../models/CurrentServing.js";
import Ticket from "../models/Ticket.js";

export const registerAgent = async (req, res, next) => {
    try {
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(req.body.password, salt)

        const newAgent = new agent({
            ...req.body,
            password: hash
        })

        await newAgent.save();

        res.status(200).json(newAgent);

    } catch (error) {
        next(error)
    }
}

export const logAgent = async (req, res, next) => {
    try {
        const checkAgent = await agent.findOne({ email: req.body.email });
        if (!checkAgent) return next(createError(400, "Agent doesn't exist"));

        const checkPassword = await bcrypt.compare(req.body.password, checkAgent.password);
        if (!checkPassword) return next(createError(400, "E-mail or password is wrong"));

        const updatedAgent = await agent.findByIdAndUpdate(
            checkAgent._id,
            { $set: { lastLogin: Date.now() } },
            { new: true }
        );

        const updatedAgentId = updatedAgent._id.toString();

        const serviceData = await Service.find({ agentId: { $in: [updatedAgentId] } });

        const companyData = await superAdmin.findOne({ _id: updatedAgent.companyId });

        let assignedCounter = await Counter.findOne({ agentId: updatedAgent._id });

        if (!assignedCounter) {
            // If no counter is assigned to the agent, find an available counter
            assignedCounter = await Counter.findOne({ companyId: updatedAgent.companyId, isActive: false });

            if (!assignedCounter) {
                // If no available counter is found, create an error
                return next(createError(400, "No Counter available."));
            }

            // Assign the agent to the counter
            assignedCounter.agentId = updatedAgent._id;
            assignedCounter.isActive = true;
            await assignedCounter.save();

            // Update the agent to be assigned to the counter
            updatedAgent.isAssignedToCounter = true;
            updatedAgent.assignedCounterId = assignedCounter._id;
            await updatedAgent.save();
        }


        const finalData = {
            services: serviceData,
            company: companyData,
            agent: updatedAgent,
            counter: assignedCounter,
        };

        res.status(200).json(finalData);

    } catch (error) {
        next(error);
    }
}

export const adminLogin = async (req, res, next) => {

    try {
        const admin = await agent.findOne({ email: req.body.email })
        if (!admin) return next(createError(400, "Admin doesn't exist"))

        const validPass = await bcrypt.compare(req.body.password, admin.password)
        if (!validPass) return next(createError(400, "E-mail or password is wrong"))

        const validPosition = admin.position === "Admin"
        if (!validPosition) return next(createError(403, "Action not authorized"))

        const ticketInfo = await Ticket.findOne({ companyId: admin.companyId })
        const companyInfo = await superAdmin.findById(admin.companyId)
        const { password, ...otherDetails } = admin._doc

        if (ticketInfo) {
            const finalData = { ...otherDetails, ticket: ticketInfo, company: companyInfo }
            res.status(200).json(finalData)
            await agent.findByIdAndUpdate(admin._id, { $set: { lastLogin: Date.now() } })
        } else {
            const finalData = { ...otherDetails, company: companyInfo }
            await agent.findByIdAndUpdate(admin._id, { $set: { lastLogin: Date.now() } })
            res.status(200).json(finalData)
        }



    } catch (error) {
        next(error)
    }

}

export const adminGetInfo = async (req, res, next) => {
    try {
        const admin = await agent.findById(req.params.id)
        const companyInfo = await superAdmin.findById(admin.companyId)
        const ticketInfo = await Ticket.findOne({ companyId: admin.companyId })
        const { password, ...otherDetails } = admin._doc

        const finalData = { ...otherDetails, ticket: ticketInfo, company: companyInfo }
        res.status(200).json(finalData)

    } catch (error) {
        next(error)
    }
}

export const emptyCounter = async (req, res, next) => {
    try {

        const updatedCounter = await Counter.findByIdAndUpdate(req.params.id, { $set: { isActive: false, agentId: "" } }, { new: true })
        res.status(200).json(updatedCounter)

    } catch (error) {
        next(error)
    }
}

export const updateAgent = async (req, res, next) => {
    try {
        const currentAgent = await agent.findByIdAndUpdate(req.params.id, { $set: { ...req.body } }, { new: true })
        res.status(200).json(currentAgent)
    } catch (error) {
        next(error)
    }
}

export const updateAgentPass = async (req, res, next) => {
    try {
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(req.body.password, salt)

        const updatedAgent = await agent.findByIdAndUpdate(req.params.id, { $set: { password: hash } }, { new: true })
        res.status(200).json(updatedAgent)
    } catch (error) {
        next(error)
    }
}

export const deleteAgent = async (req, res, next) => {
    try {
        await agent.findByIdAndDelete(req.params.id)
        res.status(200).send("Agent deleted succesfully")
    } catch (error) {
        next(error)
    }
}

export const getAgent = async (req, res, next) => {
    try {
        const agentInfo = await agent.findById(req.params.id)
        res.status(200).json(agentInfo)
    } catch (error) {
        next(error)
    }
}

export const getAgents = async (req, res, next) => {
    try {
        const agentsInfo = await agent.find({ companyId: req.params.id })

        res.status(200).json(agentsInfo)
    } catch (error) {
        next(error)
    }
}



export const callClient = async (req, res, next) => {
    try {
        const today = moment().startOf('day');
        const currentAgent = await Agent.findById(req.params.id)
        const servingCounter = await Counter.findOne({ agentId: currentAgent._id })

        const ticketToCall = await Client.findOne({ isActive: true, letter: req.body.letter, companyId: currentAgent.companyId, issuedTime: { $gte: today }, clientType: { $in: servingCounter.clientTypes }, number: { $ne: null } }).sort({ number: 1 })

        if (!ticketToCall) {
            return next(createError(403, `There's no customer for the selected service for now.`))
        } else if (servingCounter.clientTypes.includes(ticketToCall.clientType)) {
            await Client.findByIdAndUpdate(ticketToCall._id, { isActive: false }, { new: true })
            res.status(200).json(ticketToCall)
        } else {
            return next(createError(403, `There's no customer for the selected service for now.`))
        }
    } catch (error) {
        next(error)
        console.log(error)
    }
}

export const callClientManually = async (req, res, next) => {
    try {
        const today = moment().startOf('day');
        const currentAgent = await Agent.findById(req.params.id)

        const ticketToCall = await Client.findOne({ letter: req.body.letter, number: req.body.number, companyId: currentAgent.companyId, issuedTime: { $gte: today } }).sort({ number: 1 })

        if (ticketToCall === null) return next(createError(403, `There's no customer for the selected service for now.`))

        res.status(200).json(ticketToCall)

    } catch (error) {
        next(error)
    }
}

export const addHistory = async (req, res, next) => {
    try {

        const content = new History({
            ...req.body,
            agentId: req.params.id,
            endTime: Date.now()
        })

        const create = await content.save()

        res.status(200).json(create)

    } catch (error) {
        next(error)
    }
}

export const getHistory = async (req, res, next) => {
    try {

        const latest = await History.find({ agentId: req.params.id }).limit(10).sort({ endTime: -1 })

        res.status(200).json(latest)

    } catch (error) {
        next(error)
    }
}

export const getFullHistory = async (req, res, next) => {
    try {

        const latest = await History.find({ agentId: req.params.id }).sort({ endTime: -1 })

        res.status(200).json(latest)

    } catch (error) {
        next(error)
    }
}


export const getServedToday = async (req, res, next) => {
    try {
        const servedToday = await History.find({ agentId: req.params.id, startTime: { $gte: new moment().format("YYYY-MM-DDT00:00:00"), $lte: new moment().format("YYYY-MM-DDT23:59:59") } }).countDocuments()
        res.status(200).json(servedToday)
    } catch (error) {
        next(error)
    }
}

export const currentServingClient = async (req, res, next) => {
    try {

        const counterExist = await CurrentServing.findOne({ currentCounter: req.body.currentCounter, companyId: req.params.id })

        if (!counterExist) {
            const createClient = new CurrentServing({ companyId: req.params.id, ...req.body })

            await createClient.save()
            res.status(200).json(createClient)
        } else {
            const currentCounter = await CurrentServing.findByIdAndUpdate(counterExist._id, { ...req.body }, { new: true })
            res.status(200).json(currentCounter)
        }

    } catch (error) {
        next(error)
    }
}


export const getAllCurrentServing = async (req, res, next) => {
    try {

        const allCurrentCounters = await CurrentServing.aggregate([
            {
                $match: { companyId: req.params.id },
            },
            {
                $addFields: {
                    currentCounterNum: {
                        $convert: {
                            input: "$currentCounter",
                            to: "int",
                            onError: 0, // Default value if conversion fails
                            onNull: 0, // Default value if the field is null or missing
                        },
                    },
                },
            },
            {
                $sort: { currentCounterNum: 1 },
            },
        ]);
        res.status(200).json(allCurrentCounters)
    } catch (error) {
        next(error)
    }
}