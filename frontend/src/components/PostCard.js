import { useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Clock, MapPin, Package, LayoutGrid, Send, Eye, Heart } from 'lucide-react';
import { AuthContext } from '../core/AuthContext';
import { getImageUrl } from '../utils/constant';
import PrivacyImage from './PrivacyImage';
import { createComment } from '../api/comments.api';

// Format thời gian kiểu Facebook (vd: 2 giờ, 3 ngày)
const formatTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút`;
    if (diffHours < 24) return `${diffHours} giờ`;
    if (diffDays < 7) return `${diffDays} ngày`;
    return date.toLocaleDateString('vi-VN');
};

const PostCard = ({ item }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { token, user } = useContext(AuthContext);
    const [commentText, setCommentText] = useState('');
    const [comments, setComments] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);

    // Kiểm tra trạng thái yêu thích từ localStorage
    useEffect(() => {
        const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        setIsFavorite(favorites.includes(item._id));
    }, [item._id]);

    const handleToggleFavorite = (e) => {
        e.stopPropagation();
        const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        
        if (isFavorite) {
            const newFavorites = favorites.filter(id => id !== item._id);
            localStorage.setItem('favorites', JSON.stringify(newFavorites));
            setIsFavorite(false);
        } else {
            favorites.push(item._id);
            localStorage.setItem('favorites', JSON.stringify(favorites));
            setIsFavorite(true);
        }
    };

    const handleViewDetail = () => {
        if (token) {
            navigate(`/baidang/${item._id}`);
        } else {
            // Lưu trang hiện tại để sau khi đăng nhập quay lại
            navigate('/login', { state: { from: location } });
        }
    };

    const handleSubmitComment = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (!commentText.trim() || !token) return;
        
        setSubmitting(true);
        try {
            const result = await createComment({
                postId: item._id,
                content: commentText.trim()
            });
            if (result) {
                // Thêm comment mới vào danh sách với thông tin user hiện tại
                setComments(prev => [...prev, {
                    _id: result._id || Date.now(),
                    content: commentText.trim(),
                    user: user,
                    createdAt: new Date().toISOString()
                }]);
                setCommentText('');
            }
        } catch (error) {
            console.error('Lỗi gửi bình luận:', error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300">
            {/* Header - Avatar, Name, Time, Location */}
            <div className="p-4 flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {(item.user?.avatar || item.authorAvatar) ? (
                            <img src={getImageUrl(item.user?.avatar || item.authorAvatar)} alt="" className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-white text-sm font-bold">{item.user?.fullname?.substring(0, 1).toUpperCase() || 'U'}</span>
                        )}
                    </div>
                    <div>
                        <p className="font-semibold text-gray-900">{item.user?.fullname || 'Người dùng'}</p>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                {formatTimeAgo(item.createdAt)}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5" />
                                {item.location}
                            </span>
                        </div>
                    </div>
                </div>
                <div className={`px-3 py-1.5 rounded-full text-xs font-bold ${item.category === 'lost' ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
                    {item.category === 'lost' ? '🔍 Thất lạc' : '✨ Nhặt được'}
                </div>
            </div>

            {/* Content */}
            <div className="px-4 pb-3">
                <h3 className="font-bold text-lg text-gray-900 mb-2">{item.title}</h3>
                {item.description && (
                    <p className="text-gray-600 line-clamp-2 mb-3">{item.description}</p>
                )}
                <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-lg">
                        <Package className="w-3.5 h-3.5" />{item.itemType}
                    </span>
                </div>
            </div>

            {/* Image */}
            {item.images && item.images.length > 0 && (
                <div className="relative aspect-[4/3] bg-gray-100">
                    <PrivacyImage 
                        src={item.images[0]} 
                        alt={item.title} 
                        className="w-full h-full object-cover" 
                        blur={true}
                        postOwnerId={item.user?._id || item.userId}
                        onClick={handleViewDetail}
                    />
                    {item.images.length > 1 && (
                        <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5">
                            <LayoutGrid className="w-3 h-3" />+{item.images.length - 1}
                        </div>
                    )}
                </div>
            )}

            {/* Footer - Nút yêu thích và xem chi tiết */}
            <div className="px-4 py-3 border-t border-gray-100 flex gap-3">
                <button
                    onClick={handleToggleFavorite}
                    className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all ${
                        isFavorite 
                            ? 'bg-red-50 text-red-500 hover:bg-red-100' 
                            : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                    }`}
                >
                    <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500' : ''}`} />
                </button>
                <button
                    onClick={handleViewDetail}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-600 font-semibold rounded-xl transition-all"
                >
                    <Eye className="w-4 h-4" />
                    Xem chi tiết
                </button>
            </div>

            {/* Comments Section */}
            {token && user && (
                <div className="px-4 pb-4 border-t border-gray-100">
                    {/* Hiển thị bình luận vừa viết */}
                    {comments.length > 0 && (
                        <div className="pt-3 space-y-3">
                            {comments.map((cmt) => (
                                <div key={cmt._id} className="flex gap-2">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center overflow-hidden flex-shrink-0">
                                        {cmt.user?.avatar ? (
                                            <img src={getImageUrl(cmt.user.avatar)} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-white text-xs font-bold">{cmt.user?.fullname?.substring(0, 1).toUpperCase() || 'U'}</span>
                                        )}
                                    </div>
                                    <div className="flex-1 bg-gray-100 rounded-2xl px-3 py-2">
                                        <p className="font-semibold text-sm text-gray-900">{cmt.user?.fullname}</p>
                                        <p className="text-sm text-gray-700">{cmt.content}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Input bình luận */}
                    <form onSubmit={handleSubmitComment} className="flex items-center gap-2 pt-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center overflow-hidden flex-shrink-0">
                            {user.avatar ? (
                                <img src={getImageUrl(user.avatar)} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-white text-xs font-bold">{user.fullname?.substring(0, 1).toUpperCase() || 'U'}</span>
                            )}
                        </div>
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                placeholder="Viết bình luận..."
                                className="w-full px-4 py-2 pr-10 bg-gray-100 rounded-full text-sm outline-none focus:ring-2 focus:ring-blue-200"
                                disabled={submitting}
                            />
                            <button
                                type="submit"
                                disabled={!commentText.trim() || submitting}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-blue-500 hover:text-blue-600 disabled:text-gray-300 disabled:cursor-not-allowed"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default PostCard;
