import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";

export default function TrendingPage() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/posts/trending')
            .then(res => {
                setPosts(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    return (
        <div className="max-w-6xl mx-auto px-6 py-12">
            <div className="flex items-center gap-3 mb-10">
                <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center text-2xl">
                    🔥
                </div>
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Trending Stories</h1>
                    <p className="text-gray-500">The most engaging posts on MyBlog right now.</p>
                </div>
            </div>

            {loading ? (
                <div className="grid gap-12 grid-cols-1 lg:grid-cols-2">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="flex gap-6 items-start h-[120px]">
                            <div className="text-4xl font-black text-gray-100 pt-1 flex-shrink-0 w-12 text-center">
                                {String(i + 1).padStart(2, '0')}
                            </div>
                            <div className="flex flex-col gap-3 flex-grow">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full skeleton shimmer" />
                                    <div className="h-4 w-20 skeleton shimmer" />
                                    <div className="h-4 w-12 skeleton shimmer" />
                                </div>
                                <div className="h-6 w-full skeleton shimmer" />
                                <div className="h-4 w-3/4 skeleton shimmer" />
                            </div>
                            <div className="w-24 h-24 md:w-32 md:h-32 flex-shrink-0 skeleton shimmer rounded-2xl ml-auto" />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid gap-12 grid-cols-1 lg:grid-cols-2">
                    {posts.map((post, index) => (
                        <div
                            key={post._id}
                            className="group flex gap-6 items-start"
                        >
                            <div className="text-4xl font-black text-gray-100 group-hover:text-gray-200 transition-colors select-none pt-1 flex-shrink-0 w-12 text-center">
                                {String(index + 1).padStart(2, '0')}
                            </div>
                            <div className="flex flex-col gap-3">
                                <div className="flex items-center gap-2">
                                    <Link to={`/profile/${post.author?._id}`} className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-600 hover:bg-gray-300 transition-colors">
                                        {post.author?.username?.[0]?.toUpperCase()}
                                    </Link>
                                    <Link to={`/profile/${post.author?._id}`} className="text-sm font-semibold text-gray-900 tracking-tight hover:underline">
                                        @{post.author?.username}
                                    </Link>
                                    <span className="text-gray-300">•</span>
                                    <span className="text-xs font-medium text-gray-500 uppercase tracking-widest">
                                        {post.category}
                                    </span>
                                </div>
                                <Link to={`/post/${post.slug}`}>
                                    <h2 className="text-2xl font-extrabold text-gray-900 leading-tight hover:text-blue-600 transition-colors">
                                        {post.title}
                                    </h2>
                                </Link>
                                <p className="text-gray-500 line-clamp-2 text-sm leading-relaxed">
                                    {post.summary}
                                </p>
                                <div className="flex items-center gap-4 text-xs font-medium text-gray-400 mt-1">
                                    <span>{new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                                    <span>•</span>
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-1 text-orange-500 font-bold bg-orange-50 px-2 py-0.5 rounded-full">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                                            </svg>
                                            <span>{post.likesCount || 0}</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-gray-500 font-bold bg-gray-50 px-2 py-0.5 rounded-full">
                                            💬 <span>{post.commentsCount || 0}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {post.coverImage && (
                                <Link to={`/post/${post.slug}`} className="w-24 h-24 md:w-32 md:h-32 flex-shrink-0 rounded-2xl overflow-hidden ml-auto">
                                    <img
                                        src={post.coverImage}
                                        alt={post.title}
                                        className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-700"
                                    />
                                </Link>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
