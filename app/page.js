'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { supabase, creatorAPI } from '../lib/supabase';
import { AppHeader } from './components/AppHeader';
import { PrimaryButton } from './components/PrimaryButton';
import { CreatorCard } from './components/CreatorCard';
import Link from 'next/link';

// Force dynamic rendering to bypass WagmiProvider prerender error
export const dynamic = 'force-dynamic';

// Creator Onboarding Flow
export default function Home() {
  const { address, isConnected } = useAccount();
  const [creator, setCreator] = useState(null);
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [profileImageUrl, setProfileImageUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [shareUrl, setShareUrl] = useState('');

  useEffect(() => {
    if (address) {
      fetchCreator();
      // Generate shareable URL
      const baseUrl = window.location.origin;
      setShareUrl(`${baseUrl}/creators/${address}`);
    } else {
      setLoading(false);
    }
  }, [address]);

  const fetchCreator = async () => {
    try {
      setLoading(true);
      const data = await creatorAPI.getCreator(address);
      setCreator(data);
      
      // Pre-fill form if editing
      if (data) {
        setDisplayName(data.displayName || '');
        setBio(data.bio || '');
        setProfileImageUrl(data.profileImageUrl || '');
      }
    } catch (err) {
      console.error('Failed to fetch creator profile:', err);
      // Not setting error here as this is expected for new creators
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!displayName.trim()) {
      errors.displayName = 'Display name is required';
    }
    
    if (profileImageUrl && !isValidUrl(profileImageUrl)) {
      errors.profileImageUrl = 'Please enter a valid URL';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  };

  const handleOnboard = async () => {
    if (!address) return;
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      await creatorAPI.upsertCreator({
        creatorId: address,
        displayName,
        bio,
        profileImageUrl,
        createdAt: new Date().toISOString(),
      });
      
      await fetchCreator();
    } catch (err) {
      setError('Failed to save creator profile: ' + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('Link copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (!isConnected) {
    return (
      <div className="container">
        <AppHeader />
        <div className="flex flex-col items-center justify-center py-xl">
          <h1 className="text-display mb-md text-center">Welcome to <span className="text-accent">Tip</span>Spark</h1>
          <p className="text-body text-center mb-lg max-w-md">
            Spark joy for creators with instant, personalized tips on Base.
            Connect your wallet to get started.
          </p>
          <div className="bg-surface p-lg rounded-lg shadow-card mb-lg max-w-md w-full">
            <h2 className="text-heading mb-md">Get Started</h2>
            <p className="text-body mb-md">Connect your wallet to:</p>
            <ul className="list-disc pl-lg mb-lg">
              <li className="mb-sm">Onboard as a creator</li>
              <li className="mb-sm">Receive personalized tips</li>
              <li className="mb-sm">View your tipping analytics</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  if (creator) {
    return (
      <div className="container">
        <AppHeader variant="withProfile" />
        <div className="mb-lg">
          <h1 className="text-display mb-md">Welcome, {creator.displayName}</h1>
          <p className="text-body mb-md">Your creator profile is ready! Share your unique link to start receiving tips.</p>
        </div>
        
        <div className="bg-surface p-lg rounded-lg shadow-card mb-lg">
          <h2 className="text-heading mb-md">Your Creator Profile</h2>
          <CreatorCard creator={creator} variant="withAvatar" />
          
          <div className="mt-lg">
            <h3 className="text-heading mb-sm">Share Your Profile</h3>
            <div className="flex items-center mb-md">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-grow p-md border border-text-secondary rounded-l-md focus:shadow-focus outline-none bg-bg"
              />
              <button
                onClick={() => copyToClipboard(shareUrl)}
                className="bg-primary text-white py-md px-lg rounded-r-md hover:bg-opacity-90"
              >
                Copy
              </button>
            </div>
            
            <div className="flex space-x-md">
              <Link href="/analytics">
                <PrimaryButton>View Analytics</PrimaryButton>
              </Link>
              <PrimaryButton 
                variant="secondary" 
                onClick={() => setCreator(null)}
              >
                Edit Profile
              </PrimaryButton>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <AppHeader />
      <div className="max-w-md mx-auto">
        <h1 className="text-display mb-md">{creator ? 'Edit' : 'Create'} Creator Profile</h1>
        <p className="text-body mb-lg">
          Set up your creator profile to start receiving personalized tips from your supporters.
        </p>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-md py-sm rounded mb-md">
            {error}
          </div>
        )}
        
        <div className="bg-surface p-lg rounded-lg shadow-card mb-lg">
          <div className="mb-md">
            <label htmlFor="displayName" className="block text-caption mb-xs">
              Display Name*
            </label>
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your creator name"
              className={`w-full p-md border rounded-md focus:shadow-focus outline-none ${
                formErrors.displayName ? 'border-red-500' : 'border-text-secondary'
              }`}
            />
            {formErrors.displayName && (
              <p className="text-red-500 text-sm mt-xs">{formErrors.displayName}</p>
            )}
          </div>
          
          <div className="mb-md">
            <label htmlFor="bio" className="block text-caption mb-xs">
              Bio
            </label>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell your supporters about yourself"
              rows={4}
              className="w-full p-md border border-text-secondary rounded-md focus:shadow-focus outline-none resize-none"
            />
          </div>
          
          <div className="mb-lg">
            <label htmlFor="profileImageUrl" className="block text-caption mb-xs">
              Profile Image URL
            </label>
            <input
              id="profileImageUrl"
              type="text"
              value={profileImageUrl}
              onChange={(e) => setProfileImageUrl(e.target.value)}
              placeholder="https://example.com/your-image.jpg"
              className={`w-full p-md border rounded-md focus:shadow-focus outline-none ${
                formErrors.profileImageUrl ? 'border-red-500' : 'border-text-secondary'
              }`}
            />
            {formErrors.profileImageUrl && (
              <p className="text-red-500 text-sm mt-xs">{formErrors.profileImageUrl}</p>
            )}
          </div>
          
          <PrimaryButton 
            onClick={handleOnboard} 
            loading={loading} 
            className="w-full"
          >
            {creator ? 'Update Profile' : 'Create Profile'}
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}
