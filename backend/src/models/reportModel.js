import Joi from "joi";
import { ObjectId } from "mongodb";
import { GET_DB } from "../config/mongodb.js";

const REPORT_COLLECTION_NAME = 'reports';

const REPORT_COLLECTION_SCHEMA = Joi.object({
    postId: Joi.string().required(),
    postTitle: Joi.string().required(),
    reporterId: Joi.string().required(),
    reporterName: Joi.string().required(),
    reason: Joi.string().required(),
    status: Joi.string().valid('pending', 'reviewed', 'resolved').default('pending'),
    adminNote: Joi.string().optional().default(''),
    createdAt: Joi.date().timestamp('javascript').default(Date.now),
    updatedAt: Joi.date().timestamp('javascript').default(null)
});

const validateCreated = async (data) => {
    return await REPORT_COLLECTION_SCHEMA.validateAsync(data);
};

const createReport = async (payload) => {
    try {
        const validatedData = await validateCreated(payload);
        const result = await GET_DB().collection(REPORT_COLLECTION_NAME).insertOne(validatedData);
        return result;
    } catch (error) {
        throw error;
    }
};

const findReports = async ({ page = 1, limit = 10, status }) => {
    try {
        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.max(1, Math.min(100, parseInt(limit)));
        const skip = (pageNum - 1) * limitNum;

        const filter = {};
        if (status) filter.status = status;

        const totalCount = await GET_DB().collection(REPORT_COLLECTION_NAME).countDocuments(filter);

        const reports = await GET_DB()
            .collection(REPORT_COLLECTION_NAME)
            .find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum)
            .toArray();

        return {
            data: reports,
            pagination: {
                total: totalCount,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(totalCount / limitNum)
            }
        };
    } catch (error) {
        throw error;
    }
};

const findReportById = async (id) => {
    try {
        return await GET_DB().collection(REPORT_COLLECTION_NAME).findOne({ _id: new ObjectId(id) });
    } catch (error) {
        throw error;
    }
};

const updateReport = async (id, payload) => {
    try {
        const updateData = { ...payload, updatedAt: Date.now() };
        const result = await GET_DB()
            .collection(REPORT_COLLECTION_NAME)
            .findOneAndUpdate(
                { _id: new ObjectId(id) },
                { $set: updateData },
                { returnDocument: 'after' }
            );
        return result.value;
    } catch (error) {
        throw error;
    }
};

const deleteReport = async (id) => {
    try {
        return await GET_DB().collection(REPORT_COLLECTION_NAME).deleteOne({ _id: new ObjectId(id) });
    } catch (error) {
        throw error;
    }
};

const countPendingReports = async () => {
    try {
        return await GET_DB().collection(REPORT_COLLECTION_NAME).countDocuments({ status: 'pending' });
    } catch (error) {
        throw error;
    }
};

export const REPORTMODEL = {
    createReport,
    findReports,
    findReportById,
    updateReport,
    deleteReport,
    countPendingReports
};
