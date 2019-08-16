import React, { Component } from "react";
import { compose, bindActionCreators } from "redux";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import queryString from "query-string";
import * as Strings from "@/constants/strings";
import * as router from "@/constants/routes";
import { AuthorizationGuard } from "@/HOC/AuthorizationGuard";
import CustomPropTypes from "@/customPropTypes";
import NoticeOfWorkTable from "@/components/dashboard/noticeOfWorkHomePage/NoticeOfWorkTable";
import NoticeOfWorkSearch from "@/components/dashboard/noticeOfWorkHomePage/NoticeOfWorkSearch";
import ResponsivePagination from "@/components/common/ResponsivePagination";
import LoadingWrapper from "@/components/common/wrappers/LoadingWrapper";
import { fetchNoticeOfWorkApplications } from "@/actionCreators/noticeOfWorkActionCreator";
import { getNoticeOfWorkList, getNoticeOfWorkPageData } from "@/selectors/noticeOfWorkSelectors";

const propTypes = {
  fetchNoticeOfWorkApplications: PropTypes.func.isRequired,
  history: PropTypes.shape({ push: PropTypes.func }).isRequired,
  location: PropTypes.shape({ search: PropTypes.string }).isRequired,
  pageData: CustomPropTypes.pageData.isRequired,
  noticeOfWorkApplications: PropTypes.arrayOf(CustomPropTypes.nowApplication).isRequired,
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
    const params = this.props.location.search;
    const parsedParams = queryString.parse(params);
    const { page = this.state.params.page, per_page = this.state.params.per_page } = parsedParams;
    if (params) {
      this.renderDataFromURL();
    } else {
      this.props.history.push(
        router.NOTICE_OF_WORK_APPLICATIONS.dynamicRoute({
          page,
          per_page,
        })
      );
    }
  }

  componentWillReceiveProps(nextProps) {
    const locationChanged = nextProps.location !== this.props.location;
    if (locationChanged) {
      this.renderDataFromURL(nextProps.location.search);
    }
  }

  componentWillUnmount() {
    this.setState({ params: {} });
  }

  renderDataFromURL = (queryParams) => {
    const params = queryParams || this.props.location.search;
    const parsedParams = queryString.parse(params);
    this.setState(
      {
        params: parsedParams,
        isLoaded: false,
      },
      () =>
        this.props.fetchNoticeOfWorkApplications(parsedParams).then(() => {
          this.setState({ isLoaded: true });
        })
    );
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
    this.setState({
      params: updatedParams,
    });
  };

  onPageChange = (page, per_page) => {
    this.props.history.push(
      router.NOTICE_OF_WORK_APPLICATIONS.dynamicRoute({
        ...this.state.params,
        page,
        per_page,
      })
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
            <NoticeOfWorkSearch
              handleSearch={this.handleSearch}
              initialValues={{ mine_search: this.state.params.mine_search }}
            />
            <LoadingWrapper condition={this.state.isLoaded}>
              <div>
                <NoticeOfWorkTable
                  handleSearch={this.handleSearch}
                  noticeOfWorkApplications={this.props.noticeOfWorkApplications}
                  sortField={this.state.params.sort_field}
                  sortDir={this.state.params.sort_dir}
                  searchParams={this.state.params}
                />
                <div className="center">
                  <ResponsivePagination
                    onPageChange={this.onPageChange}
                    currentPage={Number(this.state.params.page)}
                    pageTotal={Number(this.props.pageData.total)}
                    itemsPerPage={Number(this.state.params.per_page)}
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
  pageData: getNoticeOfWorkPageData(state),
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
