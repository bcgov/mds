import React, { Component } from "react";
import { bindActionCreators } from "redux";
import moment from "moment";
import queryString from "query-string";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Row } from "antd";
import { isEmpty } from "lodash";
import CustomPropTypes from "@/customPropTypes";
import * as Permission from "@/constants/permissions";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import {
  fetchMineReports,
  updateMineReport,
  createMineReport,
  deleteMineReport,
} from "@/actionCreators/reportActionCreator";
import AddButton from "@/components/common/AddButton";
import MineReportTable from "@/components/mine/Reports/MineReportTable";
import ReportFilterForm from "@/components/Forms/reports/ReportFilterForm";
import * as ModalContent from "@/constants/modalContent";
import * as routes from "@/constants/routes";
import { modalConfig } from "@/components/modalContent/config";
import { getMineReports } from "@/selectors/reportSelectors";
import { getMineReportDefinitionOptions } from "@/selectors/staticContentSelectors";
import { getMines, getMineGuid } from "@/selectors/mineSelectors";
import { openModal, closeModal } from "@/actions/modalActions";

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
  history: PropTypes.shape({ push: PropTypes.func }).isRequired,
  openModal: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  location: PropTypes.shape({ search: PropTypes.string }).isRequired,
  match: PropTypes.shape({
    params: {
      id: PropTypes.string,
    },
  }).isRequired,
};

const initialSearchValues = {
  report_name: "",
  report_type: "",
  compliance_year: "",
  report_due_date_start: "",
  report_due_date_end: "",
  report_status: "",
};

export class MineReportInfo extends Component {
  state = {
    mine: {},
    reportFilterParams: initialSearchValues,
    filteredReports: [],
  };

  componentWillMount = () => {
    this.props.fetchMineReports(this.props.mineGuid).then(() => {
      if (Object.keys(this.props.location.search).length > 0) {
        this.renderDataFromURL(this.props.location.search);
      } else {
        this.setFilteredReports();
      }
    });
  };

  componentDidMount = () => {
    this.setState({
      mine: this.props.mines[this.props.mineGuid],
    });
  };

  componentWillReceiveProps = (nextProps) => {
    const locationChanged = nextProps.location !== this.props.location;
    if (locationChanged) {
      const correctParams = nextProps.location.search
        ? nextProps.location.search
        : queryString.stringify(initialSearchValues);
      this.renderDataFromURL(correctParams);
    }
  };

  setFilteredReports(reports = null) {
    this.setState({
      filteredReports: reports || this.props.mineReports,
    });
  }

  handleEditReport = (values) => {
    this.props
      .updateMineReport(this.props.mineGuid, values.mine_report_guid, values)
      .then(() => this.props.closeModal())
      .then(() =>
        this.props.fetchMineReports(this.props.mineGuid).then(() => {
          this.setFilteredReports();
        })
      );
  };

  handleAddReport = (values) => {
    this.props
      .createMineReport(this.props.mineGuid, values)
      .then(() => this.props.closeModal())
      .then(() =>
        this.props.fetchMineReports(this.props.mineGuid).then(() => {
          this.setFilteredReports();
        })
      );
  };

  handleRemoveReport = (reportGuid) => {
    this.props.deleteMineReport(this.props.mineGuid, reportGuid).then(() =>
      this.props.fetchMineReports(this.props.mineGuid).then(() => {
        this.setFilteredReports();
      })
    );
  };

  openAddReportModal = (event) => {
    event.preventDefault();
    this.props.openModal({
      props: {
        onSubmit: this.handleAddReport,
        title: `Add report for ${this.state.mine.mine_name}`,
        mineGuid: this.props.mineGuid,
      },
      content: modalConfig.ADD_REPORT,
    });
  };

  openEditReportModal = (event, onSubmit, report) => {
    event.preventDefault();
    this.props.openModal({
      props: {
        initialValues: report,
        onSubmit,
        title: `Edit report for ${this.state.mine.mine_name}`,
        mineGuid: this.props.mineGuid,
      },
      content: modalConfig.ADD_REPORT,
    });
  };

  renderDataFromURL = (params) => {
    const formattedParams = queryString.parse(params);
    const reports = this.props.mineReports || [];
    const filteredReportDefinitionGuids =
      formattedParams.report_type !== ""
        ? this.props.mineReportDefinitionOptions
            .filter((option) =>
              option.categories
                .map((category) => category.mine_report_category)
                .includes(formattedParams.report_type)
            )
            .map((definition) => definition.mine_report_definition_guid)
        : this.props.mineReportDefinitionOptions.map(
            (definition) => definition.mine_report_definition_guid
          );
    const filteredReports = reports.filter((report) =>
      this.handleFiltering(report, formattedParams, filteredReportDefinitionGuids)
    );
    this.setState({
      filteredReports,
      reportFilterParams: formattedParams,
    });
  };

  handleFiltering = (report, params, reportDefinitionGuids) => {
    // convert string to boolean before passing it into a filter check
    const report_name =
      params.report_name === "" || report.mine_report_definition_guid.includes(params.report_name);
    const report_type =
      params.report_type === "" ||
      reportDefinitionGuids.includes(report.mine_report_definition_guid.toLowerCase());
    const compliance_year =
      params.compliance_year === "" || params.compliance_year.includes(report.submission_year);
    const report_due_date_start =
      params.report_due_date_start === "" ||
      moment(report.due_date, "YYYY-MM-DD") >= moment(params.report_due_date_start, "YYYY-MM-DD");
    const report_due_date_end =
      params.report_due_date_end === "" ||
      moment(report.due_date, "YYYY-MM-DD") <= moment(params.report_due_date_end, "YYYY-MM-DD");
    return (
      report_name && report_type && compliance_year && report_due_date_start && report_due_date_end
    );
  };

  handleReportFilter = (values) => {
    if (isEmpty(values)) {
      this.props.history.push(routes.MINE_REPORTS.dynamicRoute(this.props.match.params.id));
    } else {
      this.props.history.push(routes.MINE_REPORTS.dynamicRoute(this.props.match.params.id, values));
    }
  };

  render() {
    return (
      <div>
        <div className="inline-flex flex-end">
          <Row>
            <AuthorizationWrapper permission={Permission.EDIT_REPORTS}>
              <AddButton
                onClick={(event) =>
                  this.openAddReportModal(
                    event,
                    this.handleAddReport,
                    `${ModalContent.ADD_REPORT} to ${this.state.mine.mine_name}`
                  )
                }
              >
                Add a Report
              </AddButton>
            </AuthorizationWrapper>
          </Row>
        </div>
        {this.props.mineReports && this.props.mineReports.length > 0 && (
          <div className="advanced-search__container">
            <div>
              <h2>Filter By</h2>
            </div>
            <Row>
              <ReportFilterForm
                onSubmit={this.handleReportFilter}
                initialValues={this.state.reportFilterParams}
              />
            </Row>
          </div>
        )}
        <MineReportTable
          openEditReportModal={this.openEditReportModal}
          handleEditReport={this.handleEditReport}
          handleRemoveReport={this.handleRemoveReport}
          mineReports={this.state.filteredReports}
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
    },
    dispatch
  );

MineReportInfo.propTypes = propTypes;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MineReportInfo);
