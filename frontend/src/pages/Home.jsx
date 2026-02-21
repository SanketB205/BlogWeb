import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import Pagination from "../components/Pagination";

export default function Home() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [category, setCategory] = useState('');
    const [sort, setSort] = useState('createdAt');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
        }, 800);
        return () => clearTimeout(timer);
    }, [search]);

    useEffect(() => {
        setPage(1);
    }, [debouncedSearch, category, sort]);

    useEffect(() => {
        setLoading(true);
        const query = new URLSearchParams({ search: debouncedSearch, category, sort, page, limit: 9 }).toString();
        api.get(`/posts?${query}`).then(response => {
            const { posts: fetchedPosts = [], totalPages: fetchedTotal = 1 } = response.data || {};
            setPosts(fetchedPosts);
            setTotalPages(fetchedTotal);
            setLoading(false);
        }).catch((err) => {
            console.error("Home fetch error:", err);
            setLoading(false);
        });
    }, [debouncedSearch, category, sort, page]);

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row gap-4 mb-8">
                {/* ... search and filter UI unchanged ... */}
                <input
                    type="text"
                    placeholder="Search posts..."
                    className="p-2 border rounded flex-grow"
                    value={search}
                    onChange={ev => setSearch(ev.target.value)}
                />
                <select
                    className="p-2 border rounded"
                    value={category}
                    onChange={ev => setCategory(ev.target.value)}
                >
                    <option value="">All Categories</option>
                    <option value="Technology">Technology</option>
                    <option value="Design">Design</option>
                    <option value="Lifestyle">Lifestyle</option>
                    <option value="Coding">Coding</option>
                    <option value="Business">Business</option>
                    <option value="Other">Other</option>
                </select>
                <select
                    className="p-2 border rounded"
                    value={sort}
                    onChange={ev => setSort(ev.target.value)}
                >
                    <option value="createdAt">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="likesCount">Most Popular</option>
                </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {loading ? (
                    // Shimmer Skeletons
                    [...Array(6)].map((_, i) => (
                        <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col h-[400px]">
                            <div className="aspect-video skeleton shimmer" />
                            <div className="p-4 flex flex-col flex-grow gap-4">
                                <div className="h-4 w-20 skeleton shimmer" />
                                <div className="h-8 w-full skeleton shimmer" />
                                <div className="h-4 w-full skeleton shimmer" />
                                <div className="h-4 w-2/3 skeleton shimmer" />
                                <div className="mt-auto flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full skeleton shimmer" />
                                        <div className="h-4 w-16 skeleton shimmer" />
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="h-4 w-10 skeleton shimmer" />
                                        <div className="h-4 w-10 skeleton shimmer" />
                                        <div className="h-4 w-20 skeleton shimmer" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : posts.length > 0 ? (
                    posts.map(post => (
                        <div key={post._id} className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col hover:shadow-xl transition-shadow duration-300">
                            <Link to={`/post/${post.slug}`}>
                                <div className="aspect-video bg-gray-200">
                                    {post.coverImage && (
                                        <img src={post.coverImage} className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500" alt={post.title} />
                                    )}
                                </div>
                            </Link>
                            <div className="p-4 flex flex-col flex-grow">
                                <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                                    <span className="font-bold text-blue-600 uppercase tracking-widest">{post.category || 'Uncategorized'}</span>
                                    <span>•</span>
                                    <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                                </div>
                                <Link to={`/post/${post.slug}`}>
                                    <h2 className="text-xl font-bold mb-2 hover:text-blue-600 transition-colors line-clamp-2">{post.title}</h2>
                                </Link>
                                <p className="text-gray-600 text-sm mb-4 flex-grow line-clamp-3">{post.summary}</p>
                                <div className="flex items-center justify-between mt-auto">
                                    <div className="flex items-center gap-2">
                                        <Link to={`/profile/${post.author?._id}`} className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center text-white text-[10px] font-bold hover:bg-black transition-colors">
                                            {post.author?.username?.[0]?.toUpperCase()}
                                        </Link>
                                        <Link to={`/profile/${post.author?._id}`} className="text-sm font-medium hover:underline text-gray-700">
                                            @{post.author?.username}
                                        </Link>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-3 text-sm font-bold text-gray-400">
                                            <span className="flex items-center gap-1 group/like cursor-default">
                                                ❤️ <span className="text-gray-600">{post.likesCount || 0}</span>
                                            </span>
                                            <span className="flex items-center gap-1 group/comment cursor-default">
                                                💬 <span className="text-gray-600">{post.commentsCount || 0}</span>
                                            </span>
                                        </div>
                                        <Link to={`/post/${post.slug}`} className="text-blue-600 font-bold text-sm bg-blue-50 px-3 py-1 rounded-full hover:bg-blue-100 transition-colors">Details</Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="col-span-full text-center text-gray-500 py-20">No posts found matching your criteria.</p>
                )}
            </div>

            <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
            />
        </div>
    );
}
