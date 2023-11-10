import React, { Component } from "react";
import PropTypes from "prop-types";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { InfoCircleOutlined } from "@ant-design/icons";
import { Button, Col, Descriptions, Row, Tooltip, Typography } from "antd";
import { fetchMineRecordById, updateMineRecord } from "@mds/common/redux/actionCreators/mineActionCreator";
import { EDIT_PENCIL } from "@/constants/assets";
import CustomPropTypes from "@/customPropTypes";
import EditWorkerInformationForm from "@/components/Forms/mines/EditWorkerInformationForm";
import * as Strings from "@/constants/strings";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";

const propTypes = {
  mine: PropTypes.objectOf(CustomPropTypes.mine).isRequired,
  fetchMineRecordById: PropTypes.func.isRequired,
  updateMineRecord: PropTypes.func.isRequired,
};

export class WorkerInfoEmployee extends Component {
  state = {
    isEditable: false,
  };

  handleToggleEdit = (event) => {
    event.preventDefault();
    this.setState((prevState) => ({
      isEditable: !prevState.isEditable,
    }));
  };

  handleEditWorkerInfo = (value) => {
    return this.props
      .updateMineRecord(
        this.props.mine.mine_guid,
        {
          number_of_contractors: value.number_of_contractors,
          number_of_mine_employees: value.number_of_mine_employees,
        },
        value.mine_name
      )
      .then(() => {
        this.setState({ isEditable: false });
        this.props.fetchMineRecordById(this.props.mine.mine_guid);
      });
  };

  render() {
    return (
      <div>
        {this.state.isEditable ? (
          <EditWorkerInformationForm
            initialValues={this.props.mine}
            onSubmit={this.handleEditWorkerInfo}
            handleToggleEdit={this.handleToggleEdit}
          />
        ) : (
          <div className="work-information-container">
            <Row gutter={16}>
              <Col span={24}>
                <div className="inline-flex between">
                  <>
                    <Typography.Title level={4}>
                      Worker Information
                      <Tooltip
                        overlayClassName="minespace-tooltip"
                        title="Approximate number of workers on site that includes mine employees and contractors."
                        placement="right"
                        mouseEnterDelay={0.3}
                      >
                        <InfoCircleOutlined className="padding-sm" />
                      </Tooltip>
                    </Typography.Title>
                  </>
                  <AuthorizationWrapper>
                    <Button
                      type="link"
                      onClick={(event) => {
                        this.handleToggleEdit(event);
                      }}
                    >
                      <img src={EDIT_PENCIL} alt="Edit Worker Info" />
                    </Button>
                  </AuthorizationWrapper>
                </div>

                <Descriptions>
                  <Descriptions.Item span={2} label="Number of Mine Employees">
                    {this.props.mine.number_of_mine_employees || Strings.UNKNOWN}
                  </Descriptions.Item>
                  <Descriptions.Item span={2} label="Number of Contractors">
                    {this.props.mine.number_of_contractors || Strings.UNKNOWN}
                  </Descriptions.Item>
                </Descriptions>
              </Col>
            </Row>
          </div>
        )}
      </div>
    );
  }
}

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      updateMineRecord,
      fetchMineRecordById,
    },
    dispatch
  );

WorkerInfoEmployee.propTypes = propTypes;

export default connect(null, mapDispatchToProps)(WorkerInfoEmployee);
