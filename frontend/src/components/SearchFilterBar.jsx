const SearchFilterBar = ({
  search,
  onSearchChange,
  filters = [],
  onFilterChange,
  filterValues = {},
  placeholder = 'Search...',
}) => (
  <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
    <div className="relative flex-1">
      <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        type="text"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-slate-300 py-2 pl-10 pr-4 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
      />
    </div>
    {filters.map((filter) => (
      <select
        key={filter.key}
        value={filterValues[filter.key] || ''}
        onChange={(e) => onFilterChange(filter.key, e.target.value)}
        className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
      >
        {filter.options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    ))}
  </div>
);

export default SearchFilterBar;
