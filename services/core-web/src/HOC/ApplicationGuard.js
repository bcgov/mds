import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import Loading from "@/components/common/Loading";
import hoistNonReactStatics from "hoist-non-react-statics";
import {
  fetchImportedNoticeOfWorkApplication,
  fetchOriginalNoticeOfWorkApplication,
  fetchImportNoticeOfWorkSubmissionDocumentsJob,
} from "@common/actionCreators/noticeOfWorkActionCreator";
import CustomPropTypes from "@/customPropTypes";
import { clearNoticeOfWorkApplication } from "@common/actions/noticeOfWorkActions";
import NOWStatusIndicator from "@/components/noticeOfWork/NOWStatusIndicator";
import NullScreen from "@/components/common/NullScreen";

/**
 * @constant ApplicationGuard - Higher Order Component that fetches applications, and handles all common logic between the application routes.
 * If users try to access an "Administrative Amendment" via the Notice of work Flow, they will be redirected.
 * If users try to access an "Notice of Work" via the Administrative Amendment Flow, they will be redirected.
 * If the Guid in the url changes, HOC looks for that change and updates.
 * If the guid is not an application_guid, HOC shows nullScreen
 * HOC handles all fixedTop/Scroll logic and passes flag to children
 *
 */

const propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func,
    replace: PropTypes.func,
    location: PropTypes.shape({
      state: PropTypes.shape({ mineGuid: PropTypes.string, permitGuid: PropTypes.string }),
    }),
  }).isRequired,
  location: PropTypes.shape({
    pathname: PropTypes.string,
    state: PropTypes.shape({
      applicationPageFromRoute: CustomPropTypes.applicationPageFromRoute,
    }),
  }).isRequired,
  match: PropTypes.shape({
    params: {
      id: PropTypes.string,
    },
  }).isRequired,
  clearNoticeOfWorkApplication: PropTypes.func.isRequired,
  fetchImportedNoticeOfWorkApplication: PropTypes.func.isRequired,
  fetchOriginalNoticeOfWorkApplication: PropTypes.func.isRequired,
  fetchImportNoticeOfWorkSubmissionDocumentsJob: PropTypes.func.isRequired,
};
const defaultProps = {};

export const ApplicationGuard = (WrappedComponent) => {
  class applicationGuard extends Component {
    state = {
      fixedTop: false,
      isLoaded: false,
      applicationPageFromRoute: undefined,
      showNullScreen: false,
    };

    componentDidMount() {
      if (this.props.location.state && this.props.location.state.applicationPageFromRoute) {
        this.setState({
          applicationPageFromRoute: this.props.location.state.applicationPageFromRoute,
        });
      }

      if (!this.props.history.location.state && !this.props.match.params.id) {
        this.setState({ showNullScreen: true });
      }

      window.addEventListener("scroll", this.handleScroll);
      this.handleScroll();
      this.loadApplication(this.props.match.params.id);
    }

    componentWillReceiveProps(nextProps) {
      if (nextProps.match.params.id !== this.props.match.params.id) {
        this.loadApplication(nextProps.match.params.id);
      }
    }

    componentWillUnmount() {
      window.removeEventListener("scroll", this.handleScroll);
      this.props.clearNoticeOfWorkApplication();
    }

    handleScroll = () => {
      if (window.pageYOffset > 170 && !this.state.fixedTop) {
        this.setState({ fixedTop: true });
      } else if (window.pageYOffset <= 170 && this.state.fixedTop) {
        this.setState({ fixedTop: false });
      }
    };

    loadApplication = async (id) => {
      this.setState({ isLoaded: false });
      await Promise.all([
        this.props.fetchOriginalNoticeOfWorkApplication(id),
        this.props.fetchImportedNoticeOfWorkApplication(id).then(() => {
          this.handleCorrectRouteByApplicationType();
        }),
        this.props.fetchImportNoticeOfWorkSubmissionDocumentsJob(id),
      ]);
    };

    renderTabTitle = (title, tabSection) => (
      <span>
        <NOWStatusIndicator type="badge" tabSection={tabSection} />
        {title}
      </span>
    );

    handleCorrectRouteByApplicationType = () => {
      // TODO: add routing logic by type
      this.setState({ isLoaded: true });
    };

    render() {
      if (this.state.showNullScreen) {
        return <NullScreen type="unauthorized-page" />;
      }
      if (this.state.isLoaded) {
        return (
          <WrappedComponent
            {...this.props}
            fixedTop={this.state.fixedTop}
            loadNoticeOfWork={this.loadNoticeOfWork}
            applicationPageFromRoute={this.state.applicationPageFromRoute}
            renderTabTitle={this.renderTabTitle}
          />
        );
      }
      return <Loading />;
    }
  }

  applicationGuard.propTypes = propTypes;
  applicationGuard.defaultProps = defaultProps;

  hoistNonReactStatics(applicationGuard, WrappedComponent);

  const mapDispatchToProps = (dispatch) =>
    bindActionCreators(
      {
        fetchImportedNoticeOfWorkApplication,
        fetchOriginalNoticeOfWorkApplication,
        fetchImportNoticeOfWorkSubmissionDocumentsJob,
        clearNoticeOfWorkApplication,
      },
      dispatch
    );

  return connect(null, mapDispatchToProps)(applicationGuard);
};

export default ApplicationGuard;
