import React, { useEffect, useRef } from 'react';
import type { Fruit } from '@/types/Fruit';

interface FruitDetailsModalProps {
  fruit: Fruit | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToJar: (fruit: Fruit) => void;
}

const FruitDetailsModal = ({
  fruit,
  isOpen,
  onClose,
  onAddToJar,
}: FruitDetailsModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const addButtonRef = useRef<HTMLButtonElement>(null);

  // Focus management
  useEffect(() => {
    if (isOpen) {
      // Focus the close button when modal opens
      closeButtonRef.current?.focus();
      
      // Trap focus within modal
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
        
        if (e.key === 'Tab') {
          const focusableElements = modalRef.current?.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          
          if (focusableElements && focusableElements.length > 0) {
            const firstElement = focusableElements[0] as HTMLElement;
            const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
            
            if (e.shiftKey) {
              if (document.activeElement === firstElement) {
                e.preventDefault();
                lastElement.focus();
              }
            } else {
              if (document.activeElement === lastElement) {
                e.preventDefault();
                firstElement.focus();
              }
            }
          }
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden'; // Prevent background scrolling

      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen || !fruit) {
    return null;
  }

  const handleAddToJar = () => {
    onAddToJar(fruit);
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      <div 
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        role="document"
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 id="modal-title" className="text-2xl font-bold text-gray-900">🍎 {fruit.name}</h2>
          <button 
            ref={closeButtonRef}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 rounded"
            onClick={onClose}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>
        
        <div className="p-6" id="modal-description">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Classification</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <span className="text-sm font-medium text-gray-500">Family:</span>
                  <p className="text-gray-900 font-medium">{fruit.family}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <span className="text-sm font-medium text-gray-500">Order:</span>
                  <p className="text-gray-900 font-medium">{fruit.order}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <span className="text-sm font-medium text-gray-500">Genus:</span>
                  <p className="text-gray-900 font-medium">{fruit.genus}</p>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Nutrition Information</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <span className="text-sm font-medium text-gray-500">Calories:</span>
                  <p className="text-green-700 font-bold text-lg">{fruit.calories} cal</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <span className="text-sm font-medium text-gray-500">Fat:</span>
                  <p className="text-blue-700 font-medium">{(fruit.nutritions?.fat ?? 0).toFixed(1)}g</p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <span className="text-sm font-medium text-gray-500">Sugar:</span>
                  <p className="text-yellow-700 font-medium">{(fruit.nutritions?.sugar ?? 0).toFixed(1)}g</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <span className="text-sm font-medium text-gray-500">Carbohydrates:</span>
                  <p className="text-purple-700 font-medium">{(fruit.nutritions?.carbohydrates ?? 0).toFixed(1)}g</p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <span className="text-sm font-medium text-gray-500">Protein:</span>
                  <p className="text-red-700 font-medium">{(fruit.nutritions?.protein ?? 0).toFixed(1)}g</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end space-x-4 p-6 border-t border-gray-200">
          <button 
            className="px-6 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            onClick={onClose}
          >
            Close
          </button>
          <button 
            ref={addButtonRef}
            className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            onClick={handleAddToJar}
          >
            Add to Jar
          </button>
        </div>
      </div>
    </div>
  );
};

export default FruitDetailsModal; 