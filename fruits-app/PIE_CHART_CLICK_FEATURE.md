# Pie Chart Click Feature

## Overview
The pie chart in the Fruit Jar now supports interactive clicking to show detailed information about specific fruits.

## How It Works

### 1. Click on Pie Chart Sections
- When viewing the chart in the Fruit Jar, you can click on any section of the pie chart
- Each section represents a different fruit in your jar
- Clicking a section will highlight it and show only the items for that specific fruit

### 2. Visual Feedback
- The selected fruit section remains at full opacity
- Other fruit sections become slightly transparent (50% opacity)
- A blue notification bar appears at the top showing which fruit is selected

### 3. Detailed View
- Below the chart, a detailed list appears showing only the items for the selected fruit
- You can still manage quantities and remove items from this filtered view
- The list shows the same controls as the main jar view

### 4. Clear Selection
- Click the "Show all fruits" button in the notification bar to return to viewing all fruits
- Or click the same pie chart section again to deselect it

## Implementation Details

### Components Modified:
1. **JarChart** (`src/components/Jar/JarChart/index.tsx`)
   - Added click handlers to pie chart sections
   - Added visual feedback with opacity changes
   - Enhanced tooltip to indicate clickable functionality

2. **Jar** (`src/components/Jar/Jar/index.tsx`)
   - Added state management for selected fruit
   - Added filtered view for selected fruit items
   - Added notification bar for selection status

3. **JarChartProps** (`src/types/components/JarChartProps/index.ts`)
   - Added optional props for selection functionality

### Key Features:
- **Interactive Pie Chart**: Click any section to select that fruit
- **Visual Feedback**: Selected sections remain bright, others dim
- **Filtered View**: Shows only items for the selected fruit
- **Easy Deselection**: Multiple ways to clear the selection
- **Maintained Functionality**: All existing jar features still work

## Usage Example

1. Add multiple fruits to your jar (e.g., 2 Apples, 1 Banana, 3 Oranges)
2. Click "Show Chart" to view the pie chart
3. Click on the "Apple" section of the pie chart
4. Notice the visual changes:
   - Apple section stays bright
   - Other sections become transparent
   - Blue notification appears: "Showing items for: Apple"
   - Detailed list shows only Apple items below the chart
5. Click "Show all fruits" to return to the full view

## Technical Notes

- The feature uses React state management to track the selected fruit
- Click handlers are attached to the Recharts Pie component
- The filtered view reuses the existing JarItemList component
- All existing functionality (quantity management, removal) is preserved
- The feature is fully accessible with proper ARIA labels and keyboard navigation 