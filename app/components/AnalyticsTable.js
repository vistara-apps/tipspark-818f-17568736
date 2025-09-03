'use client';

export function AnalyticsTable({ data, variant = 'summary', className = '' }) {
  if (variant === 'summary') {
    return (
      <div className={`bg-surface p-lg rounded-lg shadow-card ${className}`}>
        <h3 className="text-heading mb-md">Summary</h3>
        <div className="grid grid-cols-3 gap-md">
          <div className="bg-bg p-md rounded-md">
            <p className="text-caption text-text-secondary">Total Tips</p>
            <p className="text-heading text-primary">{data.totalTips.toFixed(2)} USDC</p>
          </div>
          <div className="bg-bg p-md rounded-md">
            <p className="text-caption text-text-secondary">Unique Tippers</p>
            <p className="text-heading">{data.uniqueTippers}</p>
          </div>
          <div className="bg-bg p-md rounded-md">
            <p className="text-caption text-text-secondary">Average Tip</p>
            <p className="text-heading text-accent">{data.averageTip} USDC</p>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'supporters') {
    if (!data || data.length === 0) {
      return (
        <div className={`bg-surface p-lg rounded-lg shadow-card ${className}`}>
          <h3 className="text-heading mb-md">Top Supporters</h3>
          <p className="text-body text-text-secondary">No supporters yet. Share your profile to start receiving tips!</p>
        </div>
      );
    }
    
    return (
      <div className={`bg-surface p-lg rounded-lg shadow-card overflow-auto ${className}`}>
        <h3 className="text-heading mb-md">Top Supporters</h3>
        <table className="w-full">
          <thead>
            <tr className="border-b border-text-secondary border-opacity-20">
              <th className="text-left p-sm text-caption text-text-secondary">Address</th>
              <th className="text-left p-sm text-caption text-text-secondary">Total Tipped</th>
              <th className="text-left p-sm text-caption text-text-secondary">Tip Count</th>
              <th className="text-left p-sm text-caption text-text-secondary">Last Tipped</th>
            </tr>
          </thead>
          <tbody>
            {data.map((supporter, index) => (
              <tr key={index} className="border-b border-text-secondary border-opacity-10 hover:bg-bg">
                <td className="p-sm font-medium">
                  {supporter.supporterId.slice(0, 6)}...{supporter.supporterId.slice(-4)}
                </td>
                <td className="p-sm text-primary font-medium">{supporter.totalTipped.toFixed(2)} USDC</td>
                <td className="p-sm">{supporter.tipCount}</td>
                <td className="p-sm text-text-secondary">
                  {new Date(supporter.lastTippedAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return null;
}
