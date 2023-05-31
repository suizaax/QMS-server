import bcrypt from "bcryptjs"
import agent from "../models/Agent.js"
import { createError } from "../util/error.js";
import superAdmin from "../models/SuperAdmin.js"
import Service from "../models/Service.js";

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
      
        const serviceData = await Service.findOne({ agentId: updatedAgent._id });
      
        const companyData = await superAdmin.findOne({ _id: updatedAgent.companyId });
      
        const finalData = {
          ...(serviceData ? serviceData.toObject() : {}), // Check if serviceData exists, convert it to object if available, or use an empty object otherwise
          company: companyData,
          agent: updatedAgent,
        };
      
        console.log(finalData);
      
        res.status(200).json(finalData);
      } catch (error) {
        next(error);
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

export const getNonAsignedAgents = async (req, res, next) => {
    try {
        const assignedAgents = await Service.distinct('agentId', { companyId: req.params.id })
        const unassignedAgents = await agent.find({ companyId: req.params.id, _id: { $nin: assignedAgents } })
        res.status(200).json(unassignedAgents)
    } catch (error) {
        next(error)
    }
}
