// --- src/components/feature/AuthPage.tsx --- (FINAL DIAGNOSTIC TEST VERSION)

import React, { useState } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  sendEmailVerification,
  sendPasswordResetEmail,
  signOut
} from 'firebase/auth';
// YENİ: Firestore'un temel fonksiyonlarını buraya da import ediyoruz
import { doc, setDoc } from 'firebase/firestore'; 
import { auth, db } from '../../src/firebase'; // db'yi de import et
import { createUserProfile } from '../../services/firebaseService';
import { LogoIcon } from '../shared/Icons';

type AuthView = 'login' | 'signup' | 'reset';

const AuthPage: React.FC = () => {
    const [view, setView] = useState<AuthView>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [gender, setGender] = useState('');
    const [address, setAddress] = useState('');
    const [agreed, setAgreed] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [notification, setNotification] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const clearState = () => { setError(null); setNotification(null); };

    const handleAuthError = (err: any) => {
        console.error("!!! AUTHENTICATION ERROR CATCHED !!!", err);
        setError(`Operation Failed: ${err.message} (Code: ${err.code || 'N/A'})`);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        clearState();

        if (view === 'login') {
            try {
                const userCredential = await signInWithEmailAndPassword(auth, email, password);
                if (!userCredential.user.emailVerified) {
                    setError('Please verify your email to sign in...');
                    await sendEmailVerification(userCredential.user);
                    await signOut(auth);
                    setLoading(false);
                    return;
                }
            } catch(err) {
                handleAuthError(err);
                setLoading(false);
            }
        } else { // view === 'signup'
            try {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                
                if (userCredential.user) {

                    // --- NİHAİ TEŞHİS TESTİ BURADA BAŞLIYOR ---
                    try {
                        console.log("--- Firestore Connection Test: STARTING ---");
                        const testRef = doc(db, "test_writes", userCredential.user.uid);
                        await setDoc(testRef, { testMessage: 'Hello World', timestamp: new Date() });
                        console.log("--- Firestore Connection Test: SUCCESS! Basic write completed. ---");
                    } catch (testError) {
                        console.error("--- Firestore Connection Test: FAILED! ---", testError);
                        // Eğer bu test başarısız olursa, hatayı ekrana yazdır ve dur.
                        throw testError; 
                    }
                    // --- NİHAİ TEŞHİS TESTİ BURADA BİTİYOR ---

                    await createUserProfile(userCredential.user, fullName, dateOfBirth, gender, address);
                    await sendEmailVerification(userCredential.user);
                    await signOut(auth);

                    setNotification('Registration successful! Please check your email to verify your account before signing in.');
                    setView('login');
                } else {
                    throw new Error("User creation failed, user object is null.");
                }
            } catch (err: any) {
                handleAuthError(err);
            } finally {
                setLoading(false);
            }
        }
    };
    
    // ... dosyanın geri kalanında bir değişiklik yok ...
    const handlePasswordReset = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) {setError('Please enter your email address.'); return;}
        setLoading(true); clearState();
        try {
            await sendPasswordResetEmail(auth, email);
            setNotification('If an account exists for this email, a password reset link has been sent.');
            setView('login');
        } catch (err: any) { setError('An error occurred.'); console.error(err);
        } finally { setLoading(false); }
    };
    const renderLoginView = () => (
        <form onSubmit={handleSubmit} className="space-y-4">
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" required className="input-style" />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required className="input-style" />
            <div className="text-right"><button type="button" onClick={() => { setView('reset'); clearState(); }} className="text-sm text-primary hover:underline">Forgot Password?</button></div>
            {error && <p className="text-sm text-danger text-center">{error}</p>}
            <button type="submit" disabled={loading} className="w-full btn-primary">{loading ? 'Processing...' : 'Sign In'}</button>
        </form>
    );
    const renderSignupView = () => (
        <form onSubmit={handleSubmit} className="space-y-4">
             <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full Name" required className="input-style" />
             <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" required className="input-style" />
             <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password (min. 6 characters)" required className="input-style" />
             <input type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} placeholder="Date of Birth" required className="input-style" />
             <select value={gender} onChange={(e) => setGender(e.target.value)} required className="input-style">
                <option value="" disabled>Select Gender</option><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option><option value="prefer_not_to_say">Prefer not to say</option>
            </select>
            <textarea value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Address" required className="input-style h-24 resize-none" />
            <div className="flex items-center">
                <input id="agree" type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded" />
                <label htmlFor="agree" className="ml-2 block text-sm text-muted">I agree to the <a href="#" className="text-primary hover:underline">Terms and Conditions</a></label>
            </div>
             {error && <p className="text-sm text-danger text-center">{error}</p>}
             <button type="submit" disabled={loading || !agreed} className="w-full btn-primary">{loading ? 'Processing...' : 'Sign Up'}</button>
        </form>
    );
    const renderResetView = () => (
        <form onSubmit={handleSubmit} className="space-y-4">
             <p className="text-sm text-muted text-center">Enter your email address and we will send you a link to reset your password.</p>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" required className="input-style" />
            {error && <p className="text-sm text-danger text-center">{error}</p>}
             <button type="submit" disabled={loading} className="w-full btn-primary">{loading ? 'Sending...' : 'Send Reset Link'}</button>
        </form>
    );
    return (
        <div className="flex items-center justify-center min-h-screen bg-background p-4">
            <div className="w-full max-w-md p-8 space-y-6 bg-surface border border-border-color rounded-lg">
                <div className="text-center"><LogoIcon className="w-12 h-12 text-primary mx-auto mb-4" /><h1 className="text-2xl font-bold text-white">Welcome to Trademeta</h1><p className="text-muted">{view === 'login' && 'Sign in to your account'}{view === 'signup' && 'Create a new account'}{view === 'reset' && 'Reset your password'}</p></div>
                {notification && <p className="text-sm text-success text-center bg-success/10 p-3 rounded-md">{notification}</p>}
                {view === 'login' && renderLoginView()}
                {view === 'signup' && renderSignupView()}
                {view === 'reset' && renderResetView()}
                <div className="text-center">
                    {view === 'reset' ? (<button onClick={() => { setView('login'); clearState(); }} className="text-sm text-primary hover:underline">&larr; Back to Sign In</button>) : (<button onClick={() => { setView(view === 'login' ? 'signup' : 'login'); clearState(); }} className="text-sm text-primary hover:underline">{view === 'login' ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}</button>)}
                </div>
            </div>
            <style>{`.input-style { width: 100%; background-color: #0d1117; border: 1px solid #30363d; border-radius: 6px; padding: 8px 12px; color: white; outline: none; } .input-style:focus { border-color: #58a6ff; box-shadow: 0 0 0 3px rgba(88, 166, 255, 0.2); } .btn-primary { background-color: #2f81f7; color: white; font-weight: bold; padding: 8px 0; border-radius: 6px; } .btn-primary:hover { background-color: #388bfd; } .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }`}</style>
        </div>
    );
};

export default AuthPage;