import { PropTypes, shape } from "prop-types";

export const minespaceUser = shape({
  email_or_username: PropTypes.string.isRequired,
  user_id: PropTypes.string.isRequired,
  keycloak_guid: PropTypes.string,
  mines: PropTypes.arrayOf(PropTypes.string),
});

export default minespaceUser;
