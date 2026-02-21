import { useEffect, useState, useContext } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api";
import { UserContext } from "../context/UserContext";
import Pagination from "../components/Pagination";

export default function ProfilePage() {
    const { userId } = useParams();
    const { userInfo } = useContext(UserContext);

    const [posts, setPosts] = useState([]);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [following, setFollowing] = useState(false);
    const [followersCount, setFollowersCount] = useState(0);
    const [followLoading, setFollowLoading] = useState(false);

    const myId = userInfo?.id || userInfo?._id;
    const isOwnProfile = myId === userId;

    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        setPage(1);
    }, [userId]);

    useEffect(() => {
        setLoading(true);
        api.get(`/auth/users/${userId}`)
            .then(res => {
                const p = res.data;
                setProfile(p);
                setFollowersCount(p.followersCount);
                if (myId) {
                    setFollowing(p.followers.some(id => id === myId || id?._id === myId || id?.toString() === myId));
                }
            })
            .catch(console.error);
    }, [userId, myId]);

    useEffect(() => {
        api.get(`/posts/user/${userId}?page=${page}&limit=6`)
            .then(res => {
                const { posts: fetchedPosts = [], totalPages: fetchedTotal = 1 } = res.data || {};
                setPosts(fetchedPosts);
                setTotalPages(fetchedTotal);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [userId, page]);

    async function handleFollow() {
        if (!userInfo) return;
        setFollowLoading(true);
        try {
            const res = await api.post(`/auth/users/${userId}/follow`);
            setFollowing(res.data.following);
            setFollowersCount(res.data.followersCount);
        } catch (err) {
            console.error(err);
        } finally {
            setFollowLoading(false);
        }
    }

    const username = profile?.username || '';

    return (
        <div className="min-h-screen pt-8">
            {/* Profile Header */}
            <section className="text-center py-16 px-6 border-b border-gray-100 mb-12">
                {/* Avatar */}
                <div className="w-24 h-24 rounded-full bg-gray-900 flex items-center justify-center text-4xl font-bold text-white mx-auto mb-5 shadow-lg">
                    {username?.[0]?.toUpperCase() || '?'}
                </div>

                {/* Name */}
                <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 mb-1">
                    @{username || 'User'}
                </h1>

                {/* Stats row */}
                <div className="flex justify-center gap-8 mt-4 text-sm text-gray-500">
                    <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900">{posts.length}</p>
                        <p className="text-xs uppercase tracking-wider mt-0.5">Posts</p>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900">{followersCount}</p>
                        <p className="text-xs uppercase tracking-wider mt-0.5">Followers</p>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900">{profile?.followingCount ?? 0}</p>
                        <p className="text-xs uppercase tracking-wider mt-0.5">Following</p>
                    </div>
                </div>

                {/* Follow / Unfollow button */}
                {!isOwnProfile && (
                    <div className="mt-6">
                        {userInfo ? (
                            <button
                                onClick={handleFollow}
                                disabled={followLoading}
                                className={`px-8 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 disabled:opacity-60 ${following
                                    ? 'bg-white text-gray-800 border-2 border-gray-300 hover:border-red-400 hover:text-red-500'
                                    : 'bg-black text-white hover:bg-gray-800'
                                    }`}
                            >
                                {followLoading ? '...' : following ? 'Unfollow' : 'Follow'}
                            </button>
                        ) : (
                            <Link
                                to="/login"
                                className="inline-block px-8 py-2.5 rounded-full text-sm font-semibold bg-black text-white hover:bg-gray-800 transition-colors"
                            >
                                Follow
                            </Link>
                        )}
                    </div>
                )}

                {isOwnProfile && (
                    <p className="mt-5 text-xs text-gray-400 uppercase tracking-wider">Your Profile</p>
                )}
            </section>

            {/* Posts Grid */}
            <div className="max-w-6xl mx-auto px-6 pb-20">
                {loading ? (
                    <div className="animate-pulse">
                        <section className="text-center py-16 px-6 border-b border-gray-100 mb-12 flex flex-col items-center">
                            <div className="w-24 h-24 rounded-full skeleton shimmer mb-5" />
                            <div className="h-10 w-48 skeleton shimmer mb-6" />
                            <div className="flex justify-center gap-8 mt-4">
                                <div className="h-12 w-16 skeleton shimmer" />
                                <div className="h-12 w-16 skeleton shimmer" />
                                <div className="h-12 w-16 skeleton shimmer" />
                            </div>
                        </section>
                        <div className="max-w-6xl mx-auto px-6 pb-20">
                            <div className="grid gap-10 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} className="flex flex-col gap-4">
                                        <div className="w-full aspect-[4/3] skeleton shimmer rounded-2xl" />
                                        <div className="flex flex-col gap-2">
                                            <div className="h-4 w-24 skeleton shimmer" />
                                            <div className="h-8 w-full skeleton shimmer" />
                                            <div className="h-4 w-full skeleton shimmer" />
                                            <div className="h-8 w-24 skeleton shimmer rounded-full mt-2" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        {posts.length > 0 ? (
                            <div className="grid gap-10 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                                {posts.map(post => (
                                    <div key={post._id} className="group cursor-pointer flex flex-col gap-4">
                                        {post.coverImage && (
                                            <Link to={`/post/${post.slug}`} className="block overflow-hidden rounded-2xl">
                                                <img
                                                    src={post.coverImage}
                                                    alt={post.title}
                                                    className="w-full aspect-[4/3] object-cover transform group-hover:scale-105 transition-transform duration-500"
                                                />
                                            </Link>
                                        )}
                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-center gap-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                <span className="text-black font-bold">{post.category || 'Uncategorized'}</span>
                                                <span>•</span>
                                                <span>{new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                            </div>
                                            <Link to={`/post/${post.slug}`}>
                                                <h2 className="text-2xl font-bold leading-tight text-gray-900 group-hover:text-gray-600 transition-colors">
                                                    {post.title}
                                                </h2>
                                            </Link>
                                            <p className="text-gray-500 line-clamp-2 leading-relaxed">
                                                {post.summary}
                                            </p>
                                            <div className="mt-2 flex items-center gap-3">
                                                <Link
                                                    to={`/post/${post.slug}`}
                                                    className="text-xs font-semibold text-black border border-black px-3 py-1.5 rounded-full hover:bg-black hover:text-white transition-colors"
                                                >
                                                    Read More →
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 text-gray-400">
                                <p className="text-5xl mb-4">✍️</p>
                                <p className="text-xl font-semibold text-gray-700">No posts yet</p>
                                <p className="text-gray-400 mt-2">This author hasn't published anything.</p>
                            </div>
                        )}

                        <Pagination
                            currentPage={page}
                            totalPages={totalPages}
                            onPageChange={setPage}
                        />
                    </>
                )}
            </div>
        </div>
    );
}
