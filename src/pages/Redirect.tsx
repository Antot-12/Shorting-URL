import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabaseService } from '../supabaseClient';

export default function Redirect() {
    const { code } = useParams();

    useEffect(() => {
        (async () => {
            const url = await supabaseService.getOriginalUrl(code as string);
            window.location.href = url;
        })();
    }, [code]);

    return <p className="text-white">Переадресація...</p>;
}
