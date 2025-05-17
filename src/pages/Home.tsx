import { useEffect, useState } from 'react';
import Auth from '../components/Auth';
import LinkForm from '../components/LinkForm';
import LinkList from '../components/LinkList';
import { supabaseService } from '../supabaseClient';
import type { AuthChangeEvent, Session, User } from '@supabase/supabase-js';

export default function Home() {
    const [user, setUser] = useState<User | null>(null);
    const [reloadFlag, setReloadFlag] = useState(false);

    useEffect(() => {
        supabaseService['client'].auth.getUser().then((res: { data: { user: User | null } }) => {
            setUser(res.data.user);
        });

        supabaseService['client'].auth.onAuthStateChange(
            (_: AuthChangeEvent, session: Session | null) => {
                setUser(session?.user || null);
            }
        );
    }, []);

    const handleLogout = async () => {
        await supabaseService.logout();
        setUser(null);
    };

    return (
        <div className="min-h-screen bg-dark text-white flex items-center justify-center p-4">
            <div className="w-full max-w-md space-y-6">
                {!user ? (
                    <Auth />
                ) : (
                    <>
                        <div className="flex justify-between items-center mb-2">
                            <div>
                                <h1 className="text-xl text-neon font-bold">Your Links</h1>
                                <p className="text-xs text-gray-400">Logged in as: {user.email}</p>
                            </div>
                            <button
                                className="text-sm text-red-400 hover:underline"
                                onClick={handleLogout}
                            >
                                Log Out
                            </button>
                        </div>
                        <LinkForm onCreated={() => setReloadFlag(prev => !prev)} />
                        <LinkList reload={reloadFlag} />
                    </>
                )}
            </div>
        </div>
    );
}
