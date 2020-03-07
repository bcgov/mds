import React, { Component } from "react";
import { bindActionCreators } from "redux";
import moment from "moment";
import queryString from "query-string";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Row } from "antd";
import { isEmpty, debounce } from "lodash";
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
import CustomPropTypes from "@/customPropTypes";
import * as Permission from "@/constants/permissions";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import AddButton from "@/components/common/AddButton";
import MineReportTable from "@/components/mine/Reports/MineReportTable";
import ReportFilterForm from "@/components/Forms/reports/ReportFilterForm";
import * as ModalContent from "@/constants/modalContent";
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
  report_due_date_start: undefined,
  report_due_date_end: undefined,
  report_status: undefined,
  sort_dir: undefined,
  sort_field: undefined,
};

export class MineReportInfo extends Component {
  state = {
    mine: {},
    params: defaultParams,
    filteredReports: [],
    isLoaded: false,
    disableAddReport: false,
  };

  componentWillMount = () => {
    this.props.fetchMineReports(this.props.mineGuid).then(() => {
      this.setState({ isLoaded: true });
      if (this.props.location.search) {
        this.renderDataFromURL(this.props.location.search);
      } else {
        this.setFilteredReports();
        this.props.history.replace(
          routes.MINE_REPORTS.dynamicRoute(this.props.match.params.id, defaultParams)
        );
      }
    });
  };

  componentWillReceiveProps = (nextProps) => {
    if (nextProps.mines !== this.props.mines || nextProps.mineGuid !== this.props.mineGuid) {
      this.setState({
        mine: nextProps.mines[nextProps.mineGuid],
      });
    }

    if (nextProps.location !== this.props.location) {
      if (nextProps.location.search) {
        this.renderDataFromURL(nextProps.location.search);
      } else {
        // this.renderDataFromURL(queryString.stringify(defaultParams));
        this.props.history.replace(
          routes.MINE_REPORTS.dynamicRoute(this.props.match.params.id, defaultParams)
        );
      }
    }
  };

  setFilteredReports(reports = null) {
    this.setState({
      filteredReports: reports || this.props.mineReports,
    });
  }

  handleEditReport = (report) => {
    this.props
      .updateMineReport(report.mine_guid, report.mine_report_guid, report)
      .then(() => this.props.closeModal())
      .then(() =>
        this.props.fetchMineReports(report.mine_guid).then(() => {
          this.setFilteredReports();
        })
      );
  };

  handleAddReport = (values) => {
    this.setState({ disableAddReport: true }, () => {
      this.props
        .createMineReport(this.props.mineGuid, values)
        .then(() => this.props.closeModal())
        .then(() =>
          this.props.fetchMineReports(this.props.mineGuid).then(() => {
            this.setFilteredReports();
          })
        )
        .finally(this.setState({ disableAddReport: false }));
    });
  };

  handleRemoveReport = (report) => {
    this.props.deleteMineReport(report.mine_guid, report.mine_report_guid).then(() =>
      this.props.fetchMineReports(report.mine_guid).then(() => {
        this.setFilteredReports();
      })
    );
  };

  openAddReportModal = (event) => {
    event.preventDefault();
    this.props.openModal({
      props: {
        disableAddReport: this.state.disableAddReport,
        onSubmit: debounce(this.handleAddReport, 2000),
        title: `Add report for ${this.state.mine.mine_name}`,
        mineGuid: this.props.mineGuid,
        changeModalTitle: this.props.changeModalTitle,
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

    return reports.filter((report) => {
      const report_name =
        !params.report_name || report.mine_report_definition_guid.includes(params.report_name);
      const report_type =
        !params.report_type || reportDefinitionGuids.includes(report.mine_report_definition_guid);
      const compliance_year =
        !params.compliance_year || params.compliance_year.includes(report.submission_year);
      const report_due_date_start =
        !params.report_due_date_start ||
        moment(report.due_date, "YYYY-MM-DD") >= moment(params.report_due_date_start, "YYYY-MM-DD");
      const report_due_date_end =
        !params.report_due_date_end ||
        moment(report.due_date, "YYYY-MM-DD") <= moment(params.report_due_date_end, "YYYY-MM-DD");
      return (
        report_name &&
        report_type &&
        compliance_year &&
        report_due_date_start &&
        report_due_date_end
      );
    });
  };

  handleReportFilter = (params) => {
    if (isEmpty(params)) {
      this.props.history.replace(
        routes.MINE_REPORTS.dynamicRoute(this.props.match.params.id, defaultParams)
      );
    } else {
      this.props.history.replace(
        routes.MINE_REPORTS.dynamicRoute(this.props.match.params.id, params)
      );
    }
  };

  render() {
    return (
      <div className="tab__content">
        <div className="inline-flex flex-end">
          <Row>
            <AuthorizationWrapper permission={Permission.EDIT_REPORTS}>
              <AddButton
                onClick={(event) =>
                  this.openAddReportModal(
                    event,
                    debounce(this.handleAddReport, 2000),
                    `${ModalContent.ADD_REPORT} to ${this.state.mine.mine_name}`
                  )
                }
              >
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
          <ReportFilterForm onSubmit={this.handleReportFilter} initialValues={this.state.params} />
        </div>
        <MineReportTable
          isLoaded={this.state.isLoaded}
          openEditReportModal={this.openEditReportModal}
          handleEditReport={this.handleEditReport}
          handleRemoveReport={this.handleRemoveReport}
          handleTableChange={this.handleReportFilter}
          mineReports={this.state.filteredReports}
          params={this.state.params}
          sortField={this.state.params.sort_field}
          sortDir={this.state.params.sort_dir}
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
