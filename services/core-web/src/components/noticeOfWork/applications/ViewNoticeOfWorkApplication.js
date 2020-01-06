import React, { Component } from "react";
import PropTypes from "prop-types";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { Button, Icon } from "antd";
import { Link } from "react-router-dom";
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
  fetchNoticeOFWorkActivityTypeOptions,
  fetchNoticeOFWorkApplicationStatusOptions,
  fetchNoticeOFWorkApplicationTypeOptions,
  fetchNoticeOFWorkUndergroundExplorationTypeOptions,
  fetchNoticeOFWorkApplicationPermitTypes,
  fetchRegionOptions,
} from "@/actionCreators/staticContentActionCreator";
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
  fetchNoticeOFWorkUndergroundExplorationTypeOptions: PropTypes.func.isRequired,
  fetchRegionOptions: PropTypes.func.isRequired,
  fetchNoticeOFWorkApplicationStatusOptions: PropTypes.func.isRequired,
  fetchNoticeOFWorkApplicationTypeOptions: PropTypes.func.isRequired,
  fetchNoticeOFWorkApplicationPermitTypes: PropTypes.func.isRequired,
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
    this.props.fetchNoticeOFWorkApplicationStatusOptions();
    this.props.fetchNoticeOFWorkApplicationTypeOptions();
    this.props.fetchNoticeOFWorkApplicationPermitTypes();
    this.props.fetchNoticeOFWorkUndergroundExplorationTypeOptions();
    this.props.fetchNoticeOFWorkActivityTypeOptions();
    this.props.fetchRegionOptions();
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
              <div>
                <h1>NoW Number: {this.props.noticeOfWork.now_number || Strings.EMPTY_FIELD}</h1>
                {this.state.noticeOfWorkPageFromRoute && (
                  <Link to={this.state.noticeOfWorkPageFromRoute.route}>
                    <Icon type="arrow-left" style={{ paddingRight: "5px" }} />
                    Back to: {this.state.noticeOfWorkPageFromRoute.title}
                  </Link>
                )}
              </div>
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
  reclamationSummary: getNOWReclamationSummary(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchNoticeOFWorkApplicationStatusOptions,
      fetchRegionOptions,
      fetchNoticeOFWorkApplicationTypeOptions,
      fetchNoticeOFWorkUndergroundExplorationTypeOptions,
      fetchNoticeOFWorkApplicationPermitTypes,
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
