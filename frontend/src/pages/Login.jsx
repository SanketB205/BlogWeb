import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";
import { UserContext } from "../context/UserContext";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const { setUserInfo } = useContext(UserContext);

    async function handleLogin(ev) {
        ev.preventDefault();
        try {
            const response = await api.post("/auth/login", { email, password });
            localStorage.setItem("token", response.data.token);
            setUserInfo(response.data.user);
            navigate("/");
        } catch (err) {
            setError(err.response?.data?.message || "Login failed");
        }
    }

    return (
        <div className="max-w-md mx-auto mt-20 p-8 bg-white rounded-xl shadow-lg">
            <h1 className="text-3xl font-bold mb-8 text-center text-gray-900">Login to MyBlog</h1>
            {error && (
                <div className="mb-6 p-3 bg-red-100 text-red-600 rounded-lg text-sm text-center font-medium">
                    {error}
                </div>
            )}
            <form className="space-y-4" onSubmit={handleLogin}>
                <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-1 ml-1">Email Address</label>
                    <input
                        type="email"
                        placeholder="john@example.com"
                        value={email}
                        onChange={ev => setEmail(ev.target.value)}
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-black transition-colors"
                        required
                    />
                </div>
                <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-1 ml-1">Password</label>
                    <input
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={ev => setPassword(ev.target.value)}
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-black transition-colors"
                        required
                    />
                </div>
                <button className="w-full bg-black text-white font-bold p-3 rounded-lg hover:bg-gray-800 transition-colors mt-4">
                    Sign In
                </button>
            </form>
            <p className="mt-8 text-center text-sm text-gray-500">
                Don't have an account? <Link to="/register" className="text-black font-bold hover:underline">Register now</Link>
            </p>
        </div>
    );
}
