import { PropTypes, shape } from "prop-types";

export const noticeOfWorkPageFromRoute = shape({
  title: PropTypes.string.isRequired,
  route: PropTypes.string.isRequired,
});

export default noticeOfWorkPageFromRoute;
