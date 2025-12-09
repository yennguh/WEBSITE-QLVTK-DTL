import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Eye, Trash2, CheckCircle, Clock, X, Ban } from 'lucide-react';
import { fetchReports, updateReport, deleteReport } from '../../api/reports.api';
import { updatePost, deletePost } from '../../api/posts.api';

const ReportsList = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
    const [filter, setFilter] = useState('');
    const [selectedReport, setSelectedReport] = useState(null);

    const loadReports = async (page = 1) => {
        setLoading(true);
        try {
            const params = { page, limit: 10 };
            if (filter) params.status = filter;
            const result = await fetchReports(params);
            setReports(result.data || []);
            setPagination(result.pagination || { page: 1, totalPages: 1 });
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadReports(); }, [filter]);

    const handleUpdateStatus = async (id, status) => {
        try {
            await updateReport(id, { status });
            loadReports(pagination.page);
            if (selectedReport?._id === id) setSelectedReport(prev => ({ ...prev, status }));
        } catch (error) {
            alert('Có lỗi xảy ra');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Xóa tố cáo này?')) return;
        try {
            await deleteReport(id);
            loadReports(pagination.page);
            if (selectedReport?._id === id) setSelectedReport(null);
        } catch (error) {
            alert('Có lỗi xảy ra');
        }
    };

    // Cấm bài đăng (reject)
    const handleBanPost = async (postId, reportId) => {
        if (!window.confirm('Bạn có chắc muốn cấm/từ chối bài đăng này?')) return;
        try {
            await updatePost(postId, { status: 'rejected' });
            await handleUpdateStatus(reportId, 'resolved');
            alert('Đã cấm bài đăng thành công!');
        } catch (error) {
            alert('Có lỗi xảy ra khi cấm bài đăng');
        }
    };

    // Xóa bài đăng
    const handleDeletePost = async (postId, reportId) => {
        if (!window.confirm('Bạn có chắc muốn XÓA VĨNH VIỄN bài đăng này?')) return;
        try {
            await deletePost(postId);
            await handleUpdateStatus(reportId, 'resolved');
            alert('Đã xóa bài đăng thành công!');
        } catch (error) {
            alert('Có lỗi xảy ra khi xóa bài đăng');
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            pending: 'bg-yellow-100 text-yellow-700',
            reviewed: 'bg-blue-100 text-blue-700',
            resolved: 'bg-green-100 text-green-700'
        };
        const labels = { pending: 'Chờ xử lý', reviewed: 'Đã xem', resolved: 'Đã xử lý' };
        return <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>{labels[status]}</span>;
    };

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <AlertTriangle className="w-7 h-7 text-red-500" /> Quản lý tố cáo
                </h1>
                <select value={filter} onChange={(e) => setFilter(e.target.value)} className="px-4 py-2 border rounded-lg">
                    <option value="">Tất cả</option>
                    <option value="pending">Chờ xử lý</option>
                    <option value="reviewed">Đã xem</option>
                    <option value="resolved">Đã xử lý</option>
                </select>
            </div>

            {loading ? (
                <div className="text-center py-10">Đang tải...</div>
            ) : reports.length === 0 ? (
                <div className="text-center py-10 text-gray-500">Không có tố cáo nào</div>
            ) : (
                <div className="bg-white rounded-xl shadow overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Bài đăng</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Người tố cáo</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Lý do</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Trạng thái</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Ngày</th>
                                <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {reports.map((report) => (
                                <tr key={report._id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3">
                                        <Link to={`/baidang/${report.postId}`} className="text-blue-600 hover:underline font-medium">
                                            {report.postTitle?.substring(0, 30)}...
                                        </Link>
                                    </td>
                                    <td className="px-4 py-3 text-sm">{report.reporterName}</td>
                                    <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">{report.reason}</td>
                                    <td className="px-4 py-3">{getStatusBadge(report.status)}</td>
                                    <td className="px-4 py-3 text-sm text-gray-500">
                                        {new Date(report.createdAt).toLocaleDateString('vi-VN')}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-center gap-2">
                                            <button onClick={() => setSelectedReport(report)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded" title="Xem chi tiết">
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleBanPost(report.postId, report._id)} className="p-1.5 text-orange-600 hover:bg-orange-50 rounded" title="Cấm bài đăng">
                                                <Ban className="w-4 h-4" />
                                            </button>
                                            {report.status === 'pending' && (
                                                <button onClick={() => handleUpdateStatus(report._id, 'reviewed')} className="p-1.5 text-yellow-600 hover:bg-yellow-50 rounded" title="Đánh dấu đã xem">
                                                    <Clock className="w-4 h-4" />
                                                </button>
                                            )}
                                            {report.status !== 'resolved' && (
                                                <button onClick={() => handleUpdateStatus(report._id, 'resolved')} className="p-1.5 text-green-600 hover:bg-green-50 rounded" title="Đánh dấu đã xử lý">
                                                    <CheckCircle className="w-4 h-4" />
                                                </button>
                                            )}
                                            <button onClick={() => handleDelete(report._id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded" title="Xóa tố cáo">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {pagination.totalPages > 1 && (
                        <div className="flex justify-center gap-2 p-4 border-t">
                            {Array.from({ length: pagination.totalPages }, (_, i) => (
                                <button key={i} onClick={() => loadReports(i + 1)} className={`px-3 py-1 rounded ${pagination.page === i + 1 ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>
                                    {i + 1}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Modal chi tiết */}
            {selectedReport && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold">Chi tiết tố cáo</h3>
                            <button onClick={() => setSelectedReport(null)} className="p-1 hover:bg-gray-100 rounded-full">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="space-y-3">
                            <div><span className="font-medium">Bài đăng:</span> <Link to={`/baidang/${selectedReport.postId}`} className="text-blue-600 hover:underline">{selectedReport.postTitle}</Link></div>
                            <div><span className="font-medium">Người tố cáo:</span> {selectedReport.reporterName}</div>
                            <div><span className="font-medium">Trạng thái:</span> {getStatusBadge(selectedReport.status)}</div>
                            <div><span className="font-medium">Ngày gửi:</span> {new Date(selectedReport.createdAt).toLocaleString('vi-VN')}</div>
                            <div>
                                <span className="font-medium">Lý do:</span>
                                <p className="mt-1 p-3 bg-gray-50 rounded-lg text-gray-700">{selectedReport.reason}</p>
                            </div>
                        </div>
                        <div className="space-y-3 mt-6">
                            <div className="flex gap-2">
                                <button onClick={() => handleBanPost(selectedReport.postId, selectedReport._id)} className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center justify-center gap-2">
                                    <Ban className="w-4 h-4" /> Cấm bài đăng
                                </button>
                                <button onClick={() => handleDeletePost(selectedReport.postId, selectedReport._id)} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center gap-2">
                                    <Trash2 className="w-4 h-4" /> Xóa bài đăng
                                </button>
                            </div>
                            <div className="flex gap-2">
                                {selectedReport.status !== 'resolved' && (
                                    <button onClick={() => handleUpdateStatus(selectedReport._id, 'resolved')} className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                                        Đánh dấu đã xử lý
                                    </button>
                                )}
                                <button onClick={() => handleDelete(selectedReport._id)} className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600">
                                    Xóa tố cáo
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReportsList;
