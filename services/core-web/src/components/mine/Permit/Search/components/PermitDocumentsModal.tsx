import React, { useEffect } from "react";
import { Button, Table } from "antd";
import { fetchPermits } from "@mds/common/redux/actionCreators/permitActionCreator";
import { getAmendment } from "@mds/common/redux/selectors/permitSelectors";
import DocumentLink from "@mds/common/components/documents/DocumentLink";
import { IPermitAmendment } from "@mds/common/interfaces/permits/permitAmendment.interface";
import { useAppDispatch, useAppSelector } from "@mds/common/redux/rootState";
import { formatDate } from "@common/utils/helpers";

interface Props {
    onCancel: () => void;
    permitAmendmentGuid: string;
    mineGuid: string;
    permitGuid: string;
}

const PermitDocumentsModal: React.FC<Props> = ({
    onCancel,
    permitAmendmentGuid,
    mineGuid,
    permitGuid,
}) => {
    const dispatch = useAppDispatch();
    const currentAmendment: IPermitAmendment = useAppSelector((state) =>
        getAmendment(permitGuid, permitAmendmentGuid)(state)
    );

    useEffect(() => {
        dispatch(fetchPermits(mineGuid));
    }, [mineGuid, dispatch]);

    const columns = [
        {
            title: "Document Name",
            dataIndex: "document_name",
            key: "document_name",
            render: (text, record) => (
                <DocumentLink
                    documentManagerGuid={record.document_manager_guid}
                    documentName={record.document_name}
                />
            ),
        },
        {
            title: "Category",
            dataIndex: "category",
            key: "category",
        },
        {
            title: "Upload Date",
            dataIndex: "upload_date",
            key: "upload_date",
            render: (text) => formatDate(text),
        },
    ];

    const allDocuments = [
        ...(currentAmendment?.related_documents || []).map(doc => ({ ...doc, category: 'Permit Document' })),
        ...(currentAmendment?.now_application_documents || []).filter(d => d.is_final_package).map(doc => ({ ...doc, document_name: doc.mine_document.document_name, document_manager_guid: doc.mine_document.document_manager_guid, upload_date: doc.mine_document.upload_date, category: 'Final Application Package' }))
    ];

    return (
        <div>
            <Table dataSource={allDocuments} columns={columns} pagination={false} rowKey="document_manager_guid" />
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "16px" }}>
                <Button onClick={onCancel}>Close</Button>
            </div>
        </div>
    );
};

export default PermitDocumentsModal;
