import { useState } from 'react';
import { supabaseService } from '../supabaseClient';
import toast from 'react-hot-toast';

export default function Auth() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [animated, setAnimated] = useState(false);
    const [emailSent, setEmailSent] = useState(false);

    const handleSubmit = async () => {
        setLoading(true);
        setEmailSent(false);
        try {
            if (!email.includes('@')) {
                toast.error('Invalid email format.');
                return;
            }

            if (password.length < 6) {
                toast.error('Password must be at least 6 characters.');
                return;
            }

            if (isLogin) {
                await supabaseService.login(email, password);
                toast.success('Logged in successfully.');
            } else {
                await supabaseService.register(email, password);
                toast.success('Confirmation email has been sent. Please check your inbox.');
                setEmailSent(true);
                setAnimated(true);
                setTimeout(() => setAnimated(false), 3000);
            }
        } catch (err: unknown) {
            if (err instanceof Error) {
                toast.error(err.message);
            } else {
                toast.error('Something went wrong.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`bg-gray-900 p-6 rounded max-w-sm w-full text-white space-y-4 shadow-lg transition-transform duration-500 ${animated ? 'scale-105 ring-2 ring-neon' : ''}`}>
            <h2 className="text-2xl font-bold text-center text-neon">
                {isLogin ? 'Login' : 'Register'}
            </h2>

            <input
                type="email"
                placeholder="Email"
                className="w-full p-2 bg-gray-800 rounded border border-gray-700 focus:outline-none focus:ring-2 focus:ring-neon"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />

            <div className="relative">
                <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password"
                    className="w-full p-2 bg-gray-800 rounded border border-gray-700 focus:outline-none focus:ring-2 focus:ring-neon pr-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <span
                    className="absolute top-2 right-3 text-sm text-neon cursor-pointer"
                    onClick={() => setShowPassword(!showPassword)}
                >
                    {showPassword ? 'Hide' : 'Show'}
                </span>
            </div>

            <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-neon text-black font-semibold py-2 rounded hover:brightness-110 transition disabled:opacity-60"
            >
                {isLogin ? 'Log In' : 'Sign Up'}
            </button>

            {emailSent && (
                <p className="text-green-400 text-sm text-center">
                    A confirmation email has been sent to <span className="underline">{email}</span>. Please check your inbox to verify your account.
                </p>
            )}

            <p
                onClick={() => {
                    setIsLogin(!isLogin);
                    setEmailSent(false);
                }}
                className="text-sm text-center text-neon cursor-pointer hover:underline"
            >
                {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Log in'}
            </p>

            {isLogin && (
                <p
                    onClick={() => (window.location.href = '/reset')}
                    className="text-sm text-center text-blue-400 cursor-pointer hover:underline"
                >
                    Forgot your password?
                </p>
            )}
        </div>
    );
}
