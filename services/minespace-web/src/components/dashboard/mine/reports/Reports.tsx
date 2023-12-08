import React, { FC, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import PlusCircleFilled from "@ant-design/icons/PlusCircleFilled";
import { Button, Col, Row, Typography } from "antd";
import moment from "moment";
import {
  createMineReport,
  fetchMineReports,
  updateMineReport,
} from "@mds/common/redux/actionCreators/reportActionCreator";
import { closeModal, openModal } from "@mds/common/redux/actions/modalActions";
import { getMineReports } from "@mds/common/redux/selectors/reportSelectors";
import ReportsTable from "@/components/dashboard/mine/reports/ReportsTable";
import { modalConfig } from "@/components/modalContent/config";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import { IMine, IMineReport } from "@mds/common";

interface ReportsProps {
  mine: IMine;
}

export const Reports: FC<ReportsProps> = ({ mine, ...props }) => {
  const dispatch = useDispatch();

  const mineReports: IMineReport[] = useSelector(getMineReports);

  const [isLoaded, setIsLoaded] = useState(false);
  const [report, setReport] = useState(null);

  useEffect(() => {
    let isMounted = true;

    setIsLoaded(false);

    dispatch(fetchMineReports(mine.mine_guid)).then(() => {
      if (isMounted) {
        setIsLoaded(true);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleAddReport = async (values) => {
    const formValues = values;
    if (values.mine_report_submissions && values.mine_report_submissions.length > 0) {
      formValues.received_date = moment().format("YYYY-MM-DD");
    }

    await dispatch(createMineReport(mine.mine_guid, formValues));
    await dispatch(closeModal());
    return dispatch(fetchMineReports(mine.mine_guid));
  };

  const handleEditReport = async (values) => {
    if (!values.mine_report_submissions || values.mine_report_submissions.length === 0) {
      dispatch(closeModal());
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
    await dispatch(updateMineReport(mine.mine_guid, report.mine_report_guid, payload));
    await dispatch(closeModal());
    return dispatch(fetchMineReports(mine.mine_guid));
  };

  const openAddReportModal = (event) => {
    event.preventDefault();
    dispatch(
      openModal({
        props: {
          onSubmit: handleAddReport,
          title: "Add Report",
          mineGuid: mine.mine_guid,
          width: "40vw",
        },
        content: modalConfig.ADD_REPORT,
      })
    );
  };

  const openEditReportModal = (event, report) => {
    event.preventDefault();
    setReport(report);
    dispatch(
      openModal({
        props: {
          onSubmit: handleEditReport,
          title: `Edit Report: ${report.report_name}`,
          mineGuid: mine.mine_guid,
          width: "40vw",
          mineReport: report,
        },
        content: modalConfig.EDIT_REPORT,
      })
    );
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
              has submitted to the Ministry. It also shows reports the Ministry has requested from
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

export default Reports;
