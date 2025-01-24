import React, { FC, useState } from "react";
import { Button, Row, Typography } from "antd";
import PlusOutlined from "@ant-design/icons/PlusOutlined";
import CoreTable from "@mds/common/components/common/CoreTable";


const ComplianceReportManagement: FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const codeRequiredReports = [];
    const columns = [];

    const openAddModal = () => {
        console.log('not implemented');
    };

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
                dataSource={codeRequiredReports}
                columns={columns}
                rowKey="key"
                pagination={{
                    total: codeRequiredReports.length,
                    defaultPageSize: 50,
                    position: ['bottomCenter'],
                    disabled: isLoading
                }}
            />

        </div>
    );
};

export default ComplianceReportManagement;