'use client';

export function PrimaryButton({ 
  children, 
  onClick, 
  variant = 'default', 
  loading = false, 
  disabled = false,
  className = '',
  type = 'button'
}) {
  const baseClasses = "py-md px-lg rounded-lg font-medium transition-all duration-base focus:outline-none focus:shadow-focus";
  
  const variantClasses = {
    default: "bg-primary text-white hover:bg-opacity-90",
    loading: "bg-primary text-white opacity-75",
    secondary: "bg-bg text-primary border border-primary hover:bg-primary hover:text-white",
    accent: "bg-accent text-text-primary hover:bg-opacity-90"
  };
  
  const selectedVariant = loading ? 'loading' : variant;
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${variantClasses[selectedVariant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      {loading ? (
        <div className="flex items-center justify-center">
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading...
        </div>
      ) : children}
    </button>
  );
}
