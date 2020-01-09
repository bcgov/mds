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
import {
  fetchNoticeOfWorkActivityTypeOptions,
  fetchNoticeOfWorkApplicationStatusOptions,
  fetchNoticeOfWorkApplicationTypeOptions,
  fetchNoticeOfWorkUndergroundExplorationTypeOptions,
  fetchNoticeOfWorkApplicationPermitTypes,
  fetchRegionOptions,
  fetchNoticeOfWorkUnitTypeOptions,
} from "@/actionCreators/staticContentActionCreator";
import { getMines } from "@/selectors/mineSelectors";
import { fetchInspectors } from "@/actionCreators/partiesActionCreator";
import { getInspectorsHash } from "@/selectors/partiesSelectors";
import CustomPropTypes from "@/customPropTypes";
import ReviewNOWApplication from "@/components/noticeOfWork/applications/review/ReviewNOWApplication";
import NOWSideMenu from "@/components/noticeOfWork/applications/NOWSideMenu";
import NoticeOfWorkPageHeader from "@/components/noticeOfWork/applications/NoticeOfWorkPageHeader";
import LoadingWrapper from "@/components/common/wrappers/LoadingWrapper";
import { downloadNowDocument } from "@/utils/actionlessNetworkCalls";

/**
 * @class ViewNoticeOfWorkApplication- contains all information regarding a CORE notice of work application
 */

const propTypes = {
  noticeOfWork: CustomPropTypes.importedNOWApplication.isRequired,
  originalNoticeOfWork: CustomPropTypes.importedNOWApplication.isRequired,
  fetchImportedNoticeOfWorkApplication: PropTypes.func.isRequired,
  fetchOriginalNoticeOfWorkApplication: PropTypes.func.isRequired,
  fetchNoticeOfWorkActivityTypeOptions: PropTypes.func.isRequired,
  fetchNoticeOfWorkUndergroundExplorationTypeOptions: PropTypes.func.isRequired,
  fetchRegionOptions: PropTypes.func.isRequired,
  fetchNoticeOfWorkUnitTypeOptions: PropTypes.func.isRequired,
  fetchNoticeOfWorkApplicationStatusOptions: PropTypes.func.isRequired,
  fetchNoticeOfWorkApplicationTypeOptions: PropTypes.func.isRequired,
  fetchNoticeOfWorkApplicationPermitTypes: PropTypes.func.isRequired,
  fetchInspectors: PropTypes.func.isRequired,
  inspectorsHash: PropTypes.objectOf(PropTypes.string).isRequired,
  reclamationSummary: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.strings)).isRequired,
  history: PropTypes.shape({ push: PropTypes.func }).isRequired,
  location: PropTypes.shape({
    state: PropTypes.shape({
      noticeOfWorkPageFromRoute: CustomPropTypes.noticeOfWorkPageFromRoute,
    }),
  }).isRequired,
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
    noticeOfWorkPageFromRoute: undefined,
  };

  componentDidMount() {
    const { id } = this.props.match.params;
    this.props.fetchNoticeOfWorkApplicationStatusOptions();
    this.props.fetchNoticeOfWorkApplicationTypeOptions();
    this.props.fetchNoticeOfWorkApplicationPermitTypes();
    this.props.fetchNoticeOfWorkUndergroundExplorationTypeOptions();
    this.props.fetchNoticeOfWorkActivityTypeOptions();
    this.props.fetchRegionOptions();
    this.props.fetchInspectors();
    this.props.fetchNoticeOfWorkUnitTypeOptions();
    this.props.fetchImportedNoticeOfWorkApplication(id).then(() => {
      this.setState({ isLoaded: true });
    });
    this.props.fetchOriginalNoticeOfWorkApplication(id);
    this.setState((prevState) => ({
      noticeOfWorkPageFromRoute:
        this.props.location &&
        this.props.location.state &&
        this.props.location.state.noticeOfWorkPageFromRoute
          ? this.props.location.state.noticeOfWorkPageFromRoute
          : prevState.noticeOfWorkPageFromRoute,
    }));
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

  render() {
    return (
      <div className="page">
        <LoadingWrapper condition={this.state.isLoaded}>
          <div className="steps--header fixed-scroll-view">
            <div className="inline-flex between">
              <NoticeOfWorkPageHeader
                noticeOfWork={this.props.noticeOfWork}
                inspectorsHash={this.props.inspectorsHash}
                noticeOfWorkPageFromRoute={this.state.noticeOfWorkPageFromRoute}
              />
              {this.state.isLoaded &&
                this.props.noticeOfWork.submission_documents.filter(
                  (x) => x.filename === "ApplicationForm.pdf"
                ).length > 0 && (
                  <Button onClick={this.showApplicationForm}>Open Original Application Form</Button>
                )}
            </div>
          </div>
          <div>
            <div
              className="side-menu--fixed"
              style={this.state.noticeOfWorkPageFromRoute ? { paddingTop: "24px" } : {}}
            >
              <NOWSideMenu route={routes.VIEW_NOTICE_OF_WORK_APPLICATION} />
            </div>
            <div
              className="steps--content with-fixed-top"
              style={this.state.noticeOfWorkPageFromRoute ? { paddingTop: "24px" } : {}}
            >
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
}

const mapStateToProps = (state) => ({
  noticeOfWork: getNoticeOfWork(state),
  originalNoticeOfWork: getOriginalNoticeOfWork(state),
  mines: getMines(state),
  inspectorsHash: getInspectorsHash(state),
  reclamationSummary: getNOWReclamationSummary(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchNoticeOfWorkApplicationStatusOptions,
      fetchRegionOptions,
      fetchNoticeOfWorkApplicationTypeOptions,
      fetchNoticeOfWorkUndergroundExplorationTypeOptions,
      fetchNoticeOfWorkApplicationPermitTypes,
      fetchImportedNoticeOfWorkApplication,
      fetchOriginalNoticeOfWorkApplication,
      fetchMineRecordById,
      fetchNoticeOfWorkActivityTypeOptions,
      fetchNoticeOfWorkUnitTypeOptions,
      fetchInspectors,
    },
    dispatch
  );

ViewNoticeOfWorkApplication.propTypes = propTypes;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ViewNoticeOfWorkApplication);
