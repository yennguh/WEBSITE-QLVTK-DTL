import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure upload directories exist
const avatarDir = path.join(__dirname, '../../public/uploads/avatars/');
const commentDir = path.join(__dirname, '../../public/uploads/comments/');
const coverDir = path.join(__dirname, '../../public/uploads/covers/');

if (!fs.existsSync(avatarDir)) {
    fs.mkdirSync(avatarDir, { recursive: true });
}
if (!fs.existsSync(commentDir)) {
    fs.mkdirSync(commentDir, { recursive: true });
}
if (!fs.existsSync(coverDir)) {
    fs.mkdirSync(coverDir, { recursive: true });
}

// Configure storage for avatars
const avatarStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        if (!fs.existsSync(avatarDir)) {
            fs.mkdirSync(avatarDir, { recursive: true });
        }
        cb(null, avatarDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, 'avatar-' + uniqueSuffix + ext);
    }
});

// Configure storage for comment images
const commentStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        if (!fs.existsSync(commentDir)) {
            fs.mkdirSync(commentDir, { recursive: true });
        }
        cb(null, commentDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, 'comment-' + uniqueSuffix + ext);
    }
});

// File filter - only allow images
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Chỉ cho phép upload file ảnh (jpeg, jpg, png, gif, webp)'));
    }
};

// Configure multer for avatars
const uploadAvatarMulter = multer({
    storage: avatarStorage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: fileFilter
});

// Configure multer for comment images
const uploadCommentMulter = multer({
    storage: commentStorage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: fileFilter
});

// Configure storage for cover photos
const coverStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        if (!fs.existsSync(coverDir)) {
            fs.mkdirSync(coverDir, { recursive: true });
        }
        cb(null, coverDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, 'cover-' + uniqueSuffix + ext);
    }
});

// Configure multer for profile (avatar + cover)
const profileStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        if (file.fieldname === 'avatar') {
            cb(null, avatarDir);
        } else if (file.fieldname === 'coverPhoto') {
            cb(null, coverDir);
        }
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const prefix = file.fieldname === 'avatar' ? 'avatar-' : 'cover-';
        cb(null, prefix + uniqueSuffix + ext);
    }
});

const uploadProfileMulter = multer({
    storage: profileStorage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: fileFilter
});

export const uploadAvatar = uploadAvatarMulter.single('avatar');
export const uploadCommentImage = uploadCommentMulter.single('image');
export const uploadProfile = uploadProfileMulter.fields([
    { name: 'avatar', maxCount: 1 },
    { name: 'coverPhoto', maxCount: 1 }
]);

