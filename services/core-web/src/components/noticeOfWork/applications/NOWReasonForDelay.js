import React from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Descriptions } from "antd";
import { formatDate } from "@common/utils/helpers";
import { getDelayTypeOptionsHash } from "@mds/common/redux/selectors/staticContentSelectors";

const propTypes = {
  applicationDelay: PropTypes.objectOf(PropTypes.string).isRequired,
  delayTypeOptionsHash: PropTypes.objectOf(PropTypes.string).isRequired,
};

export const NOWReasonForDelay = (props) => (
  <div>
    <Descriptions column={1}>
      <Descriptions.Item label="Reason for Delay">
        {props.delayTypeOptionsHash[props.applicationDelay.delay_type_code]}
      </Descriptions.Item>
      <Descriptions.Item label="Comments">{props.applicationDelay.start_comment}</Descriptions.Item>
      <Descriptions.Item label="Start Date of delay">
        {formatDate(props.applicationDelay.start_date)}
      </Descriptions.Item>
    </Descriptions>
  </div>
);

NOWReasonForDelay.propTypes = propTypes;

const mapStateToProps = (state) => ({
  delayTypeOptionsHash: getDelayTypeOptionsHash(state),
});
export default connect(mapStateToProps)(NOWReasonForDelay);
