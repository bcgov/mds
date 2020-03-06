/* eslint-disable */
import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import queryString from "query-string";
import * as Strings from "@common/constants/strings";
import * as routes from "@/constants/routes";
import CustomPropTypes from "@/customPropTypes";
import ReportsTable from "@/components/dashboard/reportsHomePage/ReportsTable";
import ReportsSearch from "@/components/dashboard/reportsHomePage/ReportsSearch";
import {
  fetchReports,
  updateMineReport,
  deleteMineReport,
} from "@common/actionCreators/reportActionCreator";
import { changeModalTitle, openModal, closeModal } from "@common/actions/modalActions";
import { getReports, getReportsPageData } from "@common/selectors/reportSelectors";
import { formatQueryListParams } from "@common/utils/helpers";
import { modalConfig } from "@/components/modalContent/config";

const propTypes = {
  fetchReports: PropTypes.func.isRequired,
  reports: PropTypes.arrayOf(CustomPropTypes.mineReport).isRequired,
  pageData: CustomPropTypes.reportPageData,
  updateMineReport: PropTypes.func.isRequired,
  deleteMineReport: PropTypes.func.isRequired,
  changeModalTitle: PropTypes.func.isRequired,
  openModal: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  history: PropTypes.shape({ push: PropTypes.func }).isRequired,
  location: PropTypes.shape({ search: PropTypes.string }).isRequired,
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
        routes.REPORTS_DASHBOARD.dynamicRoute({
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
    };

    this.props.history.push(
      routes.REPORTS_DASHBOARD.dynamicRoute(this.joinListParams(updatedParams))
    );
  };

  onPageChange = (page, per_page) => {
    this.props.history.push(
      routes.REPORTS_DASHBOARD.dynamicRoute({
        ...this.state.params,
        page,
        per_page,
      })
    );
  };

  // ***
  handleEditReport = (report) => {
    this.props
      .updateMineReport(report.mine_guid, report.mine_report_guid, report)
      .then(() => this.props.closeModal())
      .then(() =>
        this.props.fetchReports().then(() => {
          // this.setFilteredReports();
        })
      );
  };

  // ***
  handleRemoveReport = (report) => {
    this.props.deleteMineReport(report.mine_guid, report.mine_report_guid).then(() =>
      this.props.fetchReports().then(() => {
        // this.setFilteredReports();
      })
    );
  };

  // ***
  openEditReportModal = (event, onSubmit, report) => {
    event.preventDefault();
    this.props.openModal({
      props: {
        initialValues: {
          ...report,
          mine_report_submission_status:
            report.mine_report_submissions.length > 0
              ? report.mine_report_submissions[report.mine_report_submissions.length - 1]
                  .mine_report_submission_status_code
              : "NRQ",
        },
        onSubmit,
        title: `Edit ${report.submission_year} ${report.report_name}`,
        mineGuid: this.props.mineGuid,
        changeModalTitle: this.props.changeModalTitle,
      },
      content: modalConfig.ADD_REPORT,
    });
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
                sortField={this.state.params.sort_field}
                sortDir={this.state.params.sort_dir}
                searchParams={this.state.params}
                handlePageChange={this.onPageChange}
                pageData={this.props.pageData}
                openEditReportModal={this.openEditReportModal}
                handleEditReport={this.handleEditReport}
                handleRemoveReport={this.handleRemoveReport}
                isDashboardView
              />
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
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchReports,
      updateMineReport,
      deleteMineReport,
      openModal,
      closeModal,
      changeModalTitle,
    },
    dispatch
  );

ReportsHomePage.propTypes = propTypes;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ReportsHomePage);
