import moment from "moment"
import clients from "../models/Client.js"
import { createError } from "../util/error.js"
import Service from "../models/Service.js";
import Client from "../models/Client.js";
import Agent from "../models/Agent.js";
import Counter from "../models/Counter.js";

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

export const updateOtherClient = async (req, res, next) => {
    try {
        const updateClient = await clients.findByIdAndUpdate(req.params.id, { $set: { ...req.body } }, { new: true })
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

export const clientWaitingPerAgent = async (req, res, next) => {
    const currentCounter = await Counter.findById(req.params.counterId)
    const updatedAgent = await Agent.findById(req.params.agentId)
    const updatedAgentId = (updatedAgent._id).toString();
    const serviceData = await Service.find({ agentId: { $in: updatedAgentId } });
    const serviceIds = serviceData.map((service) => service.name);
    const today = moment().startOf('day');
    try {
        const findClients = await clients.find({ companyId: req.params.id, isActive: true, issuedTime: { $gte: today }, clientType: { $in: currentCounter.clientTypes }, service: { $in: serviceIds } })
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
            const clientToTransfer = await clients.findByIdAndUpdate(req.params.id, { $set: { letter: serviceInfo.letter, number: getBiggestNumber.number + 1, service: serviceInfo.name } })
            res.status(200).json(clientToTransfer)
        } else {
            const clientToTransfer = await clients.findByIdAndUpdate(req.params.id, { $set: { letter: serviceInfo.letter, number: 1, service: serviceInfo.name } })
            res.status(200).json(clientToTransfer)
        }


    } catch (error) {
        next(error)
    }
}

// today data

export const todayClients = async (req, res, next) => {
    try {
        const memberCount = await clients.find({
            issuedTime: { $gte: new moment().format("YYYY-MM-DDT00:00:00"), $lte: new moment().format("YYYY-MM-DDT23:59:59") },
            companyId: req.params.id,
        }).countDocuments()

        res.status(200).json(memberCount)

    } catch (error) {
        next(error)
    }
}

export const todayServed = async (req, res, next) => {
    try {
        const memberCount = await clients.find({
            issuedTime: { $gte: new moment().format("YYYY-MM-DDT00:00:00"), $lte: new moment().format("YYYY-MM-DDT23:59:59") },
            companyId: req.params.id,
            isActive: false
        }).countDocuments()

        res.status(200).json(memberCount)

    } catch (error) {
        next(error)
    }
}

export const todayInd = async (req, res, next) => {
    try {
        const memberCount = await clients.find({
            issuedTime: { $gte: new moment().format("YYYY-MM-DDT00:00:00"), $lte: new moment().format("YYYY-MM-DDT23:59:59") },
            companyId: req.params.id,
            clientType: "Individuel"
        }).countDocuments()

        res.status(200).json(memberCount)

    } catch (error) {
        next(error)
    }
}

export const todayBusiness = async (req, res, next) => {
    try {
        const memberCount = await clients.find({
            issuedTime: { $gte: new moment().format("YYYY-MM-DDT00:00:00"), $lte: new moment().format("YYYY-MM-DDT23:59:59") },
            companyId: req.params.id,
            clientType: "Business"
        }).countDocuments()

        res.status(200).json(memberCount)

    } catch (error) {
        next(error)
    }
}

// today data end

// yesterday data

export const yesterdayClients = async (req, res, next) => {
    try {
        const memberCount = await clients.find({
            issuedTime: { $gte: new moment().subtract(1, "days").format("YYYY-MM-DDT00:00:00"), $lte: new moment().subtract(1, "days").format("YYYY-MM-DDT23:59:59") },
            companyId: req.params.id,
        }).countDocuments()

        res.status(200).json(memberCount)

    } catch (error) {
        next(error)
    }
}

export const yesterdayServed = async (req, res, next) => {
    try {
        const memberCount = await clients.find({
            issuedTime: { $gte: new moment().subtract(1, "days").format("YYYY-MM-DDT00:00:00"), $lte: new moment().subtract(1, "days").format("YYYY-MM-DDT23:59:59") },
            companyId: req.params.id,
            isActive: false
        }).countDocuments()

        res.status(200).json(memberCount)

    } catch (error) {
        next(error)
    }
}

export const yesterdayInd = async (req, res, next) => {
    try {
        const memberCount = await clients.find({
            issuedTime: { $gte: new moment().subtract(1, "days").format("YYYY-MM-DDT00:00:00"), $lte: new moment().subtract(1, "days").format("YYYY-MM-DDT23:59:59") },
            companyId: req.params.id,
            clientType: "Individuel"
        }).countDocuments()

        res.status(200).json(memberCount)

    } catch (error) {
        next(error)
    }
}

export const yesterdayBusiness = async (req, res, next) => {
    try {
        const memberCount = await clients.find({
            issuedTime: { $gte: new moment().subtract(1, "days").format("YYYY-MM-DDT00:00:00"), $lte: new moment().subtract(1, "days").format("YYYY-MM-DDT23:59:59") },
            companyId: req.params.id,
            clientType: "Business"
        }).countDocuments()

        res.status(200).json(memberCount)

    } catch (error) {
        next(error)
    }
}

// yesterday data end

// weekly data

export const weeklyClients = async (req, res, next) => {
    try {

        const today = await clients.find({
            issuedTime: { $gte: new moment().format("YYYY-MM-DDT00:00:00"), $lte: new moment().format("YYYY-MM-DDT23:59:59") }
            , companyId: req.params.id,
        }).countDocuments()

        const yesterday = await clients.find({
            issuedTime: { $gte: new moment().subtract(1, "days").format("YYYY-MM-DDT00:00:00"), $lte: new moment().subtract(1, "days").format("YYYY-MM-DDT23:59:59") }
            , companyId: req.params.id,
        }).countDocuments()

        const twoDays = await clients.find({
            issuedTime: { $gte: new moment().subtract(2, "days").format("YYYY-MM-DDT00:00:00"), $lte: new moment().subtract(2, "days").format("YYYY-MM-DDT23:59:59") }
            , companyId: req.params.id,
        }).countDocuments()

        const threeDays = await clients.find({
            issuedTime: { $gte: new moment().subtract(3, "days").format("YYYY-MM-DDT00:00:00"), $lte: new moment().subtract(3, "days").format("YYYY-MM-DDT23:59:59") }
            , companyId: req.params.id,
        }).countDocuments()

        const fourDays = await clients.find({
            issuedTime: { $gte: new moment().subtract(4, "days").format("YYYY-MM-DDT00:00:00"), $lte: new moment().subtract(4, "days").format("YYYY-MM-DDT23:59:59") }
            , companyId: req.params.id,
        }).countDocuments()

        const fiveDays = await clients.find({
            issuedTime: { $gte: new moment().subtract(5, "days").format("YYYY-MM-DDT00:00:00"), $lte: new moment().subtract(5, "days").format("YYYY-MM-DDT23:59:59") }
            , companyId: req.params.id,
        }).countDocuments()

        const sixDays = await clients.find({
            issuedTime: { $gte: new moment().subtract(6, "days").format("YYYY-MM-DDT00:00:00"), $lte: new moment().subtract(6, "days").format("YYYY-MM-DDT23:59:59") }
            , companyId: req.params.id,
        }).countDocuments()

        const sevenDays = await clients.find({
            issuedTime: { $gte: new moment().subtract(7, "days").format("YYYY-MM-DDT00:00:00"), $lte: new moment().subtract(7, "days").format("YYYY-MM-DDT23:59:59") }
            , companyId: req.params.id,
        }).countDocuments()

        res.status(200).json([
            { date: moment().format("DD/MM"), count: today },
            { date: moment().subtract(1, "days").format("DD/MM"), count: yesterday },
            { date: moment().subtract(2, "days").format("DD/MM"), count: twoDays },
            { date: moment().subtract(3, "days").format("DD/MM"), count: threeDays },
            { date: moment().subtract(4, "days").format("DD/MM"), count: fourDays },
            { date: moment().subtract(5, "days").format("DD/MM"), count: fiveDays },
            { date: moment().subtract(6, "days").format("DD/MM"), count: sixDays },
            { date: moment().subtract(7, "days").format("DD/MM"), count: sevenDays },
        ])

    } catch (error) {
        next(error)
    }
}

export const weeklyServed = async (req, res, next) => {
    try {

        const today = await clients.find({
            issuedTime: { $gte: new moment().format("YYYY-MM-DDT00:00:00"), $lte: new moment().format("YYYY-MM-DDT23:59:59") }
            , companyId: req.params.id,
            isActive: false
        }).countDocuments()

        const yesterday = await clients.find({
            issuedTime: { $gte: new moment().subtract(1, "days").format("YYYY-MM-DDT00:00:00"), $lte: new moment().subtract(1, "days").format("YYYY-MM-DDT23:59:59") }
            , companyId: req.params.id,
            isActive: false
        }).countDocuments()

        const twoDays = await clients.find({
            issuedTime: { $gte: new moment().subtract(2, "days").format("YYYY-MM-DDT00:00:00"), $lte: new moment().subtract(2, "days").format("YYYY-MM-DDT23:59:59") }
            , companyId: req.params.id,
            isActive: false
        }).countDocuments()

        const threeDays = await clients.find({
            issuedTime: { $gte: new moment().subtract(3, "days").format("YYYY-MM-DDT00:00:00"), $lte: new moment().subtract(3, "days").format("YYYY-MM-DDT23:59:59") }
            , companyId: req.params.id,
            isActive: false
        }).countDocuments()

        const fourDays = await clients.find({
            issuedTime: { $gte: new moment().subtract(4, "days").format("YYYY-MM-DDT00:00:00"), $lte: new moment().subtract(4, "days").format("YYYY-MM-DDT23:59:59") }
            , companyId: req.params.id,
            isActive: false
        }).countDocuments()

        const fiveDays = await clients.find({
            issuedTime: { $gte: new moment().subtract(5, "days").format("YYYY-MM-DDT00:00:00"), $lte: new moment().subtract(5, "days").format("YYYY-MM-DDT23:59:59") }
            , companyId: req.params.id,
            isActive: false
        }).countDocuments()

        const sixDays = await clients.find({
            issuedTime: { $gte: new moment().subtract(6, "days").format("YYYY-MM-DDT00:00:00"), $lte: new moment().subtract(6, "days").format("YYYY-MM-DDT23:59:59") }
            , companyId: req.params.id,
            isActive: false
        }).countDocuments()

        const sevenDays = await clients.find({
            issuedTime: { $gte: new moment().subtract(7, "days").format("YYYY-MM-DDT00:00:00"), $lte: new moment().subtract(7, "days").format("YYYY-MM-DDT23:59:59") }
            , companyId: req.params.id,
            isActive: false
        }).countDocuments()

        res.status(200).json([
            { date: moment().format("DD/MM"), count: today },
            { date: moment().subtract(1, "days").format("DD/MM"), count: yesterday },
            { date: moment().subtract(2, "days").format("DD/MM"), count: twoDays },
            { date: moment().subtract(3, "days").format("DD/MM"), count: threeDays },
            { date: moment().subtract(4, "days").format("DD/MM"), count: fourDays },
            { date: moment().subtract(5, "days").format("DD/MM"), count: fiveDays },
            { date: moment().subtract(6, "days").format("DD/MM"), count: sixDays },
            { date: moment().subtract(7, "days").format("DD/MM"), count: sevenDays },
        ])

    } catch (error) {
        next(error)
    }
}

// weekly data end

// monthly Data

export const monthlyClients = async (req, res, next) => {
    try {
        const counts = [];

        for (let i = 0; i < 30; i++) {
            const day = moment().subtract(i, "days");
            const count = await clients.find({
                issuedTime: {
                    $gte: day.startOf("day").format("YYYY-MM-DDTHH:mm:ss"),
                    $lte: day.endOf("day").format("YYYY-MM-DDTHH:mm:ss")
                },
                companyId: req.params.id,
            }).countDocuments();

            counts.push({ date: day.format("DD/MM"), count })
        }

        res.status(200).json(counts);

    } catch (error) {
        next(error)
    }
}

export const monthlyServed = async (req, res, next) => {
    try {
        const counts = [];

        for (let i = 0; i < 30; i++) {
            const day = moment().subtract(i, "days");
            const count = await clients.find({
                issuedTime: {
                    $gte: day.startOf("day").format("YYYY-MM-DDTHH:mm:ss"),
                    $lte: day.endOf("day").format("YYYY-MM-DDTHH:mm:ss")
                },
                companyId: req.params.id,
                isActive: false
            }).countDocuments();

            counts.push({ date: day.format("DD/MM"), count })
        }

        res.status(200).json(counts);

    } catch (error) {
        next(error)
    }
}

// monthly Data end

// Quarterly data

export const quarterlyClients = async (req, res, next) => {
    try {
        const startDate = moment().subtract(90, 'days').startOf('day').toDate();
        const endDate = moment().endOf('day').toDate();

        const pipeline = [
            {
                $match: {
                    issuedTime: {
                        $gte: startDate,
                        $lte: endDate
                    },
                    companyId: req.params.id,
                    // isActive: false
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: {
                            format: '%d/%m',
                            date: '$issuedTime'
                        }
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $group: {
                    _id: null,
                    counts: {
                        $push: {
                            date: '$_id',
                            count: '$count'
                        }
                    }
                }
            },
            {
                $addFields: {
                    dates: {
                        $map: {
                            input: {
                                $range: [0, 90]
                            },
                            as: 'day',
                            in: {
                                $dateToString: {
                                    format: '%d/%m',
                                    date: { $add: [startDate, { $multiply: ['$$day', 24 * 60 * 60 * 1000] }] }
                                }
                            }
                        }
                    }
                }
            },
            {
                $lookup: {
                    from: 'clients', // Replace 'YourModels' with the actual collection name
                    let: { days: '$dates' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $in: [{ $dateToString: { format: '%d/%m', date: '$issuedTime' } }, '$$days'] },
                                        { $eq: ['$companyId', req.params.id] },
                                        //   { $eq: ['$isActive', false] }
                                    ]
                                }
                            }
                        },
                        {
                            $group: {
                                _id: {
                                    $dateToString: {
                                        format: '%d/%m',
                                        date: '$issuedTime'
                                    }
                                },
                                count: { $sum: 1 }
                            }
                        }
                    ],
                    as: 'matchedDocs'
                }
            },
            {
                $unwind: {
                    path: '$dates',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: 'clients', // Replace 'YourModels' with the actual collection name
                    let: { date: '$dates' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: [{ $dateToString: { format: '%d/%m', date: '$issuedTime' } }, '$$date'] },
                                        { $eq: ['$companyId', req.params.id] },
                                        //   { $eq: ['$isActive', false] }
                                    ]
                                }
                            }
                        },
                        {
                            $count: 'count'
                        }
                    ],
                    as: 'matchedCount'
                }
            },
            {
                $addFields: {
                    count: { $ifNull: [{ $arrayElemAt: ['$matchedCount.count', 0] }, 0] }
                }
            },
            {
                $project: {
                    _id: 0,
                    date: '$dates',
                    count: 1
                }
            }
        ];

        const result = await clients.aggregate(pipeline);

        res.status(200).json(result);

    } catch (error) {
        next(error)
    }
}

export const quarterlyServed = async (req, res, next) => {
    try {
        const startDate = moment().subtract(90, 'days').startOf('day').toDate();
        const endDate = moment().endOf('day').toDate();

        const pipeline = [
            {
                $match: {
                    issuedTime: {
                        $gte: startDate,
                        $lte: endDate
                    },
                    companyId: req.params.id,
                    isActive: false
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: {
                            format: '%d/%m',
                            date: '$issuedTime'
                        }
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $group: {
                    _id: null,
                    counts: {
                        $push: {
                            date: '$_id',
                            count: '$count'
                        }
                    }
                }
            },
            {
                $addFields: {
                    dates: {
                        $map: {
                            input: {
                                $range: [0, 90]
                            },
                            as: 'day',
                            in: {
                                $dateToString: {
                                    format: '%d/%m',
                                    date: { $add: [startDate, { $multiply: ['$$day', 24 * 60 * 60 * 1000] }] }
                                }
                            }
                        }
                    }
                }
            },
            {
                $lookup: {
                    from: 'clients', // Replace 'YourModels' with the actual collection name
                    let: { days: '$dates' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $in: [{ $dateToString: { format: '%d/%m', date: '$issuedTime' } }, '$$days'] },
                                        { $eq: ['$companyId', req.params.id] },
                                        { $eq: ['$isActive', false] }
                                    ]
                                }
                            }
                        },
                        {
                            $group: {
                                _id: {
                                    $dateToString: {
                                        format: '%d/%m',
                                        date: '$issuedTime'
                                    }
                                },
                                count: { $sum: 1 }
                            }
                        }
                    ],
                    as: 'matchedDocs'
                }
            },
            {
                $unwind: {
                    path: '$dates',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: 'clients', // Replace 'YourModels' with the actual collection name
                    let: { date: '$dates' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: [{ $dateToString: { format: '%d/%m', date: '$issuedTime' } }, '$$date'] },
                                        { $eq: ['$companyId', req.params.id] },
                                        { $eq: ['$isActive', false] }
                                    ]
                                }
                            }
                        },
                        {
                            $count: 'count'
                        }
                    ],
                    as: 'matchedCount'
                }
            },
            {
                $addFields: {
                    count: { $ifNull: [{ $arrayElemAt: ['$matchedCount.count', 0] }, 0] }
                }
            },
            {
                $project: {
                    _id: 0,
                    date: '$dates',
                    count: 1
                }
            }
        ];

        const result = await clients.aggregate(pipeline);

        res.status(200).json(result);

    } catch (error) {
        next(error)
    }
}

// Quarterly data end

// yearly data

export const yearlyClients = async (req, res, next) => {
    try {
        const startDate = moment().subtract(365, 'days').startOf('day').toDate();
        const endDate = moment().endOf('day').toDate();

        const pipeline = [
            {
                $match: {
                    issuedTime: {
                        $gte: startDate,
                        $lte: endDate
                    },
                    companyId: req.params.id,
                    // isActive: false
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: {
                            format: '%d/%m',
                            date: '$issuedTime'
                        }
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $group: {
                    _id: null,
                    counts: {
                        $push: {
                            date: '$_id',
                            count: '$count'
                        }
                    }
                }
            },
            {
                $addFields: {
                    dates: {
                        $map: {
                            input: {
                                $range: [0, 365]
                            },
                            as: 'day',
                            in: {
                                $dateToString: {
                                    format: '%d/%m',
                                    date: { $add: [startDate, { $multiply: ['$$day', 24 * 60 * 60 * 1000] }] }
                                }
                            }
                        }
                    }
                }
            },
            {
                $lookup: {
                    from: 'clients', // Replace 'YourModels' with the actual collection name
                    let: { days: '$dates' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $in: [{ $dateToString: { format: '%d/%m', date: '$issuedTime' } }, '$$days'] },
                                        { $eq: ['$companyId', req.params.id] },
                                        //   { $eq: ['$isActive', false] }
                                    ]
                                }
                            }
                        },
                        {
                            $group: {
                                _id: {
                                    $dateToString: {
                                        format: '%d/%m',
                                        date: '$issuedTime'
                                    }
                                },
                                count: { $sum: 1 }
                            }
                        }
                    ],
                    as: 'matchedDocs'
                }
            },
            {
                $unwind: {
                    path: '$dates',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: 'clients', // Replace 'YourModels' with the actual collection name
                    let: { date: '$dates' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: [{ $dateToString: { format: '%d/%m', date: '$issuedTime' } }, '$$date'] },
                                        { $eq: ['$companyId', req.params.id] },
                                        //   { $eq: ['$isActive', false] }
                                    ]
                                }
                            }
                        },
                        {
                            $count: 'count'
                        }
                    ],
                    as: 'matchedCount'
                }
            },
            {
                $addFields: {
                    count: { $ifNull: [{ $arrayElemAt: ['$matchedCount.count', 0] }, 0] }
                }
            },
            {
                $project: {
                    _id: 0,
                    date: '$dates',
                    count: 1
                }
            }
        ];

        const result = await clients.aggregate(pipeline);

        res.status(200).json(result);

    } catch (error) {
        next(error)
    }
}

export const yearlyServed = async (req, res, next) => {
    try {
        const startDate = moment().subtract(365, 'days').startOf('day').toDate();
        const endDate = moment().endOf('day').toDate();

        const pipeline = [
            {
                $match: {
                    issuedTime: {
                        $gte: startDate,
                        $lte: endDate
                    },
                    companyId: req.params.id,
                    isActive: false
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: {
                            format: '%d/%m',
                            date: '$issuedTime'
                        }
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $group: {
                    _id: null,
                    counts: {
                        $push: {
                            date: '$_id',
                            count: '$count'
                        }
                    }
                }
            },
            {
                $addFields: {
                    dates: {
                        $map: {
                            input: {
                                $range: [0, 365]
                            },
                            as: 'day',
                            in: {
                                $dateToString: {
                                    format: '%d/%m',
                                    date: { $add: [startDate, { $multiply: ['$$day', 24 * 60 * 60 * 1000] }] }
                                }
                            }
                        }
                    }
                }
            },
            {
                $lookup: {
                    from: 'clients', // Replace 'YourModels' with the actual collection name
                    let: { days: '$dates' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $in: [{ $dateToString: { format: '%d/%m', date: '$issuedTime' } }, '$$days'] },
                                        { $eq: ['$companyId', req.params.id] },
                                        { $eq: ['$isActive', false] }
                                    ]
                                }
                            }
                        },
                        {
                            $group: {
                                _id: {
                                    $dateToString: {
                                        format: '%d/%m',
                                        date: '$issuedTime'
                                    }
                                },
                                count: { $sum: 1 }
                            }
                        }
                    ],
                    as: 'matchedDocs'
                }
            },
            {
                $unwind: {
                    path: '$dates',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: 'clients', // Replace 'YourModels' with the actual collection name
                    let: { date: '$dates' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: [{ $dateToString: { format: '%d/%m', date: '$issuedTime' } }, '$$date'] },
                                        { $eq: ['$companyId', req.params.id] },
                                        { $eq: ['$isActive', false] }
                                    ]
                                }
                            }
                        },
                        {
                            $count: 'count'
                        }
                    ],
                    as: 'matchedCount'
                }
            },
            {
                $addFields: {
                    count: { $ifNull: [{ $arrayElemAt: ['$matchedCount.count', 0] }, 0] }
                }
            },
            {
                $project: {
                    _id: 0,
                    date: '$dates',
                    count: 1
                }
            }
        ];

        const result = await clients.aggregate(pipeline);

        res.status(200).json(result);

    } catch (error) {
        next(error);
    }
};

// yearly data end