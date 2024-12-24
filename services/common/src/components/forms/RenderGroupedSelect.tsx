import React, { FC } from "react";
import { Select } from "antd";
import { BaseInputProps, WrappedInput } from "./BaseInput";
import { IGroupedDropdownList } from "@mds/common/interfaces";

/**
 * @component RenderGroupedSelect - Ant Design `Select` component for redux-form - used for data sets that require grouping.
 * There is a bug when the data sets are large enough to cause the dropdown to scroll, and the field is in a modal.
 * In the case where the modal cannot scroll, it is better to pass in the prop doNotPinDropdown.  It allows the
 * dropdown to render properly
 */


interface GroupedSelectProps extends BaseInputProps {
  data: IGroupedDropdownList[];
  allowClear?: boolean;
  onSelect?: (value, option) => void;
}


const RenderGroupedSelect: FC<GroupedSelectProps> = (props) => {
  const {
    placeholder = "",
    id,
    input,
    data = [],
    onSelect = () => { },
    allowClear = true,
    disabled = false,
  } = props;
  return <WrappedInput {...props}>
    <Select
      virtual={false}
      disabled={disabled}
      dropdownMatchSelectWidth
      showSearch
      placeholder={placeholder}
      optionFilterProp="children"
      id={id}
      value={input.value ? input.value : undefined}
      onChange={input.onChange}
      onSelect={onSelect}
      allowClear={allowClear}
    >
      {data.map((group) => (
        <Select.OptGroup label={group.groupName} key={group.groupName}>
          {group.opt.map((opt) => (
            <Select.Option
              key={opt.value.toString()}
              value={opt.value}
            >
              {opt.label}
            </Select.Option>
          ))}
        </Select.OptGroup>
      ))}
    </Select>
  </WrappedInput>
};

export default RenderGroupedSelect;
