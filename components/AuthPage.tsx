
import React, { useState } from 'react';
import { supabase, signInWithGoogle } from '../services/supabaseClient';

interface AuthPageProps {
  onGuestLogin: () => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onGuestLogin }) => {
  const [role, setRole] = useState<'user' | 'guide'>('user');
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        
        // Save profile with role
        if (data.user) {
          const { error: profileError } = await supabase
            .from('profiles')
            .insert([{ id: data.user.id, role: role, email: email }]);
          
          if (profileError) console.error("Profile creation failed", profileError);
          alert("Registration successful! Please check your email for verification.");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        // Success is handled by App.tsx subscription
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Connection failure. Check credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (error: any) {
      console.error("Google Auth Error:", error);
      setError(error.message || "Google authentication failed.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full bg-slate-950">
        <div className="absolute top-1/2 left-1/2 w-[800px] h-[800px] bg-pink-500/10 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-orange-500/10 rounded-full blur-[120px]"></div>
      </div>

      <div className="glass-panel w-full max-w-5xl h-[650px] rounded-[3rem] border border-white/5 flex overflow-hidden relative z-10 shadow-2xl">
        
        {/* Left Side - Visual */}
        <div className="hidden lg:flex w-1/2 relative flex-col justify-between p-12 bg-slate-900/40">
           <img 
              src="https://images.unsplash.com/photo-1548013146-72479768bbaa?auto=format&fit=crop&q=80&w=1920" 
              className="absolute inset-0 w-full h-full object-cover opacity-30" 
              alt="Auth BG"
            />
           <div className="relative z-10">
              <div className="w-12 h-12 rani-pink-bg rounded-[1rem] flex items-center justify-center text-white font-black text-xl mb-6">L</div>
              <h1 className="text-5xl font-black text-white leading-none mb-4">Local<span className="textile-gradient">Lens</span></h1>
              <p className="text-slate-400 font-bold italic text-lg">Your gateway to the curated Bharat.</p>
           </div>
           <div className="relative z-10">
             <div className="flex gap-4 mb-4">
                <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10">
                  <span className="block text-2xl font-black text-white">12K+</span>
                  <span className="text-[10px] uppercase text-slate-400 font-bold">Verified Guides</span>
                </div>
                <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10">
                  <span className="block text-2xl font-black text-white">400+</span>
                  <span className="text-[10px] uppercase text-slate-400 font-bold">AI Itineraries</span>
                </div>
             </div>
             <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em]">System Secure • v2.5.1</p>
           </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full lg:w-1/2 p-8 sm:p-12 flex flex-col justify-center bg-slate-950/80 backdrop-blur-xl relative overflow-y-auto">
          <div className="flex justify-center mb-8">
             <div className="bg-white/5 p-1 rounded-full flex">
               <button 
                 onClick={() => setRole('user')}
                 className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${role === 'user' ? 'bg-pink-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
               >
                 Tourist Access
               </button>
               <button 
                 onClick={() => setRole('guide')}
                 className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${role === 'guide' ? 'bg-orange-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
               >
                 Guide Portal
               </button>
             </div>
          </div>

          <div className="mb-6 text-center">
            <h2 className="text-3xl font-black text-white mb-2">{isSignUp ? 'Initiate Protocol' : 'Access Node'}</h2>
            <p className="text-slate-500 text-sm font-bold">{isSignUp ? `Create your ${role === 'user' ? 'traveler' : 'guide'} identity` : 'Sign in to retrieve your data'}</p>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            <div className="space-y-2">
               <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 ml-2">Digital ID (Email)</label>
               <input 
                 type="email" 
                 value={email}
                 onChange={(e) => setEmail(e.target.value)}
                 className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-pink-500 transition-colors"
                 placeholder="name@locallens.com"
                 required 
               />
            </div>
            <div className="space-y-2">
               <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 ml-2">Access Key (Password)</label>
               <input 
                 type="password" 
                 value={password}
                 onChange={(e) => setPassword(e.target.value)}
                 className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-pink-500 transition-colors"
                 placeholder="••••••••"
                 required
               />
            </div>

            {error && <div className="text-red-400 text-xs font-bold bg-red-500/10 p-3 rounded-lg border border-red-500/20">{error}</div>}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-5 rounded-2xl bg-white text-slate-950 font-black text-sm uppercase tracking-[0.3em] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl disabled:opacity-50"
            >
              {loading ? 'Processing...' : (isSignUp ? 'Register Identity' : 'Connect')}
            </button>
          </form>

          <div className="mt-6 flex flex-col items-center gap-4">
            <div className="flex items-center w-full gap-4">
               <div className="h-px bg-white/10 flex-grow"></div>
               <span className="text-[10px] text-slate-500 font-bold uppercase">Or Authenticate With</span>
               <div className="h-px bg-white/10 flex-grow"></div>
            </div>
            
            <button 
              onClick={handleGoogleLogin}
              className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold flex items-center justify-center gap-3 transition-all"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Google
            </button>

            <button 
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-slate-400 hover:text-white text-xs font-bold underline decoration-pink-500/50 underline-offset-4 transition-colors mt-2"
            >
              {isSignUp ? 'Already verified? Login' : 'New to LocalLens? Register'}
            </button>
            
            <button
               onClick={onGuestLogin}
               className="text-slate-500 hover:text-white text-[10px] font-black uppercase tracking-widest border border-white/5 hover:border-white/20 px-6 py-2 rounded-full transition-all"
            >
               Execute Guest Protocol (Bypass)
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AuthPage;
