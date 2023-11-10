import React from "react";
import PropTypes from "prop-types";
import { Badge, Row, Col } from "antd";
import { connect } from "react-redux";
import { getMineRegionHash } from "@mds/common/redux/selectors/staticContentSelectors";
import * as Strings from "@common/constants/strings";
import MineHeaderMapLeaflet from "@/components/maps/MineHeaderMapLeaflet";
import CustomPropTypes from "@/customPropTypes";
import * as Styles from "@/constants/styles";

/**
 * @class MineHeader.js contains header section of MineDashboard before the tabs. Including map, mineName, mineNumber.
 */
const propTypes = {
  mine: CustomPropTypes.mine.isRequired,
  mineRegionHash: PropTypes.objectOf(PropTypes.string).isRequired,
  additionalPin: PropTypes.arrayOf(PropTypes.string),
};

const defaultProps = {
  additionalPin: [],
};

export const MineCard = (props) => {
  return (
    props.mine && (
      <div className="mine-content__card">
        <div className="mine-content__card-right">
          <Row gutter={16}>
            <Col md={12} sm={24}>
              <div className="inline-flex padding-sm">
                <p className="field-title">Mine Name</p>
                <p>{props.mine.mine_name}</p>
              </div>
              <div className="inline-flex padding-sm">
                <p className="field-title">Mine Number</p>
                <p>{props.mine.mine_no}</p>
              </div>
              <div className="inline-flex padding-sm">
                <p className="field-title">Mine Class </p>
                <p>{props.mine.major_mine_ind ? Strings.MAJOR_MINE : Strings.REGIONAL_MINE}</p>
              </div>
              <div className="inline-flex padding-sm">
                <p className="field-title">Permit Number</p>
                {(!props.mine.mine_permit_numbers ||
                  props.mine.mine_permit_numbers?.length === 0) && <p>{Strings.EMPTY_FIELD}</p>}
                {props.mine.mine_permit_numbers?.length === 1 && (
                  <p>{props.mine.mine_permit_numbers[0]}</p>
                )}
                {props.mine.mine_permit_numbers?.length > 1 && (
                  <ul className="mine-list__permits">
                    {props.mine.mine_permit_numbers.map((permit_no) => (
                      <li key={permit_no}>
                        <p>{permit_no}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </Col>
            <Col md={12} sm={24}>
              <div className="inline-flex padding-sm">
                <p className="field-title">Mine Region</p>
                <p>
                  {props.mine.mine_region
                    ? props.mineRegionHash[props.mine.mine_region]
                    : Strings.EMPTY_FIELD}
                </p>
              </div>
              <div className="inline-flex padding-sm">
                <div style={{ position: "absolute", left: "0px" }}>
                  <Badge color={Styles.COLOR.fuschia} />
                </div>
                <p className="field-title">Mine Latitude</p>
                <p>
                  {props.mine.mine_location && props.mine.mine_location.latitude
                    ? props.mine.mine_location.latitude
                    : Strings.EMPTY_FIELD}
                </p>
              </div>
              <div className="inline-flex padding-sm">
                <p className="field-title">Mine Longitude</p>
                <p>
                  {props.mine.mine_location && props.mine.mine_location.longitude
                    ? props.mine.mine_location.longitude
                    : Strings.EMPTY_FIELD}
                </p>
              </div>
            </Col>
          </Row>
        </div>
        <div className="mine-content__card-left">
          <MineHeaderMapLeaflet mine={props.mine} additionalPin={props.additionalPin} />
        </div>
      </div>
    )
  );
};

const mapStateToProps = (state) => ({
  mineRegionHash: getMineRegionHash(state),
});

MineCard.propTypes = propTypes;
MineCard.defaultProps = defaultProps;

export default connect(mapStateToProps)(MineCard);
