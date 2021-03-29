import { PropTypes, shape } from "prop-types";

export const ApplicationPageFromRoute = shape({
  title: PropTypes.string.isRequired,
  route: PropTypes.string.isRequired,
});

export default ApplicationPageFromRoute;
