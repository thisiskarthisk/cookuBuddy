/**
 * CookuBuddy Authentication Core Context Provider
 * Includes user runtime state tracking and explicit resetPassword implementation.
 */

import { Session, User } from '@supabase/supabase-js';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface Profile {
  id: string;
  name: string | null;
  email: string | null;
  user_type: 'admin' | 'user';
  avatar_url: string | null;
  phone: string | null;
  bio: string | null;
  status: string | null;
}

interface AuthState {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  isAdmin: boolean;
  loading: boolean;
}

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string, metadata?: { full_name?: string; phone?: string }) => Promise<any>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>; 
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  async function fetchProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      
      if (error) {
        console.warn('[AUTH] Error fetching profile:', error.message);
        return null;
      }
      return data as Profile;
    } catch (e) {
      console.error('[AUTH] Unexpected error fetching profile:', e);
      return null;
    }
  }

  async function ensureProfile(authUser: User) {
    try {
      let userProfile = await fetchProfile(authUser.id);
      
      if (!userProfile) {
        console.log('[AUTH] Profile missing for user, creating default...');
        const { data, error } = await supabase
          .from('profiles')
          .upsert([ // Using upsert to prevent unique constraint errors
            {
              id: authUser.id,
              name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User',
              email: authUser.email,
              user_type: 'user',
              status: 'active'
            }
          ])
          .select()
          .maybeSingle();
        
        if (error) {
          console.error('[AUTH] Failed to create/upsert profile:', error.message);
        } else {
          userProfile = data as Profile;
        }
      }
      return userProfile;
    } catch (e) {
      console.error('[AUTH] Exception in ensureProfile:', e);
      return null;
    }
  }

  const updateAuthState = async (newSession: Session | null) => {
    setLoading(true);
    setSession(newSession);
    const currentUser = newSession?.user ?? null;
    setUser(currentUser);
    
    if (currentUser) {
      const userProfile = await ensureProfile(currentUser);
      setProfile(userProfile);
      setIsAdmin(userProfile?.user_type === 'admin');
    } else {
      setProfile(null);
      setIsAdmin(false);
    }
    setLoading(false);
  };

  useEffect(() => {
    // Check initial session status on startup
    supabase.auth.getSession().then(({ data: { session } }) => {
      updateAuthState(session);
    });

    // Listen for incoming auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      updateAuthState(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return data;
    } catch (err: any) {
      // If it's a network error, try one more time after a short delay
      if (err.message === 'Network request failed' || err.status === 0) {
        console.warn('[AUTH] Initial login failed, retrying once...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        return data;
      }
      throw err;
    }
  };

  const signUp = async (email: string, password: string, metadata?: { full_name?: string; phone?: string }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: metadata?.full_name,
          phone: metadata?.phone,
        }
      }
    });
    
    if (error) throw error;

    if (data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert([
          {
            id: data.user.id,
            name: metadata?.full_name || null,
            email: email,
            user_type: 'user',
            phone: metadata?.phone || null,
            status: 'active',
          }
        ]);
      
      if (profileError) {
        console.error('[AUTH] Error creating profile record:', profileError);
      }
    }
    
    return data;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'cookubuddy://reset-password',
    });
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{ 
      session, 
      user, 
      profile,
      isAdmin,
      loading, 
      signIn, 
      signUp, 
      signOut,
      resetPassword 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
