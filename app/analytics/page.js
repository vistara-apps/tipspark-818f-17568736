'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { supabase, tipAPI, supporterAPI, analyticsAPI } from '../../lib/supabase';
import { AppHeader } from '../components/AppHeader';
import { AnalyticsTable } from '../components/AnalyticsTable';
import { PrimaryButton } from '../components/PrimaryButton';
import Link from 'next/link';

// Force dynamic rendering to bypass WagmiProvider prerender error
export const dynamic = 'force-dynamic';

// Creator Analytics View
export default function Analytics() {
  const { address, isConnected } = useAccount();
  const [summary, setSummary] = useState({ totalTips: 0, uniqueTippers: 0, averageTip: 0, tipCount: 0 });
  const [topSupporters, setTopSupporters] = useState([]);
  const [recentTips, setRecentTips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('all'); // 'all', 'week', 'month'
  const [shareUrl, setShareUrl] = useState('');

  useEffect(() => {
    if (address) {
      fetchAnalytics();
      // Generate shareable URL
      const baseUrl = window.location.origin;
      setShareUrl(`${baseUrl}/creators/${address}`);
    } else {
      setLoading(false);
    }
  }, [address, timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      // Fetch tips
      let tips = await tipAPI.getCreatorTips(address);
      
      // Filter by time range if needed
      if (timeRange !== 'all') {
        const now = new Date();
        const cutoffDate = new Date();
        
        if (timeRange === 'week') {
          cutoffDate.setDate(now.getDate() - 7);
        } else if (timeRange === 'month') {
          cutoffDate.setMonth(now.getMonth() - 1);
        }
        
        tips = tips.filter(tip => new Date(tip.timestamp) >= cutoffDate);
      }
      
      // Set recent tips
      setRecentTips(tips.slice(0, 10));
      
      // Calculate summary
      const totalTips = tips.reduce((sum, tip) => sum + parseFloat(tip.amount), 0);
      const uniqueTippers = new Set(tips.map(tip => tip.senderWalletAddress)).size;
      const averageTip = uniqueTippers > 0 ? (totalTips / uniqueTippers).toFixed(2) : 0;
      
      setSummary({ 
        totalTips, 
        uniqueTippers, 
        averageTip,
        tipCount: tips.length
      });
      
      // Fetch top supporters
      const supporters = await supporterAPI.getTopSupporters(address, 10);
      setTopSupporters(supporters);
    } catch (err) {
      setError('Failed to load analytics data');
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
          <h1 className="text-display mb-md">Analytics Dashboard</h1>
          <p className="text-body text-center mb-lg">
            Connect your wallet to view your tipping analytics.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container">
        <AppHeader variant="withProfile" />
        <div className="flex justify-center items-center py-xl">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <AppHeader variant="withProfile" />
        <div className="bg-red-100 border border-red-400 text-red-700 px-lg py-md rounded mb-lg">
          <h2 className="text-heading mb-sm">Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <AppHeader variant="withProfile" />
      
      <div className="mb-lg">
        <h1 className="text-display mb-md">Analytics Dashboard</h1>
        <p className="text-body mb-md">
          Track your tipping performance and understand your supporters.
        </p>
      </div>
      
      <div className="mb-lg">
        <div className="flex justify-between items-center mb-md">
          <h2 className="text-heading">Share Your Profile</h2>
          <div className="flex space-x-xs">
            <button 
              onClick={() => setTimeRange('all')}
              className={`px-md py-sm rounded-md text-sm ${timeRange === 'all' ? 'bg-primary text-white' : 'bg-bg text-text-secondary'}`}
            >
              All Time
            </button>
            <button 
              onClick={() => setTimeRange('month')}
              className={`px-md py-sm rounded-md text-sm ${timeRange === 'month' ? 'bg-primary text-white' : 'bg-bg text-text-secondary'}`}
            >
              Last Month
            </button>
            <button 
              onClick={() => setTimeRange('week')}
              className={`px-md py-sm rounded-md text-sm ${timeRange === 'week' ? 'bg-primary text-white' : 'bg-bg text-text-secondary'}`}
            >
              Last Week
            </button>
          </div>
        </div>
        
        <div className="flex items-center mb-lg">
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
      </div>
      
      <AnalyticsTable data={summary} variant="summary" className="mb-lg" />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-lg mb-lg">
        <div>
          <h2 className="text-heading mb-md">Top Supporters</h2>
          <AnalyticsTable data={topSupporters} variant="supporters" />
        </div>
        
        <div>
          <h2 className="text-heading mb-md">Recent Tips</h2>
          {recentTips.length === 0 ? (
            <div className="bg-surface p-lg rounded-lg shadow-card">
              <p className="text-text-secondary">No tips received yet.</p>
            </div>
          ) : (
            <div className="bg-surface p-lg rounded-lg shadow-card overflow-auto max-h-96">
              <div className="space-y-sm">
                {recentTips.map((tip, index) => (
                  <div key={index} className="bg-bg p-md rounded-md">
                    <div className="flex justify-between items-start mb-xs">
                      <div className="text-sm text-text-secondary">
                        From: {tip.senderWalletAddress.slice(0, 6)}...{tip.senderWalletAddress.slice(-4)}
                      </div>
                      <div className="font-medium text-primary">
                        {parseFloat(tip.amount).toFixed(2)} USDC
                      </div>
                    </div>
                    <p className="text-body">{tip.message}</p>
                    <div className="text-xs text-text-secondary mt-xs">
                      {new Date(tip.timestamp).toLocaleDateString()} {new Date(tip.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="bg-surface p-lg rounded-lg shadow-card mb-lg">
        <h2 className="text-heading mb-md">Earnings Breakdown</h2>
        <p className="text-body mb-md">
          You've received a total of {summary.tipCount} tips from {summary.uniqueTippers} unique supporters.
          Your average tip amount is {summary.averageTip} USDC.
        </p>
        <p className="text-body mb-md">
          TipSpark charges a 0.1% service fee (capped at $1 per tip). The rest goes directly to you.
        </p>
        <div className="flex justify-center">
          <Link href="/">
            <PrimaryButton>Return to Home</PrimaryButton>
          </Link>
        </div>
      </div>
    </div>
  );
}
