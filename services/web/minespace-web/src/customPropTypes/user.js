import { PropTypes, shape, arrayOf } from "prop-types";

// This file is anticipated to have multiple exports
// eslint-disable-next-line import/prefer-default-export
export const userMineInfo = shape({
  mine_guid: PropTypes.string.isRequired,
  mine_no: PropTypes.string,
  mine_name: PropTypes.string,
  latitude: PropTypes.string,
  longitude: PropTypes.string,
});

export const userMines = shape({
  mines: arrayOf(userMineInfo),
});
