'use client';

import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { useSignatures } from '@/hooks/useSignatures';
import { type Signature } from '@/lib/supabase';

const AnimatedCounter = ({ target }: { target: number }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = 2000; // 2 seconds
    const steps = 60;
    const increment = target / steps;
    const stepDuration = duration / steps;

    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [target]);

  return (
    <span className="text-3xl font-bold text-manifesto-gray">
      {count}
    </span>
  );
};

const SignatureCard = ({ signature }: { signature: Signature }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="p-4 border border-gray-200 rounded-lg hover:shadow-lg transition-all duration-200 bg-white shadow-sm">
      <div className="flex items-center space-x-3 mb-3">
        <img
          src={signature.profiles.avatar_url}
          alt={signature.profiles.full_name}
          className="w-12 h-12 rounded-full border-2 border-gray-100"
        />
        <div className="flex-1">
          <h4 className="font-semibold text-manifesto-gray">
            {signature.profiles.full_name}
          </h4>
          <p className="text-sm text-gray-500">
            @{signature.profiles.github_username}
          </p>
        </div>
      </div>
      
      {signature.message && (
        <p className="text-sm text-gray-700 mb-3 italic bg-gray-50 p-3 rounded-md border-l-4 border-blue-200">
          "{signature.message}"
        </p>
      )}
      
      <div className="flex justify-between items-center text-xs text-gray-500 pt-2 border-t border-gray-100">
        {signature.location && (
          <span className="flex items-center space-x-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            <span>{signature.location}</span>
          </span>
        )}
        <span>{formatDate(signature.signed_at)}</span>
      </div>
    </div>
  );
};

export const SignaturesList = forwardRef<{ refetch: () => void }>((props, ref) => {
  const { signatures, loading, error, refetch } = useSignatures();

  useImperativeHandle(ref, () => ({
    refetch
  }));

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="animate-pulse bg-gray-200 h-8 w-32 mx-auto rounded mb-2"></div>
          <div className="animate-pulse bg-gray-200 h-4 w-48 mx-auto rounded"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse bg-gray-200 h-32 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  // Only show error if it's not a demo mode message
  if (error && !error.includes('demo data')) {
    return (
      <div className="text-center p-8 bg-red-50 border border-red-200 rounded-lg">
        <div className="text-red-600 mb-2">
          <svg className="w-12 h-12 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <h3 className="text-lg font-semibold mb-2">Error Loading Signatures</h3>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-manifesto-gray mb-2">
          <AnimatedCounter target={signatures.length} />
        </h3>
        <p className="text-lg text-gray-600 mb-1">
          {signatures.length === 1 ? 'Signature' : 'Signatures'}
        </p>
        <p className="text-sm text-gray-500">
          Join developers who have committed to these principles
        </p>
        
        {/* Demo mode indicator */}
        {error && error.includes('demo data') && (
          <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            Demo Mode - Sample Data
          </div>
        )}
      </div>

      {signatures.length === 0 ? (
        <div className="text-center p-8 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            Be the first to sign!
          </h3>
          <p className="text-gray-500">
            Sign the manifesto and become part of the developer community.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {signatures.map((signature) => (
            <SignatureCard key={signature.id} signature={signature} />
          ))}
        </div>
      )}
    </div>
  );
});

SignaturesList.displayName = 'SignaturesList';

