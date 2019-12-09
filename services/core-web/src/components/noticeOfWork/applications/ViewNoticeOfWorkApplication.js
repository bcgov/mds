import React, { Component } from "react";
import PropTypes from "prop-types";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { Button } from "antd";
import * as routes from "@/constants/routes";
import {
  fetchImportedNoticeOfWorkApplication,
  fetchOriginalNoticeOfWorkApplication,
} from "@/actionCreators/noticeOfWorkActionCreator";
import { fetchMineRecordById } from "@/actionCreators/mineActionCreator";
import {
  getNoticeOfWork,
  getOriginalNoticeOfWork,
  getNOWReclamationSummary,
} from "@/selectors/noticeOfWorkSelectors";
import { fetchNoticeOFWorkActivityTypeOptions } from "@/actionCreators/staticContentActionCreator";
import { getMines } from "@/selectors/mineSelectors";
import CustomPropTypes from "@/customPropTypes";
import ReviewNOWApplication from "@/components/noticeOfWork/applications/review/ReviewNOWApplication";
import NOWSideMenu from "@/components/noticeOfWork/applications/NOWSideMenu";
import LoadingWrapper from "@/components/common/wrappers/LoadingWrapper";
import * as Strings from "@/constants/strings";
import { downloadNowDocument } from "@/utils/actionlessNetworkCalls";

/**
 * @class ViewNoticeOfWorkApplication- contains all information regarding a CORE notice of work application
 */

const propTypes = {
  noticeOfWork: CustomPropTypes.importedNOWApplication.isRequired,
  originalNoticeOfWork: CustomPropTypes.importedNOWApplication.isRequired,
  fetchImportedNoticeOfWorkApplication: PropTypes.func.isRequired,
  fetchOriginalNoticeOfWorkApplication: PropTypes.func.isRequired,
  fetchNoticeOFWorkActivityTypeOptions: PropTypes.func.isRequired,
  reclamationSummary: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.strings)).isRequired,
  history: PropTypes.shape({ push: PropTypes.func }).isRequired,
  match: PropTypes.shape({
    params: {
      id: PropTypes.string,
    },
  }).isRequired,
};

export class ViewNoticeOfWorkApplication extends Component {
  state = {
    isLoaded: false,
    showOriginalValues: false,
    fixedTop: false,
  };

  componentDidMount() {
    const { id } = this.props.match.params;
    this.props.fetchNoticeOFWorkActivityTypeOptions();
    this.props.fetchImportedNoticeOfWorkApplication(id).then(() => {
      this.props.history.push(
        routes.VIEW_NOTICE_OF_WORK_APPLICATION.hashRoute(id, "#application-info")
      );
      this.setState({ isLoaded: true });
    });
    this.props.fetchOriginalNoticeOfWorkApplication(id);
  }

  showApplicationForm = () => {
    const document = this.props.noticeOfWork.submission_documents.filter(
      (x) => x.filename === "ApplicationForm.pdf"
    )[0];
    downloadNowDocument(
      document.id,
      this.props.noticeOfWork.now_application_guid,
      document.filename
    );
  };

  handleScroll = () => {
    if (window.pageYOffset > "20" && !this.state.fixedTop) {
      this.setState({ fixedTop: true });
    } else if (window.pageYOffset < "20" && this.state.fixedTop) {
      this.setState({ fixedTop: false });
    }
  };

  render = () => (
    <div className="page" onScroll={this.handleScroll()}>
      <div className={this.state.fixedTop ? "steps--header fixed-scroll-view" : "steps--header"}>
        <div className="inline-flex between">
          <div>
            <h1>NoW Number: {this.props.noticeOfWork.now_number || Strings.EMPTY_FIELD}</h1>
          </div>
          {this.state.isLoaded &&
            this.props.noticeOfWork.submission_documents.filter(
              (x) => x.filename === "ApplicationForm.pdf"
            ).length && (
              <Button onClick={this.showApplicationForm}>Open Original Application Form</Button>
            )}
        </div>
      </div>
      <LoadingWrapper condition={this.state.isLoaded}>
        <div>
          <div className={this.state.fixedTop ? "side-menu--fixed" : "side-menu"}>
            <NOWSideMenu route={routes.VIEW_NOTICE_OF_WORK_APPLICATION} />
          </div>
          <div className={this.state.fixedTop ? "steps--content with-fixed-top" : "steps--content"}>
            <ReviewNOWApplication
              reclamationSummary={this.props.reclamationSummary}
              isViewMode
              initialValues={
                this.state.showOriginalValues
                  ? this.props.originalNoticeOfWork
                  : this.props.noticeOfWork
              }
              noticeOfWork={
                this.state.showOriginalValues
                  ? this.props.originalNoticeOfWork
                  : this.props.noticeOfWork
              }
            />
          </div>
        </div>
      </LoadingWrapper>
    </div>
  );
}

const mapStateToProps = (state) => ({
  noticeOfWork: getNoticeOfWork(state),
  originalNoticeOfWork: getOriginalNoticeOfWork(state),
  mines: getMines(state),
  reclamationSummary: getNOWReclamationSummary(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchImportedNoticeOfWorkApplication,
      fetchOriginalNoticeOfWorkApplication,
      fetchMineRecordById,
      fetchNoticeOFWorkActivityTypeOptions,
    },
    dispatch
  );

ViewNoticeOfWorkApplication.propTypes = propTypes;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ViewNoticeOfWorkApplication);
