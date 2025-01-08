import React, { FC, useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import PlusCircleFilled from "@ant-design/icons/PlusCircleFilled";
import { Button, Col, Row, Typography } from "antd";
import { fetchMineReports } from "@mds/common/redux/actionCreators/reportActionCreator";
import { getMineReports, getReportsPageData } from "@mds/common/redux/selectors/reportSelectors";
import ReportsTable from "@/components/dashboard/mine/reports/ReportsTable";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import { IMine, IMineReport, IPageData } from "@mds/common";
import { Link, useHistory } from "react-router-dom";
import * as routes from "@/constants/routes";
import { Link as ScrollLink, Element } from "react-scroll";
import { SidebarContext } from "@mds/common/components/common/SidebarWrapper";
import ResponsivePagination from "@mds/common/components/common/ResponsivePagination";
import * as Strings from "@mds/common/constants/strings";

export const Reports: FC = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const { mine } = useContext<{ mine: IMine }>(SidebarContext);
  const pageData = useSelector(getReportsPageData);
  const mineReports: IMineReport[] = useSelector(getMineReports);

  const [isLoaded, setIsLoaded] = useState(false);
  const [permitRequiredReports, setPermitRequiredReports] = useState<IMineReport[]>([]);
  const [codeRequiredReports, setCodeRequiredReports] = useState<IMineReport[]>([]);
  const defaultPageData = {
    current_page: 1,
    items_per_page: 10,
    records: [],
    total: 0,
    total_pages: 1,
  };
  const [crrPageData, setCRRPageData] = useState<IPageData<IMineReport>>(defaultPageData);
  const [prrPageData, setPRRPageData] = useState<IPageData<IMineReport>>(defaultPageData);

  useEffect(() => {
    if (mineReports[0]) {
      const permitGuid = mineReports[0].permit_guid;
      if (!permitGuid) {
        setCodeRequiredReports(mineReports);
        setCRRPageData(pageData);
      } else {
        setPermitRequiredReports(mineReports);
        setPRRPageData(pageData);
      }
    }
  }, [mineReports]);

  useEffect(() => {
    let isMounted = true;
    setIsLoaded(false);
    Promise.all([
      dispatch(fetchMineReports(mine.mine_guid, Strings.MINE_REPORTS_TYPE.codeRequiredReports)),
      dispatch(fetchMineReports(mine.mine_guid, Strings.MINE_REPORTS_TYPE.permitRequiredReports)),
    ]).then(() => {
      if (isMounted) {
        setIsLoaded(true);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const openReport = (reportRecord: IMineReport) => {
    history.push(
      routes.REPORT_VIEW_EDIT.dynamicRoute(mine.mine_guid, reportRecord.mine_report_guid)
    );
  };

  const onCRRPageChange = (page, per_page) => {
    dispatch(
      fetchMineReports(mine.mine_guid, Strings.MINE_REPORTS_TYPE.codeRequiredReports, {
        page,
        per_page,
      })
    );
  };

  const onPRRPageChange = (page, per_page) => {
    dispatch(
      fetchMineReports(mine.mine_guid, Strings.MINE_REPORTS_TYPE.permitRequiredReports, {
        page,
        per_page,
      })
    );
  };

  return (
    <Row>
      <Col span={24}>
        <Row>
          <Col span={24}>
            <div>
              <AuthorizationWrapper>
                <Link to={routes.REPORTS_CREATE_NEW.dynamicRoute(mine.mine_guid)}>
                  <Button className="dashboard-add-button" type="primary">
                    <PlusCircleFilled />
                    Submit Report
                  </Button>
                </Link>
              </AuthorizationWrapper>
            </div>
            <Typography.Title level={1} className="report-title">
              Reports
            </Typography.Title>
            <Typography.Paragraph>
              View all{" "}
              <ScrollLink to="codeRequiredReports" smooth={true}>
                Code Required Reports
              </ScrollLink>{" "}
              and{" "}
              <ScrollLink to="permitRequiredReports" smooth={true}>
                Permit Required Reports
              </ScrollLink>{" "}
              for this mine.
            </Typography.Paragraph>
            <Element name="codeRequiredReports">
              <Typography.Title level={4}>Code Required Reports</Typography.Title>
            </Element>
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
              openReport={openReport}
              mineReports={codeRequiredReports}
              isLoaded={isLoaded}
              backendPaginated
            />
            <Row justify="center" className="margin-large--bottom">
              <ResponsivePagination
                onPageChange={onCRRPageChange}
                currentPage={Number(crrPageData.current_page)}
                pageTotal={Number(crrPageData.total)}
                itemsPerPage={Number(crrPageData.items_per_page)}
              />
            </Row>
            <Element name="permitRequiredReports">
              <Typography.Title level={4}>Permit Required Reports</Typography.Title>
            </Element>
            <Typography.Paragraph>
              This table shows documents submitted pursuant to regulatory requirements established
              by conditions in site-specific Mines Act permits. It also shows reports the Ministry
              has requested from your mine. If you do not see a permit required report that your
              mine must submit, click Submit Report, choose the report you need to send and then
              attach the file or files.
            </Typography.Paragraph>
            <ReportsTable
              openReport={openReport}
              mineReports={permitRequiredReports}
              isLoaded={isLoaded}
            />
            <Row justify="center" className="margin-large--bottom">
              <ResponsivePagination
                onPageChange={onPRRPageChange}
                currentPage={Number(prrPageData.current_page)}
                pageTotal={Number(prrPageData.total)}
                itemsPerPage={Number(prrPageData.items_per_page)}
              />
            </Row>
          </Col>
        </Row>
      </Col>
    </Row>
  );
};

export default Reports;
