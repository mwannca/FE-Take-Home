import React, { memo, useState, useCallback } from 'react';
import { useDebounce } from '@/hooks/useDebounce';

interface SearchInputProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  className?: string;
  'aria-label'?: string;
}

const SearchInput = memo(({ 
  onSearch, 
  placeholder = "Search fruits...", 
  className = "",
  'aria-label': ariaLabel = "Search fruits"
}: SearchInputProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setSearchTerm('');
      onSearch('');
    }
  }, [onSearch]);

  // Trigger search when debounced value changes
  React.useEffect(() => {
    onSearch(debouncedSearchTerm);
  }, [debouncedSearchTerm, onSearch]);

  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <svg 
          className="h-5 w-5 text-gray-400" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
          />
        </svg>
      </div>
      <input
        type="text"
        value={searchTerm}
        onChange={handleSearchChange}
        onKeyDown={handleKeyDown}
        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
        placeholder={placeholder}
        aria-label={ariaLabel}
        aria-describedby="search-description"
      />
      {searchTerm && (
        <button
          type="button"
          onClick={() => {
            setSearchTerm('');
            onSearch('');
          }}
          className="absolute inset-y-0 right-0 pr-3 flex items-center"
          aria-label="Clear search"
        >
          <svg 
            className="h-5 w-5 text-gray-400 hover:text-gray-600" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M6 18L18 6M6 6l12 12" 
            />
          </svg>
        </button>
      )}
      <span id="search-description" className="sr-only">
        Type to search fruits. Press Escape to clear the search.
      </span>
    </div>
  );
});

SearchInput.displayName = 'SearchInput';

export default SearchInput; 