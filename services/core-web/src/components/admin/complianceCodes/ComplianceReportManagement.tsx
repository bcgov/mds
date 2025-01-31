import React, { FC, useEffect, useState } from "react";
import { Button, Row, Typography } from "antd";
import PlusOutlined from "@ant-design/icons/PlusOutlined";
import CoreTable from "@mds/common/components/common/CoreTable";
import { useAppDispatch as useDispatch, useAppSelector as useSelector } from "@mds/common/redux/rootState";
import { ComplianceReportParams, fetchComplianceReports, getComplianceReportPageData, getReportDefinitionsLoaded } from "@mds/common/redux/slices/complianceReportsSlice";
import { renderActionsColumn, renderTextColumn } from "@mds/common/components/common/CoreTableCommonColumns";
import { IComplianceArticle, IMineReportDefinition } from "@mds/common/interfaces";
import { REPORT_REGULATORY_AUTHORITY_CODES, REPORT_REGULATORY_AUTHORITY_ENUM } from "@mds/common/constants/enums";
import { formatComplianceCodeArticleNumber } from "@mds/common/redux/utils/helpers";
import { EMPTY_FIELD, REPORT_REGULATORY_AUTHORITY_CODES_HASH } from "@mds/common/constants/strings";
import { removeNullValues } from "@mds/common/constants/utils";


const defaultParams = {
    page: 1,
    per_page: 50
};

const ComplianceReportManagement: FC = () => {
    const dispatch = useDispatch();
    const reportPageData = useSelector(getComplianceReportPageData);
    const reportDefinitions = reportPageData?.records ?? [];
    const [queryParams, setQueryParams] = useState<ComplianceReportParams>(defaultParams);
    const isLoaded = useSelector(getReportDefinitionsLoaded(queryParams));

    const fetchData = () => {
        dispatch(fetchComplianceReports(queryParams));
    };

    useEffect(() => {
        if (!isLoaded) {
            fetchData();
        }
    }, [queryParams]);

    const onTableChange = (pagination, filters, sorter) => {
        const { current: page, pageSize: per_page } = pagination;
        const { order, field: sort_field } = sorter;
        const activeFilters = removeNullValues(filters);

        const sortParams = order ? {
            sort_dir: order.replace("end", ""),
            sort_field
        } : {};

        const newParams = {
            page,
            per_page,
            sort_field,
            ...sortParams,
            ...activeFilters,
        }
        setQueryParams(newParams)
    };

    const openAddModal = () => {
        console.log('not implemented');
    };

    const openViewModal = (record) => {
        console.log('record', record)
    };

    const actions = [{
        key: "view",
        label: "View",
        clickFunction: (_, record) => openViewModal(record)
    }];

    const regulatoryAuthorityFilter = Object.entries(REPORT_REGULATORY_AUTHORITY_CODES_HASH).map(([value, text]) => ({ value, text }));

    const columns = [
        renderTextColumn("report_name", "Report Name", true),
        { ...renderTextColumn("section", "Section"), sorter: true }, // filter
        {
            ...renderTextColumn("is_prr_only", "Report Type"),
            filters: [
                { value: false, text: "Code Required Report" },
                { value: true, text: "Permit Required Report" }
            ]
        },
        {
            ...renderTextColumn("regulatory_authority", "Regulatory Authority"),
            filters: regulatoryAuthorityFilter,
            sorter: true
        },
        renderActionsColumn({ actions })
    ];

    const formatCode = (article: IComplianceArticle) => {
        if (!article) {
            return {
                regulatory_authority: EMPTY_FIELD,
                section: EMPTY_FIELD
            }
        }
        return {
            regulatory_authority: REPORT_REGULATORY_AUTHORITY_ENUM[article.cim_or_cpo] ?? REPORT_REGULATORY_AUTHORITY_CODES.NONE,
            section: formatComplianceCodeArticleNumber(article)
        }
    }

    const transformData = (reports: IMineReportDefinition[]) => {
        return reports.map((r) => {
            const formattedComplianceArticle = formatCode(r.compliance_articles[0]);
            const is_prr_only = r.is_prr_only ? "Permit Required Report" : "Code Required Report";
            return {
                ...r,
                is_prr_only,
                ...formattedComplianceArticle
            };
        })
    }

    return (
        <div>
            <Typography.Text>
                Manage Code Required Reports that are associated to HSRC. Create a new report before adding it to a code in Health, Safety and Reclamation Code page.
            </Typography.Text>
            <Row justify="end">
                <Button
                    onClick={() => openAddModal()}
                    type="primary"
                    icon={<PlusOutlined />}
                >
                    Create Report
                </Button>
            </Row>
            <CoreTable
                loading={!isLoaded}
                dataSource={transformData(reportDefinitions)}
                columns={columns}
                rowKey="mine_report_definition_guid"
                onChange={onTableChange}
                pagination={isLoaded && {
                    total: reportPageData.total,
                    defaultPageSize: 50,
                    pageSize: queryParams.per_page,
                    position: ['bottomCenter'],
                    disabled: !isLoaded,
                }}
            />
        </div>
    );
};

export default ComplianceReportManagement;