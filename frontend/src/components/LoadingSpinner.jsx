const sizes = { sm: 'h-5 w-5', md: 'h-8 w-8', lg: 'h-12 w-12' };

const LoadingSpinner = ({ size = 'md', className = '' }) => (
  <div
    className={`animate-spin rounded-full border-2 border-brand-200 border-t-brand-600 ${sizes[size]} ${className}`}
    role="status"
    aria-label="Loading"
  />
);

export default LoadingSpinner;
