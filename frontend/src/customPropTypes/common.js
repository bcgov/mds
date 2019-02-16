import { PropTypes, shape, arrayOf } from "prop-types";

export const dropdownListItem = shape({
  value: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
});

export const options = arrayOf(dropdownListItem);

export const formMeta = shape({
  touched: PropTypes.bool,
  error: PropTypes.string,
  warning: PropTypes.string,
});

export const match = shape({
  isExact: PropTypes.bool,
  params: PropTypes.objectOf(PropTypes.string),
  path: PropTypes.string,
  url: PropTypes.string,
});
