'use client';

export function CreatorCard({ creator, variant = 'withAvatar' }) {
  if (!creator) return null;
  
  return (
    <div className="bg-surface p-lg rounded-lg shadow-card mb-lg">
      <div className="flex items-center mb-md">
        {(variant === 'withAvatar' || variant === 'withName') && creator.profileImageUrl && (
          <img 
            src={creator.profileImageUrl || 'https://via.placeholder.com/64'} 
            alt={creator.displayName || 'Creator'} 
            className="w-16 h-16 rounded-full mr-md object-cover border-2 border-accent"
          />
        )}
        <div>
          <h2 className="text-heading">{creator.displayName || 'Anonymous Creator'}</h2>
          {creator.creatorId && (
            <p className="text-caption text-text-secondary">
              {creator.creatorId.slice(0, 6)}...{creator.creatorId.slice(-4)}
            </p>
          )}
        </div>
      </div>
      {creator.bio && (
        <div className="bg-bg p-md rounded-md">
          <p className="text-body">{creator.bio}</p>
        </div>
      )}
    </div>
  );
}
