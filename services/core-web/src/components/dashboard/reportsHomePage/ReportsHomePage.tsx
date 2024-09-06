import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import queryString from "query-string";
import * as Strings from "@mds/common/constants/strings";
import {
  deleteMineReport,
  fetchReports,
  updateMineReport,
} from "@mds/common/redux/actionCreators/reportActionCreator";
import { changeModalTitle, closeModal, openModal } from "@mds/common/redux/actions/modalActions";
import { getReports, getReportsPageData } from "@mds/common/redux/selectors/reportSelectors";
import { PageTracker } from "@common/utils/trackers";
import * as routes from "@/constants/routes";
import ReportsTable from "@/components/dashboard/reportsHomePage/ReportsTable";
import ReportsSearch from "@/components/dashboard/reportsHomePage/ReportsSearch";
import { modalConfig } from "@/components/modalContent/config";
import { useHistory, useLocation } from "react-router-dom";
import { MineReportParams } from "@mds/common";

const defaultParams: MineReportParams = {
  page: Strings.DEFAULT_PAGE,
  per_page: Strings.DEFAULT_PER_PAGE,
  sort_field: "received_date",
  sort_dir: "desc",
  search: undefined,
  report_type: undefined,
  report_name: undefined,
  due_date_start: undefined,
  due_date_end: undefined,
  received_date_start: undefined,
  received_date_end: undefined,
  received_only: "false",
  requested_by: undefined,
  status: [],
  compliance_year: undefined,
};

export const ReportsHomePage = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const history = useHistory();
  const [isLoaded, setIsLoaded] = useState(false);
  const [params, setParams] = useState<MineReportParams>(defaultParams);

  const reports = useSelector(getReports);
  const pageData = useSelector(getReportsPageData);

  const { search } = useLocation();

  useEffect(() => {
    const urlSearchParams = queryString.parse(search);
    setParams(urlSearchParams);
    history.replace(routes.REPORTS_DASHBOARD.dynamicRoute(urlSearchParams));
  }, []);

  const renderDataFromURL = async (params) => {
    await dispatch(fetchReports(params));

    setIsLoaded(true);
  };

  useEffect(() => {
    setIsLoaded(false);
    renderDataFromURL(queryString.parse(search));
  }, [location]);

  useEffect(() => {
    history.replace(routes.REPORTS_DASHBOARD.dynamicRoute(params));
  }, [params]);

  const onPageChange = (page, per_page) => {
    setParams({ ...params, page, per_page });
  };

  const handleSearch = (newParams) => {
    setParams(newParams);
  };

  const handleReset = () => {
    setParams({
      ...defaultParams,
      per_page: params.per_page || defaultParams.per_page,
      sort_field: params.sort_field,
      sort_dir: params.sort_dir,
    });
  };

  const handleEditReport = async (report) => {
    await dispatch(updateMineReport(report.mine_guid, report.mine_report_guid, report));
    dispatch(closeModal());
  };

  const handleRemoveReport = async (report) => {
    await dispatch(deleteMineReport(report.mine_guid, report.mine_report_guid));
  };

  const openEditReportModal = (event, onSubmit, report) => {
    event.preventDefault();
    dispatch(
      openModal({
        props: {
          initialValues: {
            ...report,
            mine_report_submission_status: report.mine_report_status_code,
          },
          title: `Edit ${report.submission_year} ${report.report_name}`,
          mineGuid: report.mine_guid,
          changeModalTitle: dispatch(changeModalTitle),
          onSubmit,
        },
        content: modalConfig.ADD_REPORT,
      })
    );
  };

  return (
    <div className="landing-page">
      <PageTracker title="Reports Page" />
      <div className="landing-page__header">
        <div>
          <h1>Browse Reports</h1>
        </div>
      </div>
      <div className="landing-page__content">
        <div className="page__content">
          <ReportsSearch
            handleSearch={handleSearch}
            handleReset={handleReset}
            initialValues={params}
          />
          <div>
            <ReportsTable
              isLoaded={isLoaded}
              handleSearch={handleSearch}
              reports={reports}
              params={params}
              sortField={params.sort_field}
              sortDir={params.sort_dir}
              handlePageChange={onPageChange}
              pageData={pageData}
              openEditReportModal={openEditReportModal}
              handleEditReport={handleEditReport}
              handleRemoveReport={handleRemoveReport}
              isDashboardView
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsHomePage;
