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
        const serviceInfo = await service.findById(req.params.id)
        const agentInfo = await Agent.findById(serviceInfo.agentId)
        const serviceWithAgent = { ...serviceInfo.toObject(), agent: agentInfo };
        res.status(200).json(serviceWithAgent)
    } catch (error) {
        next(error)
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