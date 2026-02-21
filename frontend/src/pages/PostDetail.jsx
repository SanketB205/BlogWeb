import { useEffect, useState, useContext } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../api";
import { UserContext } from "../context/UserContext";

export default function PostDetail() {
    const { slug } = useParams();
    const { userInfo } = useContext(UserContext);
    const [post, setPost] = useState(null);
    const [likesCount, setLikesCount] = useState(0);
    const [isLiked, setIsLiked] = useState(false);
    const [comment, setComment] = useState("");
    const [comments, setComments] = useState([]);
    const [relatedPosts, setRelatedPosts] = useState([]);
    const [loadingRelated, setLoadingRelated] = useState(true);
    const [showShareMenu, setShowShareMenu] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        api.get(`/posts/${slug}`).then(response => {
            setPost(response.data);
            setLikesCount(response.data.likesCount || response.data.likes?.length || 0);
            if (userInfo) {
                const userId = userInfo.id || userInfo._id;
                setIsLiked(response.data.likes?.includes(userId));
            }
        });
    }, [slug, userInfo]);

    useEffect(() => {
        if (post?._id) {
            setLoadingRelated(true);
            const targetSlug = post.slug || slug;


            api.get(`/posts/${post._id}/comments`).then(response => {
                setComments(response.data);
            });

            api.get(`/posts/${targetSlug}/related`).then(response => {

                setRelatedPosts(response.data);
                setLoadingRelated(false);
            }).catch(err => {
                console.error("PostDetail: Related fetch failed:", err);
                setLoadingRelated(false);
            });
        }
    }, [post?._id]);

    async function handleLike() {
        if (!userInfo) return navigate('/login');
        try {
            const res = await api.post(`/posts/${slug}/like`);
            setLikesCount(res.data.likes);
            setIsLiked(res.data.liked);
        } catch (e) {
            console.error(e);
        }
    }

    async function handleShare() {
        setShowShareMenu(false);
        try {
            await api.post(`/posts/${slug}/share`);
            if (navigator.share) {
                await navigator.share({
                    title: post.title,
                    text: `Check out this story: ${post.title}`,
                    url: window.location.href,
                });
            } else {
                handleCopyLink();
            }
        } catch (e) {
            console.error(e);
        }
    }

    async function handleCopyLink() {
        setShowShareMenu(false);
        try {
            await navigator.clipboard.writeText(window.location.href);
            alert("Link copied to clipboard!");
        } catch (e) {
            console.error(e);
        }
    }

    async function addComment(ev) {
        ev.preventDefault();
        try {
            const res = await api.post(`/posts/${post._id}/comments`, { content: comment });
            setComments([res.data, ...comments]);
            setComment("");
        } catch (e) {
            console.error(e);
        }
    }

    async function handleDelete() {
        const confirmed = window.confirm("Are you sure you want to delete this post?");
        if (!confirmed) return;

        try {
            await api.delete(`/posts/${post._id}`);
            navigate('/');
        } catch (e) {
            console.error(e);
            alert(e.response?.data?.message || "Failed to delete post");
        }
    }

    async function handleDeleteComment(commentId) {
        if (!window.confirm("Are you sure you want to delete this comment?")) return;
        try {
            await api.delete(`/posts/${post._id}/comments/${commentId}`);
            setComments(comments.filter(c => c._id !== commentId));
        } catch (e) {
            console.error(e);
            alert(e.response?.data?.message || "Failed to delete comment");
        }
    }

    if (!post) return (
        <div className="max-w-4xl mx-auto px-4 py-8 bg-white shadow-lg rounded-lg my-10 overflow-hidden">
            <div className="w-full h-80 skeleton shimmer mb-6" />
            <div className="flex justify-between mb-4">
                <div className="h-6 w-24 skeleton shimmer rounded-full" />
            </div>
            <div className="h-12 w-3/4 skeleton shimmer mb-6" />
            <div className="flex items-center gap-3 mb-8 pb-8 border-b border-gray-100">
                <div className="w-10 h-10 rounded-full skeleton shimmer" />
                <div className="flex flex-col gap-2">
                    <div className="h-4 w-24 skeleton shimmer" />
                    <div className="h-3 w-16 skeleton shimmer" />
                </div>
            </div>
            <div className="space-y-4 mb-12">
                <div className="h-4 w-full skeleton shimmer" />
                <div className="h-4 w-full skeleton shimmer" />
                <div className="h-4 w-5/6 skeleton shimmer" />
                <div className="h-4 w-full skeleton shimmer" />
                <div className="h-4 w-4/6 skeleton shimmer" />
            </div>
            <div className="flex gap-6 py-6 border-y border-gray-100 mb-12">
                <div className="h-10 w-24 skeleton shimmer rounded-full" />
                <div className="h-10 w-24 skeleton shimmer rounded-full" />
            </div>
        </div>
    );
    const isAuthor = userInfo && (userInfo.id === post.author._id || userInfo._id === post.author._id);

    return (
        <div className="pb-32">
            {/* Hero Header */}
            <div className="w-full h-[70vh] relative overflow-hidden">
                {post.coverImage && (
                    <img
                        src={post.coverImage}
                        alt={post.title}
                        className="w-full h-full object-cover"
                    />
                )}
                <div className="absolute inset-0 hero-gradient" />
                <div className="absolute inset-0 flex flex-col justify-end max-w-7xl mx-auto px-8 pb-20 text-white">
                    <span className="badge-travel mb-8 block relative top-0 left-0 w-fit">
                        {post.category || 'Travel Story'}
                    </span>
                    <h1 className="text-5xl md:text-8xl font-black mb-10 tracking-tighter leading-none animate-in slide-in-from-bottom-6 duration-1000">
                        {post.title}
                    </h1>

                    <div className="flex flex-wrap items-center gap-10 text-xs font-black uppercase tracking-widest opacity-80">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-lg flex items-center justify-center text-sm">
                                {post.author.username[0].toUpperCase()}
                            </div>
                            <Link to={`/profile/${post.author._id}`} className="hover:underline">@{post.author.username}</Link>
                        </div>
                        <div className="flex items-center gap-2">
                            <span>📅</span>
                            {new Date(post.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                        </div>
                        <div className="flex items-center gap-2">
                            <span>⏱️</span>
                            5 MIN READ
                        </div>
                        <div className="flex gap-4 ml-auto">
                            {isAuthor && (
                                <>
                                    <Link to={`/edit/${post.slug}`} className="bg-white/10 hover:bg-white/20 px-6 py-3 rounded-full transition-colors backdrop-blur-md">Edit</Link>
                                    <button onClick={handleDelete} className="bg-red-500/20 hover:bg-red-500/40 px-6 py-3 rounded-full transition-colors backdrop-blur-md text-red-200">Delete</button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="max-w-4xl mx-auto px-8 -mt-10 relative z-10 bg-white rounded-[60px] pt-20 shadow-2xl">
                <div className="prose whitespace-pre-wrap">
                    {post.content}
                </div>

                <div className="flex items-center justify-center gap-6 py-16 mt-20 border-t border-gray-50">
                    <button
                        onClick={handleLike}
                        className={`flex items-center gap-3 text-sm font-black uppercase tracking-widest px-8 py-4 border-2 rounded-full transition-all duration-300 ${isLiked ? 'bg-black text-white border-black scale-105 shadow-xl' : 'border-gray-100 hover:border-black'
                            }`}
                    >
                        {isLiked ? '❤️ Liked' : '🤍 Like'}
                        <span className="ml-2 py-1 px-3 bg-gray-100 rounded-full text-black">{likesCount}</span>
                    </button>
                    <div className="relative">
                        <button
                            onClick={() => setShowShareMenu(!showShareMenu)}
                            className="flex items-center gap-3 text-sm font-black uppercase tracking-widest px-8 py-4 border-2 border-gray-100 rounded-full hover:border-black transition-all bg-white"
                        >
                            📤 Share
                        </button>

                        {showShareMenu && (
                            <>
                                <div
                                    className="fixed inset-0 z-40"
                                    onClick={() => setShowShareMenu(false)}
                                />
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-56 bg-white rounded-[24px] shadow-2xl border border-gray-100 p-2 z-50 animate-in slide-in-from-bottom-2 duration-200">
                                    <button
                                        onClick={handleShare}
                                        className="w-full flex items-center gap-3 px-6 py-4 hover:bg-gray-50 rounded-[18px] transition-colors text-left"
                                    >
                                        <span className="text-xl">📱</span>
                                        <div className="flex flex-col">
                                            <span className="text-xs font-black uppercase tracking-widest">Share Directly</span>
                                            <span className="text-[10px] text-gray-400 font-bold uppercase">WhatsApp, etc.</span>
                                        </div>
                                    </button>
                                    <button
                                        onClick={handleCopyLink}
                                        className="w-full flex items-center gap-3 px-6 py-4 hover:bg-gray-50 rounded-[18px] transition-colors text-left"
                                    >
                                        <span className="text-xl">🔗</span>
                                        <div className="flex flex-col">
                                            <span className="text-xs font-black uppercase tracking-widest">Copy Link</span>
                                            <span className="text-[10px] text-gray-400 font-bold uppercase">To Clipboard</span>
                                        </div>
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Discussion Section */}
                <div className="bg-gray-50/50 rounded-[50px] p-12 mt-12">
                    <div className="flex items-center justify-between mb-12">
                        <h3 className="text-4xl font-black tracking-tighter">Discussion</h3>
                        <span className="bg-black text-white px-4 py-1 rounded-full text-xs font-black">{comments.length}</span>
                    </div>

                    {userInfo ? (
                        <form className="mb-16" onSubmit={addComment}>
                            <textarea
                                value={comment}
                                onChange={ev => setComment(ev.target.value)}
                                placeholder="What are your thoughts on this journey?"
                                className="w-full p-8 bg-white/80 border-none rounded-[30px] mb-6 focus:ring-4 focus:ring-blue-50 outline-none text-lg min-h-[150px] shadow-sm"
                            />
                            <button className="bg-black text-white px-10 py-4 rounded-full text-xs font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl">
                                Post Comment
                            </button>
                        </form>
                    ) : (
                        <div className="mb-16 text-center py-10 bg-white rounded-[30px] border-2 border-dashed border-gray-100">
                            <Link to="/login" className="text-black font-black underline decoration-blue-500 decoration-4 underline-offset-4">Sign in</Link> to join the community.
                        </div>
                    )}

                    <div className="space-y-8 max-h-[400px] overflow-y-auto pr-4 custom-scrollbar">
                        {comments.map(c => (
                            <div key={c._id} className="bg-white p-8 rounded-[30px] shadow-sm border border-gray-50 group hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-xs">
                                            {c.author.username?.[0]?.toUpperCase()}
                                        </div>
                                        <Link to={`/profile/${c.author?._id || c.author}`} className="font-black text-sm hover:text-blue-600">
                                            @{c.author.username}
                                        </Link>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">{new Date(c.createdAt).toLocaleDateString()}</span>
                                        {userInfo && (userInfo.id === (c.author._id || c.author) || userInfo._id === (c.author._id || c.author)) && (
                                            <button
                                                onClick={() => handleDeleteComment(c._id)}
                                                className="text-[10px] font-black uppercase tracking-widest text-red-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                                            >
                                                Delete
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <p className="text-gray-600 leading-relaxed font-medium">{c.content}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Related Posts */}
            <div className="max-w-7xl mx-auto px-8 mt-40">
                <div className="section-title">
                    <span>{relatedPosts && relatedPosts[0]?.isFallback ? "More to Discover" : "If You Liked This..."}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3">
                    {loadingRelated ? (
                        [...Array(3)].map((_, i) => (
                            <div key={i} className="flex flex-col gap-6">
                                <div className="aspect-[4/5] skeleton shimmer" />
                                <div className="h-4 w-16 skeleton shimmer" />
                                <div className="h-6 w-full skeleton shimmer" />
                            </div>
                        ))
                    ) : (
                        relatedPosts.map(rp => (
                            <div key={rp._id} className="group hover:shadow-xl transition-shadow duration-300">
                                <div className="card-image-wrap mb-6">
                                    <Link key={rp._id} to={`/post/${rp.slug}`}>
                                        <span className="badge-travel">{rp.category || 'Travel'}</span>
                                        {rp.coverImage && (
                                            <img src={rp.coverImage} alt={rp.title} className="w-full h-full object-cover" />
                                        )}
                                        <div className="absolute inset-0 hero-gradient opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </Link>
                                </div>
                                <div className="flex flex-col px-2">
                                    <h4 className="font-black text-xl leading-tight group-hover:text-blue-600 transition-colors line-clamp-2">
                                        {rp.title}
                                    </h4>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
