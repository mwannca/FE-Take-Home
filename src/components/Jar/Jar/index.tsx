import React, { memo, useState } from 'react';
import { JarItem, JarProps } from '@/types';
import { calculateTotalCalories } from '@/utils/fruitUtils';
import { JarItemList } from '../JarItemList';
import { JarChart } from '../JarChart';

const Jar = memo(({
  jarItems,
  showChart,
  onRemoveItem,
  onUpdateQuantity,
  onToggleChart,
}: JarProps) => {
  const [selectedFruit, setSelectedFruit] = useState<number | null>(null);
  
  const totalCalories = calculateTotalCalories(jarItems);
  const totalItems = jarItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleToggleChart = () => {
    onToggleChart();
    // Clear selection when toggling chart
    setSelectedFruit(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleToggleChart();
    }
  };

  const handleFruitSelect = (fruitId: number) => {
    setSelectedFruit(selectedFruit === fruitId ? null : fruitId);
  };

  // Filter jar items if a fruit is selected
  const displayItems = selectedFruit 
    ? jarItems.filter(item => item.fruit.id === selectedFruit)
    : jarItems;

  const selectedFruitName = selectedFruit 
    ? jarItems.find(item => item.fruit.id === selectedFruit)?.fruit.name
    : null;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6" role="region" aria-label="Fruit jar">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900" id="jar-title">🍯 Fruit Jar</h2>
        <div className="flex items-center space-x-4" aria-labelledby="jar-title">
          <span className="text-sm text-gray-600">
            <strong className="text-primary-600">{totalItems}</strong> items
          </span>
          <span className="text-sm text-gray-600">
            <strong className="text-green-600">{totalCalories}</strong> calories
          </span>
        </div>
        <button
          className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          onClick={handleToggleChart}
          onKeyDown={handleKeyDown}
          disabled={jarItems.length === 0}
          aria-label={showChart ? 'Show item list' : 'Show chart view'}
          aria-describedby="chart-description"
        >
          {showChart ? 'Show Item List' : 'Show Chart'}
        </button>
        <span id="chart-description" className="sr-only">
          Toggle between list and chart view of fruits in the jar
        </span>
      </div>

      {jarItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-4 text-center" role="status" aria-live="polite">
          <div className="text-6xl mb-4" aria-hidden="true">🍯</div>
          <p className="text-gray-500 text-lg">Your jar is empty. Add some fruits to get started!</p>
        </div>
      ) : (
        <div>
          {showChart ? (
            <div>
              {selectedFruit && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-blue-900">
                        Showing items for: <strong>{selectedFruitName}</strong>
                      </span>
                    </div>
                    <button
                      onClick={() => setSelectedFruit(null)}
                      className="text-sm text-blue-600 hover:text-blue-800 underline"
                    >
                      Show all fruits
                    </button>
                  </div>
                </div>
              )}
              <JarChart 
                jarItems={jarItems} 
                onFruitSelect={handleFruitSelect}
                selectedFruit={selectedFruit}
              />
              {selectedFruit && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Items for {selectedFruitName}
                  </h3>
                  <JarItemList
                    jarItems={displayItems}
                    onRemoveItem={onRemoveItem}
                    onUpdateQuantity={onUpdateQuantity}
                  />
                </div>
              )}
            </div>
          ) : (
            <JarItemList
              jarItems={jarItems}
              onRemoveItem={onRemoveItem}
              onUpdateQuantity={onUpdateQuantity}
            />
          )}
        </div>
      )}
    </div>
  );
});

Jar.displayName = 'Jar';

export default Jar; 