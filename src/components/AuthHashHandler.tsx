'use client';

import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
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

interface AuthHashHandlerProps {
  onShowUserDialog?: (user: User) => void;
}

export const AuthHashHandler = ({ onShowUserDialog }: AuthHashHandlerProps) => {
  const { hasUserSigned } = useSignatures();
  useEffect(() => {
    const handleAuthHash = async () => {
      // Check if we have auth data in the hash
      if (typeof window !== 'undefined' && window.location.hash) {
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const expiresIn = hashParams.get('expires_in');
        const tokenType = hashParams.get('token_type');

        if (accessToken) {
          console.log('Found access token in hash, setting session...');
          console.log('Token details:', { 
            accessToken: accessToken.substring(0, 20) + '...', 
            hasRefreshToken: !!refreshToken,
            expiresIn,
            tokenType 
          });
          
          try {
            // Set the session using the tokens from the hash
            const { data, error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken || '',
            });

            if (error) {
              console.error('Error setting session from hash:', error);
            } else {
              console.log('Successfully set session from hash!');
              console.log('User data:', data.user?.user_metadata);
              
              // Clean up the URL hash
              window.history.replaceState(null, '', window.location.pathname);
              
              // Check if user has signed before showing dialog
              if (data.user) {
                console.log('Checking if user has signed before showing dialog...');
                const checkAndShowDialog = async () => {
                  try {
                    const hasSigned = await hasUserSigned(data.user!.id);
                    console.log('User has signed:', hasSigned);
                    
                    if (!hasSigned) {
                      console.log('User has not signed, showing user dialog');
                      onShowUserDialog?.(data.user as unknown as User);
                    } else {
                      console.log('User has already signed, no dialog needed');
                    }
                  } catch (error) {
                    console.error('Error checking signature status:', error);
                    // Show dialog anyway if there's an error
                    onShowUserDialog?.(data.user as unknown as User);
                  }
                };
                
                // Small delay to ensure everything is set up
                setTimeout(checkAndShowDialog, 500);
              }
              
              // Don't reload, just let the auth state propagate
              // setTimeout(() => {
              //   window.location.reload();
              // }, 500);
            }
          } catch (err) {
            console.error('Exception setting session from hash:', err);
          }
        }
      }
    };

    // Run on mount
    handleAuthHash();
  }, []);

  return null; // This component doesn't render anything
};
