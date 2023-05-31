import clients from "../models/Client.js"
import { createError } from "../util/error.js"

export const createClient = async (req, res, next) => {

    try {

        if (clients.find()) {
            const checkExistance = await clients.findOne({ number: req.body.number, letter: req.body.letter }).lean().exec()

            if (checkExistance) return next(createError(400, 'Ticket with same number already issued'))
        }

        const getBiggestNumber = await clients.findOne({ letter: req.body.letter }).sort({ number: -1 }).lean().exec();

        if (getBiggestNumber) {
            const registerClient = new clients({
                ...req.body,
                agentId: req.body.agentId,
                agentName: req.body.agentName,
                companyId: req.body.companyId,
                number: getBiggestNumber.number + 1
            })

            await registerClient.save()

            res.status(200).json(registerClient);
        }

        const registerClient = new clients({
            ...req.body,
            agentId: req.body.agentId,
            agentName: req.body.agentName,
            companyId: req.body.companyId,
            number: 1
        })

        await registerClient.save()

        res.status(200).json(registerClient);

    } catch (error) {
        console.log(error)
        next(error)
    }

}