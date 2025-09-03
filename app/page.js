'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { supabase } from '../lib/supabase';
import { AppHeader } from './components/AppHeader';
import { PrimaryButton } from './components/PrimaryButton';

// Force dynamic rendering to bypass WagmiProvider prerender error
export const dynamic = 'force-dynamic';

// Creator Onboarding Flow
export default function Home() {
  const { address } = useAccount();
  const [creator, setCreator] = useState(null);
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [profileImageUrl, setProfileImageUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (address) {
      fetchCreator();
    } else {
      setLoading(false);
    }
  }, [address]);

  const fetchCreator = async () => {
    try {
      const { data, error } = await supabase
        .from('creators')
        .select('*')
        .eq('creatorId', address)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setCreator(data);
    } catch (err) {
      setError('Failed to fetch creator profile');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOnboard = async () => {
    if (!address) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from('creators')
        .upsert({
          creatorId: address,
          displayName,
          bio,
          profileImageUrl,
          createdAt: new Date().toISOString(),
        });

      if (error) throw error;
      fetchCreator();
    } catch (err) {
      setError('Failed to onboard creator');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!address) {
    return (
      <div className="container py-lg">
        <AppHeader />
        <p className="text-center">Connect your wallet to onboard as a creator.</p>
      </div>
    );
  }

  if (creator) {
    return (
      <div className="container py-lg">
        <AppHeader variant="withProfile" />
        <h1 className="text-display mb-lg">Welcome, {creator.displayName}</h1>
        <p>Your unique link: /creators/{address}</p>
      </div>
    );
  }

  return (
    <div className="container py-lg">
      <AppHeader />
      <h1 className="text-display mb-lg">Onboard as Creator</h1>
      {error && <p className="text-red-500 mb-md">{error}</p>}
      <input
        type="text"
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
        placeholder="Display Name"
        className="w-full p-md border border-text-secondary rounded-md mb-md"
      />
      <textarea
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        placeholder="Bio"
        className="w-full p-md border border-text-secondary rounded-md mb-md"
      />
      <input
        type="text"
        value={profileImageUrl}
        onChange={(e) => setProfileImageUrl(e.target.value)}
        placeholder="Profile Image URL"
        className="w-full p-md border border-text-secondary rounded-md mb-md"
      />
      <PrimaryButton onClick={handleOnboard} loading={loading}>
        Onboard
      </PrimaryButton>
    </div>
  );
}
  