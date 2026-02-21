import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Post from './models/Post.js';
import User from './models/User.js';

dotenv.config();

async function checkData() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const posts = await Post.find({}).limit(10);
        console.log(`Checking ${posts.length} posts...`);

        for (const post of posts) {
            const authorType = typeof post.author;
            const isObjectId = post.author instanceof mongoose.Types.ObjectId;
            const user = await User.findById(post.author);

            console.log(`Post: "${post.title}"`);
            console.log(` - Author Field: ${post.author} (Type: ${authorType}, isObjectId: ${isObjectId})`);
            console.log(` - User Found: ${user ? user.username : 'NOT FOUND'}`);

            if (!user) {
                console.log("   WARNING: Dangling author reference!");
            }
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkData();
