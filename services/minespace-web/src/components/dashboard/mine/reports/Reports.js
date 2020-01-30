// TODO: Remove this when the file is more fully implemented.
/* eslint-disable */

import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { Row, Col, Typography, Button, Icon, Alert } from "antd";
import PropTypes from "prop-types";
import { getMine } from "@/selectors/userMineSelectors";
import CustomPropTypes from "@/customPropTypes";
import { fetchMineRecordById } from "@/actionCreators/userDashboardActionCreator";
import { fetchMineReports, updateMineReport } from "@/actionCreators/reportActionCreator";
import { modalConfig } from "@/components/modalContent/config";
import { openModal, closeModal } from "@/actions/modalActions";
import { getMineReports } from "@/selectors/reportSelectors";
import ReportsTable from "@/components/dashboard/mine/reports/ReportsTable";
import TableSummaryCard from "@/components/common/TableSummaryCard";
import { fetchMineReportDefinitionOptions } from "@/actionCreators/staticContentActionCreator";
import { getMineReportDefinitionOptions } from "@/reducers/staticContentReducer";

const { Paragraph, Title, Text } = Typography;

const propTypes = {
  mine: CustomPropTypes.mine,
  match: PropTypes.shape({
    params: {
      id: PropTypes.string,
    },
  }).isRequired,
  mineReports: PropTypes.arrayOf(CustomPropTypes.mineReport).isRequired,
  mineReportDefinitionOptions: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)).isRequired,
  fetchMineReportDefinitionOptions: PropTypes.func.isRequired,
  fetchMineRecordById: PropTypes.func.isRequired,
  updateMineReport: PropTypes.func.isRequired,
  fetchMineReports: PropTypes.func.isRequired,
  openModal: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
};

const defaultProps = {
  mine: {},
};

export class Reports extends Component {
  state = { isLoaded: false };

  componentDidMount() {
    this.props.fetchMineReportDefinitionOptions();
    const { id } = this.props.match.params;
    this.props.fetchMineReports(id);
    this.props.fetchMineRecordById(id).then(() => {
      this.setState({ isLoaded: true });
    });
  }

  handleEditReport = (values) => {
    this.props
      .updateMineReport(this.props.mine.mine_guid, values.mine_report_guid, values)
      .then(() => this.props.closeModal())
      .then(() => this.props.fetchMineReports(this.props.mine.mine_guid));
  };

  openEditReportModal = (event, onSubmit, report) => {
    event.preventDefault();
    this.props.openModal({
      props: {
        initialValues: report,
        onSubmit,
        title: "Edit Report",
        mineGuid: this.props.mine.mine_guid,
      },
      content: modalConfig.ADD_REPORT,
    });
  };

  render() {
    const filteredReportDefinitionGuids =
      this.props.mineReportDefinitionOptions &&
      this.props.mineReportDefinitionOptions
        .filter((option) =>
          option.categories.map((category) => category.mine_report_category).includes("TSF")
        )
        .map((definition) => definition.mine_report_definition_guid);

    const filteredReports =
      this.props.mineReports &&
      this.props.mineReports.filter((report) =>
        filteredReportDefinitionGuids.includes(report.mine_report_definition_guid.toLowerCase())
      );

    return (
      <Row>
        <Col>
          <Row>
            <Col>
              <Button
                style={{ display: "inline", float: "right" }}
                type="primary"
                onClick={(event) => this.openEditReportModal(event, this.props.mine.mine_name)}
              >
                <Icon type="plus-circle" theme="filled" />
                Submit Report
              </Button>
              <Title level={4}>Reports</Title>
              <Paragraph>
                This table shows&nbsp;
                <Text className="color-primary" strong>
                  reports
                </Text>
                &nbsp;that have been submitted to the Ministry. If a report is listed but there are
                no files attached, it means the report has not been submitted.
              </Paragraph>
              <Alert
                message="This table may not show all reports that your mine is required to submit to the Ministry. If you have any questions, please check with an EMPR representative."
                type="info"
                banner
              ></Alert>
              <br />
            </Col>
          </Row>
          <Row type="flex" justify="space-around" gutter={[{ lg: 0, xl: 32 }, 32]}>
            <Col lg={24} xl={8} xxl={6}>
              <TableSummaryCard
                title="Inspections YTD"
                // TODO: Display the amount of submitted reports.
                content="6"
                icon="check-circle"
                type="success"
              />
            </Col>
            <Col lg={24} xl={8} xxl={6}>
              <TableSummaryCard
                title="Overdue Orders"
                // TODO: Display the amount of reports that are overdue.
                content="6"
                icon="clock-circle"
                type="error"
              />
            </Col>
            <Col lg={24} xl={8} xxl={6}>
              <TableSummaryCard
                title="Responses Due"
                // TODO: Display the amount of reports that are due.
                content="6"
                icon="exclamation-circle"
                type="warning"
              />
            </Col>
          </Row>
          <Row>
            <Col>
              <ReportsTable
                openEditReportModal={this.openEditReportModal}
                handleEditReport={this.handleEditReport}
                mineReports={filteredReports}
                isLoaded={this.state.isLoaded}
              />
            </Col>
          </Row>
        </Col>
      </Row>
    );
  }
}

const mapStateToProps = (state) => ({
  mineReports: getMineReports(state),
  mine: getMine(state),
  mineReportDefinitionOptions: getMineReportDefinitionOptions(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchMineReportDefinitionOptions,
      fetchMineRecordById,
      fetchMineReports,
      updateMineReport,
      openModal,
      closeModal,
    },
    dispatch
  );

Reports.propTypes = propTypes;
Reports.defaultProps = defaultProps;

export default connect(mapStateToProps, mapDispatchToProps)(Reports);
