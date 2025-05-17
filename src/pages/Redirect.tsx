import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabaseService } from '../supabaseClient';

export default function Redirect() {
    const { code } = useParams();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const handleRedirect = async () => {
            if (!code) {
                setError('Invalid short code');
                setLoading(false);
                return;
            }

            try {
                const url = await supabaseService.getOriginalUrl(code);
                setTimeout(() => {
                    window.location.href = url;
                }, 300);
            } catch {
                setError('Redirect failed or link not found');
            } finally {
                setLoading(false);
            }
        };

        handleRedirect();
    }, [code]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-black text-white text-lg">
            {loading ? 'Redirecting...' : error}
        </div>
    );
}
