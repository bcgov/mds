import React from "react";
import PropTypes from "prop-types";
import { Link, StaticRouter } from "react-router-dom";
import { formatDate } from "@common/utils/helpers";
import { uniqBy } from "lodash";
import * as Strings from "@mds/common/constants/strings";
import CustomPropTypes from "@/customPropTypes";
import * as router from "@/constants/routes";
import { SUCCESS_CHECKMARK } from "@/constants/assets";

const propTypes = {
  mine: CustomPropTypes.mine.isRequired,
  transformedMineTypes: CustomPropTypes.transformedMineTypes.isRequired,
  mineRegionHash: PropTypes.objectOf(PropTypes.string).isRequired,
  mineTenureHash: PropTypes.objectOf(PropTypes.string).isRequired,
  mineCommodityOptionsHash: PropTypes.objectOf(PropTypes.string).isRequired,
  mineDisturbanceOptionsHash: PropTypes.objectOf(PropTypes.string).isRequired,
  context: PropTypes.objectOf(PropTypes.any).isRequired,
};

export const LeafletPopup = (props) => {
  const region =
    (props.mine.mine_region && props.mineRegionHash[props.mine.mine_region]) || Strings.EMPTY_FIELD;

  const number = props.mine.mine_no || Strings.EMPTY_FIELD;

  const status =
    props.mine.mine_status &&
    props.mine.mine_status.length > 0 &&
    props.mine.mine_status[0].status_labels &&
    props.mine.mine_status[0].status_labels.length > 0
      ? props.mine.mine_status[0].status_labels[0]
      : Strings.EMPTY_FIELD;

  const permits =
    props.mine.mine_permit_numbers && props.mine.mine_permit_numbers.length > 0
      ? props.mine.mine_permit_numbers.join(", ")
      : Strings.EMPTY_FIELD;

  const tenures =
    props.transformedMineTypes &&
    props.transformedMineTypes.mine_tenure_type_code &&
    props.transformedMineTypes.mine_tenure_type_code.length > 0
      ? uniqBy(props.transformedMineTypes.mine_tenure_type_code)
          .map((tenure) => props.mineTenureHash[tenure])
          .join(", ")
      : Strings.EMPTY_FIELD;

  const commodities =
    props.transformedMineTypes &&
    props.transformedMineTypes.mine_commodity_code &&
    props.transformedMineTypes.mine_commodity_code.length > 0
      ? uniqBy(props.transformedMineTypes.mine_commodity_code)
          .map((commodity) => props.mineCommodityOptionsHash[commodity])
          .join(", ")
      : Strings.EMPTY_FIELD;

  const disturbances =
    props.transformedMineTypes &&
    props.transformedMineTypes.mine_disturbance_code &&
    props.transformedMineTypes.mine_disturbance_code.length > 0
      ? uniqBy(props.transformedMineTypes.mine_disturbance_code)
          .map((disturbance) => props.mineDisturbanceOptionsHash[disturbance])
          .join(", ")
      : Strings.EMPTY_FIELD;

  const tsf = props.mine.mine_tailings_storage_facilities
    ? props.mine.mine_tailings_storage_facilities.length
    : Strings.EMPTY_FIELD;

  const verifiedStatus = props.mine.verified_status;

  return (
    <div style={{ width: "220px" }}>
      <div>
        <StaticRouter context={props.context} basename={process.env.BASE_PATH}>
          <Link to={router.MINE_SUMMARY.dynamicRoute(props.mine.mine_guid)} title="Go to mine page">
            {props.mine.mine_name}
            {verifiedStatus && verifiedStatus.healthy_ind && (
              <img
                alt="Verified"
                className="padding-sm"
                src={SUCCESS_CHECKMARK}
                width="25"
                title={`Mine data verified by ${verifiedStatus.verifying_user} on ${formatDate(
                  verifiedStatus.verifying_timestamp
                )}`}
              />
            )}
          </Link>
        </StaticRouter>
      </div>
      <hr />
      <div>
        <strong>Number</strong> {number}
      </div>
      <div>
        <strong>Region</strong> {region}
      </div>
      <div>
        <strong>Status</strong> {status}
      </div>
      <div>
        <strong>Permits</strong> {permits}
      </div>
      <div>
        <strong>Tenure</strong> {tenures}
      </div>
      <div>
        <strong>Commodity</strong> {commodities}
      </div>
      <div>
        <strong>Disturbance</strong> {disturbances}
      </div>
      <div>
        <strong>TSF</strong> {tsf}
      </div>
      {/* <StaticRouter context={props.context} basename={process.env.BASE_PATH}>
        <Link to={router.MINE_SUMMARY.dynamicRoute(props.mine.mine_guid)}>
          <div className="mineMapPopUpButton">
            <Button type="primary">View Mine</Button>
          </div>
        </Link>
      </StaticRouter> */}
    </div>
  );
};

LeafletPopup.propTypes = propTypes;

export default LeafletPopup;
