export interface IOption {
  label: string;
  value: string | number | boolean;
  tooltip?: string;
}

export interface IGroupedDropdownList {
  groupName: string | number;
  opt: IOption[];
}
