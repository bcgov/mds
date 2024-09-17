import React, { Component } from "react";
import PropTypes from "prop-types";
import { Button } from "antd";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import {
  updateNoticeOfWorkApplication,
  fetchImportedNoticeOfWorkApplication,
} from "@mds/common/redux/actionCreators/noticeOfWorkActionCreator";
import { getNoticeOfWork } from "@mds/common/redux/selectors/noticeOfWorkSelectors";
import NOWActionWrapper from "@/components/noticeOfWork/NOWActionWrapper";
import CustomPropTypes from "@/customPropTypes";
import { EDIT_OUTLINE } from "@/constants/assets";
import * as Permission from "@/constants/permissions";
import LoadingWrapper from "@/components/common/wrappers/LoadingWrapper";
import PermitAmendmentSecurityForm from "@/components/Forms/permits/PermitAmendmentSecurityForm";

/**
 * @class NOWSecurities- contains all information relating to the Securities/Bond tracking on a Notice of Work Application.
 */

const propTypes = {
  noticeOfWork: CustomPropTypes.importedNOWApplication.isRequired,
  updateNoticeOfWorkApplication: PropTypes.func.isRequired,
  fetchImportedNoticeOfWorkApplication: PropTypes.func.isRequired,
};

export class NOWSecurities extends Component {
  state = { isEditMode: false, isLoaded: true };

  handleFetchData = () => {
    this.props
      .fetchImportedNoticeOfWorkApplication(this.props.noticeOfWork.now_application_guid)
      .then(() => this.setState({ isLoaded: true }));
  };

  toggleEditMode = () => {
    this.setState((prevState) => ({ isEditMode: !prevState.isEditMode }));
  };

  handleAddSecurity = (payload) => {
    this.setState({ isLoaded: false });
    const message = "Successfully updated the Reclamation Security information.";
    this.props
      .updateNoticeOfWorkApplication(payload, this.props.noticeOfWork.now_application_guid, message)
      .then(() => {
        this.handleFetchData();
        this.toggleEditMode();
      });
  };

  render() {
    return (
      <div>
        <div className="right">
          {!this.state.isEditMode && (
            <NOWActionWrapper permission={Permission.EDIT_PERMITS} ignoreDelay>
              <Button type="secondary" onClick={this.toggleEditMode}>
                <img src={EDIT_OUTLINE} title="Edit" alt="Edit" className="padding-md--right" />
                Edit
              </Button>
            </NOWActionWrapper>
          )}
        </div>
        <LoadingWrapper condition={this.state.isLoaded}>
          <div style={this.state.isEditMode ? { backgroundColor: "#f3f0f0", padding: "20px" } : {}}>
            <PermitAmendmentSecurityForm
              isEditMode={this.state.isEditMode}
              initialValues={this.props.noticeOfWork}
              onSubmit={this.handleAddSecurity}
              onCancel={this.toggleEditMode}
            />
          </div>
        </LoadingWrapper>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  noticeOfWork: getNoticeOfWork(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      updateNoticeOfWorkApplication,
      fetchImportedNoticeOfWorkApplication,
    },
    dispatch
  );

NOWSecurities.propTypes = propTypes;

export default connect(mapStateToProps, mapDispatchToProps)(NOWSecurities);
