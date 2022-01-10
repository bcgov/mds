/* eslint-disable */
import React, { Component } from "react";
import PropTypes from "prop-types";
import { Field, reduxForm, change, arrayPush, formValueSelector } from "redux-form";
import { maxLength } from "@common/utils/Validate";
import { Form } from "@ant-design/compatible";
import { connect } from "react-redux";
import { remove } from "lodash";
import { Button, Typography, Row, Col } from "antd";
import { withRouter } from "react-router-dom";
import { compose, bindActionCreators } from "redux";
import { renderConfig } from "@/components/common/config";
import DocumentTable from "@/components/common/DocumentTable";
import ProjectSummaryFileUpload from "@/components/Forms/projectSummaries/ProjectSummaryFileUpload";
import * as FORM from "@/constants/forms";

const propTypes = {};

export class DocumentUpload extends Component {
  state = {
    uploadedFiles: [],
  };

  onFileLoad = (fileName, document_manager_guid) => {
    this.state.uploadedFiles.push({ document_name: fileName, document_manager_guid });
    return this.props.change(FORM.ADD_EDIT_PROJECT_SUMMARY, "documents", this.state.uploadedFiles);
  };

  onRemoveFile = (err, fileItem) => {
    remove(this.props.documents, { document_manager_guid: fileItem.serverId });
    return this.props.change(FORM.ADD_EDIT_PROJECT_SUMMARY, "documents", this.props.documents);
  };

  render() {
    return (
      <>
        <Typography.Title level={3}>Document Upload</Typography.Title>
        <Form.Item label="Attach your project description file(s) here.">
          <Row gutter={16}>
            <Col span={12}>
              <Typography.Paragraph>
                <ul>
                  <li>You cannot upload ZIP files</li>
                  <li>
                    {" "}
                    The allowed file types are: .pdf, .doc, .docx, .rtf, .odt, .ott, .oth, .odm,
                    .xls, .xlsx, .jpeg, .png, .dbf, .geojson, .gml, .kml, .kmz, .ain, .aih, .atx,
                    .cpg, .fbn, .fbx, .ixs, .mxs, .prj, .sbn, .sbx, .shp, .shpz, .shx, .wkt, .csv,
                    .xml
                  </li>
                  <li>Maximum individual file size is 400 MB</li>
                </ul>
              </Typography.Paragraph>
            </Col>
          </Row>
          {this.props.isEditMode && (
            <DocumentTable
              documents={this.props.initialValues?.documents}
              documentCategoryOptionsHash={this.props.projectSummaryDocumentTypesHash}
              documentParent="project summary"
              categoryDataIndex="project_summary_document_type_code"
              uploadDateIndex="upload_date"
            />
          )}

          <Field
            id="documents"
            name="documents"
            onFileLoad={this.onFileLoad}
            onRemoveFile={this.onRemoveFile}
            mineGuid={this.props.mineGuid}
            component={ProjectSummaryFileUpload}
          />
        </Form.Item>
      </>
    );
  }
}

DocumentUpload.propTypes = propTypes;
const selector = formValueSelector(FORM.ADD_EDIT_PROJECT_SUMMARY);
const mapStateToProps = (state) => ({
  documents: selector(state, "documents"),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      change,
      arrayPush,
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(DocumentUpload);
