import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabaseService } from '../supabaseClient';
import type { User } from '@supabase/supabase-js';
import toast from 'react-hot-toast';

export default function ResetPassword() {
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [status, setStatus] = useState('');
    const [error, setError] = useState('');
    const [user, setUser] = useState<User | null>(null);
    const [showResetForm, setShowResetForm] = useState(false);

    useEffect(() => {
        supabaseService['client'].auth.getUser().then((res) => {
            setUser(res.data.user || null);
            setShowResetForm(!!res.data.user);
        });
    }, []);

    const handleSendResetEmail = async () => {
        setStatus('');
        setError('');

        if (!email.includes('@')) {
            setError('Invalid email address');
            return;
        }

        const { error } = await supabaseService['client'].auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset`,
        });

        if (error) {
            setError(error.message);
        } else {
            setStatus('Password reset email sent.');
            toast.success('Password reset email has been sent to your email address.');
        }
    };

    const handlePasswordUpdate = async () => {
        setError('');
        setStatus('');

        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }

        const { error } = await supabaseService['client'].auth.updateUser({
            password: newPassword,
        });

        if (error) {
            setError(error.message);
        } else {
            setStatus('Password updated successfully. Redirecting...');
            setNewPassword('');
            setTimeout(() => {
                navigate('/');
            }, 1500);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-dark px-4">
            <div className="bg-gray-900 p-6 rounded max-w-sm w-full text-white space-y-4 shadow-lg">
                <h2 className="text-2xl font-bold text-center text-neon">
                    {showResetForm ? 'Set New Password' : 'Reset Password'}
                </h2>

                {user && (
                    <p className="text-xs text-center text-gray-400">
                        Logged in as: {user.email}
                    </p>
                )}

                {showResetForm ? (
                    <>
                        <input
                            type="password"
                            placeholder="Enter new password"
                            className="w-full p-2 bg-gray-800 rounded border border-gray-700 focus:outline-none focus:ring-2 focus:ring-neon"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                        />
                        <button
                            onClick={handlePasswordUpdate}
                            className="w-full bg-neon text-black font-semibold py-2 rounded hover:brightness-110 transition"
                        >
                            Update Password
                        </button>
                    </>
                ) : (
                    <>
                        <input
                            type="email"
                            placeholder="Enter your email"
                            className="w-full p-2 bg-gray-800 rounded border border-gray-700 focus:outline-none focus:ring-2 focus:ring-neon"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <button
                            onClick={handleSendResetEmail}
                            className="w-full bg-neon text-black font-semibold py-2 rounded hover:brightness-110 transition"
                        >
                            Send Reset Email
                        </button>
                    </>
                )}

                {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                {status && <p className="text-green-400 text-sm text-center">{status}</p>}
            </div>
        </div>
    );
}
