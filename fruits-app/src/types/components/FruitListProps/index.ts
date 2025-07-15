import { Fruit } from '@/types/Fruit';
import { GroupByOption, ViewMode } from '@/types/CommonTypes';

export interface FruitListProps {
  fruits: Fruit[];
  groupBy: GroupByOption;
  viewMode: ViewMode;
  onAddFruit: (fruit: Fruit) => void;
  onAddGroup: (fruits: Fruit[]) => void;
  onViewFruit?: (fruit: Fruit) => void;
  onGroupByChange: (groupBy: GroupByOption) => void;
  onViewModeChange: (viewMode: ViewMode) => void;
} 