import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import PlusCircleFilled from "@ant-design/icons/PlusCircleFilled";
import { Row, Col, Typography, Button } from "antd";
import moment from "moment";
import PropTypes from "prop-types";
import {
  createMineReport,
  fetchMineReports,
  updateMineReport,
} from "@mds/common/redux/actionCreators/reportActionCreator";
import { openModal, closeModal } from "@mds/common/redux/actions/modalActions";
import { getMineReports } from "@mds/common/redux/selectors/reportSelectors";
import { getMineReportDefinitionOptions } from "@mds/common/redux/reducers/staticContentReducer";
import CustomPropTypes from "@/customPropTypes";
import ReportsTable from "@/components/dashboard/mine/reports/ReportsTable";
import TableSummaryCard from "@/components/common/TableSummaryCard";
import { modalConfig } from "@/components/modalContent/config";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";

const propTypes = {
  mine: CustomPropTypes.mine.isRequired,
  mineReports: PropTypes.arrayOf(CustomPropTypes.mineReport).isRequired,
  // eslint-disable-next-line react/no-unused-prop-types
  mineReportDefinitionOptions: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)).isRequired,
  updateMineReport: PropTypes.func.isRequired,
  createMineReport: PropTypes.func.isRequired,
  fetchMineReports: PropTypes.func.isRequired,
  openModal: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
};

export class Reports extends Component {
  state = { isLoaded: false, report: null, reportsDue: 0, reportsSubmitted: 0 };

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
    if (values.mine_report_submissions && values.mine_report_submissions.length > 0) {
      formValues.received_date = moment().format("YYYY-MM-DD");
    }
    return this.props
      .createMineReport(this.props.mine.mine_guid, formValues)
      .then(() => this.props.closeModal())
      .then(() => this.props.fetchMineReports(this.props.mine.mine_guid));
  };

  handleEditReport = (values) => {
    if (!values.mine_report_submissions || values.mine_report_submissions.length === 0) {
      this.props.closeModal();
      return;
    }

    let payload = {
      mine_report_submissions: [
        ...values.mine_report_submissions,
        {
          documents:
            values.mine_report_submissions[values.mine_report_submissions.length - 1].documents,
        },
      ],
    };

    if (
      !this.state.report.received_date &&
      values.mine_report_submissions &&
      values.mine_report_submissions.length > 0
    ) {
      payload = { ...payload, received_date: moment().format("YYYY-MM-DD") };
    }

    return this.props
      .updateMineReport(this.props.mine.mine_guid, this.state.report.mine_report_guid, payload)
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
    event.preventDefault();
    this.setState({ report });
    this.props.openModal({
      props: {
        onSubmit: this.handleEditReport,
        title: `Add Documents to: ${report.report_name}`,
        width: "40vw",
        mineGuid: this.props.mine.mine_guid,
        mineReport: report,
      },
      content: modalConfig.EDIT_REPORT,
    });
  };

  render() {
    return (
      <Row>
        <Col span={24}>
          <Row>
            <Col span={24}>
              <Typography.Title level={4}>Reports</Typography.Title>
              <Typography.Paragraph>
                This table shows&nbsp;
                <Typography.Text className="color-primary" strong>
                  reports
                </Typography.Text>
                &nbsp;from the Health, Safety and Reclamation code that your mine has submitted to
                the Ministry. It also shows reports the Ministry has requested from your mine.
                <br />
                If you do not see an HSRC report that your mine must submit, click Submit Report,
                choose the report you need to send and then attach the file or files.
                <br />
                <Typography.Text className="color-primary" strong>
                  Note
                </Typography.Text>
                : Do not use this page to submit reports specified in your permit. Continue to email
                these reports to the Ministry.
              </Typography.Paragraph>
              <br />
            </Col>
          </Row>
          {/* The summary cards are intentionally hidden for now. */}
          {false && this.props.mineReports && this.props.mineReports.length > 0 && (
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
            <Col span={24}>
              <AuthorizationWrapper>
                <Button
                  style={{ zIndex: 1 }}
                  className="float-right"
                  type="primary"
                  onClick={(event) => this.openAddReportModal(event, this.props.mine.mine_name)}
                >
                  <PlusCircleFilled />
                  Submit Report
                </Button>
              </AuthorizationWrapper>
            </Col>
          </Row>
          <Row gutter={[16, 32]}>
            <Col span={24}>
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
