import mongoose from 'mongoose';
import Post from '../models/Post.js';

export const createPost = async (req, res) => {
    try {
        const { title, summary, content, coverImage, category } = req.body;

        const post = new Post({
            title,
            summary,
            content,
            coverImage,
            category,
            author: req.user.id
        });

        const savedPost = await post.save();
        res.json(savedPost);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getPosts = async (req, res) => {
    try {
        const { search, category, sort, page = 1, limit = 9 } = req.query;
        const pipeline = [];

        // 1. Match Stage
        const match = {};
        if (category && category !== '') {
            match.category = category.trim();
        }
        if (search && search !== '') {
            match.$or = [
                { title: { $regex: search, $options: 'i' } },
                { summary: { $regex: search, $options: 'i' } }
            ];
        }

        if (Object.keys(match).length > 0) {
            pipeline.push({ $match: match });
        }

        // 2. Add likesCount for sorting
        pipeline.push({
            $addFields: {
                likesCount: { $size: { $ifNull: ["$likes", []] } }
            }
        });

        // 3. Sort Stage
        let sortObj = { createdAt: -1 };
        if (sort === 'oldest') {
            sortObj = { createdAt: 1 };
        } else if (sort === 'likesCount') {
            sortObj = { likesCount: -1, createdAt: -1 };
        }
        pipeline.push({ $sort: sortObj });

        // 4. Pagination and Facet Support
        const skip = (parseInt(page) - 1) * parseInt(limit);

        pipeline.push({
            $facet: {
                metadata: [{ $count: "total" }],
                data: [
                    { $skip: skip },
                    { $limit: parseInt(limit) },
                    {
                        $lookup: {
                            from: 'users',
                            localField: 'author',
                            foreignField: '_id',
                            as: 'author'
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
                            commentsCount: { $size: "$comments" }
                        }
                    },
                    {
                        $unwind: {
                            path: '$author',
                            preserveNullAndEmptyArrays: true
                        }
                    },
                    {
                        $project: {
                            title: 1,
                            summary: 1,
                            coverImage: 1,
                            category: 1,
                            slug: 1,
                            createdAt: 1,
                            likes: 1,
                            likesCount: 1,
                            commentsCount: 1,
                            author: {
                                _id: '$author._id',
                                username: '$author.username'
                            }
                        }
                    }
                ]
            }
        });

        const result = await Post.aggregate(pipeline);
        const facetResult = result[0] || { data: [], metadata: [] };
        const posts = facetResult.data || [];
        const totalPosts = facetResult.metadata[0]?.total || 0;
        const totalPages = Math.ceil(totalPosts / parseInt(limit)) || 1;

        res.json({
            posts,
            totalPosts,
            totalPages,
            currentPage: parseInt(page)
        });
    } catch (error) {
        console.error('getPosts aggregation error:', error);
        res.status(500).json({ posts: [], totalPages: 0, totalPosts: 0, currentPage: 1 });
    }
};

export const getPostBySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        let query = { slug };

        if (mongoose.Types.ObjectId.isValid(slug)) {
            query = { $or: [{ _id: slug }, { slug }] };
        }

        const post = await Post.findOne(query).populate('author', ['username']);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        res.json(post);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const updatePost = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, summary, content, coverImage, category } = req.body;
        let query = { slug: id };

        if (mongoose.Types.ObjectId.isValid(id)) {
            query = { $or: [{ _id: id }, { slug: id }] };
        }

        let post = await Post.findOne(query);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Check user ownership
        if (post.author.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        post.title = title || post.title;
        post.summary = summary || post.summary;
        post.content = content || post.content;
        post.coverImage = coverImage !== undefined ? coverImage : post.coverImage;
        post.category = category || post.category;

        await post.save();
        res.json(post);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const deletePost = async (req, res) => {
    try {
        const { id } = req.params;
        let query = { slug: id };

        if (mongoose.Types.ObjectId.isValid(id)) {
            query = { $or: [{ _id: id }, { slug: id }] };
        }

        const post = await Post.findOne(query);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Check user ownership
        if (post.author.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        await post.deleteOne();
        res.json({ message: 'Post removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const toggleLike = async (req, res) => {
    try {
        const { slug } = req.params;
        const userId = req.user.id;

        const post = await Post.findOne({ slug });
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const alreadyLiked = post.likes.some(uid => uid.toString() === userId);

        if (alreadyLiked) {
            post.likes = post.likes.filter(uid => uid.toString() !== userId);
        } else {
            post.likes.push(userId);
        }

        await post.save();
        res.json({ likes: post.likes.length, liked: !alreadyLiked });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getUserPosts = async (req, res) => {
    try {
        const { userId } = req.params;
        const { page = 1, limit = 6 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [posts, totalPosts] = await Promise.all([
            Post.find({ author: userId })
                .populate('author', ['username'])
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            Post.countDocuments({ author: userId })
        ]);

        res.json({
            posts,
            totalPosts,
            totalPages: Math.ceil(totalPosts / parseInt(limit)),
            currentPage: parseInt(page)
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', posts: [], totalPages: 0 });
    }
};

export const incrementShare = async (req, res) => {
    try {
        const { slug } = req.params;
        const post = await Post.findOneAndUpdate({ slug }, { $inc: { shares: 1 } }, { new: true });
        if (!post) return res.status(404).json({ message: 'Post not found' });
        res.json({ shares: post.shares });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getTrendingPosts = async (req, res) => {
    try {
        const trendingPosts = await Post.aggregate([
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
                    commentsCount: { $size: "$comments" },
                    trendingScore: {
                        $add: [
                            { $multiply: [{ $size: { $ifNull: ["$likes", []] } }, 2] },
                            { $multiply: [{ $size: "$comments" }, 3] },
                            { $multiply: [{ $ifNull: ["$shares", 0] }, 1] }
                        ]
                    }
                }
            },
            { $sort: { trendingScore: -1, createdAt: -1 } },
            { $limit: 10 },
            {
                $lookup: {
                    from: 'users',
                    localField: 'author',
                    foreignField: '_id',
                    as: 'author'
                }
            },
            { $unwind: '$author' },
            {
                $project: {
                    title: 1,
                    summary: 1,
                    coverImage: 1,
                    category: 1,
                    slug: 1,
                    createdAt: 1,
                    author: { username: 1, _id: 1 },
                    likesCount: { $size: { $ifNull: ["$likes", []] } },
                    commentsCount: { $size: "$comments" },
                    shares: 1,
                    trendingScore: 1
                }
            }
        ]);
        res.json(trendingPosts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// ... existing code ...
export const getRelatedPosts = async (req, res) => {
    try {
        const { id } = req.params;
        let query = { slug: id };

        if (mongoose.Types.ObjectId.isValid(id)) {
            query = { $or: [{ _id: id }, { slug: id }] };
        }

        const post = await Post.findOne(query);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const category = (post.category || 'Uncategorized').trim();
        // Escape special regex characters in category name
        const escapedCategory = category.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        let suggestedPosts = await Post.aggregate([
            {
                $match: {
                    category: { $regex: new RegExp(`^\\s*${escapedCategory}\\s*$`, 'i') },
                    _id: { $ne: post._id }
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
                    commentsCount: { $size: "$comments" },
                    suggestionScore: {
                        $add: [
                            { $multiply: [{ $size: { $ifNull: ["$likes", []] } }, 2] },
                            { $multiply: [{ $size: "$comments" }, 3] },
                            { $multiply: [{ $ifNull: ["$shares", 0] }, 1] }
                        ]
                    }
                }
            },
            { $sort: { suggestionScore: -1, createdAt: -1 } },
            { $limit: 3 },
            {
                $lookup: {
                    from: 'users',
                    localField: 'author',
                    foreignField: '_id',
                    as: 'authorData'
                }
            },
            { $unwind: { path: '$authorData', preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    title: 1,
                    summary: 1,
                    coverImage: 1,
                    category: 1,
                    slug: 1,
                    createdAt: 1,
                    author: { $ifNull: ["$authorData", { username: 'Anonymous' }] },
                    likesCount: 1,
                    commentsCount: 1,
                    suggestionScore: 1,
                    isFallback: { $literal: false }
                }
            }
        ]);

        // Fallback: If no related posts in same category, fetch most recent posts
        if (suggestedPosts.length === 0) {
            suggestedPosts = await Post.aggregate([
                {
                    $match: {
                        _id: { $ne: post._id }
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
                        commentsCount: { $size: "$comments" }
                    }
                },
                { $sort: { createdAt: -1 } },
                { $limit: 3 },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'author',
                        foreignField: '_id',
                        as: 'authorData'
                    }
                },
                { $unwind: { path: '$authorData', preserveNullAndEmptyArrays: true } },
                {
                    $project: {
                        title: 1,
                        summary: 1,
                        coverImage: 1,
                        category: 1,
                        slug: 1,
                        createdAt: 1,
                        author: { $ifNull: ["$authorData", { username: 'Anonymous' }] },
                        likesCount: 1,
                        commentsCount: 1,
                        isFallback: { $literal: true }
                    }
                }
            ]);
        }

        res.json(suggestedPosts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const migrateSlugs = async (req, res) => {
    try {
        const posts = await Post.find({});
        let migratedCount = 0;
        for (const post of posts) {
            if (!post.slug) {
                let baseSlug = post.title
                    .toLowerCase()
                    .trim()
                    .replace(/[^\w\s-]/g, '')
                    .replace(/[\s_-]+/g, '-')
                    .replace(/^-+|-+$/g, '');

                if (!baseSlug) baseSlug = 'post';

                let slug = baseSlug;
                let exists = await Post.findOne({ slug, _id: { $ne: post._id } });
                let counter = 1;
                while (exists) {
                    slug = `${baseSlug}-${counter}`;
                    exists = await Post.findOne({ slug, _id: { $ne: post._id } });
                    counter++;
                }

                post.slug = slug;
                await post.save();
                migratedCount++;
            }
        }
        res.json({ message: 'Migration complete', count: migratedCount });
    } catch (error) {
        console.error(error);
    }
};
