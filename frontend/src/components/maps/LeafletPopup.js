import React from "react";
import PropTypes from "prop-types";
import { Link, StaticRouter } from "react-router-dom";
import { Button } from "antd";
import * as router from "@/constants/routes";
import * as Strings from "@/constants/strings";

const propTypes = {
  mine: PropTypes.shape({
    mine_permit: PropTypes.arrayOf(PropTypes.string),
    mine_name: PropTypes.string,
    mine_no: PropTypes.string,
    mine_guid: PropTypes.string,
  }).isRequired,
  commodityCodes: PropTypes.arrayOf(PropTypes.string).isRequired,
  context: PropTypes.objectOf(PropTypes.any).isRequired,
};

const defaultProps = {};

export const LeafletPopup = (props) => {
  const permitNo =
    props.mine.mine_permit && props.mine.mine_permit[0]
      ? props.mine.mine_permit[0].permit_no
      : Strings.EMPTY_FIELD;
  return (
    <div>
      <div>{props.mine.mine_name}</div>
      <br />
      <div>
        <strong>Mine No.</strong> {props.mine.mine_no}
      </div>
      <div>
        <strong>Permit No.</strong> {permitNo}
      </div>
      <div>
        <strong>Commodities</strong> {props.commodityCodes.join(", ")}
      </div>
      <StaticRouter context={props.context} basename={process.env.BASE_PATH}>
        <Link to={router.MINE_SUMMARY.dynamicRoute(props.mine.mine_guid)}>
          <div className="mineMapPopUpButton">
            <Button type="primary">View Mine</Button>
          </div>
        </Link>
      </StaticRouter>
    </div>
  );
};

LeafletPopup.propTypes = propTypes;
LeafletPopup.defaultProps = defaultProps;

export default LeafletPopup;
