import React, { FC, useEffect, useState } from "react";
import { Button, Row, Typography } from "antd";
import PlusOutlined from "@ant-design/icons/PlusOutlined";
import CoreTable from "@mds/common/components/common/CoreTable";
import { useDispatch, useSelector } from "react-redux";
import { fetchComplianceReports, getComplianceReportPageData } from "@mds/common/redux/slices/complianceReportsSlice";
import { renderActionsColumn, renderTextColumn } from "@mds/common/components/common/CoreTableCommonColumns";
import { IMineReportDefinition } from "@mds/common/interfaces";


const ComplianceReportManagement: FC = () => {
    const dispatch = useDispatch();
    const reportPageData = useSelector(getComplianceReportPageData);
    const reportDefinitions = reportPageData?.records ?? [];
    const defaultLoaded = reportPageData.total > 0;
    console.log(reportPageData);
    const [isLoading, setIsLoading] = useState(defaultLoaded);


    const fetchData = (page = 1, per_page = 50) => {
        setIsLoading(true);
        dispatch(fetchComplianceReports({ page, per_page })).then(setIsLoading(false))
    }

    useEffect(() => {
        if (!isLoading && !defaultLoaded) {
            fetchData();
        }
    }, []);

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

    // TODO: the sorting for report name only sorts the data that is currently on the page
    // and also I don't have data for the columns that are currently commented out

    const columns = [
        renderTextColumn("report_name", "Report Name", true), // sort
        // renderTextColumn("section", "Section"), // sort, filter
        renderTextColumn("report_type", "Report Type"), // filter
        // renderTextColumn("regulatory_authority", "Regulatory Authority"), // sort, filter
        // renderTextColumn("office", "Office"), // sort, filter
        renderActionsColumn({ actions })
    ];

    const transformData = (reports: IMineReportDefinition[]) => {
        return reports.map((r) => {
            const report_type = r.is_prr_only ? "Permit Required Report" : "Core Required Report";
            return {
                ...r,
                report_type
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
                loading={isLoading}
                dataSource={transformData(reportDefinitions)}
                columns={columns}
                rowKey="mine_report_definition_guid"
                pagination={!isLoading && {
                    total: reportPageData.total,
                    defaultPageSize: 50,
                    position: ['bottomCenter'],
                    disabled: isLoading,
                    onChange: fetchData
                }}
            />

        </div>
    );
};

export default ComplianceReportManagement;