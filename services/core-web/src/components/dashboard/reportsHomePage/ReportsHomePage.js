/* eslint-disable */
import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import queryString from "query-string";
import * as Strings from "@common/constants/strings";
import * as router from "@/constants/routes";
import CustomPropTypes from "@/customPropTypes";
import { getMineReportCategoryOptionsHash } from "@common/selectors/staticContentSelectors";
import ReportsTable from "@/components/dashboard/reportsHomePage/ReportsTable";
import ReportsSearch from "@/components/dashboard/reportsHomePage/ReportsSearch";
import ResponsivePagination from "@/components/common/ResponsivePagination";
import { fetchReports } from "@common/actionCreators/reportActionCreator";
import { getReports, getReportsPageData } from "@common/selectors/reportSelectors";
import { formatQueryListParams } from "@common/utils/helpers";

const propTypes = {
  fetchReports: PropTypes.func.isRequired,
  history: PropTypes.shape({ push: PropTypes.func }).isRequired,
  location: PropTypes.shape({ search: PropTypes.string }).isRequired,
  pageData: CustomPropTypes.reportPageData,
  reports: PropTypes.arrayOf(CustomPropTypes.mineReport).isRequired,
  mineReportCategoryOptionsHash: PropTypes.objectOf(PropTypes.string).isRequired,
};

export class ReportsHomePage extends Component {
  params = queryString.parse(this.props.location.search);

  listQueryParams = [];

  splitListParams = formatQueryListParams("split", this.listQueryParams);

  joinListParams = formatQueryListParams("join", this.listQueryParams);

  state = {
    isLoaded: false,
    params: {
      page: Strings.DEFAULT_PAGE,
      per_page: Strings.DEFAULT_PER_PAGE,
      submissions_only: true,
      ...this.params,
    },
  };

  componentDidMount() {
    const params = this.props.location.search;
    const parsedParams = queryString.parse(params);
    const {
      page = this.state.params.page,
      per_page = this.state.params.per_page,
      submissions_only = this.state.params.submissions_only,
    } = parsedParams;
    if (params) {
      this.renderDataFromURL();
    } else {
      this.props.history.push(
        router.REPORTS_DASHBOARD.dynamicRoute({
          page,
          per_page,
          submissions_only,
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
        params: this.splitListParams(parsedParams),
        isLoaded: false,
      },
      () =>
        this.props.fetchReports(parsedParams).then(() => {
          this.setState({ isLoaded: true });
        })
    );
  };

  handleSearch = (searchParams = {}, clear = false) => {
    const persistedParams = clear ? {} : this.state.params;
    const updatedParams = {
      per_page: Strings.DEFAULT_PER_PAGE,
      ...persistedParams,
      ...searchParams,
      page: Strings.DEFAULT_PAGE,
      submissions_only: true,
    };

    this.props.history.push(
      router.REPORTS_DASHBOARD.dynamicRoute(this.joinListParams(updatedParams))
    );
  };

  onPageChange = (page, per_page) => {
    this.props.history.push(
      router.REPORTS_DASHBOARD.dynamicRoute({
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
            <h1>Browse Reports</h1>
          </div>
        </div>
        <div className="landing-page__content">
          <div className="page__content">
            <ReportsSearch
              handleSearch={this.handleSearch}
              initialValues={{ mine_search: this.state.params.mine_search }}
            />
            <div>
              <ReportsTable
                isLoaded={this.state.isLoaded}
                handleSearch={this.handleSearch}
                reports={this.props.reports}
                mineReportCategoryOptionsHash={this.props.mineReportCategoryOptionsHash}
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
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  reports: getReports(state),
  pageData: getReportsPageData(state),
  mineReportCategoryOptionsHash: getMineReportCategoryOptionsHash(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchReports,
    },
    dispatch
  );

ReportsHomePage.propTypes = propTypes;

export default connect(mapStateToProps, mapDispatchToProps)(ReportsHomePage);
