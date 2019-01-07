import { PropTypes, shape, arrayOf } from "prop-types";

export const dropdownListItem = shape({
  value: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
});

export const options = arrayOf(dropdownListItem);

// export const popConfirm = shape({
//   placement: PropTypes.string,
//   title: PropTypes.string,
//   onConfirm: PropTypes.func.isRequired,
//   okText: PropTypes.string,
//   cancelText: PropTypes.string
// });
