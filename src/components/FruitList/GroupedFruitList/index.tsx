import React, { memo, useCallback } from 'react';
import { Fruit, GroupByOption, ViewMode, GroupedFruitListProps } from '@/types';
import { groupFruitsByField } from '@/utils/fruitUtils';
import FruitListView from '../FruitListView';
import FruitTableView from '../FruitTableView';

const GroupedFruitList = memo(({
  fruits,
  groupBy,
  viewMode,
  expandedGroups,
  onAddFruit,
  onAddGroup,
  onViewFruit,
  onGroupToggle,
}: GroupedFruitListProps) => {
  const groupedFruits = groupFruitsByField(fruits, groupBy);
  const grouped = groupedFruits || {};

  const renderGroupContent = useCallback((groupFruits: Fruit[]) => {
    return viewMode === 'list' ? (
      <FruitListView fruits={groupFruits} onAddFruit={onAddFruit} onViewFruit={onViewFruit} />
    ) : (
      <FruitTableView fruits={groupFruits} onAddFruit={onAddFruit} onViewFruit={onViewFruit} />
    );
  }, [viewMode, onAddFruit, onViewFruit]);

  const handleGroupToggle = useCallback((groupName: string) => {
    onGroupToggle(groupName);
  }, [onGroupToggle]);

  const handleAddGroup = useCallback((e: React.MouseEvent, groupFruits: Fruit[]) => {
    e.stopPropagation();
    onAddGroup(groupFruits);
  }, [onAddGroup]);

  const handleGroupKeyDown = useCallback((e: React.KeyboardEvent, groupName: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleGroupToggle(groupName);
    }
  }, [handleGroupToggle]);

  return (
    <div className="divide-y divide-gray-200" role="region" aria-label="Grouped fruit list">
      {Object.entries(grouped).map(([groupName, groupFruits]) => (
        <div key={groupName} className="py-4">
          <div 
            className="flex items-center justify-between cursor-pointer select-none group-header hover:bg-blue-50 focus:bg-blue-50 p-2 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
            onClick={() => handleGroupToggle(groupName)}
            onKeyDown={(e) => handleGroupKeyDown(e, groupName)}
            tabIndex={0}
            role="button"
            aria-expanded={expandedGroups.has(groupName)}
            aria-label={`${groupName} group with ${groupFruits.length} fruits. Click to ${expandedGroups.has(groupName) ? 'collapse' : 'expand'}.`}
          >
            <span className="text-lg font-semibold text-gray-800">
              {groupName} ({groupFruits.length})
            </span>
            <button
              className="px-3 py-1 bg-primary-600 hover:bg-primary-700 text-white text-xs font-medium rounded transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              onClick={(e) => handleAddGroup(e, groupFruits as Fruit[])}
              aria-label={`Add all ${groupName} fruits to jar`}
            >
              Add All
            </button>
          </div>
          <div 
            className={`transition-all duration-300 ${expandedGroups.has(groupName) ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}
            aria-hidden={!expandedGroups.has(groupName)}
          >
            {renderGroupContent(groupFruits as Fruit[])}
          </div>
        </div>
      ))}
    </div>
  );
});

GroupedFruitList.displayName = 'GroupedFruitList';

export default GroupedFruitList; 