'use client';

import { useState, useEffect } from 'react';
import { supabase, isSupabaseReady, testSupabaseConnection } from '@/lib/supabase';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { useSignatures } from '@/hooks/useSignatures';

interface User {
  id: string;
  email: string;
  user_metadata: {
    full_name?: string;
    name?: string;
    avatar_url?: string;
    preferred_username?: string;
    user_name?: string;
  };
}

interface GitHubAuthProps {
  onAuthChange?: (user: User | null) => void;
  onShowUserDialog?: (user: User) => void;
}

export const GitHubAuth = ({ onAuthChange, onShowUserDialog }: GitHubAuthProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [mockMode, setMockMode] = useState(false);
  const { hasUserSigned } = useSignatures();

  // Mock user for development
  const mockUser: User = {
    id: 'mock-user-demo',
    email: 'demo@example.com',
    user_metadata: {
      full_name: 'Demo User',
      avatar_url: 'https://avatars.githubusercontent.com/u/1?v=4',
      preferred_username: 'demouser'
    }
  };

  useEffect(() => {
    const checkSupabaseConnection = async () => {
      // Test actual Supabase connection
      const isConnected = await testSupabaseConnection();
      
      if (!isConnected) {
        console.log('Supabase not connected, using mock authentication');
        setMockMode(true);
        setLoading(false);
        return;
      }

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const currentUser = session?.user ? session.user as unknown as User : null;
        setUser(currentUser);
        onAuthChange?.(currentUser);
        
        // If we have a session on initial load, check if user has signed
        if (currentUser) {
          console.log('Initial session found, checking if user has signed...');
          
          // Check if user has already signed the manifesto
          const checkAndShowDialog = async () => {
            try {
              const hasSigned = await hasUserSigned(currentUser.id);
              console.log('User has signed:', hasSigned);
              
              if (!hasSigned && !localStorage.getItem('user_dialog_shown')) {
                console.log('User has not signed, showing user dialog');
                localStorage.setItem('user_dialog_shown', 'true');
                // Small delay to ensure UI is ready
                setTimeout(() => {
                  onShowUserDialog?.(currentUser);
                }, 1000);
              } else if (hasSigned) {
                console.log('User has already signed, no dialog needed');
              }
            } catch (error) {
              console.error('Error checking user signature status:', error);
            }
          };
          
          checkAndShowDialog();
        }
      } catch (error) {
        console.error('Error getting session:', error);
        setMockMode(true);
      } finally {
        setLoading(false);
      }
    };

      getInitialSession();

      // Listen for auth changes
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((event, session) => {
        const currentUser = session?.user ? session.user as unknown as User : null;
        setUser(currentUser);
        onAuthChange?.(currentUser);
        
        // Show user dialog when user signs in
        if (event === 'SIGNED_IN' && currentUser) {
          onShowUserDialog?.(currentUser);
        }
      });

      return () => subscription.unsubscribe();
    };

    checkSupabaseConnection();
  }, [onAuthChange]);

  const signOut = async () => {
    // Clear the dialog flag
    localStorage.removeItem('user_dialog_shown');
    
    if (mockMode) {
      setUser(null);
      onAuthChange?.(null);
      return;
    }
    await supabase.auth.signOut();
  };

  const mockSignIn = () => {
    setUser(mockUser);
    onAuthChange?.(mockUser);
    onShowUserDialog?.(mockUser);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-manifesto-gray"></div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <img
          src={user.user_metadata?.avatar_url || 'https://avatars.githubusercontent.com/u/0?v=4'}
          alt={user.user_metadata?.full_name || 'User'}
          className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
        />
        <div className="flex-1">
          <h4 className="font-semibold text-manifesto-gray text-sm">
            {user.user_metadata?.full_name || user.user_metadata?.name || 'User'}
          </h4>
          <p className="text-xs text-gray-500">
            @{user.user_metadata?.preferred_username || user.user_metadata?.user_name || 'username'}
          </p>
        </div>
        <button
          onClick={signOut}
          className="text-xs text-gray-600 hover:text-gray-800 px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-1 transition-all duration-200 font-medium"
        >
          Sign Out
        </button>
      </div>
    );
  }

  // Show mock mode message and demo button
  if (mockMode) {
    return (
      <div className="p-4">
        <div className="text-center mb-4">
          <h3 className="text-lg font-semibold text-manifesto-gray mb-2">
            Sign the Developer Manifesto
          </h3>
          <p className="text-sm text-gray-600 mb-3">
            Join the community by signing with your GitHub account
          </p>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-yellow-800">
              <strong>Demo Mode:</strong> Supabase not configured. Using mock authentication.
            </p>
            <p className="text-xs text-yellow-700 mt-1">
              To enable real GitHub auth, configure Supabase environment variables.
            </p>
          </div>
        </div>
        
        <button
          onClick={mockSignIn}
          className="w-full bg-white text-blue-800 py-3 px-4 rounded-md hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-800 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center space-x-2 font-medium border-2 border-blue-800"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
          </svg>
          <span>Sign in with GitHub (Demo)</span>
        </button>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-manifesto-gray mb-2">
          Sign the Developer Manifesto
        </h3>
        <p className="text-sm text-gray-600">
          Join the community by signing with your GitHub account
        </p>
      </div>
      
      <Auth
        supabaseClient={supabase}
        appearance={{ 
          theme: ThemeSupa,
          variables: {
            default: {
              colors: {
                brand: '#222222',
                brandAccent: '#444444',
              },
            },
          },
        }}
        providers={['github']}
        redirectTo={`${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback`}
        onlyThirdPartyProviders
        view="sign_in"
        showLinks={false}
      />
    </div>
  );
};