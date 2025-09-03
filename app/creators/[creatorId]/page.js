'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAccount } from 'wagmi';
import { parseUnits } from 'viem';
import { base } from 'viem/chains';
import { Transaction, TransactionButton, TransactionStatus, TransactionStatusLabel, TransactionStatusAction } from '@coinbase/onchainkit/transaction';
import { USDC_ADDRESS, USDC_ABI, USDC_DECIMALS, calculateFee } from '../../../lib/usdc';
import { supabase, creatorAPI, tipAPI, supporterAPI } from '../../../lib/supabase';
import { AppHeader } from '../../components/AppHeader';
import { CreatorCard } from '../../components/CreatorCard';
import { TipInput } from '../../components/TipInput';
import { MessageInput } from '../../components/MessageInput';
import { PrimaryButton } from '../../components/PrimaryButton';
import Link from 'next/link';

// Force dynamic rendering to bypass WagmiProvider prerender error
export const dynamic = 'force-dynamic';

// Fan Tipping Flow
export default function CreatorProfile() {
  const { creatorId } = useParams();
  const { address: sender, isConnected } = useAccount();
  const [creator, setCreator] = useState(null);
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [txHash, setTxHash] = useState(null);
  const [tipSuccess, setTipSuccess] = useState(false);
  const [recentTips, setRecentTips] = useState([]);

  useEffect(() => {
    if (creatorId) {
      fetchCreator();
      fetchRecentTips();
    }
  }, [creatorId]);

  const fetchCreator = async () => {
    try {
      const data = await creatorAPI.getCreator(creatorId);
      if (!data) {
        setError('Creator not found');
        return;
      }
      setCreator(data);
    } catch (err) {
      setError('Failed to load creator profile');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentTips = async () => {
    try {
      const tips = await tipAPI.getCreatorTips(creatorId);
      setRecentTips(tips.slice(0, 5)); // Get 5 most recent tips
    } catch (err) {
      console.error('Failed to fetch recent tips:', err);
    }
  };

  const handleTipSuccess = async (hash) => {
    setTxHash(hash);
    try {
      const tipAmount = parseFloat(amount);
      const feeAmount = calculateFee(tipAmount);
      
      // Record the tip in the database
      await tipAPI.createTip({
        senderWalletAddress: sender,
        receiverCreatorId: creatorId,
        amount: tipAmount,
        message,
        timestamp: new Date().toISOString(),
        transactionHash: hash,
        feeAmount
      });

      // Update supporter stats
      await supporterAPI.updateSupporter(sender, creatorId, tipAmount);
      
      // Update UI
      setTipSuccess(true);
      setAmount('');
      setMessage('');
      
      // Refresh recent tips
      await fetchRecentTips();
    } catch (err) {
      console.error('Failed to record tip:', err);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <AppHeader />
        <div className="flex justify-center items-center py-xl">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <AppHeader />
        <div className="bg-red-100 border border-red-400 text-red-700 px-lg py-md rounded mb-lg">
          <h2 className="text-heading mb-sm">Error</h2>
          <p>{error}</p>
          <Link href="/" className="text-primary hover:underline mt-md inline-block">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  // Calculate transaction parameters
  const tipAmount = parseFloat(amount || '0');
  const fee = calculateFee(tipAmount);
  const totalAmount = tipAmount;
  
  const calls = amount ? [
    {
      to: USDC_ADDRESS,
      abi: USDC_ABI,
      functionName: 'transfer',
      args: [creatorId, parseUnits(amount, USDC_DECIMALS)],
    },
  ] : [];

  return (
    <div className="container">
      <AppHeader />
      
      <div className="max-w-2xl mx-auto">
        <CreatorCard creator={creator} variant="withAvatar" />
        
        {tipSuccess ? (
          <div className="bg-green-100 border border-green-400 text-green-700 px-lg py-md rounded mb-lg">
            <h2 className="text-heading mb-sm">Tip Sent Successfully!</h2>
            <p className="mb-md">Your tip of {amount} USDC has been sent to {creator.displayName}.</p>
            <p className="text-sm mb-md">Transaction: <a href={`https://basescan.org/tx/${txHash}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{txHash.slice(0, 10)}...{txHash.slice(-8)}</a></p>
            <div className="flex space-x-md mt-md">
              <PrimaryButton onClick={() => setTipSuccess(false)}>Send Another Tip</PrimaryButton>
              <Link href="/">
                <PrimaryButton variant="secondary">Return Home</PrimaryButton>
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-surface p-lg rounded-lg shadow-card mb-lg">
            <h2 className="text-heading mb-md">Send a Tip</h2>
            
            {!isConnected ? (
              <div className="text-center py-md">
                <p className="mb-md">Connect your wallet to send a tip to {creator.displayName}</p>
              </div>
            ) : (
              <>
                <TipInput 
                  value={amount} 
                  onChange={setAmount} 
                  className="mb-md" 
                />
                
                <MessageInput 
                  value={message} 
                  onChange={setMessage} 
                  className="mb-lg" 
                />
                
                {amount && message && sender ? (
                  <Transaction
                    chainId={base.id}
                    calls={calls}
                    onSuccess={(hash) => handleTipSuccess(hash)}
                  >
                    <TransactionButton 
                      text={`Send ${amount} USDC Tip`}
                      className="bg-primary text-white py-md px-lg rounded-lg font-medium hover:bg-opacity-90 transition-all duration-base focus:outline-none focus:shadow-focus w-full"
                    />
                    <TransactionStatus>
                      <div className="mt-md">
                        <TransactionStatusLabel />
                        <TransactionStatusAction />
                      </div>
                    </TransactionStatus>
                  </Transaction>
                ) : (
                  <PrimaryButton 
                    disabled={!amount || !message || !sender}
                    className="w-full opacity-50 cursor-not-allowed"
                  >
                    {!amount ? 'Enter Amount' : !message ? 'Add a Message' : 'Send Tip'}
                  </PrimaryButton>
                )}
                
                <div className="text-sm text-text-secondary mt-md">
                  <p>
                    By sending a tip, you agree to the TipSpark terms of service. 
                    A 0.1% service fee (max $1) will be applied.
                  </p>
                </div>
              </>
            )}
          </div>
        )}
        
        {recentTips.length > 0 && (
          <div className="bg-surface p-lg rounded-lg shadow-card mb-lg">
            <h3 className="text-heading mb-md">Recent Tips</h3>
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
  );
}
