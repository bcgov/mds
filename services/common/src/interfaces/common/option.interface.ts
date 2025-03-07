export interface IOption {
  label: string;
  value: string | number;
  tooltip?: string;
}

export interface IRadioOption {
  label: string;
  value: boolean | string;
}

export interface IGroupedDropdownList {
  groupName: string | number;
  opt: IOption[];
}
export interface DropdownOption {
  value: string;
  label: string;
  isActive?: boolean;
  subType?: any;
}