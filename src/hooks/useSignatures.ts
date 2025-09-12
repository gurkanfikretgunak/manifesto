'use client';

import { useState, useEffect } from 'react';
import { supabase, isSupabaseReady, testSupabaseConnection, type Signature } from '@/lib/supabase';

export const useSignatures = () => {
  const [signatures, setSignatures] = useState<Signature[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock data for development when Supabase is not configured
  const mockSignatures: Signature[] = [
    {
      id: '1',
      user_id: 'mock-user-1',
      message: 'Great manifesto! These principles resonate with my development philosophy.',
      location: 'San Francisco, CA',
      privacy_consent: true,
      signed_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      profiles: {
        id: 'mock-user-1',
        github_username: 'johndoe',
        full_name: 'John Doe',
        avatar_url: 'https://avatars.githubusercontent.com/u/1?v=4',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    },
    {
      id: '2',
      user_id: 'mock-user-2',
      message: 'Building with intention, coding with conscience. Love it!',
      location: 'Berlin, Germany',
      privacy_consent: true,
      signed_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      created_at: new Date(Date.now() - 86400000).toISOString(),
      profiles: {
        id: 'mock-user-2',
        github_username: 'janedoe',
        full_name: 'Jane Doe',
        avatar_url: 'https://avatars.githubusercontent.com/u/2?v=4',
        created_at: new Date(Date.now() - 86400000).toISOString(),
        updated_at: new Date(Date.now() - 86400000).toISOString(),
      }
    }
  ];

  // Fetch all signatures
  const fetchSignatures = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Test actual Supabase connection
      const isConnected = await testSupabaseConnection();
      
      if (!isConnected) {
        // Use mock data when Supabase is not configured or connection fails
        console.log('Supabase not connected, using mock data');
        setSignatures(mockSignatures);
        setError('Using demo data - Supabase not configured');
        setLoading(false);
        return;
      }
      
      const { data, error } = await supabase
        .from('signatures')
        .select(`
          *,
          profiles (
            github_username,
            full_name,
            avatar_url
          )
        `)
        .order('signed_at', { ascending: false });

      if (error) throw error;
      setSignatures(data || []);
    } catch (error) {
      console.error('Error fetching signatures:', error);
      // Fallback to mock data if Supabase fails
      setSignatures(mockSignatures);
      setError('Using demo data - Supabase not configured');
    } finally {
      setLoading(false);
    }
  };

  // Add new signature
  const addSignature = async (message?: string, location?: string, privacyConsent: boolean = true) => {
    try {
      // Test actual Supabase connection
      const isConnected = await testSupabaseConnection();
      
      if (!isConnected) {
        const mockSignature: Signature = {
          id: Date.now().toString(),
          user_id: 'mock-user-' + Date.now(),
          message,
          location,
          privacy_consent: privacyConsent,
          signed_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          profiles: {
            id: 'mock-user-' + Date.now(),
            github_username: 'mockuser',
            full_name: 'Mock User',
            avatar_url: 'https://avatars.githubusercontent.com/u/3?v=4',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }
        };
        
        setSignatures(prev => [mockSignature, ...prev]);
        return mockSignature;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      console.log('Adding signature for user:', user);

      // First, ensure user profile exists
      const profileData = {
        id: user.id,
        github_username: user.user_metadata?.preferred_username || user.user_metadata?.user_name || 'unknown',
        full_name: user.user_metadata?.full_name || user.user_metadata?.name || 'Unknown User',
        avatar_url: user.user_metadata?.avatar_url || '',
      };

      console.log('Upserting profile data:', profileData);

      const { error: profileError } = await supabase
        .from('profiles')
        .upsert(profileData);

      if (profileError) {
        console.error('Profile upsert error:', profileError);
        throw new Error(`Profile creation failed: ${profileError.message}`);
      }

      // Then add the signature
      const signatureData = {
        user_id: user.id,
        message: message || null,
        location: location || null,
        privacy_consent: privacyConsent,
      };

      console.log('Inserting signature data:', signatureData);

      const { data, error } = await supabase
        .from('signatures')
        .insert([signatureData])
        .select(`
          *,
          profiles (
            github_username,
            full_name,
            avatar_url
          )
        `)
        .single();

      if (error) {
        console.error('Signature insert error:', error);
        throw error;
      }

      console.log('Signature added successfully:', data);
      setSignatures(prev => [data, ...prev]);
      return data;
    } catch (error) {
      console.error('Error adding signature:', error);
      throw error;
    }
  };

  // Check if user has already signed
  const hasUserSigned = async (userId: string): Promise<boolean> => {
    try {
      console.log('Checking if user has signed:', userId);
      
      // Test actual Supabase connection first
      const isConnected = await testSupabaseConnection();
      
      if (!isConnected) {
        console.log('Supabase not connected, returning false for hasUserSigned');
        return false;
      }

      const { data, error } = await supabase
        .from('signatures')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking user signature:', error);
        return false;
      }
      
      const hasSigned = !!data;
      console.log('User has signed:', hasSigned);
      return hasSigned;
    } catch (error) {
      console.error('Error checking if user signed:', error);
      return false;
    }
  };

  useEffect(() => {
    fetchSignatures();
  }, []);

  return {
    signatures,
    loading,
    error,
    addSignature,
    hasUserSigned,
    refetch: fetchSignatures
  };
};
