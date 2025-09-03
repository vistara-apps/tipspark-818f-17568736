'use client';

import Link from 'next/link';
import { useAccount } from 'wagmi';
import { ConnectWallet } from '@coinbase/onchainkit/wallet';

export function AppHeader({ variant = 'withLogo' }) {
  const { address } = useAccount();

  return (
    <header className="py-md bg-surface shadow-card flex justify-between items-center">
      <div className="container">
        {variant === 'withLogo' && (
          <Link href="/" className="text-display text-primary">
            TipSpark
          </Link>
        )}
        {variant === 'withProfile' && address && (
          <Link href="/analytics" className="text-heading">
            Analytics
          </Link>
        )}
        <ConnectWallet />
      </div>
    </header>
  );
}
  