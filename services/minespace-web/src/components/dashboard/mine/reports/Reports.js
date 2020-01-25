/* eslint-disable */

import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { Row, Col, Icon, Typography } from "antd";
import PropTypes from "prop-types";
import { getMine } from "@/selectors/userMineSelectors";
import CustomPropTypes from "@/customPropTypes";
import { fetchMineRecordById } from "@/actionCreators/userDashboardActionCreator";
import { fetchMineReports, updateMineReport } from "@/actionCreators/reportActionCreator";
import { modalConfig } from "@/components/modalContent/config";
import { openModal, closeModal } from "@/actions/modalActions";
import { getMineReports } from "@/selectors/reportSelectors";
import ReportsTable from "@/components/dashboard/mine/reports/ReportsTable";
import { fetchMineReportDefinitionOptions } from "@/actionCreators/staticContentActionCreator";
import { getMineReportDefinitionOptions } from "@/reducers/staticContentReducer";

const { Paragraph, Title, Text } = Typography;

const propTypes = {
  mine: CustomPropTypes.mine.isRequired,
  mineReports: PropTypes.arrayOf(CustomPropTypes.mineReport).isRequired,
  mineReportDefinitionOptions: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)).isRequired,
  fetchMineReportDefinitionOptions: PropTypes.func.isRequired,
  fetchMineRecordById: PropTypes.func.isRequired,
  updateMineReport: PropTypes.func.isRequired,
  fetchMineReports: PropTypes.func.isRequired,
  openModal: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
};

const TableSummaryCard = (props) => (
  <div className="table-summary-card">
    <div>
      <Icon className={`table-summary-card-icon color-${props.type}`} type={props.icon} />
      <span className="table-summary-card-title">{props.title}</span>
    </div>
    <div className="table-summary-card-content">{props.content}</div>
  </div>
);

export class Reports extends Component {
  state = { isLoaded: false };

  componentDidMount() {
    this.props.fetchMineReportDefinitionOptions();
    const { mine_guid } = this.props.mine;
    this.props.fetchMineReports(mine_guid);
    this.props.fetchMineRecordById(mine_guid).then(() => {
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
              <Title level={4}>Reports</Title>
              <Paragraph>
                The following table lists all of the{" "}
                <Text className="color-primary" strong>
                  reports
                </Text>{" "}
                associated with this mine.
              </Paragraph>
            </Col>
          </Row>
          <Row gutter={[32, 32]}>
            <Col lg={{ span: 7, offset: 1 }}>
              <TableSummaryCard
                title="Reports Submitted"
                // TODO: Display the amount of submitted reports.
                content="6"
                icon="check-circle"
                type="success"
              />
            </Col>
            <Col lg={7}>
              <TableSummaryCard
                title="Reports Overdue"
                // TODO: Display the amount of reports that are overdue.
                content="6"
                icon="clock-circle"
                type="error"
              />
            </Col>
            <Col lg={7}>
              <TableSummaryCard
                title="Reports Due"
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

export default connect(mapStateToProps, mapDispatchToProps)(Reports);
