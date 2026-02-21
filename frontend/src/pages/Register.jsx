import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";

export default function Register() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    async function handleRegister(ev) {
        ev.preventDefault();
        try {
            await api.post("/auth/register", { username, email, password });
            navigate("/login");
        } catch (err) {
            setError(err.response?.data?.message || "Registration failed");
        }
    }

    return (
        <div className="max-w-md mx-auto mt-20 p-8 bg-white rounded-xl shadow-lg">
            <h1 className="text-3xl font-bold mb-8 text-center text-gray-900">Create Account</h1>
            {error && (
                <div className="mb-6 p-3 bg-red-100 text-red-600 rounded-lg text-sm text-center font-medium">
                    {error}
                </div>
            )}
            <form className="space-y-4" onSubmit={handleRegister}>
                <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-1 ml-1">Username</label>
                    <input
                        type="text"
                        placeholder="johndoe"
                        value={username}
                        onChange={ev => setUsername(ev.target.value)}
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-black transition-colors"
                        required
                    />
                </div>
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
                    Create Account
                </button>
            </form>
            <p className="mt-8 text-center text-sm text-gray-500">
                Already have an account? <Link to="/login" className="text-black font-bold hover:underline">Login here</Link>
            </p>
        </div>
    );
}
