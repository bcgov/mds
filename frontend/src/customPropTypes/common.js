import { PropTypes, shape, arrayOf } from "prop-types";

export const dropdownListItem = shape({
  value: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
});

export const options = arrayOf(dropdownListItem);

export const formMeta = shape({
  touched: PropTypes.bool.isRequired,
  error: PropTypes.string.isRequired,
  warning: PropTypes.string.isRequired,
});
