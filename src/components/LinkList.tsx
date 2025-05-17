import { useEffect, useState } from 'react';
import { supabaseService } from '../supabaseClient';
import { QRCodeCanvas } from 'qrcode.react';
import toast from 'react-hot-toast';

interface Link {
    id: string;
    short_code: string;
    original_url: string;
    created_at: string;
    click_count: number;
}

type SortOption = 'newest' | 'oldest' | 'most_clicked' | 'least_clicked';

interface LinkListProps {
    reload: boolean;
}

export default function LinkList({ reload }: LinkListProps) {
    const [links, setLinks] = useState<Link[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [qrVisibleId, setQrVisibleId] = useState<string | null>(null);
    const [sortOption, setSortOption] = useState<SortOption>('newest');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editedCode, setEditedCode] = useState('');

    const fetchLinks = async () => {
        setLoading(true);
        try {
            const result = await supabaseService.getMyLinks();
            setLinks(result);
        } catch (err) {
            toast.error('Failed to load links');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (code: string) => {
        await supabaseService.deleteLink(code);
        toast.success('Link deleted');
        fetchLinks();
    };

    const handleCopy = (code: string) => {
        const fullLink = `${window.location.origin}/r/${code}`;
        navigator.clipboard.writeText(fullLink);
        toast.success('Copied to clipboard');
    };

    const handleEdit = async (id: string, newCode: string) => {
        if (!/^[a-zA-Z0-9_-]{3,20}$/.test(newCode)) {
            toast.error('Short code must be 3–20 characters using a-z, 0-9, - or _');
            return;
        }
        try {
            await supabaseService.updateShortCode(id, newCode);
            toast.success('Short code updated');
            setEditingId(null);
            fetchLinks();
        } catch (err) {
            toast.error('Failed to update short code');
        }
    };

    useEffect(() => {
        fetchLinks();
    }, [reload]);

    const filteredLinks = links
        .filter(
            (link) =>
                link.short_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                link.original_url.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .sort((a, b) => {
            switch (sortOption) {
                case 'newest':
                    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                case 'oldest':
                    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
                case 'most_clicked':
                    return b.click_count - a.click_count;
                case 'least_clicked':
                    return a.click_count - b.click_count;
                default:
                    return 0;
            }
        });

    if (loading) {
        return <p className="text-center text-gray-400 animate-pulse">Loading...</p>;
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-2">
                <input
                    type="text"
                    placeholder="Search links"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full sm:w-1/2 p-2 bg-gray-800 border border-gray-600 rounded text-sm text-white"
                />
                <select
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value as SortOption)}
                    className="w-full sm:w-1/4 p-2 bg-gray-800 border border-gray-600 rounded text-sm text-white"
                >
                    <option value="newest">Newest</option>
                    <option value="oldest">Oldest</option>
                    <option value="most_clicked">Most Clicked</option>
                    <option value="least_clicked">Least Clicked</option>
                </select>
            </div>

            {filteredLinks.map((link) => {
                const shortUrl = `${window.location.origin}/r/${link.short_code}`;
                const isEditing = editingId === link.id;

                return (
                    <div
                        key={link.id}
                        className="bg-gray-900 p-6 rounded flex flex-col sm:flex-row sm:justify-between items-start sm:items-center shadow-md space-y-4 sm:space-y-0"
                    >
                        <div className="flex-1 w-full">
                            {isEditing ? (
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={editedCode}
                                        onChange={(e) => setEditedCode(e.target.value)}
                                        className="p-2 bg-gray-800 border border-gray-600 rounded text-sm text-white"
                                    />
                                    <button
                                        onClick={() => handleEdit(link.id, editedCode)}
                                        className="text-sm text-green-400 hover:underline"
                                    >
                                        Save
                                    </button>
                                    <button
                                        onClick={() => setEditingId(null)}
                                        className="text-sm text-red-400 hover:underline"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <p className="text-neon text-sm break-all">
                                        <a href={shortUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                            {shortUrl}
                                        </a>
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1 break-all">{link.original_url}</p>
                                    <p className="text-xs text-gray-400 mt-1">Clicks: {link.click_count}</p>
                                </>
                            )}
                        </div>

                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mt-2 sm:mt-0 sm:ml-4">
                            {!isEditing && (
                                <>
                                    <button
                                        onClick={() => handleCopy(link.short_code)}
                                        className="text-sm text-neon hover:underline"
                                    >
                                        Copy
                                    </button>
                                    <button
                                        onClick={() => handleDelete(link.short_code)}
                                        className="text-sm text-red-500 hover:underline"
                                    >
                                        Delete
                                    </button>
                                    <button
                                        onClick={() => {
                                            setEditingId(link.id);
                                            setEditedCode(link.short_code);
                                        }}
                                        className="text-sm text-yellow-400 hover:underline"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => setQrVisibleId((prev) => (prev === link.id ? null : link.id))}
                                        className="text-sm text-blue-400 hover:underline"
                                    >
                                        {qrVisibleId === link.id ? 'Hide QR' : 'Show QR'}
                                    </button>
                                </>
                            )}
                        </div>

                        {qrVisibleId === link.id && (
                            <div className="mt-4 w-full flex justify-center">
                                <QRCodeCanvas value={shortUrl} size={150} />
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
