import React from 'react';
import { FruitList } from '../../components/FruitList';
import { Jar } from '../../components/Jar';
import { LoadingSpinner, ErrorDisplay, FruitDetailsModal, SearchInput } from '../../components/common';
import { useFruitsApp } from '../../hooks/useFruitsApp';

export const FruitsPage = () => {
  const {
    fruits,
    jarItems,
    loading,
    error,
    groupBy,
    viewMode,
    showChart,
    searchQuery,
    selectedFruit,
    isModalOpen,
    setGroupBy,
    setViewMode,
    setShowChart,
    handleAddFruit,
    handleAddGroup,
    handleRemoveFromJar,
    handleUpdateQuantity,
    handleViewFruit,
    handleCloseModal,
    handleAddToJarFromModal,
    handleSearch,
    refetch,
  } = useFruitsApp();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="large" message="Loading fruits..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <ErrorDisplay error={error} onRetry={refetch} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-8">
        <header className="text-center mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">🍎 Fruits Explorer</h1>
          <p className="text-lg sm:text-xl text-gray-600">Discover and collect your favorite fruits!</p>
        </header>
        
        <div className={`flex flex-col${jarItems.length > 0 ? ' lg:grid lg:grid-cols-2 gap-6 lg:gap-8' : ''}`}>
          <section className={jarItems.length > 0 ? 'mb-8 lg:mb-0' : ''}>
            {/* Search Input */}
            <div className="mb-6">
              <SearchInput
                onSearch={handleSearch}
                placeholder="Search fruits by name, family, genus, or order..."
                className="max-w-md"
                aria-label="Search fruits"
              />
              {searchQuery && (
                <p className="text-sm text-gray-600 mt-2">
                  Showing {fruits.length} result{fruits.length !== 1 ? 's' : ''} for "{searchQuery}"
                </p>
              )}
            </div>
            
            <FruitList
              fruits={fruits}
              groupBy={groupBy}
              viewMode={viewMode}
              onAddFruit={handleAddFruit}
              onAddGroup={handleAddGroup}
              onViewFruit={handleViewFruit}
              onGroupByChange={setGroupBy}
              onViewModeChange={setViewMode}
            />
          </section>
          {jarItems.length > 0 && (
            <section>
              <Jar
                jarItems={jarItems}
                showChart={showChart}
                onRemoveItem={handleRemoveFromJar}
                onUpdateQuantity={handleUpdateQuantity}
                onToggleChart={() => setShowChart(!showChart)}
              />
            </section>
          )}
        </div>
      </div>

      {/* Fruit Details Modal */}
      <FruitDetailsModal
        fruit={selectedFruit}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onAddToJar={handleAddToJarFromModal}
      />
    </div>
  );
};

export default FruitsPage; 