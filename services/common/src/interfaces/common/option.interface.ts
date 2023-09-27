export interface IOption {
  label: string;
  value: string | number;
}

export interface IGroupedDropdownList {
  groupName: string | number;
  opt: IOption[];
}
