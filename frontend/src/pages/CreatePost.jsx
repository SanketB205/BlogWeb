import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

export default function CreatePost() {
    const [title, setTitle] = useState('');
    const [summary, setSummary] = useState('');
    const [content, setContent] = useState('');
    const [coverImage, setCoverImage] = useState('');
    const [category, setCategory] = useState('Uncategorized');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    async function createNewPost(ev) {
        ev.preventDefault();
        try {
            await api.post('/posts', {
                title,
                summary,
                content,
                coverImage,
                category
            });
            navigate('/');
        } catch (e) {
            setError(e.response?.data?.message || 'Failed to create post');
        }
    }

    return (
        <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
            <h1 className="text-2xl font-bold mb-6 text-center">Create New Post</h1>
            {error && <p className="text-red-500 text-center mb-4">{error}</p>}
            <form className="space-y-4" onSubmit={createNewPost}>
                <input
                    type="text"
                    placeholder="Title"
                    value={title}
                    onChange={ev => setTitle(ev.target.value)}
                    className="w-full p-2 border rounded"
                    required
                />
                <input
                    type="text"
                    placeholder="Summary"
                    value={summary}
                    onChange={ev => setSummary(ev.target.value)}
                    className="w-full p-2 border rounded"
                    required
                />
                <input
                    type="url"
                    placeholder="Cover Image URL"
                    value={coverImage}
                    onChange={ev => setCoverImage(ev.target.value)}
                    className="w-full p-2 border rounded"
                />
                <select
                    value={category}
                    onChange={ev => setCategory(ev.target.value)}
                    className="w-full p-2 border rounded bg-white"
                >
                    <option value="Uncategorized">Uncategorized</option>
                    <option value="Technology">Technology</option>
                    <option value="Design">Design</option>
                    <option value="Lifestyle">Lifestyle</option>
                    <option value="Coding">Coding</option>
                    <option value="Business">Business</option>
                    <option value="Other">Other</option>
                </select>
                <textarea
                    placeholder="Content"
                    value={content}
                    onChange={ev => setContent(ev.target.value)}
                    className="w-full p-2 border rounded h-40"
                    required
                />
                <button className="w-full bg-black text-white p-2 rounded hover:bg-gray-800">Create Post</button>
            </form>
        </div>
    );
}
