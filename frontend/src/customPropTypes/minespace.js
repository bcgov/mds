import { PropTypes, shape } from "prop-types";

export const minespaceUser = shape({
  email: PropTypes.string.isRequired,
  user_id: PropTypes.string.isRequired,
  keycloak_guid: PropTypes.string,
  mines: PropTypes.arrayOf(PropTypes.string),
});

export default minespaceUser;
