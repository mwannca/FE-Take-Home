import React, { memo, useState, useCallback, useMemo } from 'react';
import { Fruit, FruitListViewProps } from '@/types';

const ITEM_HEIGHT = 80; // Height of each fruit item
const CONTAINER_HEIGHT = 600; // Height of the visible container
const BUFFER_SIZE = 5; // Number of items to render outside visible area

const FruitListView = memo(({ fruits = [], onAddFruit, onViewFruit }: FruitListViewProps) => {
  const [scrollTop, setScrollTop] = useState(0);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  // Calculate which items should be visible
  const visibleRange = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - BUFFER_SIZE);
    const endIndex = Math.min(
      fruits.length - 1,
      Math.ceil((scrollTop + CONTAINER_HEIGHT) / ITEM_HEIGHT) + BUFFER_SIZE
    );
    return { startIndex, endIndex };
  }, [scrollTop, fruits.length]);

  // Get only the visible items
  const visibleFruits = useMemo(() => {
    return fruits.slice(visibleRange.startIndex, visibleRange.endIndex + 1);
  }, [fruits, visibleRange]);

  // Calculate total height for proper scrolling
  const totalHeight = fruits.length * ITEM_HEIGHT;

  // Calculate offset for visible items
  const offsetY = visibleRange.startIndex * ITEM_HEIGHT;

  const handleFruitClick = useCallback((fruit: Fruit) => {
    onViewFruit?.(fruit);
  }, [onViewFruit]);

  const handleAddClick = useCallback((e: React.MouseEvent, fruit: Fruit) => {
    e.stopPropagation(); // Prevent triggering the fruit click
    onAddFruit(fruit);
  }, [onAddFruit]);

  return (
    <div 
      className="border border-gray-200 rounded-lg overflow-hidden"
      style={{ height: CONTAINER_HEIGHT }}
      role="list"
      aria-label="List of fruits"
    >
      <div
        className="relative overflow-auto"
        style={{ height: '100%' }}
        onScroll={handleScroll}
        role="listbox"
        aria-label="Scrollable fruit list"
      >
        <div style={{ height: totalHeight, position: 'relative' }}>
          <div style={{ transform: `translateY(${offsetY}px)` }}>
            {visibleFruits.map((fruit, index) => {
              const actualIndex = visibleRange.startIndex + index;
              return (
                <div
                  key={fruit.id}
                  className="flex items-center justify-between p-4 border-b border-gray-100 hover:bg-blue-50 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset transition-colors cursor-pointer"
                  style={{ height: ITEM_HEIGHT }}
                  role="listitem"
                  aria-label={`${fruit.name}, ${fruit.family} family, ${fruit.calories} calories. Click to view details.`}
                  onClick={() => handleFruitClick(fruit)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleFruitClick(fruit);
                    }
                  }}
                  tabIndex={0}
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl" aria-hidden="true">
                        {fruit.name === 'Apple' ? '🍎' : 
                         fruit.name === 'Banana' ? '🍌' : 
                         fruit.name === 'Orange' ? '🍊' : 
                         fruit.name === 'Strawberry' ? '🍓' : 
                         fruit.name === 'Blueberry' ? '🫐' : 
                         fruit.name === 'Grape' ? '🍇' : 
                         fruit.name === 'Pineapple' ? '🍍' : 
                         fruit.name === 'Mango' ? '🥭' : 
                         fruit.name === 'Peach' ? '🍑' : 
                         fruit.name === 'Pear' ? '🍐' : 
                         fruit.name === 'Cherry' ? '🍒' : 
                         fruit.name === 'Lemon' ? '🍋' : 
                         fruit.name === 'Lime' ? '🍈' : 
                         fruit.name === 'Kiwi' ? '🥝' : 
                         fruit.name === 'Plum' ? '🍑' : 
                         fruit.name === 'Apricot' ? '🍑' : 
                         fruit.name === 'Nectarine' ? '🍑' : 
                         fruit.name === 'Fig' ? '🍈' : 
                         fruit.name === 'Pomegranate' ? '🍈' : 
                         fruit.name === 'Raspberry' ? '🍓' : '🍎'}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{fruit.name}</h3>
                        <p className="text-sm text-gray-600">{fruit.family}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">{(typeof fruit.calories === 'number' ? fruit.calories : (typeof fruit.nutritions?.calories === 'number' ? fruit.nutritions.calories : 'N/A'))} cal</span>
                    <button
                      className="px-3 py-1 text-sm bg-primary-600 hover:bg-primary-700 text-white rounded transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                      onClick={(e) => handleAddClick(e, fruit)}
                      aria-label={`Add ${fruit.name} to jar`}
                    >
                      Add
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
});

FruitListView.displayName = 'FruitListView';

export default FruitListView; 