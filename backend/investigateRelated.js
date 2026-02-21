import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Post from './models/Post.js';
import Comment from './models/Comment.js';

dotenv.config();

async function investigate() {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        // Find a post with a category
        const samplePost = await Post.findOne({ category: { $exists: true, $ne: '' } });
        if (!samplePost) {
            console.log("No posts with categories found.");
            process.exit(0);
        }

        console.log(`Investigating related posts for: "${samplePost.title}" (Category: ${samplePost.category})`);

        const category = samplePost.category || 'Uncategorized';

        // Manual aggregation test
        const suggestedPosts = await Post.aggregate([
            {
                $match: {
                    category: { $regex: new RegExp(`^${category}$`, 'i') },
                    _id: { $ne: samplePost._id }
                }
            },
            {
                $lookup: {
                    from: 'comments',
                    localField: '_id',
                    foreignField: 'post',
                    as: 'comments'
                }
            },
            {
                $addFields: {
                    likesCount: { $size: { $ifNull: ["$likes", []] } },
                    commentsCount: { $size: { $ifNull: ["$comments", []] } }
                }
            }
        ]);

        console.log(`Found ${suggestedPosts.length} related posts in the same category.`);

        if (suggestedPosts.length === 0) {
            console.log("No related posts found. Checking total posts in DB...");
            const totalPosts = await Post.countDocuments({ _id: { $ne: samplePost._id } });
            console.log(`Total other posts: ${totalPosts}`);
        } else {
            suggestedPosts.forEach(p => console.log(` - ${p.title} (Score/Engagement metrics simulated)`));
        }

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

investigate();
