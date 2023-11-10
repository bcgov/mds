import React from "react";
import { connect } from "react-redux";
import CustomPropTypes from "@/customPropTypes";
import PropTypes from "prop-types";
import { Descriptions } from "antd";
import { formatDate } from "@common/utils/helpers";
import { getNoticeOfWorkApplicationStatusOptionsHash } from "@mds/common/redux/selectors/staticContentSelectors";
import { getNoticeOfWork } from "@mds/common/redux/selectors/noticeOfWorkSelectors";
import * as Strings from "@common/constants/strings";

const propTypes = {
  noticeOfWork: CustomPropTypes.importedNOWApplication.isRequired,
  noticeOfWorkApplicationStatusOptionsHash: PropTypes.objectOf(PropTypes.string).isRequired,
};

export const NOWStatusReason = (props) => (
  <div>
    <Descriptions column={1}>
      <Descriptions.Item label="Status">
        {props.noticeOfWorkApplicationStatusOptionsHash[
          props.noticeOfWork.now_application_status_code
        ] || Strings.EMPTY_FIELD}
      </Descriptions.Item>
      <Descriptions.Item label="Reason for Status Change">
        {props.noticeOfWork.status_reason || Strings.EMPTY_FIELD}
      </Descriptions.Item>
      <Descriptions.Item label="Date of Status Change">
        {formatDate(props.noticeOfWork.decision_by_user_date)}
      </Descriptions.Item>
    </Descriptions>
  </div>
);

NOWStatusReason.propTypes = propTypes;

const mapStateToProps = (state) => ({
  noticeOfWork: getNoticeOfWork(state),
  noticeOfWorkApplicationStatusOptionsHash: getNoticeOfWorkApplicationStatusOptionsHash(state),
});
export default connect(mapStateToProps)(NOWStatusReason);
