import React, { Component } from "react";
import PropTypes from "prop-types";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import * as router from "@/constants/routes";
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
  };

  componentDidMount() {
    const { id } = this.props.match.params;
    this.props.fetchNoticeOFWorkActivityTypeOptions();
    this.props.fetchImportedNoticeOfWorkApplication(id).then(() => {
      this.props.history.push(
        router.VIEW_NOTICE_OF_WORK_APPLICATION.hashRoute(id, "#application-info")
      );
      this.setState({ isLoaded: true });
    });
    this.props.fetchOriginalNoticeOfWorkApplication(id);
  }

  toggleShowOriginalValues = () => {
    this.setState((prevState) => ({ showOriginalValues: !prevState.showOriginalValues }));
  };

  handleScroll = () => {
    if (window.pageYOffset > "100" && !this.state.fixedTop) {
      this.setState({ fixedTop: true });
    } else if (window.pageYOffset < "100" && this.state.fixedTop) {
      this.setState({ fixedTop: false });
    }
  };

  render() {
    return (
      <div className="page" onScroll={this.handleScroll()}>
        <LoadingWrapper condition={this.state.isLoaded}>
          <div>
            <div className={this.state.fixedTop ? "side-menu--fixed" : "side-menu"}>
              {this.state.currentStep === 1 && <NOWSideMenu />}
            </div>
            <div
              className={this.state.fixedTop ? "steps--content with-fixed-top" : "steps--content"}
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

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ViewNoticeOfWorkApplication);
