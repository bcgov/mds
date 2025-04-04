import React, { FC } from "react";
import { Typography, Empty, Button, Row } from "antd";
import { IProjectSummaryEnvironmentAuthorizationDocument } from "@mds/common/interfaces";
import CoreTable from "@mds/common/components/common/CoreTable";
import { renderTextColumn } from "@mds/common/components/common/CoreTableCommonColumns";
import { Link } from "react-router-dom";
import { AMS_ENVIRONMENT_PUBLIC_DOCUMENT_SEARCH_URL } from "@mds/common/constants/strings";
import { closeModal } from "@mds/common/redux/actions/modalActions";
import { ColumnsType } from "antd/es/table";
import { useDispatch } from "react-redux";
const { Title, Paragraph } = Typography;

interface EnvironmentAuthorizationDocumentsModalProps {
    documents: IProjectSummaryEnvironmentAuthorizationDocument[];
}

const EnvironmentAuthorizationDocumentsModal: FC<EnvironmentAuthorizationDocumentsModalProps> = ({ documents }) => {
    const dispatch = useDispatch();
    const amsDocumentColumns: ColumnsType<IProjectSummaryEnvironmentAuthorizationDocument> = [
        {
            title: "File Name",
            key: "fileName",
            render: (doc) => {
                return <Link to={{ pathname: doc.url }} target="_blank">
                    {doc.name}
                </Link>
            }
        },
        renderTextColumn("extension", "File Type", false),
    ];
    return (
        <div>
            <Title level={3}>EMA AUthorization Documents</Title>
            <Paragraph>
                View the final approval documents issued by the Ministry of Environment.
                For more details, visit{" "}
                <Link to={{ pathname: AMS_ENVIRONMENT_PUBLIC_DOCUMENT_SEARCH_URL }} target="_blank">
                    Authorization Management System (AMS)
                </Link>.
            </Paragraph>
            <CoreTable
                columns={amsDocumentColumns}
                dataSource={documents}
                emptyText={
                    <Empty
                        imageStyle={{ transform: "scale(0.8)" }}
                        description={
                            <div className="center">
                                <Typography.Paragraph className="light light--sm">
                                    No Data
                                </Typography.Paragraph>
                            </div>
                        }
                    />
                }
            />
            <Row justify="end">
                <Button type="primary" onClick={() => dispatch(closeModal())}>
                    Close
                </Button>
            </Row>
        </div>
    );
};

export default EnvironmentAuthorizationDocumentsModal;