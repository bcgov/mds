import React from "react";
import { Row, Col, Typography } from "antd";
import { withRouter } from "react-router-dom";
import PropTypes, { string } from "prop-types";
import DocumentTable from "@/components/common/DocumentTable";

const propTypes = {
  title: PropTypes.string.isRequired,
  documents: PropTypes.arrayOf(PropTypes.object).isRequired,
  onArchivedDocuments: PropTypes.func.isRequired,
};

export const DocumentsPage = (props) => {
  const { projectGuid } = props.match.params;

  return (
    <Row>
      <Col span={24}>
        <Typography.Title level={3}>{props.title}</Typography.Title>
      </Col>
      <Col span={24}>
        <DocumentTable
          documents={props.documents}
          documentParent={props.title}
          canArchiveDocuments={true}
          onArchivedDocuments={props.onArchivedDocuments}
          showVersionHistory={true}
          projectGuid={projectGuid}
        />
      </Col>
    </Row>
  );
};

DocumentsPage.propTypes = propTypes;

export default withRouter(DocumentsPage);
