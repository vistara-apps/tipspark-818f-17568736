'use client';

export function AnalyticsTable({ data, variant = 'summary' }) {
  if (variant === 'summary') {
    return (
      <div className="bg-surface p-lg rounded-lg shadow-card">
        <h3 className="text-heading mb-md">Summary</h3>
        <p>Total Tips: {data.totalTips}</p>
        <p>Unique Tippers: {data.uniqueTippers}</p>
        <p>Average Tip: {data.averageTip}</p>
      </div>
    );
  }

  if (variant === 'supporters') {
    return (
      <div className="bg-surface p-lg rounded-lg shadow-card overflow-auto">
        <h3 className="text-heading mb-md">Top Supporters</h3>
        <table className="w-full">
          <thead>
            <tr>
              <th className="text-left p-sm">Address</th>
              <th className="text-left p-sm">Total Tipped</th>
              <th className="text-left p-sm">Tip Count</th>
            </tr>
          </thead>
          <tbody>
            {data.map((supporter, index) => (
              <tr key={index}>
                <td className="p-sm">{supporter.supporterId.slice(0, 6)}...{supporter.supporterId.slice(-4)}</td>
                <td className="p-sm">{supporter.totalTipped}</td>
                <td className="p-sm">{supporter.tipCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return null;
}
  