import { Fruit } from '@/types/Fruit';
import { GroupByOption, ViewMode } from '@/types/CommonTypes';

export interface GroupedFruitListProps {
  fruits: Fruit[];
  groupBy: GroupByOption;
  viewMode: ViewMode;
  expandedGroups: Set<string>;
  onAddFruit: (fruit: Fruit) => void;
  onAddGroup: (fruits: Fruit[]) => void;
  onViewFruit?: (fruit: Fruit) => void;
  onGroupToggle: (groupName: string) => void;
} 