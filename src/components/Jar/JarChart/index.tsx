import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { JarChartProps } from '@/types';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export const JarChart = ({ jarItems, onFruitSelect, selectedFruit }: JarChartProps) => {
  const chartData = jarItems.map((item, index) => ({
    name: item.fruit.name,
    value: item.fruit.calories * item.quantity,
    quantity: item.quantity,
    color: COLORS[index % COLORS.length],
    fruitId: item.fruit.id,
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-900">{data.name}</p>
          <p className="text-sm text-gray-600">Quantity: {data.quantity}</p>
          <p className="text-sm text-green-600 font-medium">Total Calories: {data.value}</p>
          <p className="text-xs text-gray-500 mt-1">Click to view details</p>
        </div>
      );
    }
    return null;
  };

  const handlePieClick = (data: any) => {
    if (data && data.fruitId && onFruitSelect) {
      onFruitSelect(data.fruitId);
    }
  };

  return (
    <div className="w-full flex items-center justify-center">
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              onClick={handlePieClick}
              style={{ cursor: 'pointer' }}
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color}
                  style={{ 
                    cursor: 'pointer',
                    opacity: selectedFruit && selectedFruit !== entry.fruitId ? 0.5 : 1
                  }}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default JarChart; 