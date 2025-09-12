'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function AuthCodeError() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [countdown, setCountdown] = useState(10);
  
  const error = searchParams.get('error');
  const description = searchParams.get('description');

  useEffect(() => {
    // Auto redirect to home after 10 seconds
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          router.push('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          
          <h1 className="text-2xl font-bold text-manifesto-gray mb-2">
            Authentication Error
          </h1>
          
          <p className="text-gray-600 mb-6">
            There was an issue with the GitHub authentication process. 
            {error && (
              <span className="block mt-2 text-sm font-mono bg-red-50 p-2 rounded">
                Error: {error}
                {description && <span className="block mt-1">Description: {description}</span>}
              </span>
            )}
          </p>
          
          <ul className="text-sm text-gray-500 text-left space-y-2 mb-8">
            <li className="flex items-start">
              <span className="w-2 h-2 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              Cancelled authentication process
            </li>
            <li className="flex items-start">
              <span className="w-2 h-2 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              Network connectivity issues
            </li>
            <li className="flex items-start">
              <span className="w-2 h-2 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              GitHub service temporary unavailability
            </li>
          </ul>
        </div>

        <div className="space-y-4">
          <Link
            href="/"
            className="w-full bg-white text-blue-800 py-3 px-4 rounded-md hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-800 focus:ring-offset-2 transition-all duration-200 font-medium inline-block text-center border-2 border-blue-800"
          >
            Try Again
          </Link>
          
          <p className="text-sm text-gray-500">
            Automatically redirecting to home in {countdown} seconds...
          </p>
        </div>
      </div>
    </div>
  );
}
