import React, { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../src/firebase';
import { createUserProfile } from '../../services/firebaseService';
import { LogoIcon } from '../shared/Icons';

const AuthPage: React.FC = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const DEMO_EMAIL = 'demo@trademeta.app';
    const DEMO_PASSWORD = 'DemoPassword123!';

    const handleAuthError = (err: any, isDemo = false) => {
        if (isDemo) {
            setError('Demo kullanıcısı ile giriş yapılamadı. Lütfen Firebase Console\'u kontrol edin.');
            return;
        }
        if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
            setError('Geçersiz e-posta veya şifre.');
        } else if (err.code === 'auth/email-already-in-use') {
            setError('Bu e-posta adresi zaten kullanılıyor.');
        } else {
            setError('Bir hata oluştu. Lütfen tekrar deneyin.');
        }
        console.error(err);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isLogin) {
                await signInWithEmailAndPassword(auth, email, password);
            } else {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                await createUserProfile(userCredential.user);
            }
        } catch (err: any) {
            handleAuthError(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDemoLogin = async () => {
        setLoading(true);
        setError(null);
        try {
            await signInWithEmailAndPassword(auth, DEMO_EMAIL, DEMO_PASSWORD);
        } catch (err: any) {
            handleAuthError(err, true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-background">
            <div className="w-full max-w-md p-8 space-y-8 bg-surface border border-border-color rounded-lg">
                <div className="text-center">
                    <LogoIcon className="w-12 h-12 text-primary mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-white">Trademeta'ya Hoş Geldiniz</h1>
                    <p className="text-muted">{isLogin ? 'Hesabınıza giriş yapın' : 'Yeni bir hesap oluşturun'}</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="E-posta adresi"
                        required
                        className="w-full bg-background border border-border-color rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Şifre"
                        required
                        className="w-full bg-background border border-border-color rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary"
                    />

                    {error && <p className="text-sm text-danger text-center">{error}</p>}

                    <button type="submit" disabled={loading} className="w-full bg-primary text-background font-bold py-2 rounded-md hover:bg-primary-focus transition-colors disabled:opacity-50">
                        {loading ? 'İşleniyor...' : (isLogin ? 'Giriş Yap' : 'Kayıt Ol')}
                    </button>
                </form>

                <div className="relative flex py-2 items-center">
                    <div className="flex-grow border-t border-border-color"></div>
                    <span className="flex-shrink mx-4 text-muted text-xs">VEYA</span>
                    <div className="flex-grow border-t border-border-color"></div>
                </div>
                <button onClick={handleDemoLogin} disabled={loading} className="w-full bg-surface border border-border-color text-muted font-bold py-2 rounded-md hover:bg-border-color transition-colors disabled:opacity-50">
                    {loading ? '...' : 'Demo Olarak Giriş Yap'}
                </button>

                <div className="text-center">
                    <button onClick={() => setIsLogin(!isLogin)} className="text-sm text-primary hover:underline">
                        {isLogin ? 'Hesabınız yok mu? Kayıt Olun' : 'Zaten bir hesabınız var mı? Giriş Yapın'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;