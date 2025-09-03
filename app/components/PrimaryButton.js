'use client';

export function PrimaryButton({ children, onClick, variant = 'default', loading = false, disabled = false }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className="bg-primary text-white py-md px-lg rounded-lg font-medium hover:bg-opacity-90 transition-base disabled:opacity-50"
    >
      {loading ? 'Loading...' : children}
    </button>
  );
}
  