/* eslint-disable */
import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import hoistNonReactStatics from "hoist-non-react-statics";
import {
  fetchImportedNoticeOfWorkApplication,
  fetchOriginalNoticeOfWorkApplication,
  fetchImportNoticeOfWorkSubmissionDocumentsJob,
} from "@common/actionCreators/noticeOfWorkActionCreator";
import { clearNoticeOfWorkApplication } from "@common/actions/noticeOfWorkActions";
import { fetchMineRecordById } from "@common/actionCreators/mineActionCreator";
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

const propTypes = {};
const defaultProps = {};

export const ApplicationGuard = (WrappedComponent) => {
  class applicationGuard extends Component {
    state = { fixedTop: false, isLoaded: false };

    componentDidMount() {
      window.addEventListener("scroll", this.handleScroll);
      this.handleScroll();
      console.log("#########################");
      console.log(this.props.location);
      console.log(this.props.match.params.id);
      // this.loadApplication(this.props.match.params.id);
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
        this.props.fetchImportedNoticeOfWorkApplication(id).then(({ data }) => {
          // if (data.imported_to_core && this.props.match.params.tab === "verification") {
          //   this.handleTabChange("application");
          // }
          this.loadMineInfo(data.mine_guid, this.setState({ isLoaded: true }));
        }),
        this.props.fetchImportNoticeOfWorkSubmissionDocumentsJob(id),
      ]);
    };

    loadMineInfo = (mineGuid, onMineInfoLoaded = () => {}) => {
      this.props.fetchMineRecordById(mineGuid).then(({ data }) => {
        this.setState({ isMajorMine: data.major_mine_ind, mineGuid: data.mine_guid });
        onMineInfoLoaded();
      });
    };

    componentWillReceiveProps(nextProps) {
      if (nextProps.match.params.id !== this.props.match.params.id) {
        this.loadApplication(nextProps.match.params.id);
      }
    }

    componentWillUnmount() {
      window.removeEventListener("scroll", this.handleScroll);
    }

    render() {
      if (true) {
        return <WrappedComponent {...this.props} fixedTop={this.state.fixedTop} />;
      }
      return <NullScreen type="unauthorized" />;
    }
  }

  applicationGuard.propTypes = propTypes;
  applicationGuard.defaultProps = defaultProps;

  hoistNonReactStatics(applicationGuard, WrappedComponent);

  const mapStateToProps = (state) => ({});

  const mapDispatchToProps = (dispatch) =>
    bindActionCreators(
      {
        fetchImportedNoticeOfWorkApplication,
        fetchOriginalNoticeOfWorkApplication,
        fetchImportNoticeOfWorkSubmissionDocumentsJob,
        fetchMineRecordById,
        clearNoticeOfWorkApplication,
      },
      dispatch
    );

  return connect(mapStateToProps, mapDispatchToProps)(applicationGuard);
};

export default ApplicationGuard;
