import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Post from './models/Post.js';

dotenv.config();

async function diagnose() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const posts = await Post.find({});
        console.log(`Diagnosing ${posts.length} posts...`);

        for (const post of posts) {
            const category = (post.category || 'Uncategorized').trim();
            const escapedCategory = category.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

            let results = await Post.aggregate([
                { $match: { category: { $regex: new RegExp(`^\\s*${escapedCategory}\\s*$`, 'i') }, _id: { $ne: post._id } } },
                { $lookup: { from: 'users', localField: 'author', foreignField: '_id', as: 'authorData' } },
                { $unwind: { path: '$authorData', preserveNullAndEmptyArrays: true } },
                { $limit: 3 }
            ]);

            let isFallbackOutput = false;
            if (results.length === 0) {
                results = await Post.aggregate([
                    { $match: { _id: { $ne: post._id } } },
                    { $lookup: { from: 'users', localField: 'author', foreignField: '_id', as: 'authorData' } },
                    { $unwind: { path: '$authorData', preserveNullAndEmptyArrays: true } },
                    { $sort: { createdAt: -1 } },
                    { $limit: 3 }
                ]);
                isFallbackOutput = true;
            }

            console.log(`Post: "${post.title}" [Category: ${category}] -> Found: ${results.length} (Fallback: ${isFallbackOutput})`);
        }
        process.exit(0);
    } catch (err) {
        console.error("Diagnostic failed:", err);
        process.exit(1);
    }
}

diagnose();
