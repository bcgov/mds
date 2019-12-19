import { PropTypes, shape } from "prop-types";

export const location = shape({
  fromTitle: PropTypes.string.isRequired,
  fromRoute: PropTypes.string.isRequired,
});

export default location;
