import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import queryString from "query-string";
import * as Strings from "@mds/common/constants/strings";
import {
  fetchReports,
  updateMineReport,
  deleteMineReport,
} from "@mds/common/redux/actionCreators/reportActionCreator";
import { changeModalTitle, openModal, closeModal } from "@mds/common/redux/actions/modalActions";
import { getReports, getReportsPageData } from "@mds/common/redux/selectors/reportSelectors";
import { PageTracker } from "@common/utils/trackers";
import * as routes from "@/constants/routes";
import CustomPropTypes from "@/customPropTypes";
import ReportsTable from "@/components/dashboard/reportsHomePage/ReportsTable";
import ReportsSearch from "@/components/dashboard/reportsHomePage/ReportsSearch";
import { modalConfig } from "@/components/modalContent/config";

const propTypes = {
  fetchReports: PropTypes.func.isRequired,
  reports: PropTypes.arrayOf(CustomPropTypes.mineReport).isRequired,
  pageData: CustomPropTypes.reportPageData.isRequired,
  updateMineReport: PropTypes.func.isRequired,
  deleteMineReport: PropTypes.func.isRequired,
  changeModalTitle: PropTypes.func.isRequired,
  openModal: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  history: PropTypes.shape({ replace: PropTypes.func }).isRequired,
  location: PropTypes.shape({ search: PropTypes.string }).isRequired,
};

const defaultParams = {
  page: Strings.DEFAULT_PAGE,
  per_page: Strings.DEFAULT_PER_PAGE,
  sort_field: "received_date",
  sort_dir: "desc",
  search: undefined,
  report_type: [],
  report_name: [],
  due_date_after: undefined,
  due_date_before: undefined,
  received_date_after: undefined,
  received_date_before: undefined,
  received_only: "false",
  requested_by: undefined,
  status: [],
  compliance_year: undefined,
  major: undefined,
  region: [],
};

export class ReportsHomePage extends Component {
  state = {
    isLoaded: false,
    params: defaultParams,
  };

  componentDidMount() {
    const params = queryString.parse(this.props.location.search);
    this.setState(
      (prevState) => ({
        params: {
          ...prevState.params,
          ...params,
        },
      }),
      () => this.props.history.replace(routes.REPORTS_DASHBOARD.dynamicRoute(this.state.params))
    );
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.location !== this.props.location) {
      this.setState({ isLoaded: false }, () => this.renderDataFromURL(nextProps.location.search));
    }
  }

  renderDataFromURL = (params) => {
    const parsedParams = queryString.parse(params);
    this.props.fetchReports(parsedParams).then(() => {
      this.setState({ isLoaded: true });
    });
  };

  onPageChange = (page, per_page) => {
    this.setState(
      (prevState) => ({ params: { ...prevState.params, page, per_page } }),
      () => this.props.history.replace(routes.REPORTS_DASHBOARD.dynamicRoute(this.state.params))
    );
  };

  handleSearch = (params) => {
    this.setState(
      {
        params,
      },
      () => this.props.history.replace(routes.REPORTS_DASHBOARD.dynamicRoute(this.state.params))
    );
  };

  handleReset = () => {
    this.setState(
      (prevState) => ({
        params: {
          ...defaultParams,
          per_page: prevState.params.per_page || defaultParams.per_page,
          sort_field: prevState.params.sort_field,
          sort_dir: prevState.params.sort_dir,
        },
      }),
      () => this.props.history.replace(routes.REPORTS_DASHBOARD.dynamicRoute(this.state.params))
    );
  };

  handleEditReport = (report) => {
    return this.props
      .updateMineReport(report.mine_guid, report.mine_report_guid, report)
      .then(() => this.props.closeModal())
      .then(() =>
        this.props.history.replace(routes.REPORTS_DASHBOARD.dynamicRoute(this.state.params))
      );
  };

  handleRemoveReport = (report) => {
    return this.props
      .deleteMineReport(report.mine_guid, report.mine_report_guid)
      .then(() =>
        this.props.history.replace(routes.REPORTS_DASHBOARD.dynamicRoute(this.state.params))
      );
  };

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
        title: `Edit ${report.submission_year} ${report.report_name}`,
        mineGuid: report.mine_guid,
        changeModalTitle: this.props.changeModalTitle,
        onSubmit,
      },
      content: modalConfig.ADD_REPORT,
    });
  };

  render() {
    return (
      <div className="landing-page">
        <PageTracker title="Reports Page" />
        <div className="landing-page__header">
          <div>
            <h1>Browse Reports</h1>
          </div>
        </div>
        <div className="landing-page__content">
          <div className="page__content">
            <ReportsSearch
              handleSearch={this.handleSearch}
              handleReset={this.handleReset}
              initialValues={this.state.params}
            />
            <div>
              <ReportsTable
                isLoaded={this.state.isLoaded}
                handleSearch={this.handleSearch}
                reports={this.props.reports}
                params={this.state.params}
                sortField={this.state.params.sort_field}
                sortDir={this.state.params.sort_dir}
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

export default connect(mapStateToProps, mapDispatchToProps)(ReportsHomePage);
