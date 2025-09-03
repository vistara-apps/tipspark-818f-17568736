# TipSpark API Documentation

This document provides comprehensive documentation for the TipSpark application's API endpoints and integration points.

## Overview

TipSpark is a Base Wallet MiniApp that allows users to send personalized tips in USDC to creators and provides creators with basic tipping analytics. The application integrates with several external services:

1. **Supabase** - For database storage and retrieval
2. **Base Blockchain** - For on-chain USDC transfers
3. **Privy** - For wallet authentication
4. **Farcaster** - For social integration (optional)

## Database Schema

### Tables

#### 1. creators

Stores information about creators who can receive tips.

```sql
CREATE TABLE creators (
  creatorId TEXT PRIMARY KEY,
  displayName TEXT,
  profileImageUrl TEXT,
  bio TEXT,
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 2. tips

Records all tips sent through the platform.

```sql
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

CREATE INDEX idx_tips_receiver ON tips(receiverCreatorId);
CREATE INDEX idx_tips_sender ON tips(senderWalletAddress);
```

#### 3. supporters

Aggregates information about supporters for each creator.

```sql
CREATE TABLE supporters (
  supporterId TEXT NOT NULL,
  creatorId TEXT NOT NULL REFERENCES creators(creatorId),
  totalTipped DECIMAL DEFAULT 0,
  tipCount INTEGER DEFAULT 0,
  lastTippedAt TIMESTAMP WITH TIME ZONE,
  PRIMARY KEY (supporterId, creatorId)
);

CREATE INDEX idx_supporters_creator ON supporters(creatorId);
```

## API Endpoints

### Creator API

#### Get Creator

Retrieves a creator's profile by their ID (wallet address).

```javascript
// Example usage
const creator = await creatorAPI.getCreator(creatorId);
```

#### Upsert Creator

Creates or updates a creator's profile.

```javascript
// Example usage
await creatorAPI.upsertCreator({
  creatorId: address,
  displayName: 'Creator Name',
  bio: 'Creator bio',
  profileImageUrl: 'https://example.com/image.jpg',
  createdAt: new Date().toISOString()
});
```

### Tip API

#### Create Tip

Records a new tip in the database.

```javascript
// Example usage
await tipAPI.createTip({
  senderWalletAddress: sender,
  receiverCreatorId: creatorId,
  amount: 10.0,
  message: 'Great content!',
  timestamp: new Date().toISOString(),
  transactionHash: '0x123...',
  feeAmount: 0.01
});
```

#### Get Creator Tips

Retrieves all tips received by a creator.

```javascript
// Example usage
const tips = await tipAPI.getCreatorTips(creatorId);
```

#### Get Supporter Tips

Retrieves all tips sent by a supporter.

```javascript
// Example usage
const tips = await tipAPI.getSupporterTips(supporterId);
```

### Supporter API

#### Update Supporter

Updates a supporter's statistics after sending a tip.

```javascript
// Example usage
await supporterAPI.updateSupporter(supporterId, creatorId, 10.0);
```

#### Get Top Supporters

Retrieves the top supporters for a creator.

```javascript
// Example usage
const supporters = await supporterAPI.getTopSupporters(creatorId, 10);
```

### Analytics API

#### Get Creator Summary

Retrieves summary statistics for a creator.

```javascript
// Example usage
const summary = await analyticsAPI.getCreatorSummary(creatorId);
// Returns: { totalTips, uniqueTippers, averageTip, tipCount }
```

## Blockchain Integration

### USDC Transfer

TipSpark uses the USDC token on Base for tipping. The contract address is:

```
0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
```

The application uses the standard ERC-20 `transfer` function to send USDC from the tipper to the creator:

```javascript
// Example transaction
const calls = [
  {
    to: USDC_ADDRESS,
    abi: USDC_ABI,
    functionName: 'transfer',
    args: [creatorId, parseUnits(amount, USDC_DECIMALS)],
  },
];
```

### Fee Calculation

TipSpark charges a 0.1% service fee on each tip, capped at $1 USD per tip.

```javascript
// Fee calculation
const calculateFee = (amount) => {
  if (!amount || isNaN(parseFloat(amount))) return 0;
  const amountValue = parseFloat(amount);
  return Math.min(amountValue * 0.001, 1); // 0.1% capped at $1
};
```

## Authentication

TipSpark uses Privy for wallet authentication. The application integrates with Privy to:

1. Connect user wallets
2. Manage user sessions
3. Handle wallet signing for transactions

## Farcaster Integration

TipSpark can optionally integrate with Farcaster for social features. This includes:

1. Connecting Farcaster accounts to creator profiles
2. Sharing tip links on Farcaster
3. Discovering creators through Farcaster

## Error Handling

The application implements comprehensive error handling for all API calls and blockchain transactions. Errors are caught and displayed to the user with appropriate messages.

## Rate Limiting

API calls to external services are rate-limited to prevent abuse:

- Supabase: Default rate limits apply
- Blockchain RPC: Managed through Alchemy with appropriate backoff strategies

## Security Considerations

1. All user inputs are validated before processing
2. Transactions require explicit user confirmation
3. No private keys are stored on the server
4. Database access is restricted through Supabase RLS policies

## Development and Testing

For local development and testing:

1. Use a local Supabase instance or a development project
2. Connect to Base testnet for blockchain interactions
3. Use test USDC for transactions

## Deployment

The application is deployed as a Base Wallet MiniApp, which requires:

1. Hosting the frontend on a static hosting service
2. Configuring the Base Wallet integration
3. Setting up the necessary environment variables

## Environment Variables

The following environment variables are required:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_ONCHAINKIT_API_KEY=your-onchainkit-api-key
```

## Support and Contact

For API support or questions, contact the TipSpark team at support@tipspark.xyz.

