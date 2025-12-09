import { REPORTMODEL } from "../models/reportModel.js";

const createReport = async (req, res) => {
    try {
        const { postId, postTitle, reason } = req.body;
        const decoded = req.jwtDecoded;
        const reporterId = decoded._id;
        const reporterName = decoded.fullname || decoded.email;

        if (!postId || !reason) {
            return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });
        }

        const result = await REPORTMODEL.createReport({
            postId,
            postTitle: postTitle || 'Không có tiêu đề',
            reporterId,
            reporterName,
            reason
        });

        res.status(201).json({ message: 'Tố cáo đã được gửi', data: result });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getReports = async (req, res) => {
    try {
        const { page = 1, limit = 10, status } = req.query;
        const result = await REPORTMODEL.findReports({ page, limit, status });
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getReportById = async (req, res) => {
    try {
        const report = await REPORTMODEL.findReportById(req.params.id);
        if (!report) return res.status(404).json({ message: 'Không tìm thấy tố cáo' });
        res.status(200).json(report);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateReport = async (req, res) => {
    try {
        const result = await REPORTMODEL.updateReport(req.params.id, req.body);
        res.status(200).json({ message: 'Cập nhật thành công', data: result });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteReport = async (req, res) => {
    try {
        await REPORTMODEL.deleteReport(req.params.id);
        res.status(200).json({ message: 'Xóa thành công' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const countPending = async (req, res) => {
    try {
        const count = await REPORTMODEL.countPendingReports();
        res.status(200).json({ count });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const REPORTCONTROLLER = {
    createReport,
    getReports,
    getReportById,
    updateReport,
    deleteReport,
    countPending
};
