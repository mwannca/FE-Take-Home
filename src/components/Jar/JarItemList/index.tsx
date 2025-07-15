import React from 'react';
import { JarItemListProps } from '@/types';

export const JarItemList = ({
  jarItems,
  onRemoveItem,
  onUpdateQuantity,
}: JarItemListProps) => {
  return (
    <div className="space-y-3">
      {jarItems.map((item) => (
        <div key={item.fruit.id} className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="font-medium text-gray-900">{item.fruit.name}</span>
              <span className="text-sm text-gray-600 ml-2">
                {item.fruit.calories} cal × {item.quantity} = {item.fruit.calories * item.quantity} cal
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button
                className="w-8 h-8 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full flex items-center justify-center transition-colors disabled:opacity-50"
                onClick={() => onUpdateQuantity(item.fruit.id, item.quantity - 1)}
                disabled={item.quantity <= 1}
              >
                -
              </button>
              <span className="w-12 text-center font-medium text-gray-900">{item.quantity}</span>
              <button
                className="w-8 h-8 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full flex items-center justify-center transition-colors"
                onClick={() => onUpdateQuantity(item.fruit.id, item.quantity + 1)}
              >
                +
              </button>
            </div>
            
            <button
              className="w-8 h-8 bg-red-100 hover:bg-red-200 text-red-600 rounded-full flex items-center justify-center transition-colors"
              onClick={() => onRemoveItem(item.fruit.id)}
              title={`Remove ${item.fruit.name}`}
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}; 