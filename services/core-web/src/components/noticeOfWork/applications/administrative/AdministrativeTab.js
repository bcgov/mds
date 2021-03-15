/* eslint-disable */
import React, { Component } from "react";
import PropTypes from "prop-types";
import { Button } from "antd";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import {
  updateNoticeOfWorkApplication,
  fetchImportedNoticeOfWorkApplication,
} from "@common/actionCreators/noticeOfWorkActionCreator";
import {
  getNoticeOfWork,
  getImportNowSubmissionDocumentsJob,
} from "@common/selectors/noticeOfWorkSelectors";
import { getDropdownInspectors } from "@common/selectors/partiesSelectors";
import CustomPropTypes from "@/customPropTypes";
import * as Strings from "@common/constants/strings";
import * as routes from "@/constants/routes";
import { EDIT_OUTLINE } from "@/constants/assets";
import * as Permission from "@/constants/permissions";
import NOWSideMenu from "@/components/noticeOfWork/applications/NOWSideMenu";
import NOWActionWrapper from "@/components/noticeOfWork/NOWActionWrapper";
import NOWStatusIndicator from "@/components/noticeOfWork/NOWStatusIndicator";
import NOWTabHeader from "@/components/noticeOfWork/applications/NOWTabHeader";
import NOWApplicationAdministrative from "@/components/noticeOfWork/applications/administrative/NOWApplicationAdministrative";
import LoadingWrapper from "@/components/common/wrappers/LoadingWrapper";
import PermitAmendmentSecurityForm from "@/components/Forms/permits/PermitAmendmentSecurityForm";

/**
 * @class AdministrativeTab- contains all information relating to the Securities/Bond tracking on a Notice of Work Application.
 */

const propTypes = {
  noticeOfWork: CustomPropTypes.importedNOWApplication.isRequired,
  updateNoticeOfWorkApplication: PropTypes.func.isRequired,
  fetchImportedNoticeOfWorkApplication: PropTypes.func.isRequired,
};

export class AdministrativeTab extends Component {
  state = {
    associatedLeadInspectorPartyGuid: undefined,
    associatedIssuingInspectorPartyGuid: undefined,
    adminMenuVisible: false,
  };

  setLeadInspectorPartyGuid = (leadInspectorPartyGuid) =>
    this.setState({
      associatedLeadInspectorPartyGuid: leadInspectorPartyGuid,
    });

  setIssuingInspectorPartyGuid = (issuingInspectorPartyGuid) =>
    this.setState({
      associatedIssuingInspectorPartyGuid: issuingInspectorPartyGuid,
    });

  handleSaveNOWEdit = () => {
    return this.props
      .updateNoticeOfWorkApplication(
        this.props.formValues,
        this.props.noticeOfWork.now_application_guid
      )
      .then(() => {
        this.props.fetchImportedNoticeOfWorkApplication(
          this.props.noticeOfWork.now_application_guid
        );
      });
  };

  render() {
    return (
      <div>
        <NOWTabHeader
          tab="ADMIN"
          tabName="Administrative"
          fixedTop={this.props.fixedTop}
          tabActions={
            <NOWActionWrapper permission={Permission.EDIT_PERMITS}>
              <Dropdown
                overlay={this.menu(false)}
                placement="bottomLeft"
                onVisibleChange={this.handleAdminVisibleChange}
                visible={this.state.adminMenuVisible}
              >
                <Button type="secondary" className="full-mobile">
                  Actions
                  <DownOutlined />
                </Button>
              </Dropdown>
            </NOWActionWrapper>
          }
        />
        <div className={this.props.fixedTop ? "side-menu--fixed" : "side-menu"}>
          <NOWSideMenu
            route={routes.NOTICE_OF_WORK_APPLICATION}
            noticeOfWorkType={this.props.noticeOfWork.notice_of_work_type_code}
            tabSection="administrative"
          />
        </div>
        <div
          className={
            this.props.fixedTop ? "side-menu--content with-fixed-top" : "side-menu--content"
          }
        >
          <NOWApplicationAdministrative
            mineGuid={this.props.noticeOfWork.mine_guid}
            noticeOfWork={this.props.noticeOfWork}
            inspectors={this.props.inspectors}
            setLeadInspectorPartyGuid={this.setLeadInspectorPartyGuid}
            setIssuingInspectorPartyGuid={this.setIssuingInspectorPartyGuid}
            handleUpdateInspectors={this.handleUpdateInspectors}
            importNowSubmissionDocumentsJob={this.props.importNowSubmissionDocumentsJob}
            handleSaveNOWEdit={this.handleSaveNOWEdit}
          />
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  noticeOfWork: getNoticeOfWork(state),
  inspectors: getDropdownInspectors(state),
  formValues: getFormValues(FORM.EDIT_NOTICE_OF_WORK)(state),
  importNowSubmissionDocumentsJob: getImportNowSubmissionDocumentsJob(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      updateNoticeOfWorkApplication,
      fetchImportedNoticeOfWorkApplication,
    },
    dispatch
  );

AdministrativeTab.propTypes = propTypes;

export default connect(mapStateToProps, mapDispatchToProps)(AdministrativeTab);
