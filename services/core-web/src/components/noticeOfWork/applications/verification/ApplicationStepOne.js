import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { Result, Alert, Row } from "antd";
import PropTypes from "prop-types";
import {
  createNoticeOfWorkApplication,
  fetchImportedNoticeOfWorkApplication,
  importNoticeOfWorkApplication,
} from "@common/actionCreators/noticeOfWorkActionCreator";
import { getDropdownInspectors } from "@common/selectors/partiesSelectors";
import AssignLeadInspector from "@/components/noticeOfWork/applications/verification/AssignLeadInspector";
import VerifyNOWMineInformation from "@/components/noticeOfWork/applications/verification/verification/VerifyNOWMineInformation";
import CustomPropTypes from "@/customPropTypes";
import MajorMinePermitApplicationCreate from "@/components/noticeOfWork/applications/verification/MajorMinePermitApplicationCreate";

const propTypes = {
  mineGuid: PropTypes.string.isRequired,
  importNoticeOfWorkApplication: PropTypes.func.isRequired,
  noticeOfWork: CustomPropTypes.importedNOWApplication.isRequired,
  fetchImportedNoticeOfWorkApplication: PropTypes.func.isRequired,
  handleUpdateLeadInspector: PropTypes.func.isRequired,
  inspectors: CustomPropTypes.groupOptions.isRequired,
  setLeadInspectorPartyGuid: PropTypes.func.isRequired,
  loadNoticeOfWork: PropTypes.func.isRequired,
  initialPermitGuid: PropTypes.string,
  loadMineData: PropTypes.func.isRequired,
  isMajorMine: PropTypes.bool.isRequired,
  isNewApplication: PropTypes.bool.isRequired,
};

const defaultProps = {
  initialPermitGuid: "",
};
export class ApplicationStepOne extends Component {
  state = {
    isImported: false,
  };

  componentDidMount() {
    this.setState({ isImported: this.props.noticeOfWork.imported_to_core });
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.noticeOfWork.imported_to_core !== nextProps.noticeOfWork.imported_to_core) {
      this.setState({ isImported: nextProps.noticeOfWork.imported_to_core });
    }
  }

  handleNOWImport = (values) => {
    this.props
      .importNoticeOfWorkApplication(this.props.noticeOfWork.now_application_guid, values)
      .then(() => {
        return this.props
          .fetchImportedNoticeOfWorkApplication(this.props.noticeOfWork.now_application_guid)
          .then(({ data }) => {
            this.props.loadMineData(values.mine_guid);
            this.setState({ isImported: data.imported_to_core });
          });
      });
  };

  renderInspectorAssignment = () => {
    return (
      <AssignLeadInspector
        inspectors={this.props.inspectors}
        noticeOfWork={this.props.noticeOfWork}
        setLeadInspectorPartyGuid={this.props.setLeadInspectorPartyGuid}
        handleUpdateLeadInspector={this.props.handleUpdateLeadInspector}
      />
    );
  };

  renderResult = () => {
    const title = this.props.isMajorMine ? "Initialization" : "Verification";
    return (
      <Result
        status="success"
        title={`${title} Complete!`}
        subTitle={`You've already completed the ${title} step.`}
        extra={[
          <Row gutter={48} justify="center">
            <Alert
              message="Need to change something?"
              description="You can transfer the Notice of Work to a different mine or change its Lead Inspector on the Administrative tab"
              type="info"
              showIcon
              style={{ textAlign: "left", height: "100px" }}
            />
          </Row>,
        ]}
      />
    );
  };

  renderContent = () => {
    const values = {
      mine_guid: this.props.mineGuid,
      longitude: this.props.noticeOfWork.longitude,
      latitude: this.props.noticeOfWork.latitude,
    };
    if (this.props.isNewApplication) {
      return (
        <MajorMinePermitApplicationCreate
          initialPermitGuid={this.props.initialPermitGuid}
          mineGuid={this.props.mineGuid}
          loadNoticeOfWork={this.props.loadNoticeOfWork}
        />
      );
    }
    return <VerifyNOWMineInformation values={values} handleNOWImport={this.handleNOWImport} />;
  };

  render() {
    return (
      <div className="tab__content">
        {!this.state.isImported && this.props.mineGuid && this.renderContent()}

        {this.state.isImported && !this.props.noticeOfWork.lead_inspector_party_guid && (
          <div>{this.renderInspectorAssignment()}</div>
        )}
        {this.state.isImported && this.props.noticeOfWork.lead_inspector_party_guid && (
          <div>{this.renderResult()}</div>
        )}
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  inspectors: getDropdownInspectors(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      createNoticeOfWorkApplication,
      fetchImportedNoticeOfWorkApplication,
      importNoticeOfWorkApplication,
    },
    dispatch
  );

ApplicationStepOne.propTypes = propTypes;
ApplicationStepOne.defaultProps = defaultProps;

export default connect(mapStateToProps, mapDispatchToProps)(ApplicationStepOne);
