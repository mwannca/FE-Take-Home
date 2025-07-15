import React, { useRef, useEffect, useState, memo, useCallback } from 'react';
import { Fruit, FruitTableViewProps } from '@/types';
import { TABLE_COLUMNS } from '@/constants';

const FruitTableView = memo(({ fruits, onAddFruit, onViewFruit }: FruitTableViewProps) => {
  // --- Scroll hint logic ---
  const containerRef = useRef<HTMLDivElement>(null);
  const [showScrollHint, setShowScrollHint] = useState(false);
  const [atEnd, setAtEnd] = useState(false);

  useEffect(() => {
    const checkOverflow = () => {
      const el = containerRef.current;
      if (!el) return;
      setShowScrollHint(el.scrollWidth > el.clientWidth);
      setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 2); // fudge for rounding
    };
    checkOverflow();
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener('scroll', checkOverflow);
    window.addEventListener('resize', checkOverflow);
    return () => {
      el.removeEventListener('scroll', checkOverflow);
      window.removeEventListener('resize', checkOverflow);
    };
  }, [fruits]);

  const handleRowClick = useCallback((fruit: Fruit) => {
    onViewFruit?.(fruit);
  }, [onViewFruit]);

  const handleAddClick = useCallback((e: React.MouseEvent, fruit: Fruit) => {
    e.stopPropagation();
    onAddFruit(fruit);
  }, [onAddFruit]);

  const handleRowKeyDown = useCallback((e: React.KeyboardEvent, fruit: Fruit) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleRowClick(fruit);
    }
  }, [handleRowClick]);

  // Safety check for undefined fruits
  if (!fruits || !Array.isArray(fruits)) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No fruits available. Please check your connection.</p>
      </div>
    );
  }

  return (
    <div className="relative overflow-x-auto" ref={containerRef} role="region" aria-label="Fruit table">
      {/* Scroll hint overlay */}
      {showScrollHint && !atEnd && (
        <>
          <div className="pointer-events-none absolute top-0 right-0 h-full w-16 bg-gradient-to-l from-white/90 to-transparent z-10" aria-hidden="true" />
          <div className="pointer-events-none absolute bottom-2 right-4 z-20 flex items-center space-x-2 text-base text-primary-600 font-semibold select-none animate-pulse bg-white/80 px-3 py-1 rounded-lg shadow-md">
            <span>Scroll for more</span>
            <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
          </div>
        </>
      )}
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {TABLE_COLUMNS.map((column) => (
              <th key={column.key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {column.label}
              </th>
            ))}
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {fruits.map((fruit) => (
            <tr 
              key={fruit.id} 
              className="hover:bg-blue-50 focus-within:bg-blue-50 cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
              onClick={() => handleRowClick(fruit)}
              onKeyDown={(e) => handleRowKeyDown(e, fruit)}
              tabIndex={0}
              role="row"
              aria-label={`${fruit.name}, ${fruit.family} family, ${fruit.calories} calories. Click to view details.`}
            >
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{fruit.name}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{fruit.family}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{fruit.order}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{fruit.genus}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{fruit.calories}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <button
                  className="px-3 py-1 bg-primary-600 hover:bg-primary-700 text-white text-xs font-medium rounded transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                  onClick={(e) => handleAddClick(e, fruit)}
                  aria-label={`Add ${fruit.name} to jar`}
                >
                  Add
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});

FruitTableView.displayName = 'FruitTableView';

export default FruitTableView; 