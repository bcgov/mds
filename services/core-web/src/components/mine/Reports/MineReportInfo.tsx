import React, { FC, useEffect, useState } from "react";
import moment from "moment";
import queryString from "query-string";
import { useDispatch, useSelector } from "react-redux";
import { Button, Divider, Row } from "antd";
import { isEmpty } from "lodash";
import {
  createMineReport,
  deleteMineReport,
  fetchMineReports,
  updateMineReport,
} from "@mds/common/redux/actionCreators/reportActionCreator";
import { changeModalTitle, closeModal, openModal } from "@mds/common/redux/actions/modalActions";
import { getMineReports } from "@mds/common/redux/selectors/reportSelectors";
import { getMineReportDefinitionOptions } from "@mds/common/redux/selectors/staticContentSelectors";
import { getMines } from "@mds/common/redux/selectors/mineSelectors";
import * as Strings from "@mds/common/constants/strings";
import * as Permission from "@/constants/permissions";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import AddButton from "@/components/common/buttons/AddButton";
import MineReportTable from "@/components/mine/Reports/MineReportTable";
import ReportFilterForm from "@/components/Forms/reports/ReportFilterForm";
import * as routes from "@/constants/routes";
import { modalConfig } from "@/components/modalContent/config";
import { Feature, IMine, MineReportParams, MineReportType } from "@mds/common";
import { Link, useHistory, useLocation, useParams } from "react-router-dom";
import PlusCircleFilled from "@ant-design/icons/PlusCircleFilled";
import { useFeatureFlag } from "@mds/common/providers/featureFlags/useFeatureFlag";

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
  const mineReports = useSelector((state) => getMineReports(state));
  const mineReportDefinitionOptions = useSelector((state) => getMineReportDefinitionOptions(state));
  const mines = useSelector((state) => getMines(state));

  const { id: mineGuid } = useParams<{ id: string }>();

  const [mine, setMine] = useState<IMine>();
  const [stateParams, setStateParams] = useState<MineReportParams>(defaultParams);
  const [filteredReports, setFilteredReports] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const { isFeatureEnabled } = useFeatureFlag();

  const dispatch = useDispatch();
  const history = useHistory();
  const location = useLocation();
  const { reportType } = useParams<{ reportType: string }>();

  const mine_reports_type: MineReportType = MineReportType[reportType];

  useEffect(() => {
    setMine(mines[mineGuid]);
    const params: MineReportParams = queryString.parse(location.search);

    dispatch(fetchMineReports(mineGuid, mine_reports_type)).then(() => {
      setIsLoaded(true);
      const newParams = { ...defaultParams, ...params };
      setStateParams(newParams);
      setFilteredReports(mineReports);
      history.replace(routes.MINE_REPORTS.dynamicRoute(mineGuid, reportType, newParams));
    });
  }, [reportType]);

  const handleFiltering = (reports, params: MineReportParams) => {
    const reportDefinitionGuids = params.report_type
      ? mineReportDefinitionOptions
          .filter((option) =>
            option.categories
              .map((category) => category.mine_report_category)
              .includes(params.report_type)
          )
          .map((definition) => definition.mine_report_definition_guid)
      : mineReportDefinitionOptions.map((definition) => definition.mine_report_definition_guid);

    let report_type: boolean;

    return reports.filter((report) => {
      if (mine_reports_type === "CRR") {
        report_type =
          !params.report_type || reportDefinitionGuids.includes(report.mine_report_definition_guid);
      } else {
        report_type =
          !params.report_type || report.permit_condition_category_code === params.report_type;
      }

      const report_name =
        !params.report_name || report.mine_report_definition_guid === params.report_name;
      const compliance_year =
        !params.compliance_year ||
        Number(report.submission_year) === Number(params.compliance_year);
      const due_date_start =
        !params.due_date_start ||
        moment(report.due_date, Strings.DATE_FORMAT) >=
          moment(params.due_date_start, Strings.DATE_FORMAT);
      const due_date_end =
        !params.due_date_end ||
        moment(report.due_date, Strings.DATE_FORMAT) <=
          moment(params.due_date_end, Strings.DATE_FORMAT);
      const received_date_start =
        !params.received_date_start ||
        moment(report.received_date, Strings.DATE_FORMAT) >=
          moment(params.received_date_start, Strings.DATE_FORMAT);
      const received_date_end =
        !params.received_date_end ||
        moment(report.received_date, Strings.DATE_FORMAT) <=
          moment(params.received_date_end, Strings.DATE_FORMAT);
      const requested_by =
        !params.requested_by ||
        report.created_by_idir.toLowerCase().includes(params.requested_by.toLowerCase());
      const received_only =
        !params.received_only || params.received_only === "false" || report.received_date;
      const status =
        isEmpty(params.status) ||
        (report.mine_report_submissions &&
          report.mine_report_submissions.length > 0 &&
          params.status.includes(
            report.mine_report_submissions[report.mine_report_submissions.length - 1]
              .mine_report_submission_status_code
          ));
      return (
        report_name &&
        report_type &&
        compliance_year &&
        due_date_start &&
        due_date_end &&
        received_date_start &&
        received_date_end &&
        received_only &&
        requested_by &&
        status
      );
    });
  };

  const renderDataFromURL = (params) => {
    const parsedParams = queryString.parse(params);
    const filteredReports = handleFiltering(mineReports, parsedParams);
    setFilteredReports(filteredReports);
    setStateParams(parsedParams);
  };

  useEffect(() => {
    if (location) {
      renderDataFromURL(location.search);
    }
  }, [location]);

  const fetchReports = () => {
    return dispatch(fetchMineReports(mineGuid, mine_reports_type)).then(() => {
      setFilteredReports(mineReports);
    });
  };

  const handleEditReport = (report) => {
    return dispatch(updateMineReport(report.mine_guid, report.mine_report_guid, report))
      .then(() => dispatch(closeModal()))
      .then(() => dispatch(fetchReports()));
  };

  const handleAddReport = (values) => {
    return dispatch(createMineReport(mineGuid, values))
      .then(() => dispatch(closeModal()))
      .then(() => dispatch(fetchReports()));
  };

  const handleRemoveReport = (report) => {
    return dispatch(deleteMineReport(report.mine_guid, report.mine_report_guid)).then(() =>
      dispatch(fetchReports())
    );
  };

  const openAddReportModal = (event) => {
    event.preventDefault();
    dispatch(
      openModal({
        props: {
          onSubmit: handleAddReport,
          title: `Add report for ${mine.mine_name}`,
          mineGuid: mineGuid,
          changeModalTitle: dispatch(changeModalTitle),
          mineReportsType: mine_reports_type,
        },
        content: modalConfig.ADD_REPORT,
      })
    );
  };

  const openEditReportModal = (event, onSubmit, report) => {
    event.preventDefault();
    dispatch(
      openModal({
        props: {
          initialValues: {
            ...report,
            mine_report_submission_status:
              report.mine_report_submissions.length > 0
                ? report.mine_report_submissions[report.mine_report_submissions.length - 1]
                    .mine_report_submission_status_code
                : "NRQ",
            mineReportsType: mine_reports_type,
          },
          onSubmit,
          title: `Edit ${report.submission_year} ${report.report_name}`,
          mineGuid: mineGuid,
          changeModalTitle: dispatch(changeModalTitle),
        },
        content: modalConfig.ADD_REPORT,
      })
    );
  };

  const handleReportFilterSubmit = (params) => {
    setStateParams(params);
    history.replace(routes.MINE_REPORTS.dynamicRoute(mineGuid, reportType, params));
  };

  const handleReportFilterReset = () => {
    setStateParams({
      ...defaultParams,
    });
    history.replace(routes.MINE_REPORTS.dynamicRoute(mineGuid, reportType, defaultParams));
  };

  const renderTitle = () => {
    switch (mine_reports_type) {
      case MineReportType["code-required-reports"]:
        return "Code Required Reports";
      case MineReportType["permit-required-reports"]:
        return "Permit Required Reports";
      default:
        return "Code Required Reports";
    }
  };

  return (
    <div className="tab__content">
      <div>
        <h2>{renderTitle()}</h2>
        <Divider />
      </div>
      <div className="inline-flex flex-end">
        <Row>
          <AuthorizationWrapper permission={Permission.EDIT_REPORTS}>
            {isFeatureEnabled(Feature.CODE_REQUIRED_REPORTS) ? (
              <Link to={routes.REPORTS_CREATE_NEW.dynamicRoute(mineGuid, reportType)}>
                <Button style={{ zIndex: 1 }} className="submit-report-button" type="primary">
                  <PlusCircleFilled />
                  Submit Report
                </Button>
              </Link>
            ) : (
              <AddButton onClick={(event) => openAddReportModal(event)}>Add a Report</AddButton>
            )}
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
          handleReset={handleReportFilterReset}
          initialValues={stateParams}
          mineReportType={mine_reports_type}
        />
        {mine_reports_type}
      </div>
      <MineReportTable
        isLoaded={isLoaded}
        openEditReportModal={openEditReportModal}
        handleEditReport={handleEditReport}
        handleRemoveReport={handleRemoveReport}
        handleTableChange={handleReportFilterSubmit}
        mineReports={filteredReports}
        filters={stateParams}
        sortField={stateParams.sort_field}
        sortDir={stateParams.sort_dir}
        mineReportType={mine_reports_type}
      />
    </div>
  );
};

export default MineReportInfo;
