const ErrorAlert = ({ message, onClose }) => (
  <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-start justify-between gap-3">
    <span>{message}</span>
    {onClose && (
      <button type="button" onClick={onClose} className="text-red-500 hover:text-red-700 font-medium shrink-0">
        Dismiss
      </button>
    )}
  </div>
);

export default ErrorAlert;
