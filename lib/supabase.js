import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dummy.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database schema definition (for documentation)
/*
CREATE TABLE creators (
  creatorId TEXT PRIMARY KEY,
  displayName TEXT,
  profileImageUrl TEXT,
  bio TEXT,
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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

CREATE TABLE supporters (
  supporterId TEXT NOT NULL,
  creatorId TEXT NOT NULL REFERENCES creators(creatorId),
  totalTipped DECIMAL DEFAULT 0,
  tipCount INTEGER DEFAULT 0,
  lastTippedAt TIMESTAMP WITH TIME ZONE,
  PRIMARY KEY (supporterId, creatorId)
);

CREATE INDEX idx_tips_receiver ON tips(receiverCreatorId);
CREATE INDEX idx_tips_sender ON tips(senderWalletAddress);
CREATE INDEX idx_supporters_creator ON supporters(creatorId);
*/

// Creator API
export const creatorAPI = {
  // Get a creator by ID
  getCreator: async (creatorId) => {
    const { data, error } = await supabase
      .from('creators')
      .select('*')
      .eq('creatorId', creatorId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },
  
  // Create or update a creator
  upsertCreator: async (creator) => {
    const { data, error } = await supabase
      .from('creators')
      .upsert(creator);
    
    if (error) throw error;
    return data;
  }
};

// Tip API
export const tipAPI = {
  // Record a new tip
  createTip: async (tip) => {
    const { data, error } = await supabase
      .from('tips')
      .insert(tip);
    
    if (error) throw error;
    return data;
  },
  
  // Get tips received by a creator
  getCreatorTips: async (creatorId) => {
    const { data, error } = await supabase
      .from('tips')
      .select('*')
      .eq('receiverCreatorId', creatorId)
      .order('timestamp', { ascending: false });
    
    if (error) throw error;
    return data;
  },
  
  // Get tips sent by a supporter
  getSupporterTips: async (supporterId) => {
    const { data, error } = await supabase
      .from('tips')
      .select('*')
      .eq('senderWalletAddress', supporterId)
      .order('timestamp', { ascending: false });
    
    if (error) throw error;
    return data;
  }
};

// Supporter API
export const supporterAPI = {
  // Update supporter stats after a tip
  updateSupporter: async (supporterId, creatorId, tippedAmount) => {
    // First, check if the supporter exists
    const { data: existing, error: fetchError } = await supabase
      .from('supporters')
      .select('*')
      .eq('supporterId', supporterId)
      .eq('creatorId', creatorId)
      .single();
    
    if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;
    
    const newTotal = (existing?.totalTipped || 0) + tippedAmount;
    const newCount = (existing?.tipCount || 0) + 1;
    
    const { data, error } = await supabase
      .from('supporters')
      .upsert({
        supporterId,
        creatorId,
        totalTipped: newTotal,
        tipCount: newCount,
        lastTippedAt: new Date().toISOString(),
      });
    
    if (error) throw error;
    return data;
  },
  
  // Get top supporters for a creator
  getTopSupporters: async (creatorId, limit = 10) => {
    const { data, error } = await supabase
      .from('supporters')
      .select('*')
      .eq('creatorId', creatorId)
      .order('totalTipped', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data;
  }
};

// Analytics API
export const analyticsAPI = {
  // Get summary statistics for a creator
  getCreatorSummary: async (creatorId) => {
    // Get all tips for the creator
    const { data: tips, error: tipsError } = await supabase
      .from('tips')
      .select('*')
      .eq('receiverCreatorId', creatorId);
    
    if (tipsError) throw tipsError;
    
    // Calculate summary statistics
    const totalTips = tips.reduce((sum, tip) => sum + parseFloat(tip.amount), 0);
    const uniqueTippers = new Set(tips.map(tip => tip.senderWalletAddress)).size;
    const averageTip = uniqueTippers > 0 ? (totalTips / uniqueTippers).toFixed(2) : 0;
    
    return {
      totalTips,
      uniqueTippers,
      averageTip,
      tipCount: tips.length
    };
  }
};
