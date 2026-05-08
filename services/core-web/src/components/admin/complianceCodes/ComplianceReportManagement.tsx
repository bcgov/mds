import React, { FC, useEffect, useState } from "react";
import { Button, Input, Row, Typography } from "antd";
import queryString from "query-string";
import PlusOutlined from "@ant-design/icons/PlusOutlined";
import CoreTable from "@mds/common/components/common/CoreTable";
import {
  useAppDispatch as useDispatch,
  useAppSelector as useSelector,
} from "@mds/common/redux/rootState";
import {
  ComplianceReportParams,
  createMineReportDefinition,
  fetchComplianceReports,
  fetchMineReportDueDateTypes,
  getComplianceReportPageData,
  getReportDefinitionsLoaded,
} from "@mds/common/redux/slices/complianceReportsSlice";
import {
  renderActionsColumn,
  renderTextColumn,
} from "@mds/common/components/common/CoreTableCommonColumns";
import { IComplianceArticle, IMineReportDefinition } from "@mds/common/interfaces";
import {
  REPORT_REGULATORY_AUTHORITY_CODES,
  REPORT_REGULATORY_AUTHORITY_ENUM,
} from "@mds/common/constants/enums";
import { formatComplianceCodeArticleNumber } from "@mds/common/redux/utils/helpers";
import { EMPTY_FIELD, REPORT_REGULATORY_AUTHORITY_CODES_HASH } from "@mds/common/constants/strings";
import { removeNullValues } from "@mds/common/constants/utils";
import SearchOutlined from "@ant-design/icons/SearchOutlined";
import { useHistory, useLocation } from "react-router-dom";
import { ADMIN_HSRC_COMPLIANCE_CODE_MANAGEMENT } from "@/constants/routes";
import AddReportDefinitionForm from "@/components/admin/complianceCodes/AddReportDefinitionForm";
import { closeModal, openModal } from "@mds/common/redux/actions/modalActions";

const defaultParams = {
  page: 1,
  per_page: 50,
  show_expired: true,
};

const ComplianceReportManagement: FC = () => {
  const dispatch = useDispatch();
  const { search } = useLocation();
  const history = useHistory();
  const initialParams = queryString.parse(search);
  const reportPageData = useSelector(getComplianceReportPageData);
  const reportDefinitions = reportPageData?.records ?? [];
  const [sectionSearchText, setSectionSearchText] = useState(null);
  const [queryParams, setQueryParams] = useState<ComplianceReportParams>({
    ...defaultParams,
    ...initialParams,
  });
  const isLoaded = useSelector(getReportDefinitionsLoaded(queryParams));

  const fetchData = () => {
    dispatch(fetchComplianceReports(queryParams));
  };

  useEffect(() => {
    dispatch(fetchMineReportDueDateTypes({}));
  }, []);

  useEffect(() => {
    history.replace(ADMIN_HSRC_COMPLIANCE_CODE_MANAGEMENT.dynamicRoute("reports", queryParams));
    if (!isLoaded) {
      fetchData();
    }
  }, [queryParams]);

  const onTableChange = (pagination, filters, sorter) => {
    const { current: page, pageSize: per_page } = pagination;
    const { order, field: sort_field } = sorter;
    const activeFilters = removeNullValues({ ...filters, section: sectionSearchText });

    const sortParams = order
      ? {
        sort_dir: order.replace("end", ""),
        sort_field,
      }
      : {};

    const newParams = {
      page,
      per_page,
      sort_field,
      ...sortParams,
      ...activeFilters,
    };
    setQueryParams(newParams);
  };

  const handleSectionSearch = (confirm, searchInputText: string) => {
    const newParams = {
      ...queryParams,
      section: searchInputText,
    };
    setQueryParams(removeNullValues(newParams));
    confirm();
  };

  const openAddModal = () => {
    dispatch(
      openModal({
        props: {
          title: `Create Report`,
          handleSubmit: (values) => {
            dispatch(createMineReportDefinition(values));
            dispatch(closeModal());
          },
        },
        content: AddReportDefinitionForm,
      })
    );
  };

  const openViewModal = (record) => {
    record.compliance_articles = [record.compliance_articles[0]];
    dispatch(
      openModal({
        props: {
          title: `View Report`,
          isEditMode: false,
          initialValues: {
            ...record,
            mine_report_due_date_type_code: record.mine_report_due_date_type,
            mine_report_due_date_months: record.due_date_period_months,
            report_type: record.is_prr_only ? "PRR" : "CRR",
          },
        },
        content: AddReportDefinitionForm,
      })
    );
  };

  const actions = [
    {
      key: "view",
      label: "View",
      clickFunction: (_, record) => openViewModal(record),
    },
  ];

  const regulatoryAuthorityFilter = Object.entries(REPORT_REGULATORY_AUTHORITY_CODES_HASH).map(
    ([value, text]) => ({ value, text })
  );
  const sectionSearchActive = queryParams?.section?.length > 0;

  const sectionFilter = {
    filterIcon: () => <SearchOutlined className={sectionSearchActive ? "color-primary" : ""} />,
    filterDropdown: ({ confirm }) => {
      return (
        <div className="column-search" style={{ padding: 8 }}>
          <Row style={{ minWidth: 240 }} gutter={[0, 16]}>
            <Input
              placeholder="Search Compliance Article"
              onChange={(e) => setSectionSearchText(e.target.value)}
              onPressEnter={() => handleSectionSearch(confirm, sectionSearchText)}
            />
            <Button
              onClick={() => handleSectionSearch(confirm, sectionSearchText)}
              icon={<SearchOutlined />}
              size="small"
              type="primary"
            >
              Search
            </Button>
            <Button
              onClick={() => {
                setSectionSearchText(null);
                handleSectionSearch(confirm, null);
              }}
              size="small"
            >
              Reset
            </Button>
          </Row>
        </div>
      );
    },
  };
  const columns = [
    renderTextColumn("report_name", "Report Name", true),
    {
      ...renderTextColumn("section", "Section"),
      sorter: true,
      ...sectionFilter,
    },
    {
      ...renderTextColumn("report_type_label", "Report Type"),
      key: "is_prr_only",
      filters: [
        { value: false, text: "Code Required Report" },
        { value: true, text: "Permit Required Report" },
      ],
    },
    {
      ...renderTextColumn("regulatory_authority", "Regulatory Authority"),
      filters: regulatoryAuthorityFilter,
      sorter: true,
    },
    renderActionsColumn({ actions }),
  ];

  const formatCode = (article: IComplianceArticle) => {
    if (!article) {
      return {
        regulatory_authority: EMPTY_FIELD,
        section: EMPTY_FIELD,
      };
    }
    return {
      regulatory_authority:
        REPORT_REGULATORY_AUTHORITY_ENUM[article.cim_or_cpo] ??
        REPORT_REGULATORY_AUTHORITY_CODES.NONE,
      section: formatComplianceCodeArticleNumber(article),
    };
  };

  const transformData = (reports: IMineReportDefinition[]) => {
    return reports.map((r) => {
      const formattedComplianceArticle = formatCode(r.compliance_articles[0]);
      const report_type_label = r.is_prr_only ? "Permit Required Report" : "Code Required Report";
      return {
        ...r,
        report_type_label,
        ...formattedComplianceArticle,
      };
    });
  };

  return (
    <div>
      <Typography.Text>
        Manage Code Required Reports that are associated to HSRC. Create a new report before adding
        it to a code in Health, Safety and Reclamation Code page.
      </Typography.Text>
      <Row justify="end">
        <Button onClick={() => openAddModal()} type="primary" icon={<PlusOutlined />}>
          Create Report
        </Button>
      </Row>
      <CoreTable
        loading={!isLoaded}
        dataSource={transformData(reportDefinitions)}
        columns={columns}
        rowKey="mine_report_definition_guid"
        onChange={onTableChange}
        pagination={
          isLoaded && {
            total: reportPageData.total,
            defaultPageSize: 50,
            pageSize: queryParams.per_page,
            position: ["bottomCenter"],
            disabled: !isLoaded,
          }
        }
      />
    </div>
  );
};

export default ComplianceReportManagement;
