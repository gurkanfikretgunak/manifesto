'use client';

import { useState, useEffect } from 'react';
import { useSignatures } from '@/hooks/useSignatures';
import { supabase } from '@/lib/supabase';

interface User {
  id: string;
  email?: string;
  user_metadata: {
    full_name?: string;
    name?: string;
    avatar_url?: string;
    preferred_username?: string;
    user_name?: string;
  };
}

interface SignatureFormProps {
  onSignatureSuccess?: (userName: string) => void;
  onRefreshSignatures?: () => void;
}

export const SignatureForm = ({ onSignatureSuccess, onRefreshSignatures }: SignatureFormProps = {}) => {
  const { addSignature, hasUserSigned } = useSignatures();
  const [user, setUser] = useState<User | null>(null);
  const [userHasSigned, setUserHasSigned] = useState(false);
  const [formData, setFormData] = useState({
    message: '',
    location: '',
    privacyConsent: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    // Get current user
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const currentUser = user ? user as unknown as User : null;
      setUser(currentUser);
      
      if (currentUser) {
        console.log('Current user data:', currentUser);
        const hasSigned = await hasUserSigned(currentUser.id);
        setUserHasSigned(hasSigned);
      }
    };

    getCurrentUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ? session.user as unknown as User : null;
      setUser(currentUser);
      
      if (currentUser) {
        console.log('Auth state changed, user data:', currentUser);
        const hasSigned = await hasUserSigned(currentUser.id);
        setUserHasSigned(hasSigned);
      } else {
        setUserHasSigned(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [hasUserSigned]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);

    try {
      console.log('Submitting signature form with data:', formData);
      console.log('Current user:', user);
      
      // Get privacy consent from localStorage
      const privacyConsent = localStorage.getItem('privacy_consent') === 'true';
      console.log('Privacy consent:', privacyConsent);
      
      if (!privacyConsent) {
        alert('Privacy consent is required to sign the manifesto.');
        return;
      }
      
      const result = await addSignature(formData.message, formData.location, privacyConsent);
      console.log('Signature result:', result);
      
      if (result) {
        setFormData({ message: '', location: '', privacyConsent: false });
        setUserHasSigned(true);
        
        // Clear the dialog flag so user won't be prompted again
        localStorage.setItem('user_dialog_shown', 'true');
        
        // Refresh signatures list
        onRefreshSignatures?.();
        
        // Show success dialog
        onSignatureSuccess?.(user.user_metadata?.full_name || user.user_metadata?.name || 'User');
      } else {
        console.error('No result returned from addSignature');
        alert('There was an error signing the manifesto. Please try again.');
      }
      
    } catch (error) {
      console.error('Error signing manifesto:', error);
      alert('There was an error signing the manifesto. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return null; // User must be authenticated to see this form
  }

  if (userHasSigned) {
    return (
      <div className="p-6 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-green-800">
            Thank you for signing!
          </h3>
        </div>
        <p className="text-green-700">
          Your signature has been added to the Developer Manifesto. Thank you for supporting these principles!
        </p>
      </div>
    );
  }

  if (showSuccess) {
    return (
      <div className="p-6 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-green-800">
              Successfully signed!
            </h3>
            <p className="text-green-700">
              Your signature has been added to the manifesto.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-6 border border-gray-200 rounded-lg bg-gray-50">
      <div className="flex items-center space-x-3 mb-4">
        <img
          src={user.user_metadata?.avatar_url || 'https://avatars.githubusercontent.com/u/0?v=4'}
          alt={user.user_metadata?.full_name || 'User'}
          className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
        />
        <div>
          <h3 className="text-lg font-semibold text-manifesto-gray">
            Sign as {user.user_metadata?.full_name || user.user_metadata?.name || 'User'}
          </h3>
          <p className="text-sm text-gray-500">
            @{user.user_metadata?.preferred_username || user.user_metadata?.user_name || 'username'}
          </p>
        </div>
      </div>
      
      <div>
        <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
          Location
        </label>
        <input
          type="text"
          id="location"
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="City, Country"
        />
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
          Message (Optional)
        </label>
        <textarea
          id="message"
          rows={3}
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Share why you're signing this manifesto..."
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-white text-blue-800 py-3 px-4 rounded-md hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-800 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium border-2 border-blue-800"
      >
        {isSubmitting ? 'Signing...' : 'Sign the Manifesto'}
      </button>
    </form>
  );
};
