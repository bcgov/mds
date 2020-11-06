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
  mineGuid: PropTypes.string.isRequired,
  updatePermitAmendment: PropTypes.func.isRequired,
  fetchDraftPermitByNOW: PropTypes.func.isRequired,
  noticeOfWork: CustomPropTypes.importedNOWApplication.isRequired,
  draftPermits: CustomPropTypes.permit.isRequired,
  draftAmendment: CustomPropTypes.permit.isRequired,
};

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
        <div className="right">
          <div>
            {!this.state.isEditMode && (
              <NOWActionWrapper permission={Permission.EDIT_PERMITS}>
                {isEmpty(this.props.draftAmendment) ? (
                  <Popconfirm
                    placement="topLeft"
                    title="In order to edit Securities Total and a Securities Date Received, you need to start a Draft Permit."
                    okText="Ok"
                    cancelText="Cancel"
                  >
                    <Button type="secondary">
                      <img
                        src={EDIT_OUTLINE}
                        title="Edit"
                        alt="Edit"
                        className="padding-md--right"
                      />
                      Edit
                    </Button>
                  </Popconfirm>
                ) : (
                  <Button type="secondary" onClick={this.toggleEditMode}>
                    <img src={EDIT_OUTLINE} title="Edit" alt="Edit" className="padding-md--right" />
                    Edit
                  </Button>
                )}
              </NOWActionWrapper>
            )}
          </div>
        </div>
        <LoadingWrapper condition={this.state.isLoaded}>
          <div style={this.state.isEditMode ? { backgroundColor: "#f3f0f0", padding: "20px" } : {}}>
            <PermitAmendmentSecurityForm
              isEditMode={this.state.isEditMode}
              initialValues={this.props.draftAmendment}
              onSubmit={this.addSecurityToPermit}
              onCancel={this.toggleEditMode}
            />
          </div>
        </LoadingWrapper>
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
