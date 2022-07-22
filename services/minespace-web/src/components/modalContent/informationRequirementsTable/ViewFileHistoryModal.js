import React from "react";
import PropTypes from "prop-types";
import { Button } from "antd";
import CustomPropTypes from "@/customPropTypes";
import DocumentTable from "@/components/common/DocumentTable";

const propTypes = {
  project: CustomPropTypes.project.isRequired,
  documentCategoryOptionsHash: PropTypes.objectOf(PropTypes.string).isRequired,
  closeModal: PropTypes.func.isRequired,
};

const ViewFileHistoryModal = (props) => {
  return (
    <div>
      <DocumentTable
        documents={props.project?.information_requirements_table?.documents}
        documentCategoryOptionsHash={props.documentCategoryOptionsHash}
        documentParent="Information Requirements Table"
        categoryDataIndex="information_requirements_table_document_type_code"
        uploadDateIndex="upload_date"
      />
      <div className="ant-modal-footer">
        <Button onClick={props.closeModal}>Close</Button>
      </div>
    </div>
  );
};

ViewFileHistoryModal.propTypes = propTypes;

export default ViewFileHistoryModal;
