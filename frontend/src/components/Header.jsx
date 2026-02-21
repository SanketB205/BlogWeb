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
        <header className="flex justify-between items-center py-4 px-8 bg-white shadow-md">
            <Link to="/" className="text-2xl font-bold text-black">MyBlog</Link>
            <nav className="flex items-center gap-4">
                <Link to="/" className="text-gray-600 hover:text-black">Home</Link>
                <Link to="/trending" className="text-gray-600 hover:text-black flex items-center gap-1">
                    🔥 Trending
                </Link>
                {username ? (
                    <>
                        <Link to="/create" className="text-gray-600 hover:text-black">Create Post</Link>
                        <Link to={`/profile/${userInfo.id || userInfo._id}`} className="text-gray-600 hover:text-black">
                            @{username}
                        </Link>
                        <button onClick={logout} className="text-red-600 font-semibold hover:text-red-700">Logout</button>
                    </>
                ) : (
                    <>
                        <Link to="/login" className="text-gray-600 hover:text-black">Login</Link>
                        <Link to="/register" className="text-gray-600 hover:text-black">Register</Link>
                    </>
                )}
            </nav>
        </header>
    );
}
