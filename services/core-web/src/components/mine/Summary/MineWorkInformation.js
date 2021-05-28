import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Row, Col, Divider, Card, Descriptions, List } from "antd";
import { openModal, closeModal } from "@common/actions/modalActions";
import CustomPropTypes from "@/customPropTypes";
import * as Strings from "@common/constants/strings";
import AddButton from "@/components/common/AddButton";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import * as Permission from "@/constants/permissions";
import { formatDate, formatDateTime } from "@common/utils/helpers";
import { isEmpty } from "lodash";

const propTypes = {
  mineWorkInformation: PropTypes.objectOf(PropTypes.any).isRequired,
  openModal: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
};

const defaultProps = {};

export class MineWorkInformation extends Component {
  render() {
    const maxShow = 3;
    const renderWorkInfo = (info) => (
      <List.Item>
        <Descriptions column={3} colon={false}>
          <Descriptions.Item label="Work Status">...</Descriptions.Item>
          <Descriptions.Item label="Work Start Date">
            {formatDate(info.work_start_date)}
          </Descriptions.Item>
          <Descriptions.Item label="Work Stop Date">
            {formatDate(info.work_stop_date)}
          </Descriptions.Item>
          <Descriptions.Item label="Comments" span={3}>
            {info.work_comments}
          </Descriptions.Item>
        </Descriptions>
        <Descriptions column={2} colon={false}>
          <Descriptions.Item label="Updated By">{info.updated_by}</Descriptions.Item>
          <Descriptions.Item label="Last Updated">
            {formatDateTime(info.updated_timestamp)}
          </Descriptions.Item>
        </Descriptions>
      </List.Item>
    );

    return (
      <>
        <Row>
          <Col span={24}>
            <h4>Work Information</h4>
            <AuthorizationWrapper permission={Permission.EDIT_MINES}>
              <AddButton
                // onClick={(event) =>
                //   props.openAddReviewModal(
                //     event,
                //     props.handleAddReview,
                //     CONSULTATION_TAB_CODE,
                //     categoriesToShow
                //   )
                // }
                // type="primary"
                style={{ float: "right" }}
              >
                Add Work Information
              </AddButton>
            </AuthorizationWrapper>
            <Divider />
          </Col>
        </Row>
        <Row gutter={16}>
          <Col lg={12} md={24}>
            {(!isEmpty(this.props.mineWorkInformation) && (
              <List
                // className="demo-loadmore-list"
                // loading={initLoading}
                itemLayout="vertical"
                // loadMore={loadMore}
                dataSource={this.props.mineWorkInformation}
                renderItem={(info) => renderWorkInfo(info)}
              />
            )) ||
              "This mine has no recorded work information."}
          </Col>
        </Row>
      </>
    );
  }
}

const mapStateToProps = (state) => ({});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      openModal,
      closeModal,
    },
    dispatch
  );

MineWorkInformation.propTypes = propTypes;
MineWorkInformation.defaultProps = defaultProps;

export default connect(mapStateToProps, mapDispatchToProps)(MineWorkInformation);
