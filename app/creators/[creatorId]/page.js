'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAccount } from 'wagmi';
import { parseUnits } from 'viem';
import { Transaction, TransactionButton, TransactionStatus, TransactionStatusLabel, TransactionStatusAction } from '@coinbase/onchainkit/transaction';
import { USDC_ADDRESS, USDC_ABI } from '../../../lib/usdc';
import { supabase } from '../../../lib/supabase';
import { AppHeader } from '../../components/AppHeader';
import { CreatorCard } from '../../components/CreatorCard';
import { TipInput } from '../../components/TipInput';
import { MessageInput } from '../../components/MessageInput';
import { PrimaryButton } from '../../components/PrimaryButton';

// Force dynamic rendering to bypass WagmiProvider prerender error
export const dynamic = 'force-dynamic';

// Fan Tipping Flow
export default function CreatorProfile() {
  const { creatorId } = useParams();
  const { address: sender } = useAccount();
  const [creator, setCreator] = useState(null);
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [txHash, setTxHash] = useState(null);

  useEffect(() => {
    fetchCreator();
  }, [creatorId]);

  const fetchCreator = async () => {
    try {
      const { data, error } = await supabase
        .from('creators')
        .select('*')
        .eq('creatorId', creatorId)
        .single();

      if (error) throw error;
      setCreator(data);
    } catch (err) {
      setError('Creator not found');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTipSuccess = async (hash) => {
    setTxHash(hash);
    try {
      const { error } = await supabase
        .from('tips')
        .insert({
          senderWalletAddress: sender,
          receiverCreatorId: creatorId,
          amount: parseFloat(amount),
          message,
          timestamp: new Date().toISOString(),
          transactionHash: hash,
        });

      if (error) throw error;
      // Update supporters table (aggregate)
      await updateSupporter(sender, parseFloat(amount));
    } catch (err) {
      console.error('Failed to record tip', err);
    }
  };

  const updateSupporter = async (supporterId, tippedAmount) => {
    const { data: existing, error: fetchError } = await supabase
      .from('supporters')
      .select('*')
      .eq('supporterId', supporterId)
      .eq('creatorId', creatorId) // Assuming per creator supporters
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

    const newTotal = (existing?.totalTipped || 0) + tippedAmount;
    const newCount = (existing?.tipCount || 0) + 1;

    const { error } = await supabase
      .from('supporters')
      .upsert({
        supporterId,
        creatorId,
        totalTipped: newTotal,
        tipCount: newCount,
        lastTippedAt: new Date().toISOString(),
      });

    if (error) throw error;
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  const calls = [
    {
      to: USDC_ADDRESS,
      abi: USDC_ABI,
      functionName: 'transfer',
      args: [creatorId, parseUnits(amount, 6)], // USDC has 6 decimals
    },
  ];

  return (
    <div className="container py-lg">
      <AppHeader />
      <CreatorCard creator={creator} variant="withAvatar" />
      <h2 className="text-heading my-md">Send a Tip</h2>
      <TipInput value={amount} onChange={setAmount} />
      <MessageInput value={message} onChange={setMessage} className="my-md" />
      {amount && message && sender && (
        <Transaction
          chainId={base.id}
          calls={calls}
          onSuccess={(hash) => handleTipSuccess(hash)}
        >
          <TransactionButton text="Send Tip" />
          <TransactionStatus>
            <TransactionStatusLabel />
            <TransactionStatusAction />
          </TransactionStatus>
        </Transaction>
      )}
      {txHash && <p>Tip sent! Tx: {txHash}</p>}
    </div>
  );
}
  