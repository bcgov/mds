import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Row, Col, Divider, Button, Descriptions, List } from "antd";
import { openModal, closeModal } from "@common/actions/modalActions";
import {
  fetchMineWorkInformations,
  createMineWorkInformation,
  updateMineWorkInformation,
} from "@common/actionCreators/workInformationActionCreator";
import * as Strings from "@common/constants/strings";
import { getMineWorkInformations } from "@common/selectors/workInformationSelectors";
import AddButton from "@/components/common/AddButton";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import * as Permission from "@/constants/permissions";
import { formatDate, formatDateTime } from "@common/utils/helpers";
import { isEmpty } from "lodash";
import { modalConfig } from "@/components/modalContent/config";

const propTypes = {
  mineGuid: PropTypes.string.isRequired,
  mineWorkInformations: PropTypes.objectOf(PropTypes.any).isRequired,
  fetchMineWorkInformations: PropTypes.func.isRequired,
  createMineWorkInformation: PropTypes.func.isRequired,
  updateMineWorkInformation: PropTypes.func.isRequired,
  openModal: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
};

const defaultProps = {};

export class MineWorkInformation extends Component {
  state = { isLoaded: false, showAll: false };

  submitAddEditMineWorkInformationForm = (mineWorkInformationGuid) => (values) => {
    const action = mineWorkInformationGuid
      ? this.props.updateMineWorkInformation(this.props.mineGuid, mineWorkInformationGuid, values)
      : this.props.createMineWorkInformation(this.props.mineGuid, values);
    return action.then(() => {
      this.setState({ isLoaded: false });
      return this.props
        .fetchMineWorkInformations(this.props.mineGuid)
        .then(() => this.props.closeModal())
        .finally(() => this.setState({ isLoaded: true }));
    });
  };

  openAddEditMineWorkInformationModal = (event, mineWorkInformation = null) => {
    event.preventDefault();
    const title = mineWorkInformation ? "Edit Mine Work Information" : "Add Mine Work Information";
    return this.props.openModal({
      props: {
        title,
        initialValues: mineWorkInformation,
        mineWorkInformationGuid: mineWorkInformation?.mine_work_information_guid,
        onSubmit: this.submitAddEditMineWorkInformationForm(
          mineWorkInformation?.mine_work_information_guid
        ),
      },
      content: modalConfig.ADD_MINE_WORK_INFORMATION,
      width: "50vw",
    });
  };

  componentDidMount = () =>
    this.props
      .fetchMineWorkInformations(this.props.mineGuid)
      .then(() => this.setState({ isLoaded: true }));

  render() {
    const renderWorkInfo = (info) => (
      <List.Item
        actions={[
          <Button onClick={(event) => this.openAddEditMineWorkInformationModal(event, info)}>
            Edit
          </Button>,
        ]}
      >
        <List.Item.Meta></List.Item.Meta>
        <Descriptions column={3} colon={false}>
          <Descriptions.Item label="Work Status">...</Descriptions.Item>
          <Descriptions.Item label="Work Start Date">
            {formatDate(info.work_start_date) || Strings.NOT_APPLICABLE}
          </Descriptions.Item>
          <Descriptions.Item label="Work Stop Date">
            {formatDate(info.work_stop_date) || Strings.NOT_APPLICABLE}
          </Descriptions.Item>
          <Descriptions.Item label="Comments" span={3}>
            {info.work_comments || Strings.NOT_APPLICABLE}
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

    const dataSource = this.state.showAll
      ? this.props.mineWorkInformations
      : !isEmpty(this.props.mineWorkInformations)
      ? [this.props.mineWorkInformations[0]]
      : [];

    const showAll = this.state.isLoaded &&
      !this.state.showAll &&
      !isEmpty(this.props.mineWorkInformations) &&
      this.props.mineWorkInformations.length > 1 && (
        <div
          style={{
            textAlign: "center",
            marginTop: 12,
            height: 32,
            lineHeight: "32px",
          }}
        >
          <Button onClick={() => this.setState({ showAll: true })}>Show All</Button>
        </div>
      );

    return (
      <>
        <Row>
          <Col span={24}>
            <h4>Work Information</h4>
            <AuthorizationWrapper permission={Permission.EDIT_MINES}>
              <AddButton
                onClick={(event) => this.openAddEditMineWorkInformationModal(event)}
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
            {(!isEmpty(this.props.mineWorkInformations) && (
              <List
                itemLayout="vertical"
                loadMore={showAll}
                dataSource={dataSource}
                renderItem={(info) => renderWorkInfo(info)}
                loading={!this.state.isLoaded}
              />
            )) ||
              "This mine has no recorded work information."}
          </Col>
        </Row>
      </>
    );
  }
}

const mapStateToProps = (state) => ({
  mineWorkInformations: getMineWorkInformations(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchMineWorkInformations,
      createMineWorkInformation,
      updateMineWorkInformation,
      openModal,
      closeModal,
    },
    dispatch
  );

MineWorkInformation.propTypes = propTypes;
MineWorkInformation.defaultProps = defaultProps;

export default connect(mapStateToProps, mapDispatchToProps)(MineWorkInformation);
