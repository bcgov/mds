import React, { FC, useEffect, useState } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import PlusCircleFilled from "@ant-design/icons/PlusCircleFilled";
import { Button, Col, Row, Typography } from "antd";
import moment from "moment";
import PropTypes from "prop-types";
import {
  createMineReport,
  fetchMineReports,
  updateMineReport,
} from "@mds/common/redux/actionCreators/reportActionCreator";
import { closeModal, openModal } from "@mds/common/redux/actions/modalActions";
import { getMineReports } from "@mds/common/redux/selectors/reportSelectors";
import { getMineReportDefinitionOptions } from "@mds/common/redux/reducers/staticContentReducer";
import CustomPropTypes from "@/customPropTypes";
import ReportsTable from "@/components/dashboard/mine/reports/ReportsTable";
import { modalConfig } from "@/components/modalContent/config";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import { IMine, IMineReport } from "@mds/common";
import { ActionCreator } from "@mds/common/interfaces/actionCreator";

interface ReportsProps {
  mine: IMine;
  mineReports: IMineReport[];
  mineReportDefinitionOptions: any[];
  updateMineReport: ActionCreator<typeof updateMineReport>;
  createMineReport: ActionCreator<typeof createMineReport>;
  fetchMineReports: ActionCreator<typeof fetchMineReports>;
  openModal: (any?) => void;
  closeModal: (any?) => void;
}

export const Reports: FC<ReportsProps> = ({
  mine,
  mineReports,
  mineReportDefinitionOptions,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [report, setReport] = useState(null);

  useEffect(() => {
    props.fetchMineReports(mine.mine_guid).then(() => {
      setIsLoaded(true);
    });
  }, []);

  useEffect(() => {
    const reportsSubmitted = mineReports.filter(
      (report) => report.mine_report_submissions.length > 0
    ).length;
    const reportsDue = mineReports.filter(
      (report) => report.mine_report_submissions.length === 0 && report.due_date
    ).length;
  }, [mineReports]);

  const handleAddReport = (values) => {
    const formValues = values;
    if (values.mine_report_submissions && values.mine_report_submissions.length > 0) {
      formValues.received_date = moment().format("YYYY-MM-DD");
    }
    return props
      .createMineReport(mine.mine_guid, formValues)
      .then(() => props.closeModal())
      .then(() => props.fetchMineReports(mine.mine_guid));
  };

  const handleEditReport = (values) => {
    if (!values.mine_report_submissions || values.mine_report_submissions.length === 0) {
      props.closeModal();
      return;
    }

    let payload: any = {
      mine_report_submissions: [
        ...values.mine_report_submissions,
        {
          documents:
            values.mine_report_submissions[values.mine_report_submissions.length - 1].documents,
        },
      ],
    };

    if (
      !report.received_date &&
      values.mine_report_submissions &&
      values.mine_report_submissions.length > 0
    ) {
      payload = { ...payload, received_date: moment().format("YYYY-MM-DD") };
    }

    return props
      .updateMineReport(mine.mine_guid, report.mine_report_guid, payload)
      .then(() => props.closeModal())
      .then(() => props.fetchMineReports(mine.mine_guid));
  };

  const openAddReportModal = (event) => {
    event.preventDefault();
    props.openModal({
      props: {
        onSubmit: handleAddReport,
        title: "Add Report",
        mineGuid: mine.mine_guid,
        width: "40vw",
      },
      content: modalConfig.ADD_REPORT,
    });
  };

  const openEditReportModal = (event, report) => {
    event.preventDefault();
    setReport(report);
    props.openModal({
      props: {
        onSubmit: handleEditReport,
        title: `Add Documents to: ${report.report_name}`,
        width: "40vw",
        mineGuid: mine.mine_guid,
        mineReport: report,
      },
      content: modalConfig.EDIT_REPORT,
    });
  };

  return (
    <Row>
      <Col span={24}>
        <Row>
          <Col span={24}>
            <div className="submit-report-button">
              <AuthorizationWrapper>
                <Button
                  style={{ zIndex: 1 }}
                  className="submit-report-button"
                  type="primary"
                  onClick={(event) => openAddReportModal(event)}
                >
                  <PlusCircleFilled />
                  Submit Report
                </Button>
              </AuthorizationWrapper>
            </div>
            <Typography.Title level={4} className="report-title">
              Reports
            </Typography.Title>
            <Typography.Paragraph>
              This table shows reports from the Health, Safety and Reclamation code that your mine
              has submitted to the cMinistry. It also shows reports the Ministry has requested from
              your mine. If you do not see an HSRC report that your mine must submit, click Submit
              Report, choose the report you need to send and then attach the file or files.
            </Typography.Paragraph>
            <Typography.Paragraph>
              Note: Do not use this page to submit reports specified in your permit. Continue to
              email these reports to the Ministry.
            </Typography.Paragraph>
          </Col>
        </Row>
        <Row gutter={[16, 32]}>
          <Col span={24}>
            <ReportsTable
              openEditReportModal={openEditReportModal}
              mineReports={mineReports}
              isLoaded={isLoaded}
            />
          </Col>
        </Row>
      </Col>
    </Row>
  );
};

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

export default connect(mapStateToProps, mapDispatchToProps)(Reports);
