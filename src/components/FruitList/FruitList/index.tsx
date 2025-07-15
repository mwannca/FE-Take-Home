import React, { useState, memo, useEffect } from 'react';
import { Fruit, GroupByOption, ViewMode, FruitListProps } from '@/types';
import { GROUP_BY_OPTIONS, VIEW_MODES } from '@/constants';
import FruitListView from '../FruitListView';
import FruitTableView from '../FruitTableView';
import GroupedFruitList from '../GroupedFruitList';

const FruitList = memo(({
  fruits,
  groupBy,
  viewMode,
  onAddFruit,
  onAddGroup,
  onViewFruit,
  onGroupByChange,
  onViewModeChange,
}: FruitListProps) => {
  const safeFruits = fruits ?? [];
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  // Auto-expand all groups in table view
  useEffect(() => {
    if (groupBy !== 'None' && viewMode === 'table' && fruits && fruits.length > 0) {
      // Get all group names
      const groupNames = Array.from(new Set(fruits.map(fruit => fruit[groupBy.toLowerCase() as keyof Fruit] as string)));
      setExpandedGroups(new Set(groupNames));
    }
  }, [groupBy, viewMode, fruits]);

  const handleGroupToggle = (groupName: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupName)) {
      newExpanded.delete(groupName);
    } else {
      newExpanded.add(groupName);
    }
    setExpandedGroups(newExpanded);
  };

  const renderFruitList = () => {
    if (!fruits || fruits.length === 0) {
      return (
        <div className="text-center text-gray-500 py-8">
          No fruits available. Please check your connection.
        </div>
      );
    }
    if (groupBy === 'None') {
      return viewMode === 'list' ? (
        <FruitListView fruits={safeFruits} onAddFruit={onAddFruit} onViewFruit={onViewFruit} />
      ) : (
        <FruitTableView fruits={safeFruits} onAddFruit={onAddFruit} onViewFruit={onViewFruit} />
      );
    }
    return (
      <GroupedFruitList
        fruits={safeFruits}
        groupBy={groupBy}
        viewMode={viewMode}
        expandedGroups={expandedGroups}
        onAddFruit={onAddFruit}
        onAddGroup={onAddGroup}
        onViewFruit={onViewFruit}
        onGroupToggle={handleGroupToggle}
      />
    );
  };

  return (
    <div className="w-full" role="region" aria-label="Fruit list controls and display">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-2">
        <div className="flex items-center gap-2">
          <label htmlFor="groupBy" className="text-gray-700 font-medium">Group by:</label>
          <select
            id="groupBy"
            value={groupBy}
            onChange={e => onGroupByChange(e.target.value as GroupByOption)}
            className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary-200"
            aria-describedby="groupBy-description"
          >
            {GROUP_BY_OPTIONS.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          <span id="groupBy-description" className="sr-only">Select how to group the fruits</span>
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="viewMode" className="text-gray-700 font-medium">View:</label>
          <select
            id="viewMode"
            value={viewMode}
            onChange={e => onViewModeChange(e.target.value as ViewMode)}
            className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary-200"
            aria-describedby="viewMode-description"
          >
            {VIEW_MODES.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          <span id="viewMode-description" className="sr-only">Select the display format for fruits</span>
        </div>
      </div>
      {renderFruitList()}
    </div>
  );
});

FruitList.displayName = 'FruitList';

export default FruitList; 