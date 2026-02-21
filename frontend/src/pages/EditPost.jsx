import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api";

export default function EditPost() {
    const { id } = useParams();
    const [title, setTitle] = useState('');
    const [summary, setSummary] = useState('');
    const [content, setContent] = useState('');
    const [coverImage, setCoverImage] = useState('');
    const [category, setCategory] = useState('Uncategorized');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        setLoading(true);
        api.get(`/posts/${id}`)
            .then(response => {
                const { title, summary, content, coverImage, category } = response.data;
                setTitle(title || '');
                setSummary(summary || '');
                setContent(content || '');
                setCoverImage(coverImage || '');
                setCategory(category || 'Uncategorized');
            })
            .catch(err => {
                setError("Failed to load post data: " + (err.response?.data?.message || err.message));
            })
            .finally(() => {
                setLoading(false);
            });
    }, [id]);

    async function updatePost(ev) {
        ev.preventDefault();
        try {
            const response = await api.put(`/posts/${id}`, {
                title,
                summary,
                content,
                coverImage,
                category
            });
            navigate(`/post/${response.data.slug}`);
        } catch (e) {
            setError(e.response?.data?.message || 'Failed to update post');
        }
    }

    if (loading) return <div className="text-center mt-10">Loading article data...</div>;

    return (
        <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
            <h1 className="text-2xl font-bold mb-6 text-center">Edit Post</h1>
            {error && <p className="text-red-500 text-center mb-4">{error}</p>}
            <form className="space-y-4" onSubmit={updatePost}>
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
                <button className="w-full bg-black text-white p-2 rounded hover:bg-gray-800">Update Post</button>
            </form>
        </div>
    );
}
