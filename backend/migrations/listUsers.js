import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI;
const DATABASE_NAME = process.env.DATABASE_NAME;

async function listUsers() {
    const client = new MongoClient(MONGODB_URI);
    
    try {
        await client.connect();
        const db = client.db(DATABASE_NAME);
        const users = await db.collection('users').find({}).toArray();
        
        console.log('\n=== DANH SÁCH TÀI KHOẢN ===\n');
        users.forEach((user, i) => {
            console.log(`${i+1}. Email: ${user.email}`);
            console.log(`   Password: ${user.password}`);
            console.log(`   Fullname: ${user.fullname || 'N/A'}`);
            console.log(`   Roles: ${user.roles?.join(', ') || 'user'}`);
            console.log('');
        });
        console.log(`Tổng: ${users.length} tài khoản`);
        
    } catch (error) {
        console.error('Lỗi:', error);
    } finally {
        await client.close();
    }
}

listUsers();
