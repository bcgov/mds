import React from "react";
import { Row, Col, Typography } from "antd";
import { withRouter } from "react-router-dom";
import PropTypes from "prop-types";
import DocumentTable from "@/components/common/DocumentTable";

const propTypes = {
  title: PropTypes.string.isRequired,
  documents: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export const DocumentsPage = (props) => {
  return (
    <Row>
      <Col span={24}>
        <Typography.Title level={3}>{props.title}</Typography.Title>
      </Col>
      <Col span={24}>
        <DocumentTable
          documents={props.documents}
          documentParent={props.title}
          component="project-all-documents"
          uploadDateIndex="upload_date"
        />
      </Col>
    </Row>
  );
};

DocumentsPage.propTypes = propTypes;

export default withRouter(DocumentsPage);
