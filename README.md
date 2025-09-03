# TipSpark

![TipSpark Logo](https://via.placeholder.com/200x60?text=TipSpark)

Spark joy for creators with instant, personalized tips on Base.

## Overview

TipSpark is a Base Wallet MiniApp that allows users to send personalized tips in USDC to creators and provides creators with basic tipping analytics. The application is built on the Base blockchain and uses Supabase for data storage.

## Features

### Personalized Tipping
- Send USDC tips to creators with personalized messages
- Simple and intuitive tipping interface
- Transaction fee of 0.1% (capped at $1 per tip)

### Creator Profiles
- Create and customize your creator profile
- Share your unique tipping link
- View your profile as others see it

### Analytics Dashboard
- Track total tips received
- Identify top supporters
- View tip history with messages
- Filter analytics by time period

## Tech Stack

- **Frontend**: Next.js, React, Tailwind CSS
- **Blockchain**: Base, USDC, Viem, Wagmi
- **Authentication**: Privy, OnchainKit
- **Database**: Supabase
- **Wallet Integration**: Base Wallet, Coinbase Wallet

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- Base Wallet

### Installation

1. Clone the repository:
```bash
git clone https://github.com/vistara-apps/tipspark-818f-17568736.git
cd tipspark-818f-17568736
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Set up environment variables:
Create a `.env.local` file with the following variables:
```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_ONCHAINKIT_API_KEY=your-onchainkit-api-key
```

4. Run the development server:
```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Database Setup

Run the following SQL commands in your Supabase SQL editor to set up the required tables:

```sql
-- Create creators table
CREATE TABLE creators (
  creatorId TEXT PRIMARY KEY,
  displayName TEXT,
  profileImageUrl TEXT,
  bio TEXT,
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tips table
CREATE TABLE tips (
  tipId UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  senderWalletAddress TEXT NOT NULL,
  receiverCreatorId TEXT NOT NULL REFERENCES creators(creatorId),
  amount DECIMAL NOT NULL,
  currency TEXT DEFAULT 'USDC',
  message TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  transactionHash TEXT,
  feeAmount DECIMAL
);

-- Create supporters table
CREATE TABLE supporters (
  supporterId TEXT NOT NULL,
  creatorId TEXT NOT NULL REFERENCES creators(creatorId),
  totalTipped DECIMAL DEFAULT 0,
  tipCount INTEGER DEFAULT 0,
  lastTippedAt TIMESTAMP WITH TIME ZONE,
  PRIMARY KEY (supporterId, creatorId)
);

-- Create indexes
CREATE INDEX idx_tips_receiver ON tips(receiverCreatorId);
CREATE INDEX idx_tips_sender ON tips(senderWalletAddress);
CREATE INDEX idx_supporters_creator ON supporters(creatorId);
```

## Usage

### Creator Onboarding

1. Connect your wallet
2. Fill in your creator profile details
3. Share your unique tipping link

### Sending Tips

1. Visit a creator's tipping page
2. Connect your wallet
3. Enter the tip amount and a personalized message
4. Confirm the transaction

### Viewing Analytics

1. Connect your wallet
2. Navigate to the Analytics page
3. View your tipping statistics and history

## API Documentation

For detailed API documentation, see [API_DOCUMENTATION.md](./API_DOCUMENTATION.md).

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- Base for providing the blockchain infrastructure
- Supabase for the database solution
- OnchainKit for wallet integration
- All the creators and tippers using TipSpark!

