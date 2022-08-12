import React from "react";
import PropTypes from "prop-types";
import { Button } from "antd";
import CustomPropTypes from "@/customPropTypes";
import DocumentTable from "@/components/common/DocumentTable";
import {
  categoryColumn,
  uploadDateTimeColumn,
  importedByColumn,
} from "@/components/common/DocumentColumns";

const propTypes = {
  project: CustomPropTypes.project.isRequired,
  documentCategoryOptionsHash: PropTypes.objectOf(PropTypes.string).isRequired,
  closeModal: PropTypes.func.isRequired,
};

const ViewFileHistoryModal = (props) => {
  const documentColumns = [
    categoryColumn(
      "information_requirements_table_document_type_code",
      props.documentCategoryOptionsHash
    ),
    uploadDateTimeColumn("upload_date"),
    importedByColumn("create_user"),
  ];
  return (
    <div>
      <DocumentTable
        documents={props.project?.information_requirements_table?.documents}
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
