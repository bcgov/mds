import { PropTypes, shape, arrayOf } from "prop-types";

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
