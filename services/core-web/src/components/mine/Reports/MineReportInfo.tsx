import React, { FC, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link, useHistory, useLocation, useParams } from "react-router-dom";
import { Button, Divider, Dropdown, MenuProps, Row } from "antd";
import queryString from "query-string";
import { closeModal, openModal } from "@mds/common/redux/actions/modalActions";
import { getMineReports, getReportsPageData } from "@mds/common/redux/selectors/reportSelectors";
import { getMineReportDefinitionOptions } from "@mds/common/redux/slices/complianceReportsSlice";
import * as Strings from "@mds/common/constants/strings";
import * as Permission from "@/constants/permissions";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import MineReportTable from "@/components/mine/Reports/MineReportTable";
import ReportFilterForm from "@mds/common/components/reports/ReportFilterForm";
import * as routes from "@/constants/routes";
import PlusOutlined from "@ant-design/icons/PlusOutlined";
import { RequestReportForm } from "@/components/Forms/reports/RequestReportForm";
import ResponsivePagination from "@mds/common/components/common/ResponsivePagination";
import { MineReportParams } from "@mds/common/interfaces/reports";
import { MINE_REPORTS_ENUM, MineReportType } from "@mds/common/constants/enums";
import { useAppDispatch } from "@mds/common/redux/rootState";
import {
  createMineReport,
  deleteMineReport,
  fetchMineReports,
} from "@mds/common/redux/slices/reportSlice";
import { handleFiltering } from "@mds/common/utils";

const defaultParams: MineReportParams = {
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

export const MineReportInfo: FC = () => {
  const mineReports = useSelector(getMineReports);
  const mineReportDefinitionOptions = useSelector(getMineReportDefinitionOptions);
  const pageData = useSelector(getReportsPageData);
  const { id: mineGuid } = useParams<{ id: string }>();
  const [stateParams, setStateParams] = useState<MineReportParams>(defaultParams);
  const [filteredReports, setFilteredReports] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const dispatch = useAppDispatch();
  const history = useHistory();
  const location = useLocation();
  const { reportType = "code-required-reports" } = useParams<{ reportType: string }>();

  const mine_reports_type: MineReportType = MineReportType[reportType];

  useEffect(() => {
    const params: MineReportParams = queryString.parse(location.search);
    const newParams = { ...defaultParams, ...params };
    history.replace(routes.MINE_REPORTS.dynamicRoute(mineGuid, reportType, newParams));

    dispatch(fetchMineReports({ mineGuid, reportsType: mine_reports_type, params })).then(() => {
      setIsLoaded(true);
      setStateParams(newParams);
    });
  }, [reportType]);

  useEffect(() => {
    setFilteredReports(mineReports);
    const newParams = { ...stateParams, page: "1" };
    setStateParams(newParams);
  }, [mineReports]);

  const renderDataFromURL = (params) => {
    const parsedParams = queryString.parse(params);
    const reports = handleFiltering(mineReports, parsedParams, mineReportDefinitionOptions, mine_reports_type, true);
    setFilteredReports(reports);
    setStateParams(parsedParams);
  };

  useEffect(() => {
    if (location) {
      renderDataFromURL(location.search);
    }
  }, [location]);

  const refreshReportData = () => {
    return dispatch(
      fetchMineReports({
        mineGuid,
        reportsType: mine_reports_type,
        params: stateParams ?? defaultParams,
      })
    );
  };

  const handleAddReport = (values) => {
    return dispatch(createMineReport({ mineGuid, payload: values }))
      .then(() => dispatch(closeModal()))
      .then(() => refreshReportData());
  };

  const handleRemoveReport = (report) => {
    return dispatch(
      deleteMineReport({ mineGuid: report.mine_guid, mineReportGuid: report.mine_report_guid })
    ).then(() => refreshReportData());
  };

  const handleReportFilterSubmit = (params) => {
    setStateParams(params);
    history.replace(routes.MINE_REPORTS.dynamicRoute(mineGuid, reportType, params));
    dispatch(fetchMineReports({ mineGuid, reportsType: mine_reports_type, params }));
  };

  const onPageChange = (page, per_page) => {
    const newParams = { ...stateParams, page, per_page };
    setStateParams(newParams);
    handleReportFilterSubmit(newParams);
    handleFiltering(mineReports, { ...stateParams, page, per_page }, mineReportDefinitionOptions, mine_reports_type, true);
  };

  const handleReportFilterReset = () => {
    setStateParams({
      ...defaultParams,
    });
    history.replace(routes.MINE_REPORTS.dynamicRoute(mineGuid, reportType, defaultParams));
    dispatch(fetchMineReports({ mineGuid, reportsType: mine_reports_type, params: defaultParams }));
  };

  const handleOpenRequestReportModal = () => {
    dispatch(
      openModal({
        props: {
          onSubmit: handleAddReport,
          title: `Request ${MINE_REPORTS_ENUM[mine_reports_type]}`,
          mineGuid: mineGuid,
          mineReportsType: mine_reports_type,
        },
        content: RequestReportForm,
      })
    );
  };

  const items: MenuProps["items"] = [
    {
      key: "request",
      label: (
        <span onClick={handleOpenRequestReportModal} className="menu-item-inner">
          Request Report
        </span>
      ),
    },
    {
      key: "add",
      label: (
        <Link
          to={routes.REPORTS_CREATE_NEW.dynamicRoute(mineGuid, reportType)}
          className="menu-item-inner"
        >
          Add a Report
        </Link>
      ),
    },
  ];

  return (
    <div className="tab__content">
      <div>
        <h2>{MINE_REPORTS_ENUM[mine_reports_type]}</h2>
        <Divider />
      </div>
      <div className="inline-flex flex-end">
        <Row>
          <AuthorizationWrapper permission={Permission.EDIT_REPORTS}>
            <Dropdown trigger={["click"]} menu={{ items }} overlayClassName="full-click-menu">
              <Button type="primary" icon={<PlusOutlined />}>
                Add a Report
              </Button>
            </Dropdown>
          </AuthorizationWrapper>
        </Row>
      </div>
      <div className="advanced-search__container">
        <div>
          <h2>Filter By</h2>
          <br />
        </div>
        <ReportFilterForm
          onSubmit={handleReportFilterSubmit}
          onReset={handleReportFilterReset}
          initialValues={stateParams}
          mineReportType={mine_reports_type}
        />
      </div>
      <MineReportTable
        isLoaded={isLoaded}
        handleRemoveReport={handleRemoveReport}
        handleTableChange={handleReportFilterSubmit}
        mineReports={filteredReports}
        filters={stateParams}
        sortField={stateParams.sort_field}
        sortDir={stateParams.sort_dir}
        mineReportType={mine_reports_type}
      />
      <div className="center">
        <ResponsivePagination
          onPageChange={onPageChange}
          currentPage={Number(pageData.current_page)}
          pageTotal={Number(pageData.total)}
          itemsPerPage={Number(pageData.items_per_page)}
        />
      </div>
    </div>
  );
};

export default MineReportInfo;
