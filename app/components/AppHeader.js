'use client';

import Link from 'next/link';
import { useAccount } from 'wagmi';
import { ConnectWallet } from '@coinbase/onchainkit/wallet';

export function AppHeader({ variant = 'withLogo' }) {
  const { address, isConnected } = useAccount();

  return (
    <header className="py-md bg-surface shadow-card mb-lg">
      <div className="container flex justify-between items-center">
        <div className="flex items-center">
          {variant === 'withLogo' && (
            <Link href="/" className="text-display text-primary font-bold">
              <span className="text-accent">Tip</span>Spark
            </Link>
          )}
          {variant === 'withProfile' && isConnected && (
            <div className="flex space-x-md">
              <Link href="/" className="text-heading hover:text-primary transition-all duration-base">
                Home
              </Link>
              <Link href="/analytics" className="text-heading hover:text-primary transition-all duration-base">
                Analytics
              </Link>
              <Link 
                href={`/creators/${address}`} 
                className="text-heading hover:text-primary transition-all duration-base"
                target="_blank"
                rel="noopener noreferrer"
              >
                My Profile
              </Link>
            </div>
          )}
        </div>
        
        <div className="flex items-center">
          <ConnectWallet />
        </div>
      </div>
    </header>
  );
}
