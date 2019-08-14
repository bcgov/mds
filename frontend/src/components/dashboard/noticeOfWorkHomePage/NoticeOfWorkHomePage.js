import React, { Component } from "react";
import { compose, bindActionCreators } from "redux";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { AuthorizationGuard } from "@/HOC/AuthorizationGuard";
import NoticeOfWorkTable from "@/components/dashboard/noticeOfWorkHomePage/NoticeOfWorkTable";
import NoticeOfWorkSearch from "@/components/dashboard/noticeOfWorkHomePage/NoticeOfWorkSearch";
import ResponsivePagination from "@/components/common/ResponsivePagination";
import LoadingWrapper from "@/components/common/wrappers/LoadingWrapper";
import { fetchNoticeOfWorkApplications } from "@/actionCreators/noticeOfWorkActionCreator";

const propTypes = {
  fetchNoticeOfWorkApplications: PropTypes.func.isRequired,
};

export class NoticeOfWorkHomePage extends Component {
  state = { isLoaded: false };

  componentDidMount() {
    this.props.fetchNoticeOfWorkApplications().then(() => {
      this.setState({ isLoaded: true });
    });
  }

  render() {
    return (
      <div className="landing-page">
        <div className="landing-page__header">
          <div>
            <h1>Browse Notice of Work</h1>
          </div>
        </div>
        <div className="landing-page__content">
          <div className="page__content">
            <NoticeOfWorkSearch />
            <LoadingWrapper condition={this.state.isLoaded}>
              <div>
                <NoticeOfWorkTable />
                <div className="center">
                  <ResponsivePagination
                    onPageChange={() => {}}
                    currentPage={1}
                    pageTotal={2}
                    itemsPerPage={25}
                  />
                </div>
              </div>
            </LoadingWrapper>
          </div>
        </div>
      </div>
    );
  }
}

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchNoticeOfWorkApplications,
    },
    dispatch
  );

NoticeOfWorkHomePage.propTypes = propTypes;

export default compose(
  connect(
    null,
    mapDispatchToProps
  ),
  AuthorizationGuard("inDevelopment")
)(NoticeOfWorkHomePage);
