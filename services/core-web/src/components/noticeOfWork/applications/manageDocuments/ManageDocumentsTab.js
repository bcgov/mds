import React, { Component } from "react";
import PropTypes from "prop-types";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { getFormValues } from "redux-form";
import {
  updateNoticeOfWorkApplication,
  fetchImportedNoticeOfWorkApplication,
  fetchNoticeOfWorkApplicationReviews,
} from "@common/actionCreators/noticeOfWorkActionCreator";
import {
  getNoticeOfWork,
  getImportNowSubmissionDocumentsJob,
  getNoticeOfWorkReviews,
} from "@common/selectors/noticeOfWorkSelectors";
import { getGeneratableNoticeOfWorkApplicationDocumentTypeOptions } from "@common/selectors/staticContentSelectors";
import { getDropdownInspectors } from "@common/selectors/partiesSelectors";
import CustomPropTypes from "@/customPropTypes";
import * as FORM from "@/constants/forms";
import NOWSideMenu from "@/components/noticeOfWork/applications/NOWSideMenu";
import NOWTabHeader from "@/components/noticeOfWork/applications/NOWTabHeader";
import NOWApplicationManageDocuments from "@/components/noticeOfWork/applications/manageDocuments/NOWApplicationManageDocuments";

/**
 * @class ManageDocumentsTab- contains all information relating to the documents on a Notice of Work Application.
 */

const propTypes = {
  noticeOfWork: CustomPropTypes.importedNOWApplication.isRequired,
  updateNoticeOfWorkApplication: PropTypes.func.isRequired,
  fetchImportedNoticeOfWorkApplication: PropTypes.func.isRequired,
  fetchNoticeOfWorkApplicationReviews: PropTypes.func.isRequired,
  fixedTop: PropTypes.bool.isRequired,
  importNowSubmissionDocumentsJob: PropTypes.bool.isRequired,
  inspectors: CustomPropTypes.groupOptions.isRequired,
  formValues: CustomPropTypes.importedNOWApplication.isRequired,
  noticeOfWorkReviews: PropTypes.arrayOf(CustomPropTypes.NOWApplicationReview).isRequired,
};

export class ManageDocumentsTab extends Component {
  state = {
    isInspectorsLoaded: true,
  };

  componentDidMount = () =>
    this.props.fetchNoticeOfWorkApplicationReviews(this.props.noticeOfWork.now_application_guid);

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
          tab="MND"
          tabName="Manage Documents"
          fixedTop={this.props.fixedTop}
          showProgressButton={false}
        />
        <div className={this.props.fixedTop ? "side-menu--fixed" : "side-menu"}>
          <NOWSideMenu tabSection="manage-documents" />
        </div>
        <div
          className={
            this.props.fixedTop ? "side-menu--content with-fixed-top" : "side-menu--content"
          }
        >
          <NOWApplicationManageDocuments
            mineGuid={this.props.noticeOfWork.mine_guid}
            noticeOfWork={this.props.noticeOfWork}
            inspectors={this.props.inspectors}
            importNowSubmissionDocumentsJob={this.props.importNowSubmissionDocumentsJob}
            handleSaveNOWEdit={this.handleSaveNOWEdit}
            isLoaded={this.state.isInspectorsLoaded}
            noticeOfWorkReviews={this.props.noticeOfWorkReviews}
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
  generatableApplicationDocuments: getGeneratableNoticeOfWorkApplicationDocumentTypeOptions(state),
  noticeOfWorkReviews: getNoticeOfWorkReviews(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      updateNoticeOfWorkApplication,
      fetchImportedNoticeOfWorkApplication,
      fetchNoticeOfWorkApplicationReviews,
    },
    dispatch
  );

ManageDocumentsTab.propTypes = propTypes;

export default connect(mapStateToProps, mapDispatchToProps)(ManageDocumentsTab);
