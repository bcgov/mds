import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Row, Col, Divider, Button, Descriptions, List, Popconfirm, Typography, Badge } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { openModal, closeModal } from "@mds/common/redux/actions/modalActions";
import {
  fetchMineWorkInformations,
  createMineWorkInformation,
  updateMineWorkInformation,
  deleteMineWorkInformation,
} from "@mds/common/redux/actionCreators/workInformationActionCreator";
import * as Strings from "@common/constants/strings";
import { getMineWorkInformations } from "@mds/common/redux/selectors/workInformationSelectors";
import AddButton from "@/components/common/buttons/AddButton";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import * as Permission from "@/constants/permissions";
import { formatDate, formatDateTime } from "@common/utils/helpers";
import { isEmpty } from "lodash";
import { modalConfig } from "@/components/modalContent/config";
import { CoreTooltip } from "@/components/common/CoreTooltip";
import { getWorkInformationBadgeStatusType } from "@/constants/theme";

const propTypes = {
  mineGuid: PropTypes.string.isRequired,
  mineWorkInformations: PropTypes.objectOf(PropTypes.any).isRequired,
  fetchMineWorkInformations: PropTypes.func.isRequired,
  createMineWorkInformation: PropTypes.func.isRequired,
  updateMineWorkInformation: PropTypes.func.isRequired,
  deleteMineWorkInformation: PropTypes.func.isRequired,
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

  openAddEditMineWorkInformationModal = (mineWorkInformation = null) => {
    const title = mineWorkInformation
      ? "Update Mine Work Information"
      : "Add Mine Work Information";
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

  deleteMineWorkInformation = (mineWorkInformationGuid) => {
    this.setState({ isLoaded: false });
    return this.props
      .deleteMineWorkInformation(this.props.mineGuid, mineWorkInformationGuid)
      .then(() => this.props.fetchMineWorkInformations(this.props.mineGuid))
      .finally(() => this.setState({ isLoaded: true }));
  };

  componentDidMount = () =>
    this.props
      .fetchMineWorkInformations(this.props.mineGuid)
      .then(() => this.setState({ isLoaded: true }));

  render() {
    const renderWorkInfo = (info) => (
      <List.Item>
        <Row>
          <Col span={22}>
            <Descriptions column={5} colon={false}>
              <Descriptions.Item label="Work Status">
                <Badge
                  status={getWorkInformationBadgeStatusType(info.work_status)}
                  text={info.work_status}
                />
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <>
                    Work Start Date
                    <CoreTooltip
                      title={
                        <>
                          <Typography.Text strong underline>
                            Notice To Start Work
                          </Typography.Text>
                          <br />
                          <Typography.Text>
                            6.2.1 The manager shall give 10 days’ notice to an inspector of
                            intention to start [any mining activity] in, at, or about a mine,
                            including seasonal reactivation.
                          </Typography.Text>
                        </>
                      }
                    />
                  </>
                }
              >
                {formatDate(info.work_start_date) || Strings.NOT_APPLICABLE}
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <>
                    Work Stop Date
                    <CoreTooltip
                      title={
                        <>
                          <Typography.Text strong underline>
                            Notice to Stop Work
                          </Typography.Text>
                          <br />
                          <Typography.Text>
                            6.2.2 The manager shall give notice to an inspector of intention to stop
                            [any mining activity] in, at, or about a mine, permanently,
                            indefinitely, or for a definite period exceeding 30 days, and except in
                            an emergency, the notice shall be not less than seven days.
                          </Typography.Text>
                        </>
                      }
                    />
                  </>
                }
              >
                {formatDate(info.work_stop_date) || Strings.NOT_APPLICABLE}
              </Descriptions.Item>
            </Descriptions>
            <Descriptions column={1} colon={false}>
              <Descriptions.Item label="Comments" span={1}>
                {info.work_comments || Strings.NOT_APPLICABLE}
              </Descriptions.Item>
            </Descriptions>
            {/* NOTE: Ant Design has no easy way to right-align "Descriptions" so plain HTML tags are used here. */}
            <span style={{ float: "right", display: "inline-flex" }}>
              <div className="inline-flex padding-sm" style={{ marginRight: 10 }}>
                <p className="field-title">Updated By</p>
                <p>{info.updated_by}</p>
              </div>
              <div className="inline-flex padding-sm">
                <p className="field-title">Last Updated</p>
                <p>{formatDateTime(info.updated_timestamp)}</p>
              </div>
            </span>
          </Col>
          <Col span={2}>
            <span style={{ float: "right" }}>
              <AuthorizationWrapper permission={Permission.EDIT_MINES}>
                <Button
                  type="primary"
                  size="small"
                  ghost
                  onClick={() => this.openAddEditMineWorkInformationModal(info)}
                >
                  <EditOutlined className="icon-lg icon-svg-filter" />
                </Button>
              </AuthorizationWrapper>
              <AuthorizationWrapper permission={Permission.EDIT_MINES}>
                <Popconfirm
                  placement="topLeft"
                  title="Are you sure you want to delete this record?"
                  onConfirm={() => this.deleteMineWorkInformation(info.mine_work_information_guid)}
                  okText="Delete"
                  cancelText="Cancel"
                >
                  <Button type="primary" size="small" ghost>
                    <DeleteOutlined className="icon-lg icon-svg-filter" />
                  </Button>
                </Popconfirm>
              </AuthorizationWrapper>
            </span>
          </Col>
        </Row>
      </List.Item>
    );

    const dataSource = this.state.showAll
      ? this.props.mineWorkInformations
      : !isEmpty(this.props.mineWorkInformations)
      ? [this.props.mineWorkInformations[0]]
      : [];

    const showAll = this.state.isLoaded &&
      !isEmpty(this.props.mineWorkInformations) &&
      this.props.mineWorkInformations.length > 1 && (
        <div
          style={{
            textAlign: "center",
            marginTop: 12,
          }}
        >
          <Button onClick={() => this.setState((prevState) => ({ showAll: !prevState.showAll }))}>
            {this.state.showAll ? "Hide" : "Show"} Work History
          </Button>
        </div>
      );

    return (
      <>
        <Row>
          <Col span={24}>
            <h4>
              Work Information
              <AuthorizationWrapper permission={Permission.EDIT_MINES}>
                <AddButton
                  onClick={() => this.openAddEditMineWorkInformationModal()}
                  style={{ float: "right" }}
                >
                  Add Work Information
                </AddButton>
              </AuthorizationWrapper>
            </h4>
            <Divider style={{ margin: "0" }} />
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={24}>
            {(!isEmpty(this.props.mineWorkInformations) && (
              <List
                itemLayout="vertical"
                loadMore={showAll}
                dataSource={dataSource}
                renderItem={(info) => renderWorkInfo(info)}
                loading={!this.state.isLoaded}
              />
            )) || (
              <>
                <br />
                This mine has no recorded work information.
              </>
            )}
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
      deleteMineWorkInformation,
      openModal,
      closeModal,
    },
    dispatch
  );

MineWorkInformation.propTypes = propTypes;
MineWorkInformation.defaultProps = defaultProps;

export default connect(mapStateToProps, mapDispatchToProps)(MineWorkInformation);
