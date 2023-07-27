import React from "react";
import PropTypes from "prop-types";
import { Button } from "antd";
import CustomPropTypes from "@/customPropTypes";
import DocumentTable from "@/components/common/DocumentTable";
import {
  renderCategoryColumn,
  renderDateColumn,
  renderTextColumn,
} from "@/components/common/CoreTableCommonColumns";
import { formatDateTime } from "@common/utils/helpers";
import { MineDocument } from "@common/models/documents/document";
import { documentNameColumn } from "@/components/common/DocumentColumns";

const propTypes = {
  project: CustomPropTypes.project.isRequired,
  documentCategoryOptionsHash: PropTypes.objectOf(PropTypes.string).isRequired,
  closeModal: PropTypes.func.isRequired,
};

const ViewFileHistoryModal = (props) => {
  const documents = props.project?.information_requirements_table?.documents.map(
    (doc) =>
      new MineDocument({ ...doc, category: doc.information_requirements_table_document_type_code })
  );
  const documentColumns = [
    documentNameColumn(),
    renderCategoryColumn("category", "Category", props.documentCategoryOptionsHash),
    renderDateColumn("upload_date", "Date/Time", true, formatDateTime),
    renderTextColumn("create_user", "Imported By"),
  ];
  return (
    <div>
      <DocumentTable
        documents={documents}
        documentParent="Information Requirements Table"
        documentColumns={documentColumns}
      />
      <div className="ant-modal-footer">
        <Button onClick={props.closeModal}>Close</Button>
      </div>
    </div>
  );
};

ViewFileHistoryModal.propTypes = propTypes;

export default ViewFileHistoryModal;
