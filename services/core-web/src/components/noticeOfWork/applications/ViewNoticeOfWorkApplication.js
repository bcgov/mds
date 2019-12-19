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
  location: CustomPropTypes.location,
  match: PropTypes.shape({
    params: {
      id: PropTypes.string,
    },
  }).isRequired,
};

const defaultProps = {
  location: {},
};

export class ViewNoticeOfWorkApplication extends Component {
  state = {
    isLoaded: false,
    showOriginalValues: false,
    fromTitle: "",
    fromRoute: "",
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
    this.setState({
      fromTitle:
        this.props &&
        this.props.location &&
        this.props.location.state &&
        this.props.location.state.fromTitle
          ? this.props.location.state.fromTitle
          : "",
      fromRoute:
        this.props &&
        this.props.location &&
        this.props.location.state &&
        this.props.location.state.fromRoute
          ? this.props.location.state.fromRoute
          : "",
    });
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
        <div className="steps--header fixed-scroll-view">
          <div className="inline-flex between">
            <div>
              <h1>NoW Number: {this.props.noticeOfWork.now_number || Strings.EMPTY_FIELD}</h1>
              {this.state && this.state.fromRoute && (
                <Link to={this.state.fromRoute}>
                  <Icon type="arrow-left" style={{ paddingRight: "5px" }} />
                  Back to: {this.state.fromTitle}
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
        <LoadingWrapper condition={this.state.isLoaded}>
          <div>
            <div
              className="side-menu--fixed"
              style={this.state && this.state.fromRoute ? { paddingTop: "20px" } : {}}
            >
              <NOWSideMenu route={routes.VIEW_NOTICE_OF_WORK_APPLICATION} />
            </div>
            <div
              className="steps--content with-fixed-top"
              style={this.state && this.state.fromRoute ? { paddingTop: "20px" } : {}}
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
      fetchImportedNoticeOfWorkApplication,
      fetchOriginalNoticeOfWorkApplication,
      fetchMineRecordById,
      fetchNoticeOFWorkActivityTypeOptions,
    },
    dispatch
  );

ViewNoticeOfWorkApplication.propTypes = propTypes;
ViewNoticeOfWorkApplication.defaultProps = defaultProps;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ViewNoticeOfWorkApplication);
