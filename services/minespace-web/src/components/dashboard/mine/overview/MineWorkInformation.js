import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { isEmpty } from "lodash";
import { Row, Col, Button, Descriptions, Typography, Badge, Tooltip, Icon } from "antd";

import {
  fetchMineWorkInformations,
  createMineWorkInformation,
  updateMineWorkInformation,
} from "@common/actionCreators/workInformationActionCreator";
import { getMineWorkInformations } from "@common/selectors/workInformationSelectors";
import { formatDateTime } from "@common/utils/helpers";
import { EDIT_PENCIL } from "@/constants/assets";
import AddMineWorkInformationForm from "@/components/Forms/AddMineWorkInformationForm";
import { getWorkInformationBadgeStatusType } from "@/constants/theme";
import { formatDate } from "@/utils/helpers";

const propTypes = {
  mineGuid: PropTypes.string.isRequired,
  mineWorkInformations: PropTypes.objectOf(PropTypes.any).isRequired,
  fetchMineWorkInformations: PropTypes.func.isRequired,
  createMineWorkInformation: PropTypes.func.isRequired,
  updateMineWorkInformation: PropTypes.func.isRequired,
};

const defaultProps = {};

const { Paragraph, Title } = Typography;

export class MineWorkInformation extends Component {
  state = { isEditMode: false };

  submitAddEditMineWorkInformationForm = (mineWorkInformationGuid) => (values) => {
    const action = mineWorkInformationGuid
      ? this.props.updateMineWorkInformation(this.props.mineGuid, mineWorkInformationGuid, values)
      : this.props.createMineWorkInformation(this.props.mineGuid, values);
    return action.then(() => {
      this.setState({ isEditMode: false });
      return this.props.fetchMineWorkInformations(this.props.mineGuid);
    });
  };

  editWorkInformation = () => this.setState((prevState) => ({ isEditMode: !prevState.isEditMode }));

  componentDidMount = () => this.props.fetchMineWorkInformations(this.props.mineGuid);

  render() {
    const info = this.props.mineWorkInformations[0];
    const title = info ? "Update Mine Work Information" : "Add Mine Work Information";
    return (
      <div className="work-information-container ">
        <Row gutter={5}>
          <div className="inline-flex between">
            <Title level={4}>Work Information</Title>
            {!this.state.isEditMode && (
              <span style={{ float: "right" }}>
                <Button type="link" onClick={() => this.editWorkInformation()}>
                  <img src={EDIT_PENCIL} alt="Edit" />
                </Button>
              </span>
            )}
          </div>
        </Row>
        <Row gutter={5}>
          <Paragraph>
            Keep your start and stop work dates current. Sections 6.1.2 and 6.2.2 of the Health,
            Safety & Reclamation Code apply to any person doing any work (mining activity) at, on,
            or about the mine site.
          </Paragraph>
        </Row>
        <Row gutter={16}>
          <Col span={24}>
            {!isEmpty(this.props.mineWorkInformations) || this.state.isEditMode ? (
              <div>
                <Row>
                  {this.state.isEditMode ? (
                    <AddMineWorkInformationForm
                      initialValues={info}
                      title={title}
                      mineWorkInformationGuid={info?.mine_work_information_guid}
                      onSubmit={this.submitAddEditMineWorkInformationForm(
                        info?.mine_work_information_guid
                      )}
                      cancelEdit={this.editWorkInformation}
                      isEditMode={this.state.isEditMode}
                    />
                  ) : (
                    <div>
                      <Row gutter={16}>
                        <Col span={22}>
                          <Descriptions column={5} colon={false}>
                            <Descriptions.Item
                              label={
                                <>
                                  <Tooltip
                                    overlayClassName="minespace-tooltip"
                                    title={
                                      <>
                                        <Typography.Text strong>
                                          Health, Safety and Reclamation Code for Mines in British
                                          Columbia
                                        </Typography.Text>
                                        <br />
                                        <Typography.Text underline>
                                          Notice To Start Work
                                        </Typography.Text>
                                        <br />
                                        <Typography.Text>
                                          6.2.1 The manager shall give 10 days’ notice to an
                                          inspector of intention to start [any mining activity] in,
                                          at, or about a mine, including seasonal reactivation.
                                        </Typography.Text>
                                      </>
                                    }
                                    placement="right"
                                    mouseEnterDelay={0.3}
                                  >
                                    <Icon type="info-circle" className="padding-sm" />
                                  </Tooltip>
                                  Work Start Date
                                </>
                              }
                            >
                              {formatDate(info.work_start_date)}
                            </Descriptions.Item>
                            <Descriptions.Item
                              label={
                                <>
                                  <Tooltip
                                    overlayClassName="minespace-tooltip"
                                    title={
                                      <>
                                        <Typography.Text strong>
                                          Health, Safety and Reclamation Code for Mines in British
                                          Columbia
                                        </Typography.Text>
                                        <br />
                                        <Typography.Text underline>
                                          Notice to Stop Work
                                        </Typography.Text>
                                        <br />
                                        <Typography.Text>
                                          6.2.2 The manager shall give notice to an inspector of
                                          intention to stop [any mining activity] in, at, or about a
                                          mine, permanently, indefinitely, or for a definite period
                                          exceeding 30 days, and except in an emergency, the notice
                                          shall be not less than seven days.
                                        </Typography.Text>
                                      </>
                                    }
                                    placement="right"
                                    mouseEnterDelay={0.3}
                                  >
                                    <Icon type="info-circle" className="padding-sm" />
                                  </Tooltip>
                                  Work Stop Date
                                </>
                              }
                            >
                              {formatDate(info.work_stop_date)}
                            </Descriptions.Item>
                            <Descriptions.Item label="Work Status">
                              <Badge
                                status={getWorkInformationBadgeStatusType(info.work_status)}
                                text={info.work_status}
                              />
                            </Descriptions.Item>
                          </Descriptions>
                        </Col>
                      </Row>
                      <Row gutter={16}>
                        <Col span={24} />
                      </Row>
                    </div>
                  )}
                </Row>
                <Row>
                  {info && (
                    <Col span={22}>
                      {/* NOTE: Ant Design has no easy way to right-align "Descriptions" so plain HTML tags are used here. */}
                      <span className="inline-flex between" style={{ float: "right" }}>
                        <div className="padding-sm">
                          <span className="field-title">Updated By: </span>
                          <span>{info.updated_by}</span>
                        </div>
                        <div className="padding-sm">
                          <span className="field-title">Last Updated: </span>
                          <span>{formatDateTime(info.updated_timestamp)}</span>
                        </div>
                      </span>
                    </Col>
                  )}
                </Row>
              </div>
            ) : (
              <>
                <br />
                This mine has no recorded work information.
              </>
            )}
          </Col>
        </Row>
      </div>
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
    },
    dispatch
  );

MineWorkInformation.propTypes = propTypes;
MineWorkInformation.defaultProps = defaultProps;

export default connect(mapStateToProps, mapDispatchToProps)(MineWorkInformation);
