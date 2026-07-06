const FormField = ({ label, error, children, required }) => (
  <div className="space-y-1">
    {label && (
      <label className="block text-sm font-medium text-slate-700">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
    )}
    {children}
    {error && <p className="text-xs text-red-600">{error}</p>}
  </div>
);

export default FormField;
