'use client';

import { useState, useEffect } from 'react';

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

interface PrivacyConsentDialogProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
  onReject: () => void;
}

export const PrivacyConsentDialog = ({ user, isOpen, onClose, onAccept, onReject }: PrivacyConsentDialogProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    }
  }, [isOpen]);

  const handleAccept = () => {
    setIsVisible(false);
    setTimeout(() => {
      onAccept();
      onClose();
    }, 200);
  };

  const handleReject = () => {
    setIsVisible(false);
    setTimeout(() => {
      onReject();
      onClose();
    }, 200);
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 200);
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black transition-opacity duration-300 ${
          isVisible ? 'opacity-50' : 'opacity-0'
        }`}
        onClick={handleClose}
      />
      
      {/* Dialog */}
      <div 
        className={`relative bg-white rounded-lg max-w-lg w-full transform transition-all duration-300 ${
          isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-manifesto-gray">
              Privacy & Data Consent
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close dialog"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* GDPR Information */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-manifesto-gray mb-3">
              Public Display of Your Information
            </h3>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-800 mb-2">
                <strong>GDPR Compliance Notice:</strong>
              </p>
              <p className="text-sm text-blue-700">
                By signing the Developer Manifesto, your information will be displayed publicly on this website for other developers to see.
              </p>
            </div>
            
            <div className="space-y-3 text-sm text-gray-600">
              <h4 className="font-medium text-gray-800">The following information will be publicly visible:</h4>
              <ul className="space-y-2 ml-4">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>Your full name: <strong>{user.user_metadata?.full_name || user.user_metadata?.name || 'N/A'}</strong></span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>Your GitHub username: <strong>@{user.user_metadata?.preferred_username || user.user_metadata?.user_name || 'N/A'}</strong></span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>Your profile picture</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>Your signature message (if provided)</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>Your location (if provided)</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>The date you signed the manifesto</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Consent Question */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
            <p className="text-sm font-medium text-gray-800 mb-2">
              Do you consent to your information being displayed publicly on this website?
            </p>
            <p className="text-xs text-gray-600">
              You can withdraw this consent at any time by contacting us. Your signature will remain valid, but your information will be removed from public display.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
            <button
              onClick={handleAccept}
              className="flex-1 bg-white text-green-700 py-3 px-4 rounded-md hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 transition-all duration-200 font-medium border-2 border-green-600"
            >
              ✓ I Accept & Consent
            </button>
            <button
              onClick={handleReject}
              className="flex-1 bg-white text-red-700 py-3 px-4 rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 transition-all duration-200 font-medium border-2 border-red-600"
            >
              ✗ I Decline
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
