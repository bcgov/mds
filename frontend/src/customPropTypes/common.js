import { PropTypes, shape, arrayOf, objectOf, oneOfType } from "prop-types";

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
  params: objectOf(PropTypes.string),
  path: PropTypes.string,
  url: PropTypes.string,
});

export const genericFormState = shape({
  anyTouched: PropTypes.bool,
  registeredFields: objectOf(objectOf(oneOfType([PropTypes.string, PropTypes.number]))),
  fields: objectOf(objectOf(PropTypes.bool)),
  syncErrors: PropTypes.string,
  values: objectOf(PropTypes.string),
});
