import React, { Component } from "react";
import { bindActionCreators } from "redux";
import moment from "moment";
import queryString from "query-string";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Row, Divider } from "antd";
import { isEmpty } from "lodash";
import {
  fetchMineReports,
  updateMineReport,
  createMineReport,
  deleteMineReport,
} from "@common/actionCreators/reportActionCreator";
import { changeModalTitle, openModal, closeModal } from "@common/actions/modalActions";
import { getMineReports } from "@common/selectors/reportSelectors";
import { getMineReportDefinitionOptions } from "@common/selectors/staticContentSelectors";
import { getMines, getMineGuid } from "@common/selectors/mineSelectors";
import * as Strings from "@common/constants/strings";
import CustomPropTypes from "@/customPropTypes";
import * as Permission from "@/constants/permissions";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import AddButton from "@/components/common/AddButton";
import MineReportTable from "@/components/mine/Reports/MineReportTable";
import ReportFilterForm from "@/components/Forms/reports/ReportFilterForm";
import * as routes from "@/constants/routes";
import { modalConfig } from "@/components/modalContent/config";

/**
 * @class  MineReportInfo - contains all permit information
 */

const propTypes = {
  mines: PropTypes.objectOf(CustomPropTypes.mine).isRequired,
  mineGuid: PropTypes.string.isRequired,
  mineReports: PropTypes.arrayOf(CustomPropTypes.mineReport).isRequired,
  mineReportDefinitionOptions: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)).isRequired,
  fetchMineReports: PropTypes.func.isRequired,
  updateMineReport: PropTypes.func.isRequired,
  createMineReport: PropTypes.func.isRequired,
  deleteMineReport: PropTypes.func.isRequired,
  changeModalTitle: PropTypes.func.isRequired,
  openModal: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  history: PropTypes.shape({ replace: PropTypes.func }).isRequired,
  location: PropTypes.shape({ search: PropTypes.string }).isRequired,
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string,
    }),
  }).isRequired,
};

const defaultParams = {
  report_name: undefined,
  report_type: undefined,
  compliance_year: undefined,
  due_date_start: undefined,
  due_date_end: undefined,
  received_date_start: undefined,
  received_date_end: undefined,
  received_only: "false",
  requested_by: undefined,
  status: [],
  sort_field: "received_date",
  sort_dir: "desc",
  mine_reports_type: Strings.MINE_REPORTS_TYPE.codeRequiredReports,
};

export class MineReportInfo extends Component {
  state = {
    mine: {},
    params: defaultParams,
    filteredReports: [],
    isLoaded: false,
  };

  componentDidMount = () => {
    this.setState({ mine: this.props.mines[this.props.mineGuid] });
    const params = queryString.parse(this.props.location.search);
    this.props.fetchMineReports(this.props.mineGuid, defaultParams.mine_reports_type).then(() => {
      this.setState(
        (prevState) => ({
          isLoaded: true,
          params: { ...prevState.params, ...params },
          filteredReports: this.props.mineReports,
        }),
        () =>
          this.props.history.replace(
            routes.MINE_REPORTS.dynamicRoute(this.props.match.params.id, this.state.params)
          )
      );
    });
  };

  componentWillReceiveProps = (nextProps) => {
    if (nextProps.location !== this.props.location) {
      this.renderDataFromURL(nextProps.location.search);
    }
  };

  handleEditReport = (report) => {
    return this.props
      .updateMineReport(report.mine_guid, report.mine_report_guid, report)
      .then(() => this.props.closeModal())
      .then(() => this.fetchReports(report.mine_guid));
  };

  handleAddReport = (values) => {
    return this.props
      .createMineReport(this.props.mineGuid, values)
      .then(() => this.props.closeModal())
      .then(() => this.fetchReports(this.props.mineGuid));
  };

  handleRemoveReport = (report) => {
    return this.props
      .deleteMineReport(report.mine_guid, report.mine_report_guid)
      .then(() => this.fetchReports(report.mine_guid));
  };

  fetchReports = (mineGuid) => {
    return this.props.fetchMineReports(mineGuid, defaultParams.mine_reports_type).then(() => {
      this.setState({
        filteredReports: this.props.mineReports,
      });
    });
  };

  openAddReportModal = (event) => {
    event.preventDefault();
    this.props.openModal({
      props: {
        onSubmit: this.handleAddReport,
        title: `Add report for ${this.state.mine.mine_name}`,
        mineGuid: this.props.mineGuid,
        changeModalTitle: this.props.changeModalTitle,
        mineReportsType: Strings.MINE_REPORTS_TYPE.codeRequiredReports,
      },
      content: modalConfig.ADD_REPORT,
    });
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
          mineReportsType: Strings.MINE_REPORTS_TYPE.codeRequiredReports,
        },
        onSubmit,
        title: `Edit ${report.submission_year} ${report.report_name}`,
        mineGuid: this.props.mineGuid,
        changeModalTitle: this.props.changeModalTitle,
      },
      content: modalConfig.ADD_REPORT,
    });
  };

  renderDataFromURL = (params) => {
    const parsedParams = queryString.parse(params);
    const filteredReports = this.handleFiltering(this.props.mineReports, parsedParams);
    this.setState({
      filteredReports,
      params: parsedParams,
    });
  };

  handleFiltering = (reports, params) => {
    const reportDefinitionGuids = params.report_type
      ? this.props.mineReportDefinitionOptions
          .filter((option) =>
            option.categories
              .map((category) => category.mine_report_category)
              .includes(params.report_type)
          )
          .map((definition) => definition.mine_report_definition_guid)
      : this.props.mineReportDefinitionOptions.map(
          (definition) => definition.mine_report_definition_guid
        );

    const filteredReports = reports.filter((report) => {
      const report_type =
        !params.report_type || reportDefinitionGuids.includes(report.mine_report_definition_guid);
      const report_name =
        !params.report_name || report.mine_report_definition_guid === params.report_name;
      const compliance_year =
        !params.compliance_year ||
        Number(report.submission_year) === Number(params.compliance_year);
      const due_date_start =
        !params.due_date_start ||
        moment(report.due_date, Strings.DATE_FORMAT) >=
          moment(params.due_date_start, Strings.DATE_FORMAT);
      const due_date_end =
        !params.due_date_end ||
        moment(report.due_date, Strings.DATE_FORMAT) <=
          moment(params.due_date_end, Strings.DATE_FORMAT);
      const received_date_start =
        !params.received_date_start ||
        moment(report.received_date, Strings.DATE_FORMAT) >=
          moment(params.received_date_start, Strings.DATE_FORMAT);
      const received_date_end =
        !params.received_date_end ||
        moment(report.received_date, Strings.DATE_FORMAT) <=
          moment(params.received_date_end, Strings.DATE_FORMAT);
      const requested_by =
        !params.requested_by ||
        report.created_by_idir.toLowerCase().includes(params.requested_by.toLowerCase());
      const received_only =
        !params.received_only || params.received_only === "false" || report.received_date;
      const status =
        isEmpty(params.status) ||
        (report.mine_report_submissions &&
          report.mine_report_submissions.length > 0 &&
          params.status.includes(
            report.mine_report_submissions[report.mine_report_submissions.length - 1]
              .mine_report_submission_status_code
          ));
      return (
        report_name &&
        report_type &&
        compliance_year &&
        due_date_start &&
        due_date_end &&
        received_date_start &&
        received_date_end &&
        received_only &&
        requested_by &&
        status
      );
    });
    return filteredReports;
  };

  handleReportFilterSubmit = (params) => {
    this.setState({ params }, () =>
      this.props.history.replace(
        routes.MINE_REPORTS.dynamicRoute(this.props.match.params.id, this.state.params)
      )
    );
  };

  handleReportFilterReset = () => {
    this.setState(
      (prevState) => ({
        params: {
          ...defaultParams,
          sort_field: prevState.params.sort_field,
          sort_dir: prevState.params.sort_dir,
        },
      }),
      () =>
        this.props.history.replace(
          routes.MINE_REPORTS.dynamicRoute(this.props.match.params.id, this.state.params)
        )
    );
  };

  render() {
    return (
      <div className="tab__content">
        <div>
          <h2>Code Required Reports</h2>
          <Divider />
        </div>
        <div className="inline-flex flex-end">
          <Row>
            <AuthorizationWrapper permission={Permission.EDIT_REPORTS}>
              <AddButton onClick={(event) => this.openAddReportModal(event)}>
                Add a Report
              </AddButton>
            </AuthorizationWrapper>
          </Row>
        </div>
        <div className="advanced-search__container">
          <div>
            <h2>Filter By</h2>
            <br />
          </div>
          <ReportFilterForm
            onSubmit={this.handleReportFilterSubmit}
            handleReset={this.handleReportFilterReset}
            initialValues={this.state.params}
            mineReportType={Strings.MINE_REPORTS_TYPE.codeRequiredReports}
          />
        </div>
        <MineReportTable
          isLoaded={this.state.isLoaded}
          openEditReportModal={this.openEditReportModal}
          handleEditReport={this.handleEditReport}
          handleRemoveReport={this.handleRemoveReport}
          handleTableChange={this.handleReportFilterSubmit}
          mineReports={this.state.filteredReports}
          filters={this.state.params}
          sortField={this.state.params.sort_field}
          sortDir={this.state.params.sort_dir}
          mineReportType={Strings.MINE_REPORTS_TYPE.codeRequiredReports}
        />
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  mineReports: getMineReports(state),
  mines: getMines(state),
  mineGuid: getMineGuid(state),
  mineReportDefinitionOptions: getMineReportDefinitionOptions(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchMineReports,
      updateMineReport,
      createMineReport,
      deleteMineReport,
      openModal,
      closeModal,
      changeModalTitle,
    },
    dispatch
  );

MineReportInfo.propTypes = propTypes;

export default connect(mapStateToProps, mapDispatchToProps)(MineReportInfo);
