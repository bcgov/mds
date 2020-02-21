import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { Row, Col, Typography, Button, Icon } from "antd";
import moment from "moment";
import PropTypes from "prop-types";
import {
  createMineReport,
  fetchMineReports,
  updateMineReport,
} from "@common/actionCreators/reportActionCreator";
import { openModal, closeModal } from "@common/actions/modalActions";
import { getMineReports } from "@common/selectors/reportSelectors";
import { getMineReportDefinitionOptions } from "@common/reducers/staticContentReducer";
import CustomPropTypes from "@/customPropTypes";
import ReportsTable from "@/components/dashboard/mine/reports/ReportsTable";
import TableSummaryCard from "@/components/common/TableSummaryCard";
import { modalConfig } from "@/components/modalContent/config";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";

const { Paragraph, Title, Text } = Typography;

const propTypes = {
  mine: CustomPropTypes.mine.isRequired,
  mineReports: PropTypes.arrayOf(CustomPropTypes.mineReport).isRequired,
  // This IS being used.
  // eslint-disable-next-line
  mineReportDefinitionOptions: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)).isRequired,
  updateMineReport: PropTypes.func.isRequired,
  createMineReport: PropTypes.func.isRequired,
  fetchMineReports: PropTypes.func.isRequired,
  openModal: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
};

export class Reports extends Component {
  state = { isLoaded: false, selectedMineReportGuid: null, reportsDue: 0, reportsSubmitted: 0 };

  componentDidMount() {
    this.props.fetchMineReports(this.props.mine.mine_guid).then(() => {
      this.setState({ isLoaded: true });
    });
  }

  componentWillReceiveProps(nextProps) {
    const reportsSubmitted = nextProps.mineReports.filter(
      (report) => report.mine_report_submissions.length > 0
    ).length;
    const reportsDue = nextProps.mineReports.filter(
      (report) => report.mine_report_submissions.length === 0 && report.due_date
    ).length;

    this.setState({ reportsSubmitted, reportsDue });
  }

  handleAddReport = (values) => {
    const formValues = values;
    if (values.mine_report_submissions !== undefined) {
      formValues.received_date = moment().format("YYYY-MM-DD");
    }
    this.props
      .createMineReport(this.props.mine.mine_guid, formValues)
      .then(() => this.props.closeModal())
      .then(() => this.props.fetchMineReports(this.props.mine.mine_guid));
  };

  handleEditReport = (values) => {
    this.props
      .updateMineReport(this.props.mine.mine_guid, this.state.selectedMineReportGuid, values)
      .then(() => this.props.closeModal())
      .then(() => this.props.fetchMineReports(this.props.mine.mine_guid));
  };

  openAddReportModal = (event) => {
    event.preventDefault();
    this.props.openModal({
      props: {
        onSubmit: this.handleAddReport,
        title: "Add Report",
        mineGuid: this.props.mine.mine_guid,
        width: "40vw",
      },
      content: modalConfig.ADD_REPORT,
    });
  };

  openEditReportModal = (event, report) => {
    this.setState({ selectedMineReportGuid: report.mine_report_guid });
    event.preventDefault();
    this.props.openModal({
      props: {
        initialValues: report,
        onSubmit: this.handleEditReport,
        title: `Add Documents to: ${report.report_name}`,
        mineGuid: this.props.mine.mine_guid,
        width: "40vw",
      },
      content: modalConfig.EDIT_REPORT,
    });
  };

  render() {
    return (
      <Row>
        <Col>
          <Row>
            <Col>
              <Title level={4}>Reports</Title>
              <Paragraph>
                This table shows&nbsp;
                <Text className="color-primary" strong>
                  reports
                </Text>
                &nbsp;that have been submitted to the Ministry. If a report is listed but there are
                no files attached, it means the report has not been submitted. This table may not
                show all reports that your mine is required to submit to the Ministry. If you have
                any questions, please check with an EMPR representative.
              </Paragraph>
              <br />
            </Col>
          </Row>
          {this.props.mineReports && this.props.mineReports.length > 0 && (
            <Row type="flex" justify="space-around" gutter={[16, 32]}>
              <Col md={24} lg={8}>
                <TableSummaryCard
                  title="Reports Submitted"
                  content={this.state.reportsSubmitted}
                  icon="check-circle"
                  type="success"
                />
              </Col>
              <Col md={24} lg={8}>
                <TableSummaryCard
                  title="Reports Due"
                  content={this.state.reportsDue}
                  icon="clock-circle"
                  type="error"
                />
              </Col>
            </Row>
          )}
          <Row gutter={[16, 32]}>
            <Col>
              <AuthorizationWrapper>
                <Button
                  style={{ float: "right" }}
                  type="primary"
                  onClick={(event) => this.openAddReportModal(event, this.props.mine.mine_name)}
                >
                  <Icon type="plus-circle" theme="filled" />
                  Submit Report
                </Button>
              </AuthorizationWrapper>
            </Col>
          </Row>
          <Row gutter={[16, 32]}>
            <Col>
              <ReportsTable
                openEditReportModal={this.openEditReportModal}
                mineReports={this.props.mineReports}
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
  mineReportDefinitionOptions: getMineReportDefinitionOptions(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchMineReports,
      createMineReport,
      updateMineReport,
      openModal,
      closeModal,
    },
    dispatch
  );

Reports.propTypes = propTypes;

export default connect(mapStateToProps, mapDispatchToProps)(Reports);
