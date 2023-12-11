import { PropTypes, shape, arrayOf, oneOfType } from "prop-types";

export const dropdownListItem = shape({
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  label: PropTypes.string.isRequired,
});

export const options = arrayOf(dropdownListItem);

export const formMeta = shape({
  touched: PropTypes.bool,
  error: PropTypes.string,
  warning: PropTypes.string,
});

export const groupedDropdownList = shape({
  groupName: oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  opt: arrayOf(dropdownListItem),
});
