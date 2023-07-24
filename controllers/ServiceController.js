import Agent from "../models/Agent.js";
import Client from "../models/Client.js";
import service from "../models/Service.js"
import mongoose from "mongoose";

export const createService = async (req, res, next) => {
    try {
        const newService = new service({
            ...req.body
        })

        await newService.save();

        res.status(200).json(newService);
    } catch (error) {
        next(error)
    }
}

export const updateService = async (req, res, next) => {
    try {
        const updatedService = await service.findByIdAndUpdate(req.params.id, { $set: { ...req.body } }, { new: true })
        res.status(200).json(updatedService)
    } catch (error) {
        next(error)
    }
}

export const deleteService = async (req, res, next) => {
    try {
        await service.findByIdAndDelete(req.params.id)
        res.status(200).send("deleted succeffully")
    } catch (error) {
        next(error)
    }
}

export const getService = async (req, res, next) => {
    try {
        const serviceInfo = await service.findById(req.params.id);

        // Assuming serviceInfo.agentId is an array of agent IDs
        const agentIds = serviceInfo.agentId;
        const agents = await Agent.find({ _id: { $in: agentIds } });

        // Now you have an array of agent documents, you can add it to the serviceInfo object
        const serviceWithAgents = { ...serviceInfo.toObject(), agents: agents };
        res.status(200).json(serviceWithAgents);
    } catch (error) {
        next(error);
    }
};

export const removeAgentFromService = async (req, res, next) => {
    try {
        const serviceInfo = await service.findByIdAndUpdate(req.params.id, { $pull: { agentId: req.body.index } }, { new: true })
        res.status(200).json(serviceInfo)
    } catch (error) {
        next(error)
    }
}

export const addAgentsToService = async (req, res, next) => {
    try {
        const { id } = req.params;
        const selectedAgentIds = req.body.selectedAgentIds; // Assuming you have the selectedAgentIds array in req.body

        // Iterate through the selectedAgentIds and update the service document individually
        for (const agentId of selectedAgentIds) {
            await service.findByIdAndUpdate(id, { $push: { agentId: agentId } });
        }

        // Fetch and return the updated serviceInfo
        const serviceInfo = await service.findById(id);
        res.status(200).json(serviceInfo);
    } catch (error) {
        next(error);
    }
}


export const getServices = async (req, res, next) => {
    try {
        const servicesInfo = await service.find({ companyId: req.params.id });
        const agents = await Promise.all(
            servicesInfo.map(async (service) => {
                if (service.agentId && mongoose.Types.ObjectId.isValid(service.agentId)) {
                    return await Agent.findById(service.agentId);
                }
                return null;
            })
        );
        const servicesWithAgents = servicesInfo.map((service, index) => {
            const agent = agents[index];
            return { ...service.toObject(), agent };
        });

        res.status(200).json(servicesWithAgents);
    } catch (error) {
        next(error);
    }

}


export const serviceStats = async (req, res, next) => {
    try {
        const serviceStats = await Client.aggregate([
            {
                $match: {
                    companyId: req.params.id
                }
            },
            {
                $group: {
                    _id: '$service',
                    count: { $sum: 1 },
                }
            },
            {
                $project: {
                    _id: 0,
                    service: '$_id',
                    count: 1
                }
            },
            {
                $sort: {
                    count: -1,
                },
            },
            {
                $limit: 8,
            },
        ]);

        res.status(200).json(serviceStats);
    } catch (error) {
        next(error);
    }
};