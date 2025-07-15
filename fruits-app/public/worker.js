/**
 * Web Worker for Heavy Computations
 * 
 * Handles:
 * - Complex data filtering and sorting
 * - Statistical calculations
 * - Data processing and transformations
 * - Heavy mathematical operations
 */

// Worker message types
const MESSAGE_TYPES = {
  FILTER_FRUITS: 'FILTER_FRUITS',
  SORT_FRUITS: 'SORT_FRUITS',
  CALCULATE_STATISTICS: 'CALCULATE_STATISTICS',
  PROCESS_LARGE_DATASET: 'PROCESS_LARGE_DATASET',
  GROUP_FRUITS: 'GROUP_FRUITS',
  SEARCH_FRUITS: 'SEARCH_FRUITS'
};

// Handle messages from main thread
self.addEventListener('message', (event) => {
  const { type, data, id } = event.data;
  
  try {
    let result;
    
    switch (type) {
      case MESSAGE_TYPES.FILTER_FRUITS:
        result = filterFruits(data.fruits, data.criteria);
        break;
        
      case MESSAGE_TYPES.SORT_FRUITS:
        result = sortFruits(data.fruits, data.sortBy, data.sortOrder);
        break;
        
      case MESSAGE_TYPES.CALCULATE_STATISTICS:
        result = calculateStatistics(data.fruits);
        break;
        
      case MESSAGE_TYPES.PROCESS_LARGE_DATASET:
        result = processLargeDataset(data.dataset, data.operations);
        break;
        
      case MESSAGE_TYPES.GROUP_FRUITS:
        result = groupFruits(data.fruits, data.groupBy);
        break;
        
      case MESSAGE_TYPES.SEARCH_FRUITS:
        result = searchFruits(data.fruits, data.query);
        break;
        
      default:
        throw new Error(`Unknown message type: ${type}`);
    }
    
    // Send result back to main thread
    self.postMessage({
      type: 'SUCCESS',
      id,
      result
    });
    
  } catch (error) {
    // Send error back to main thread
    self.postMessage({
      type: 'ERROR',
      id,
      error: error.message
    });
  }
});

/**
 * Filter fruits based on criteria
 */
function filterFruits(fruits, criteria) {
  const startTime = performance.now();
  
  let filtered = fruits;
  
  // Apply multiple filters
  if (criteria.family) {
    filtered = filtered.filter(fruit => 
      fruit.family.toLowerCase().includes(criteria.family.toLowerCase())
    );
  }
  
  if (criteria.order) {
    filtered = filtered.filter(fruit => 
      fruit.order.toLowerCase().includes(criteria.order.toLowerCase())
    );
  }
  
  if (criteria.genus) {
    filtered = filtered.filter(fruit => 
      fruit.genus.toLowerCase().includes(criteria.genus.toLowerCase())
    );
  }
  
  if (criteria.minCalories !== undefined) {
    filtered = filtered.filter(fruit => fruit.calories >= criteria.minCalories);
  }
  
  if (criteria.maxCalories !== undefined) {
    filtered = filtered.filter(fruit => fruit.calories <= criteria.maxCalories);
  }
  
  if (criteria.searchQuery) {
    const query = criteria.searchQuery.toLowerCase();
    filtered = filtered.filter(fruit => 
      fruit.name.toLowerCase().includes(query) ||
      fruit.family.toLowerCase().includes(query) ||
      fruit.genus.toLowerCase().includes(query) ||
      fruit.order.toLowerCase().includes(query)
    );
  }
  
  const endTime = performance.now();
  
  return {
    fruits: filtered,
    processingTime: endTime - startTime,
    originalCount: fruits.length,
    filteredCount: filtered.length
  };
}

/**
 * Sort fruits by specified field
 */
function sortFruits(fruits, sortBy, sortOrder = 'asc') {
  const startTime = performance.now();
  
  const sorted = [...fruits].sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];
    
    // Handle string values
    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }
    
    if (sortOrder === 'desc') {
      return bValue > aValue ? 1 : -1;
    } else {
      return aValue > bValue ? 1 : -1;
    }
  });
  
  const endTime = performance.now();
  
  return {
    fruits: sorted,
    processingTime: endTime - startTime,
    sortBy,
    sortOrder
  };
}

/**
 * Calculate statistics for fruits dataset
 */
function calculateStatistics(fruits) {
  const startTime = performance.now();
  
  const stats = {
    totalFruits: fruits.length,
    totalCalories: fruits.reduce((sum, fruit) => sum + fruit.calories, 0),
    averageCalories: 0,
    minCalories: Infinity,
    maxCalories: -Infinity,
    families: {},
    orders: {},
    genera: {},
    calorieDistribution: {
      low: 0,    // 0-50 calories
      medium: 0, // 51-100 calories
      high: 0    // 101+ calories
    }
  };
  
  // Calculate statistics
  fruits.forEach(fruit => {
    // Min/max calories
    stats.minCalories = Math.min(stats.minCalories, fruit.calories);
    stats.maxCalories = Math.max(stats.maxCalories, fruit.calories);
    
    // Calorie distribution
    if (fruit.calories <= 50) stats.calorieDistribution.low++;
    else if (fruit.calories <= 100) stats.calorieDistribution.medium++;
    else stats.calorieDistribution.high++;
    
    // Count families, orders, genera
    stats.families[fruit.family] = (stats.families[fruit.family] || 0) + 1;
    stats.orders[fruit.order] = (stats.orders[fruit.order] || 0) + 1;
    stats.genera[fruit.genus] = (stats.genera[fruit.genus] || 0) + 1;
  });
  
  // Calculate average
  stats.averageCalories = stats.totalCalories / stats.totalFruits;
  
  // Find most common categories
  stats.mostCommonFamily = Object.entries(stats.families)
    .sort(([,a], [,b]) => b - a)[0];
  stats.mostCommonOrder = Object.entries(stats.orders)
    .sort(([,a], [,b]) => b - a)[0];
  stats.mostCommonGenus = Object.entries(stats.genera)
    .sort(([,a], [,b]) => b - a)[0];
  
  const endTime = performance.now();
  
  return {
    ...stats,
    processingTime: endTime - startTime
  };
}

/**
 * Process large datasets with multiple operations
 */
function processLargeDataset(dataset, operations) {
  const startTime = performance.now();
  
  let processed = [...dataset];
  const results = [];
  
  operations.forEach(operation => {
    const operationStart = performance.now();
    
    switch (operation.type) {
      case 'filter':
        processed = processed.filter(item => {
          return operation.criteria.every(criterion => {
            const value = item[criterion.field];
            switch (criterion.operator) {
              case 'equals':
                return value === criterion.value;
              case 'contains':
                return String(value).toLowerCase().includes(String(criterion.value).toLowerCase());
              case 'greaterThan':
                return value > criterion.value;
              case 'lessThan':
                return value < criterion.value;
              default:
                return true;
            }
          });
        });
        break;
        
      case 'sort':
        processed.sort((a, b) => {
          const aValue = a[operation.field];
          const bValue = b[operation.field];
          return operation.order === 'desc' ? bValue - aValue : aValue - bValue;
        });
        break;
        
      case 'group':
        const grouped = {};
        processed.forEach(item => {
          const key = item[operation.field];
          if (!grouped[key]) grouped[key] = [];
          grouped[key].push(item);
        });
        processed = Object.entries(grouped).map(([key, items]) => ({
          key,
          items,
          count: items.length
        }));
        break;
        
      case 'aggregate':
        const aggregated = processed.reduce((acc, item) => {
          const key = item[operation.groupBy];
          if (!acc[key]) acc[key] = { count: 0, sum: 0 };
          acc[key].count++;
          acc[key].sum += item[operation.aggregateField] || 0;
          return acc;
        }, {});
        processed = Object.entries(aggregated).map(([key, data]) => ({
          key,
          count: data.count,
          average: data.sum / data.count
        }));
        break;
    }
    
    const operationEnd = performance.now();
    results.push({
      operation: operation.type,
      processingTime: operationEnd - operationStart,
      resultCount: processed.length
    });
  });
  
  const endTime = performance.now();
  
  return {
    processed,
    results,
    totalProcessingTime: endTime - startTime
  };
}

/**
 * Group fruits by specified field
 */
function groupFruits(fruits, groupBy) {
  const startTime = performance.now();
  
  const grouped = fruits.reduce((acc, fruit) => {
    const key = fruit[groupBy];
    if (!acc[key]) acc[key] = [];
    acc[key].push(fruit);
    return acc;
  }, {});
  
  // Convert to array format with metadata
  const result = Object.entries(grouped).map(([key, items]) => ({
    key,
    items,
    count: items.length,
    totalCalories: items.reduce((sum, fruit) => sum + fruit.calories, 0),
    averageCalories: items.reduce((sum, fruit) => sum + fruit.calories, 0) / items.length
  }));
  
  const endTime = performance.now();
  
  return {
    grouped: result,
    processingTime: endTime - startTime,
    groupBy,
    totalGroups: result.length
  };
}

/**
 * Advanced search with fuzzy matching
 */
function searchFruits(fruits, query) {
  const startTime = performance.now();
  
  if (!query.trim()) {
    return {
      fruits: [],
      processingTime: performance.now() - startTime,
      query: query
    };
  }
  
  const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 0);
  
  const results = fruits.filter(fruit => {
    const searchableText = [
      fruit.name,
      fruit.family,
      fruit.genus,
      fruit.order
    ].join(' ').toLowerCase();
    
    // Check if all search terms are found
    return searchTerms.every(term => searchableText.includes(term));
  });
  
  // Sort by relevance (exact matches first)
  results.sort((a, b) => {
    const aText = a.name.toLowerCase();
    const bText = b.name.toLowerCase();
    
    const aExactMatch = aText === query.toLowerCase();
    const bExactMatch = bText === query.toLowerCase();
    
    if (aExactMatch && !bExactMatch) return -1;
    if (!aExactMatch && bExactMatch) return 1;
    
    // Sort by name length (shorter names first)
    return a.name.length - b.name.length;
  });
  
  const endTime = performance.now();
  
  return {
    fruits: results,
    processingTime: endTime - startTime,
    query,
    resultCount: results.length
  };
} 