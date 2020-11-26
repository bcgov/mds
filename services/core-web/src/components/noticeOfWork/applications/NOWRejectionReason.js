import React from "react";
import { connect } from "react-redux";
import CustomPropTypes from "@/customPropTypes";
import { Descriptions } from "antd";
import { formatDate } from "@common/utils/helpers";
import { getNoticeOfWork } from "@common/selectors/noticeOfWorkSelectors";
import * as Strings from "@common/constants/strings";

const propTypes = {
  noticeOfWork: CustomPropTypes.importedNOWApplication.isRequired,
};

export const NOWRejectionReason = (props) => (
  <div>
    <Descriptions column={1}>
      <Descriptions.Item label="Reason for Rejection">
        {props.noticeOfWork.status_reason || Strings.EMPTY_FIELD}
      </Descriptions.Item>
      <Descriptions.Item label="Date of Rejection">
        {formatDate(props.noticeOfWork.status_updated_date)}
      </Descriptions.Item>
    </Descriptions>
  </div>
);

NOWRejectionReason.propTypes = propTypes;

const mapStateToProps = (state) => ({
  noticeOfWork: getNoticeOfWork(state),
});
export default connect(mapStateToProps)(NOWRejectionReason);
