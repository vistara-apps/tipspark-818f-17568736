'use client';

export function CreatorCard({ creator, variant = 'withAvatar' }) {
  return (
    <div className="bg-surface p-lg rounded-lg shadow-card">
      {variant === 'withAvatar' && creator.profileImageUrl && (
        <img src={creator.profileImageUrl} alt={creator.displayName} className="w-16 h-16 rounded-full mb-md" />
      )}
      {variant === 'withName' && <h2 className="text-heading mb-sm">{creator.displayName}</h2>}
      <p className="text-body">{creator.bio}</p>
    </div>
  );
}
  