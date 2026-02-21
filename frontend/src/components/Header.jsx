import { Link } from "react-router-dom";
import { useContext } from "react";
import { UserContext } from "../context/UserContext";

export default function Header() {
    const { userInfo, setUserInfo } = useContext(UserContext);

    function logout() {
        localStorage.removeItem('token');
        setUserInfo(null);
    }

    const username = userInfo?.username;

    return (
        <header>
            <div className="max-w-7xl mx-auto px-8 flex justify-between items-center h-full">
                <Link to="/" className="text-2xl font-black tracking-tighter text-black flex items-center gap-2">
                    <span className="w-8 h-8 bg-black text-white rounded-lg flex items-center justify-center text-sm">B</span>
                    BlogsVibes
                </Link>
                <nav className="hidden md:flex items-center gap-10">
                    <Link to="/">Home</Link>
                    <Link to="/trending" className="flex items-center gap-2">
                        <span className="text-[10px] bg-red-50 text-red-500 px-2 py-0.5 rounded-md font-black">HOT</span>
                        Trending
                    </Link>
                    {username ? (
                        <>
                            <Link to="/create">Create</Link>
                            <Link to={`/profile/${userInfo.id || userInfo._id}`} className="px-5 py-2 bg-gray-100 rounded-full">
                                @{username}
                            </Link>
                            <button onClick={logout} className="text-red-500">Logout</button>
                        </>
                    ) : (
                        <>
                            <Link to="/login">Sign In</Link>
                            <Link to="/register" className="px-6 py-2 bg-black text-white rounded-full hover:bg-blue-600 transition-all">Sign Up</Link>
                        </>
                    )}
                </nav>
                {/* Mobile Menu Icon (Placeholder for layout) */}
                <div className="md:hidden text-2xl">≡</div>
            </div>
        </header>
    );
}
