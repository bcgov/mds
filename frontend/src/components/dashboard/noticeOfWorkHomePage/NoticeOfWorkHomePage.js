import React, { Component } from "react";
import { compose, bindActionCreators } from "redux";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import queryString from "query-string";
import * as Strings from "@/constants/strings";
import * as router from "@/constants/routes";
import { AuthorizationGuard } from "@/HOC/AuthorizationGuard";
import NoticeOfWorkTable from "@/components/dashboard/noticeOfWorkHomePage/NoticeOfWorkTable";
import NoticeOfWorkSearch from "@/components/dashboard/noticeOfWorkHomePage/NoticeOfWorkSearch";
import ResponsivePagination from "@/components/common/ResponsivePagination";
import LoadingWrapper from "@/components/common/wrappers/LoadingWrapper";
import { fetchNoticeOfWorkApplications } from "@/actionCreators/noticeOfWorkActionCreator";
import { getNoticeOfWorkList, getNoticeOfWorkPageData } from "@/selectors/noticeOfWorkSelectors";

const propTypes = {
  fetchNoticeOfWorkApplications: PropTypes.func.isRequired,
  history: PropTypes.shape({ push: PropTypes.func }).isRequired,
  // use NoW custom prop once this feature is fully implemented
  // eslint-disable-next-line react/forbid-prop-types
  noticeOfWorkApplications: PropTypes.arrayOf(PropTypes.any).isRequired,
};

export class NoticeOfWorkHomePage extends Component {
  params = queryString.parse(this.props.location.search);

  state = {
    isLoaded: false,
    params: {
      page: Strings.DEFAULT_PAGE,
      per_page: Strings.DEFAULT_PER_PAGE,
      ...this.params,
    },
  };

  componentDidMount() {
    this.renderDataFromURL();
  }

  renderDataFromURL = (nextProps) => {
    const params = nextProps ? nextProps.location.search : this.props.location.search;
    const parsedParams = queryString.parse(params);
    this.setState({
      params: parsedParams,
      isLoaded: false,
    });
    this.props.fetchNoticeOfWorkApplications(parsedParams).then(() => {
      this.setState({ isLoaded: true });
    });
  };

  handleSearch = (searchParams = {}, clear = false) => {
    const persistedParams = clear ? {} : this.state.params;
    const updatedParams = {
      // Default per_page -- overwrite if provided
      per_page: Strings.DEFAULT_PER_PAGE,
      // Start from existing state
      ...persistedParams,
      // Overwrite prev params with any newly provided search params
      ...searchParams,
      // Reset page number
      page: Strings.DEFAULT_PAGE,
    };

    this.props.history.push(router.NOTICE_OF_WORK_APPLICATIONS.dynamicRoute(updatedParams));
    this.setState(
      {
        params: updatedParams,
      },
      // Fetch parties once state has been updated
      () => this.renderDataFromURL()
    );
  };

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
                <NoticeOfWorkTable
                  handleSearch={this.handleSearch}
                  noticeOfWorkApplications={this.props.noticeOfWorkApplications}
                  sortField={this.state.params.sort_field}
                  sortDir={this.state.params.sort_dir}
                />
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

const mapStateToProps = (state) => ({
  noticeOfWorkApplications: getNoticeOfWorkList(state),
  pageDate: getNoticeOfWorkPageData(state),
});

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
    mapStateToProps,
    mapDispatchToProps
  ),
  AuthorizationGuard("inDevelopment")
)(NoticeOfWorkHomePage);
