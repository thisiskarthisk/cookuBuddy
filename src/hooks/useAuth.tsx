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
        console.warn('Error fetching profile:', error.message);
        return null;
      }
      return data as Profile;
    } catch (e) {
      console.error('Unexpected error fetching profile:', e);
      return null;
    }
  }

  async function ensureProfile(user: User) {
    let userProfile = await fetchProfile(user.id);
    
    if (!userProfile) {
      console.log('Profile missing for user, creating default...');
      const { data, error } = await supabase
        .from('profiles')
        .insert([
          {
            id: user.id,
            name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
            email: user.email,
            user_type: 'user',
            status: 'active'
          }
        ])
        .select()
        .maybeSingle();
      
      if (error) {
        console.error('Failed to create default profile:', error.message);
      } else {
        userProfile = data as Profile;
      }
    }
    return userProfile;
  }

  useEffect(() => {
    // Check initial session status on startup
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      const currentUser = session?.user ?? null;
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
    });

    // Listen for incoming auth changes (Login, logout, session expiration)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      const currentUser = session?.user ?? null;
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
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  };

  const signUp = async (email: string, password: string, metadata?: { full_name?: string; phone?: string }) => {
    // 1. Auth Sign Up
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

    // 2. Profile Table Insert
    // We do this manually here. If you have a Supabase Trigger, you should disable it to avoid "Database error saving new user"
    if (data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert([
          {
            id: data.user.id,
            name: metadata?.full_name || null,
            email: email,
            user_type: 'user', // Default role
            phone: metadata?.phone || null,
            status: 'active',
            avatar_url: null,
            bio: null
          }
        ]);
      
      if (profileError) {
        console.error('Error creating profile record:', profileError);
        // If the profile fails to save, we might want to inform the user
        // but the Auth account is already created.
        throw new Error(`Auth account created, but profile failed: ${profileError.message}`);
      }
    }
    
    return data;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  /**
   * Dispatches a secure password reset link to the user's email address.
   * Supabase handles sending this automated transactional email template.
   */
  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'cookubuddy://reset-password', // Replace with your app's custom deep-linking scheme
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
