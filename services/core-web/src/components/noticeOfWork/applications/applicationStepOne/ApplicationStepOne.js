import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { Result, Alert, Row, Col } from "antd";
import PropTypes from "prop-types";
import { fetchMineRecordById } from "@/actionCreators/mineActionCreator";
import {
  createNoticeOfWorkApplication,
  fetchImportedNoticeOfWorkApplication,
  importNoticeOfWorkApplication,
} from "@/actionCreators/noticeOfWorkActionCreator";
import { getDropdownInspectors } from "@/selectors/partiesSelectors";
import AssignLeadInspector from "@/components/noticeOfWork/applications/applicationStepOne/AssignLeadInspector";
import VerifyNOWMineInformation from "@/components/noticeOfWork/applications/applicationStepOne/verification/VerifyNOWMineInformation";
import CustomPropTypes from "@/customPropTypes";
import MMPermitApplicationInit from "@/components/noticeOfWork/applications/applicationStepOne/MMPermitApplicationInit";
import { getMines } from "@/selectors/mineSelectors";

const propTypes = {
  mineGuid: PropTypes.string.isRequired,
  mines: PropTypes.arrayOf(CustomPropTypes.mine).isRequired,
  fetchMineRecordById: PropTypes.func.isRequired,
  importNoticeOfWorkApplication: PropTypes.func.isRequired,
  noticeOfWork: CustomPropTypes.importedNOWApplication.isRequired,
  fetchImportedNoticeOfWorkApplication: PropTypes.func.isRequired,
  handleUpdateLeadInspector: PropTypes.func.isRequired,
  handleProgressChange: PropTypes.func.isRequired,
  inspectors: CustomPropTypes.groupOptions.isRequired,
  setLeadInspectorPartyGuid: PropTypes.func.isRequired,
  loadNoticeOfWork: PropTypes.func.isRequired,
  initialPermitGuid: PropTypes.string,
};

const defaultProps = {
  initialPermitGuid: "",
};
export class ApplicationStepOne extends Component {
  state = {
    isLoaded: false,
    isImported: false,
  };

  componentDidMount() {
    if (this.props.noticeOfWork !== {}) {
      this.setState({ isLoaded: true, isImported: this.props.noticeOfWork.imported_to_core });
    }
  }

  handleNOWImport = (values) => {
    this.setState({ isLoaded: false });
    this.props
      .importNoticeOfWorkApplication(values.mine_guid, this.props.noticeOfWork.now_application_guid)
      .then(() => {
        return this.props
          .fetchImportedNoticeOfWorkApplication(this.props.noticeOfWork.now_application_guid)
          .then(({ data }) => {
            this.props.fetchMineRecordById(values.mine_guid);
            this.setState({ isImported: data.imported_to_core, isLoaded: true });
          });
      });
  };

  renderInspectorAssignment = () => {
    return (
      <AssignLeadInspector
        inspectors={this.props.inspectors}
        noticeOfWork={this.props.noticeOfWork}
        setLeadInspectorPartyGuid={this.props.setLeadInspectorPartyGuid}
        handleUpdateLeadInspector={(e) =>
          this.props.handleUpdateLeadInspector(() => this.props.handleProgressChange("REV"), e)
        }
      />
    );
  };

  renderResult = () => {
    return (
      <Result
        status="success"
        title="Verification Complete!"
        subTitle="You've already completed the Verification step."
        extra={[
          <Row>
            <Col
              lg={{ span: 8, offset: 8 }}
              md={{ span: 10, offset: 7 }}
              sm={{ span: 12, offset: 6 }}
            >
              <Alert
                message="Need to change something?"
                description="You can transfer the Notice of Work to a different mine or change its Lead Inspector by using the Actions dropdown menu above."
                type="info"
                showIcon
                style={{ textAlign: "left" }}
              />
            </Col>
          </Row>,
        ]}
      />
    );
  };

  render() {
    const values = { mine_guid: this.props.noticeOfWork.mine_guid };
    return (
      <div className="tab__content">
        {!this.state.isImported && !this.props.mines[this.props.mineGuid].major_mine_ind && (
          <VerifyNOWMineInformation
            values={values}
            isLoaded={this.state.isLoaded}
            handleNOWImport={this.handleNOWImport}
          />
        )}
        {!this.state.isImported && this.props.mines[this.props.mineGuid].major_mine_ind && (
          <MMPermitApplicationInit
            initialPermitGuid={this.props.initialPermitGuid}
            mineGuid={this.props.mineGuid}
            handleProgressChange={this.props.handleProgressChange}
            loadNoticeOfWork={this.props.loadNoticeOfWork}
          />
        )}
        {this.state.isImported && !this.props.noticeOfWork.lead_inspector_party_guid && (
          <div>{this.renderInspectorAssignment()}</div>
        )}
        {this.state.isImported && this.props.noticeOfWork.application_progress[0] && (
          <div>{this.renderResult()}</div>
        )}
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  inspectors: getDropdownInspectors(state),
  mines: getMines(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      createNoticeOfWorkApplication,
      fetchImportedNoticeOfWorkApplication,
      fetchMineRecordById,
      importNoticeOfWorkApplication,
    },
    dispatch
  );

ApplicationStepOne.propTypes = propTypes;
ApplicationStepOne.defaultProps = defaultProps;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ApplicationStepOne);
