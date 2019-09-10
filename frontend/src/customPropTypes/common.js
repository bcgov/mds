import { PropTypes, shape, arrayOf, objectOf, oneOfType } from "prop-types";

export const dropdownListItem = shape({
  value: oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  label: PropTypes.string.isRequired,
});

export const filterListItem = shape({
  value: oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  text: PropTypes.string.isRequired,
});

export const groupedDropdownList = shape({
  groupName: oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  opt: arrayOf(dropdownListItem),
});

export const options = arrayOf(dropdownListItem);
export const groupOptions = arrayOf(groupedDropdownList);
export const filterOptions = arrayOf(filterListItem);

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

export const pageData = shape({
  current_page: PropTypes.number,
  items_per_page: PropTypes.number,
  records: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)),
  total: PropTypes.number,
  total_pages: PropTypes.number,
});
