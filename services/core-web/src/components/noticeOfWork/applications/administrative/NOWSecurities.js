import React, { Component } from "react";
import PropTypes from "prop-types";
import { Button, Popconfirm } from "antd";
import { bindActionCreators } from "redux";
import { isEmpty } from "lodash";
import { connect } from "react-redux";
import {
  updatePermitAmendment,
  fetchDraftPermitByNOW,
} from "@common/actionCreators/permitActionCreator";
import {
  getDraftPermitAmendmentForNOW,
  getDraftPermitForNOW,
} from "@common/selectors/permitSelectors";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import NOWDocuments from "@/components/noticeOfWork/applications//NOWDocuments";
import CustomPropTypes from "@/customPropTypes";
import { EDIT_OUTLINE } from "@/constants/assets";
import * as Permission from "@/constants/permissions";
import LoadingWrapper from "@/components/common/wrappers/LoadingWrapper";
import PermitAmendmentSecurityForm from "@/components/Forms/permits/PermitAmendmentSecurityForm";

/**
 * @class NOWSecurities- contains all information relating to the Securities/Bond tracking on a Notice of Work Application.
 */

const propTypes = {
  mineGuid: PropTypes.string.isRequired,
  updatePermitAmendment: PropTypes.func.isRequired,
  fetchDraftPermitByNOW: PropTypes.func.isRequired,
  noticeOfWork: CustomPropTypes.importedNOWApplication.isRequired,
  draftPermits: CustomPropTypes.permit.isRequired,
  draftAmendment: CustomPropTypes.permit.isRequired,
  handleSaveNOWEdit: PropTypes.func.isRequired,
};

const securityDocuments = ["SRB", "NIA", "AKL", "SCD"];

export class NOWSecurities extends Component {
  state = { isEditMode: false, isLoaded: false };

  componentDidMount() {
    this.handleFetchDraftPermit();
  }

  handleFetchDraftPermit = () => {
    this.props
      .fetchDraftPermitByNOW(this.props.mineGuid, this.props.noticeOfWork.now_application_guid)
      .then(() => this.setState({ isLoaded: true }));
  };

  toggleEditMode = () => {
    this.setState((prevState) => ({ isEditMode: !prevState.isEditMode }));
  };

  addSecurityToPermit = (payload) => {
    this.props
      .updatePermitAmendment(
        this.props.mineGuid,
        this.props.draftPermits.permit_guid,
        this.props.draftAmendment.permit_amendment_guid,
        payload
      )
      .then(() => {
        this.handleFetchDraftPermit();
        this.toggleEditMode();
      });
  };

  render() {
    return (
      <div>
        <div className="inline-flex between">
          <h3>Securities</h3>
          <div>
            <AuthorizationWrapper permission={Permission.EDIT_PERMITS}>
              {isEmpty(this.props.draftAmendment) ? (
                <Popconfirm
                  placement="topLeft"
                  title="In order to edit Securities Total and a Securities Date Recieved, you need to start a Draft Permit."
                  okText="Ok"
                  cancelText="Cancel"
                >
                  <Button type="secondary">
                    <img src={EDIT_OUTLINE} title="Edit" alt="Edit" className="padding-md--right" />
                    Edit
                  </Button>
                </Popconfirm>
              ) : (
                <Button type="secondary" onClick={this.toggleEditMode}>
                  <img src={EDIT_OUTLINE} title="Edit" alt="Edit" className="padding-md--right" />
                  Edit
                </Button>
              )}
            </AuthorizationWrapper>
          </div>
        </div>
        <LoadingWrapper condition={this.state.isLoaded}>
          <PermitAmendmentSecurityForm
            isEditMode={this.state.isEditMode}
            initialValues={this.props.draftAmendment}
            onSubmit={this.addSecurityToPermit}
          />
        </LoadingWrapper>
        <br />
        <NOWDocuments
          now_application_guid={this.props.noticeOfWork.now_application_guid}
          mine_guid={this.props.mineGuid}
          documents={this.props.noticeOfWork.documents.filter(
            ({ now_application_document_type_code }) =>
              securityDocuments.includes(now_application_document_type_code)
          )}
          isViewMode={false}
          isAdminView
          disclaimerText="Upload a copy of the security into the table below before sending the original to the Securities Team."
          categoriesToShow={securityDocuments}
          handleAfterUpload={this.props.handleSaveNOWEdit}
        />
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  draftAmendment: getDraftPermitAmendmentForNOW(state),
  draftPermits: getDraftPermitForNOW(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators({ updatePermitAmendment, fetchDraftPermitByNOW }, dispatch);

NOWSecurities.propTypes = propTypes;

export default connect(mapStateToProps, mapDispatchToProps)(NOWSecurities);
