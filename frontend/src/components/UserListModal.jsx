import React from 'react';
import { Link } from 'react-router-dom';

export default function UserListModal({ isOpen, onClose, title, users, loading }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-all duration-300">
            <div className="bg-white rounded-3xl w-full max-w-md max-h-[80vh] flex flex-col shadow-2xl overflow-hidden border border-gray-100 transform scale-100 transition-transform">
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold tracking-tight text-gray-900">{title}</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="flex-grow overflow-y-auto p-2">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12 gap-4">
                            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-sm font-medium text-gray-500">Loading users...</p>
                        </div>
                    ) : users.length > 0 ? (
                        <div className="space-y-1">
                            {users.map(user => (
                                <Link
                                    key={user._id}
                                    to={`/profile/${user._id}`}
                                    onClick={onClose}
                                    className="flex items-center gap-4 p-4 hover:bg-gray-50 rounded-2xl transition-all group"
                                >
                                    <div className="w-12 h-12 rounded-full bg-gray-900 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                                        {user.username?.[0]?.toUpperCase()}
                                    </div>
                                    <div className="flex-grow">
                                        <p className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">@{user.username}</p>
                                    </div>
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-center px-6">
                            <div className="text-4xl mb-4 opacity-30">👥</div>
                            <p className="text-gray-500 font-medium">No users found.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
