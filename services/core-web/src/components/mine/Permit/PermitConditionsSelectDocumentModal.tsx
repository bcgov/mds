import { IPermitAmendmentDocument } from "@mds/common/interfaces";
import React, { FC } from "react";
import CoreTable from "@mds/common/components/common/CoreTable";
import {
  renderDateColumn,
  renderTextColumn,
} from "@mds/common/components/common/CoreTableCommonColumns";
import { Button, Typography } from "antd";
import { documentNameColumn } from "@mds/common/components/documents/DocumentColumns";

const { Title, Paragraph } = Typography;

interface PermitConditionsSelectDocumentModalProps {
  documents: IPermitAmendmentDocument[];
  onSubmit: (document: IPermitAmendmentDocument) => void;
}

const PermitConditionsSelectDocumentModal: FC<PermitConditionsSelectDocumentModalProps> = ({
  documents,
  onSubmit,
}) => {
  return (
    <div>
      <Title>Extract Permit Conditions</Title>
      <Paragraph>Select the permit for permit condition extraction.</Paragraph>
      <CoreTable
        rowKey="document_manager_guid"
        dataSource={documents}
        columns={[
          documentNameColumn("document_name", "File Name"),
          renderTextColumn("create_user", "Created By"),
          renderDateColumn("create_timestamp", "Uploaded"),
          {
            key: "action",
            className: "actions-column",
            width: 0,
            render: (record: IPermitAmendmentDocument) => {
              return (
                <Button type="primary" onClick={() => onSubmit(record)}>
                  Extract
                </Button>
              );
            },
          },
        ]}
      />
    </div>
  );
};

export default PermitConditionsSelectDocumentModal;
