import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { Col, Row, Result, Alert } from "antd";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { fetchMineRecordById } from "@/actionCreators/mineActionCreator";
import { getMineNames } from "@/selectors/mineSelectors";
import {
  createNoticeOfWorkApplication,
  fetchImportedNoticeOfWorkApplication,
} from "@/actionCreators/noticeOfWorkActionCreator";
import { getDropdownInspectors } from "@/selectors/partiesSelectors";
import VerifyNOWMineConfirmation from "@/components/noticeOfWork/applications/verification/VerifyNOWMineConfirmation";
import CustomPropTypes from "@/customPropTypes";
import LoadingWrapper from "@/components/common/wrappers/LoadingWrapper";
import ChangeNOWMineForm from "@/components/Forms/noticeOfWork/ChangeNOWMineForm";

const propTypes = {
  fetchMineRecordById: PropTypes.func.isRequired,
  fetchMineNameList: PropTypes.func.isRequired,
  handleConfirmMine: PropTypes.func.isRequired,
  setMineGuid: PropTypes.func.isRequired,
  noticeOfWork: CustomPropTypes.importedNOWApplication.isRequired,
  currentMine: CustomPropTypes.mine.isRequired,
};

export class VerifyNOWMine extends Component {
  state = {
    isLoaded: false,
    isImported: false,
  };

  componentDidMount() {
    if (this.props.noticeOfWork) {
      this.setState({ isLoaded: true, isImported: this.props.noticeOfWork.imported_to_core });
    }
  }

  handleConfirmMine = (values) => {
    this.setState({ isLoaded: false });
    this.props
      .createNoticeOfWorkApplication(values.mine_guid, this.props.noticeOfWork.now_application_guid)
      .then(() => {
        return this.props
          .fetchImportedNoticeOfWorkApplication(this.props.noticeOfWork.now_application_guid)
          .then(({ data }) => {
            this.props.fetchMineRecordById(values.mine_guid);
            this.setState({ isImported: data.imported_to_core, isLoaded: true });
          });
      });
  };

  renderVerification = () => {
    const values = { mine_guid: this.props.noticeOfWork.mine_guid };
    return (
      <div>
        <h4>Verify Mine</h4>
        <p>
          Review the information below and verify that the mine associated with the notice of work
          is correct. Use the search to associate a different mine.
        </p>
        <br />
        <ChangeNOWMineForm
          initialValues={values}
          onSubmit={this.handleConfirmMine}
          title="Confirm Mine"
        />
      </div>
    );
  };

  renderInspectorAssignment = () => {
    return (
      <VerifyNOWMineConfirmation
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
    return (
      <LoadingWrapper condition={this.state.isLoaded}>
        <div className="tab__content">
          {!this.state.isImported && <div>{this.renderVerification()}</div>}
          {this.state.isImported && !this.props.noticeOfWork.lead_inspector_party_guid && (
            <div>{this.renderInspectorAssignment()}</div>
          )}
          {this.state.isImported && this.props.noticeOfWork.application_progress[0] && (
            <div>{this.renderResult()}</div>
          )}
        </div>
      </LoadingWrapper>
    );
  }
}

const mapStateToProps = (state) => ({
  mineNameList: getMineNames(state),
  inspectors: getDropdownInspectors(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      createNoticeOfWorkApplication,
      fetchImportedNoticeOfWorkApplication,
      fetchMineRecordById,
    },
    dispatch
  );

VerifyNOWMine.propTypes = propTypes;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(VerifyNOWMine);
