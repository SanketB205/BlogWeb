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
        try {
            await api.post(`/posts/${slug}/share`);
            alert("Share link copied to clipboard! (Simulated)");
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
        <div className="max-w-4xl mx-auto px-4 py-8 bg-white shadow-lg rounded-lg my-10 overflow-hidden">
            {post.coverImage && (
                <img src={post.coverImage} alt={post.title} className="w-full h-80 object-cover rounded-md mb-6" />
            )}
            <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                    {post.category || 'Uncategorized'}
                </span>
                <div className="flex gap-4">
                    {isAuthor && (
                        <>
                            <Link to={`/edit/${post.slug}`} className="text-sm font-semibold text-gray-600 hover:text-black transition-colors">Edit Article</Link>
                            <button onClick={handleDelete} className="text-sm font-semibold text-red-500 hover:text-red-700 transition-colors">Delete</button>
                        </>
                    )}
                </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight">{post.title}</h1>

            <div className="flex items-center gap-3 mb-8 pb-8 border-b border-gray-100">
                <div className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center text-white font-bold">
                    {post.author.username[0].toUpperCase()}
                </div>
                <div>
                    <Link to={`/profile/${post.author._id}`} className="text-sm font-bold hover:underline">@{post.author.username}</Link>
                    <p className="text-xs text-gray-500">{new Date(post.createdAt).toLocaleDateString()}</p>
                </div>
            </div>

            <div className="prose prose-lg max-w-none mb-12 leading-relaxed">
                {post.content}
            </div>

            <div className="flex items-center gap-6 py-6 border-y border-gray-100 mb-12">
                <button onClick={handleLike} className={`flex items-center gap-2 text-sm font-bold px-4 py-2 border rounded-full transition-all ${isLiked ? 'bg-red-50 border-red-200 text-red-500' : 'hover:bg-gray-50'}`}>
                    {isLiked ? '❤️' : '🤍'} {likesCount}
                </button>
                <button onClick={handleShare} className="flex items-center gap-2 text-sm font-bold px-4 py-2 border rounded-full hover:bg-gray-50 transition-all">
                    🔗 Share
                </button>
            </div>


            <div className="bg-gray-50 rounded-2xl p-6 md:p-8">
                <h3 className="text-2xl font-bold mb-6">Discussion ({comments.length})</h3>
                {userInfo ? (
                    <form className="mb-10" onSubmit={addComment}>
                        <textarea
                            value={comment}
                            onChange={ev => setComment(ev.target.value)}
                            placeholder="Add your thoughts..."
                            className="w-full p-4 border rounded-xl mb-4 focus:ring-2 focus:ring-blue-500 outline-none"
                            rows={3}
                        />
                        <button className="bg-black text-white px-8 py-2 rounded-full text-sm font-bold hover:bg-gray-800 transition-colors">
                            Submit Comment
                        </button>
                    </form>
                ) : (
                    <div className="mb-10 text-center py-6 bg-white rounded-xl border border-dashed border-gray-300">
                        <Link to="/login" className="text-blue-600 font-bold underline">Login</Link> to join the conversation.
                    </div>
                )}

                <div className="space-y-6">
                    {comments.map(c => (
                        <div key={c._id} className="bg-white p-4 rounded-xl shadow-sm">
                            <div className="flex items-center gap-3 mb-2">
                                <Link to={`/profile/${c.author?._id || c.author}`} className="font-bold text-sm hover:underline">
                                    @{c.author.username}
                                </Link>
                                <span className="text-[10px] text-gray-400 capitalize">{new Date(c.createdAt).toLocaleDateString()}</span>
                            </div>
                            <p className="text-gray-700 text-sm">{c.content}</p>
                        </div>
                    ))}
                </div>
            </div>

            {(loadingRelated || true) && (
                <div className="mt-16 pt-12 border-t border-gray-100 mb-8">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-2xl font-black tracking-tight text-gray-900">
                            {loadingRelated ? (
                                <div className="h-8 w-48 skeleton shimmer" />
                            ) : (
                                (relatedPosts.length > 0 && relatedPosts[0]?.isFallback) ? "More from MyBlog" : "Suggested Reading"
                            )}
                        </h3>
                        <div className="h-px flex-grow ml-6 bg-gray-100 hidden md:block"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {loadingRelated ? (
                            [...Array(3)].map((_, i) => (
                                <div key={i} className="flex flex-col gap-4">
                                    <div className="aspect-[16/10] skeleton shimmer rounded-2xl" />
                                    <div className="flex justify-between items-center">
                                        <div className="h-4 w-16 skeleton shimmer" />
                                        <div className="h-4 w-20 skeleton shimmer" />
                                    </div>
                                    <div className="h-6 w-full skeleton shimmer" />
                                </div>
                            ))
                        ) : (
                            relatedPosts.length > 0 ? (
                                relatedPosts.map(rp => (
                                    <Link key={rp._id} to={`/post/${rp.slug}`} className="group block">
                                        <div className="aspect-[16/10] overflow-hidden rounded-2xl mb-4 shadow-sm group-hover:shadow-md transition-all duration-300">
                                            {rp.coverImage ? (
                                                <img src={rp.coverImage} alt={rp.title} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-3xl bg-gray-50">📄</div>
                                            )}
                                        </div>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="inline-block text-[10px] font-black uppercase tracking-widest text-blue-600 px-2 py-0.5 bg-blue-50 rounded">
                                                {rp.category || 'Blog'}
                                            </span>
                                            <div className="flex items-center gap-3 text-[10px] font-bold text-gray-400">
                                                <span className="flex items-center gap-1">❤️ {rp.likesCount || 0}</span>
                                                <span className="flex items-center gap-1">💬 {rp.commentsCount || 0}</span>
                                            </div>
                                        </div>
                                        <h4 className="font-bold text-lg leading-tight group-hover:text-blue-600 transition-colors line-clamp-2">
                                            {rp.title}
                                        </h4>
                                    </Link>
                                ))
                            ) : (
                                <div className="col-span-full py-10 text-center text-gray-400 italic font-medium bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                    No further suggestions available at this time.
                                </div>
                            )
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
