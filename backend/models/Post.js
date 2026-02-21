import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    content: {
        type: String,
        required: true
    },
    summary: {
        type: String,
        required: true
    },
    coverImage: {
        type: String,
        default: ''
    },
    category: {
        type: String,
        default: 'Uncategorized'
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    shares: {
        type: Number,
        default: 0
    },
    slug: {
        type: String,
        unique: true,
        trim: true
    }
}, {
    timestamps: true
});

postSchema.pre('validate', async function () {
    if (this.isModified('title') || !this.slug) {
        this.slug = this.title
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }
});

const Post = mongoose.model('Post', postSchema);
export default Post;
