import React from "react";
import { Row, Col, Typography } from "antd";
import { withRouter } from "react-router-dom";
import PropTypes from "prop-types";
import DocumentTable from "@/components/common/DocumentTable";
import { uploadDateColumn } from "@/components/common/DocumentColumns";

const propTypes = {
  title: PropTypes.string.isRequired,
  documents: PropTypes.arrayOf(PropTypes.object).isRequired,
  onArchivedDocuments: PropTypes.func.isRequired,
  archiveDocumentsArgs: PropTypes.shape({
    mineGuid: PropTypes.string,
  }),
};

export const DocumentsPage = (props) => {
  const documentColumns = [uploadDateColumn("upload_date")];
  return (
    <Row>
      <Col span={24}>
        <Typography.Title level={3}>{props.title}</Typography.Title>
      </Col>
      <Col span={24}>
        <DocumentTable
          documents={props.documents}
          documentParent={props.title}
          documentColumns={documentColumns}
          canArchiveDocuments={true}
          onArchivedDocuments={props.onArchivedDocuments}
          archiveDocumentsArgs={props.archiveDocumentsArgs}
        />
      </Col>
    </Row>
  );
};

DocumentsPage.propTypes = propTypes;

export default withRouter(DocumentsPage);
