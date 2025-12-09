/**
 * Migration script để fix các bài đăng có ảnh blob URL không hợp lệ
 * Chạy: node --experimental-modules backend/migrations/fixBlobImages.js
 */

import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env từ backend
dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI;
const DATABASE_NAME = process.env.DATABASE_NAME;

async function fixBlobImages() {
    const client = new MongoClient(MONGODB_URI);
    
    try {
        await client.connect();
        console.log('✅ Kết nối MongoDB thành công');
        
        const db = client.db(DATABASE_NAME);
        const postsCollection = db.collection('posts');
        
        // Tìm tất cả bài đăng có ảnh blob URL
        const postsWithBlobImages = await postsCollection.find({
            images: { $regex: /^blob:/ }
        }).toArray();
        
        console.log(`\n📊 Tìm thấy ${postsWithBlobImages.length} bài đăng có ảnh blob URL không hợp lệ:\n`);
        
        for (const post of postsWithBlobImages) {
            console.log(`- ID: ${post._id}`);
            console.log(`  Title: ${post.title}`);
            console.log(`  Images: ${post.images.length} ảnh`);
            
            // Lọc bỏ các blob URL, giữ lại ảnh hợp lệ (base64 hoặc URL thực)
            const validImages = post.images.filter(img => 
                img && !img.startsWith('blob:')
            );
            
            console.log(`  Valid images: ${validImages.length}`);
            
            // Cập nhật bài đăng
            await postsCollection.updateOne(
                { _id: post._id },
                { $set: { images: validImages } }
            );
            
            console.log(`  ✅ Đã cập nhật\n`);
        }
        
        console.log('\n🎉 Hoàn thành! Các bài đăng đã được fix.');
        console.log('⚠️  Lưu ý: Các bài đăng bị xóa ảnh cần được upload lại ảnh mới từ trang Admin.');
        
    } catch (error) {
        console.error('❌ Lỗi:', error);
    } finally {
        await client.close();
    }
}

fixBlobImages();
