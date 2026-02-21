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
        if (search) setLoading(true); // Trigger shimmer immediately
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
        <div className="max-w-7xl mx-auto px-6 py-12">
            {/* Search and Filters - Pill Style */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-16">
                <div className="w-full md:max-w-md relative group">
                    <input
                        type="text"
                        placeholder="Search inspiration..."
                        className="w-full"
                        value={search}
                        onChange={ev => setSearch(ev.target.value)}
                    />
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-30 group-focus-within:opacity-100 transition-opacity">
                        🔍
                    </div>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto">
                    <select
                        className="flex-grow md:flex-grow-0"
                        value={category}
                        onChange={ev => setCategory(ev.target.value)}
                    >
                        <option value="">All Regions</option>
                        <option value="Technology">Technology</option>
                        <option value="Design">Design</option>
                        <option value="Lifestyle">Lifestyle</option>
                        <option value="Coding">Coding</option>
                        <option value="Business">Business</option>
                        <option value="Other">Other</option>
                    </select>

                    <select
                        className="flex-grow md:flex-grow-0"
                        value={sort}
                        onChange={ev => setSort(ev.target.value)}
                    >
                        <option value="createdAt">Latest</option>
                        <option value="oldest">Historical</option>
                        <option value="likesCount">Popular</option>
                    </select>
                </div>
            </div>

            {/* Hero Section - Featured Post */}
            {!loading && page === 1 && !search && !category && posts.length > 0 && (
                <div className="mb-20 overflow-hidden rounded-[40px] shadow-2xl relative h-[600px] group hero-zoom">
                    <Link to={`/post/${posts[0].slug}`} className="block h-full w-full">
                        <img
                            src={posts[0].coverImage}
                            alt={posts[0].title}
                            className="w-full h-full object-cover transition-transform duration-1000"
                        />
                        <div className="absolute inset-0 hero-gradient" />
                        <div className="absolute bottom-12 left-12 right-12 text-white">
                            <h1 className="text-5xl md:text-7xl font-black mb-6 max-w-4xl tracking-tight leading-none group-hover:underline decoration-blue-500 decoration-8 underline-offset-8">
                                {posts[0].title}
                            </h1>
                            <div className="flex items-center gap-6 text-sm font-bold tracking-widest uppercase opacity-80">
                                <Link to={`/profile/${posts[0].author?._id || posts[0].author?.id}`} className="flex items-center gap-2 hover:text-blue-400 transition-colors">
                                    <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-[10px]">
                                        {posts[0].author?.username?.[0]?.toUpperCase() || '?'}
                                    </div>
                                    <span>{posts[0].author?.username || 'Anonymous'}</span>
                                </Link>
                                <span>•</span>
                                <span>{new Date(posts[0].createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</span>
                                <span>•</span>
                                <span>5 min read</span>
                            </div>
                        </div>
                    </Link>
                </div>
            )}

            {/* Grid Section Title */}
            <div className="section-title">
                <span>{debouncedSearch || category ? 'Search Results' : 'Recent Journeys'}</span>
            </div>

            {/* Posts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {loading ? (
                    // Shimmer Skeletons
                    [...Array(6)].map((_, i) => (
                        <div key={i} className="flex flex-col gap-6">
                            <div className="aspect-[4/5] skeleton shimmer" />
                            <div className="flex flex-col gap-4 px-2">
                                <div className="h-4 w-20 skeleton shimmer" />
                                <div className="h-10 w-full skeleton shimmer" />
                                <div className="h-20 w-full skeleton shimmer" />
                            </div>
                        </div>
                    ))
                ) : posts.length > 0 ? (
                    posts.map((post, index) => (
                        // Skip first post if it's featured on page 1
                        (!loading && page === 1 && !search && !category && index === 0) ? null : (
                            <div key={post._id} className="group flex flex-col hover:shadow-xl transition-shadow duration-300">
                                <div className="card-image-wrap mb-6">
                                    <Link to={`/post/${post.slug}`}>
                                        <span className="badge-travel">{post.category || 'Travel'}</span>
                                        {post.coverImage && (
                                            <img src={post.coverImage} className="w-full h-full object-cover" alt={post.title} />
                                        )}
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
                                    </Link>
                                </div>

                                <div className="flex flex-col flex-grow px-2">
                                    <div className="flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.15em] text-slate-500 mb-4">
                                        <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                                        <span>•</span>
                                        <Link to={`/profile/${post.author?._id || post.author?.id}`} className="text-slate-600 hover:text-blue-600 transition-colors">
                                            @{post.author?.username || 'anonymous'}
                                        </Link>
                                    </div>

                                    <Link to={`/post/${post.slug}`}>
                                        <h2 className="text-2xl font-black mb-4 leading-tight group-hover:text-blue-600 transition-colors line-clamp-2">
                                            {post.title}
                                        </h2>
                                    </Link>

                                    <p className="text-gray-500 text-sm mb-6 flex-grow line-clamp-3 font-medium leading-relaxed">
                                        {post.summary}
                                    </p>

                                    <div className="flex items-center justify-between border-t border-gray-50 pt-6 mt-auto">
                                        <div className="flex items-center gap-4 text-xs font-bold text-gray-400">
                                            <span className="flex items-center gap-1.5 grayscale opacity-70">
                                                ❤️ {post.likesCount || 0}
                                            </span>
                                            <span className="flex items-center gap-1.5 grayscale opacity-70">
                                                💬 {post.commentsCount || 0}
                                            </span>
                                        </div>
                                        <Link to={`/post/${post.slug}`} className="details-btn">Details</Link>
                                    </div>
                                </div>
                            </div>
                        )
                    ))
                ) : (
                    <div className="col-span-full py-32 text-center">
                        <p className="text-6xl mb-4">🏜️</p>
                        <p className="text-2xl font-black text-gray-300 tracking-tight">No stories found in this region.</p>
                    </div>
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
