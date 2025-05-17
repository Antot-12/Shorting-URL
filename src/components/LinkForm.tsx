import { useState } from 'react';
import { supabaseService } from '../supabaseClient';
import toast from 'react-hot-toast';

interface Props {
    onCreated: () => void;
}

export default function LinkForm({ onCreated }: Props) {
    const [url, setUrl] = useState('');
    const [customCode, setCustomCode] = useState('');
    const [loading, setLoading] = useState(false);

    const handleCreate = async () => {
        setLoading(true);
        try {
            if (!url.trim().startsWith('http')) {
                toast.error('URL must start with http:// or https://');
                return;
            }

            if (customCode.trim()) {
                const isValidCode = /^[a-zA-Z0-9_-]{3,20}$/.test(customCode.trim());
                if (!isValidCode) {
                    toast.error('Short code must be 3–20 characters using a-z, 0-9, - or _');
                    return;
                }
            }

            const code = await supabaseService.createShortLink(
                url.trim(),
                customCode.trim() || undefined
            );

            toast.success('Short link created and copied!');
            await navigator.clipboard.writeText(`${window.location.origin}/r/${code}`);

            setUrl('');
            setCustomCode('');
            onCreated();
        } catch (err: unknown) {
            if (err instanceof Error) {
                toast.error(err.message);
            } else {
                toast.error('Unknown error occurred');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gray-800 p-6 md:p-8 rounded-lg space-y-4 shadow-xl w-full max-w-2xl">
            <input
                type="url"
                placeholder="Enter URL"
                value={url}
                inputMode="url"
                autoComplete="off"
                onChange={(e) => setUrl(e.target.value)}
                className="w-full text-base p-4 bg-gray-900 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-neon text-white"
            />
            <input
                type="text"
                placeholder="Custom short code (optional)"
                value={customCode}
                autoCapitalize="off"
                autoComplete="off"
                onChange={(e) => setCustomCode(e.target.value)}
                className="w-full text-base p-4 bg-gray-900 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-neon text-white"
            />
            <button
                onClick={handleCreate}
                disabled={loading}
                className="w-full text-base bg-neon text-black font-semibold py-3 rounded hover:brightness-110 transition disabled:opacity-60"
            >
                {loading ? 'Creating...' : 'Create short link'}
            </button>
        </div>
    );
}
