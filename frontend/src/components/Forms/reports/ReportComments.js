import React, { Component } from "react";
import PropTypes from "prop-types";
import { Field } from "redux-form";
import { Form, Divider, Button } from "antd";
import { required } from "@/utils/Validate";
import { renderConfig } from "@/components/common/config";
import * as FORM from "@/constants/forms";

import {
  fetchMineReportComments,
  createMineReportComment,
  deleteMineReportComment,
} from "@/actionCreators/reportActionCreator";

const propTypes = {
  mineGuid: PropTypes.string.isRequired,
  mineReportGuid: PropTypes.string.isRequired,
  mineReportComments: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)),
  handleSubmit: PropTypes.func.isRequired,
  fetchMineReportComments: PropTypes.func.isRequired,
  createMineReportComment: PropTypes.func.isRequired,
  deleteMineReportComment: PropTypes.func.isRequired,
};

const defaultProps = {
  mineReportComments: [],
};

export class ReportComments extends Component {
  handleAddComment = (mineGuid, mineReportGuid, values) => {
    this.props
      .createMineReportComment(mineGuid, mineReportGuid, values)
      .then(() => this.props.fetchMineReportComments(mineGuid, mineReportGuid));
  };

  handleRemoveComment = (mineGuid, mineReportGuid, commentGuid) => {
    this.props
      .deleteMineReportComment(commentGuid)
      .then(() => this.props.fetchMineReportComments(mineGuid, mineReportGuid));
  };

  render() {
    const hasComments = this.props.mineReportComments.length > 0;
    return [
      <Divider orientation="left">
        <h5>Comments</h5>
      </Divider>,
      hasComments && [
        this.props.mineReportComments.forEach((comment) => {
          return <div>Comment {comment}</div>;
        }),
      ],
      <Form layout="vertical" onSubmit={this.props.handleSubmit}>
        <Form.Item label="Comment" style={{ paddingBottom: "10px" }}>
          <Field
            id="report_comment"
            name="report_comment"
            placeholder=""
            component={renderConfig.SCROLL_FIELD}
            validate={[required]}
          />
          <Field
            id="comment_visibility_ind"
            name="comment_visibility_ind"
            component={renderConfig.CHECKBOX}
          />
        </Form.Item>
        <Button className="full-mobile" type="primary" htmlType="submit">
          Add Comment
        </Button>
      </Form>,
    ];
  }
}

ReportComments.propTypes = propTypes;
ReportComments.defaultProps = defaultProps;

const mapStateToProps = (state) => ({
  mineReportComments: getMineReportComments(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchMineReportComments,
      createMineReportComment,
      deleteMineReportComment,
    },
    dispatch
  );

export default compose(
  connect(
    mapStateToProps,
    mapDispatchToProps
  ),
  reduxForm({
    form: FORM.ADD_REPORT_COMMENT,
    touchOnBlur: true,
    onSubmitSuccess: resetForm(FORM.ADD_REPORT_COMMENT),
  })
)(ReportComments);
