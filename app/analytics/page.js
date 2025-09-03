'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { supabase } from '../../lib/supabase';
import { AppHeader } from '../components/AppHeader';
import { AnalyticsTable } from '../components/AnalyticsTable';

// Force dynamic rendering to bypass WagmiProvider prerender error
export const dynamic = 'force-dynamic';

// Creator Analytics View
export default function Analytics() {
  const { address } = useAccount();
  const [summary, setSummary] = useState({ totalTips: 0, uniqueTippers: 0, averageTip: 0 });
  const [topSupporters, setTopSupporters] = useState([]);
  const [recentTips, setRecentTips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (address) {
      fetchAnalytics();
    } else {
      setLoading(false);
    }
  }, [address]);

  const fetchAnalytics = async () => {
    try {
      // Fetch tips
      const { data: tips, error: tipsError } = await supabase
        .from('tips')
        .select('*')
        .eq('receiverCreatorId', address)
        .order('timestamp', { ascending: false });

      if (tipsError) throw tipsError;

      setRecentTips(tips.slice(0, 10)); // Recent 10

      const totalTips = tips.reduce((sum, tip) => sum + tip.amount, 0);
      const uniqueTippers = new Set(tips.map((tip) => tip.senderWalletAddress)).size;
      const averageTip = uniqueTippers > 0 ? (totalTips / uniqueTippers).toFixed(2) : 0;

      setSummary({ totalTips, uniqueTippers, averageTip });

      // Fetch top supporters
      const { data: supporters, error: suppError } = await supabase
        .from('supporters')
        .select('*')
        .eq('creatorId', address)
        .order('totalTipped', { ascending: false })
        .limit(10);

      if (suppError) throw suppError;
      setTopSupporters(supporters);
    } catch (err) {
      setError('Failed to load analytics');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!address) return <p>Connect wallet to view analytics.</p>;
  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="container py-lg">
      <AppHeader variant="withLogo" />
      <h1 className="text-display mb-lg">Analytics Dashboard</h1>
      <AnalyticsTable data={summary} variant="summary" />
      <AnalyticsTable data={topSupporters} variant="supporters" className="my-lg" />
      <h3 className="text-heading my-md">Recent Tips</h3>
      <ul>
        {recentTips.map((tip, index) => (
          <li key={index} className="bg-surface p-md rounded-md mb-sm">
            <p>From: {tip.senderWalletAddress.slice(0, 6)}... Amount: {tip.amount} USDC</p>
            <p>Message: {tip.message}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
  