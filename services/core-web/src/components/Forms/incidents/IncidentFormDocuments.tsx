import { IMineIncidentDocument, INCIDENT_DOCUMENT_TYPES } from "@mds/common";
import React, { FC } from "react";
import { Col, Empty, Form, Row, Typography } from "antd";
import { Field } from "redux-form";
import { useParams } from "react-router-dom";
import IncidentFileUpload from "@/components/Forms/incidents/IncidentFileUpload";
import {
  documentColumns,
  FINAL_REPORT_DOCUMENTS_FORM_FIELD,
  formatDocumentRecords,
  INITIAL_INCIDENT_DOCUMENTS_FORM_FIELD,
} from "@/components/Forms/incidents/IncidentForm";
import DocumentTable from "@/components/common/DocumentTable";

interface IncidentFormDocumentsProps {
  documents: IMineIncidentDocument[];
  isEditMode: boolean;
  onFileLoad: (
    document_name: string,
    document_manager_guid: string,
    documentTypeCode: string,
    documentFormField: string
  ) => void;
  onDeleteDocument: (event, documentGuid: string, incidentGuid: string) => void;
  onRemoveFile: (err, fileItem, documentFormField) => void;
}

const IncidentFormDocuments: FC<IncidentFormDocumentsProps> = ({
  documents,
  isEditMode,
  onFileLoad,
  onDeleteDocument,
  onRemoveFile,
}) => {
  const { mineGuid } = useParams<{
    mineGuid: string;
  }>();

  const initialIncidentDocuments = documents.filter(
    (doc) => doc.mine_incident_document_type_code === "INI"
  );
  const finalReportDocuments = documents.filter(
    (doc) => doc.mine_incident_document_type_code === "FIN"
  );

  return (
    <div className="ant-form-vertical">
      <Row>
        <Col span={24}>
          <Typography.Title level={3} id="documentation">
            Documentation
          </Typography.Title>
          <Row>
            <Col xs={24} md={12}>
              <h4>Upload Initial Notification Documents</h4>
            </Col>
          </Row>
          <br />
          <h4>Incident Documents</h4>
          <br />
          <Typography.Paragraph>
            Please upload any initial notifications that will provide context with this incident
            report.
          </Typography.Paragraph>
        </Col>
        {isEditMode && (
          <Col span={24}>
            <Form.Item>
              <Field
                id={INITIAL_INCIDENT_DOCUMENTS_FORM_FIELD}
                name={INITIAL_INCIDENT_DOCUMENTS_FORM_FIELD}
                labelIdle='<strong>Drag & Drop your files or <span class="filepond--label-action">Browse</span></strong><br>
              <div>Accepted filetypes: .kmz, .doc, .docx, .xlsx, .pdf, .msg, .png, .jpeg, .tiff, .hiec</div>'
                onFileLoad={(document_name, document_manager_guid) =>
                  onFileLoad(
                    document_name,
                    document_manager_guid,
                    INCIDENT_DOCUMENT_TYPES.initial,
                    INITIAL_INCIDENT_DOCUMENTS_FORM_FIELD
                  )
                }
                onRemoveFile={onRemoveFile}
                mineGuid={mineGuid}
                component={IncidentFileUpload}
              />
            </Form.Item>
          </Col>
        )}
        <Col span={24}>
          <DocumentTable
            documents={formatDocumentRecords(initialIncidentDocuments)}
            documentParent={"Mine Incident"}
            documentColumns={documentColumns}
            removeDocument={onDeleteDocument}
          />
          <br />
        </Col>
        <Col span={24}>
          <h4 id="final-report">Final Report</h4>
          <br />
        </Col>
        {isEditMode && (
          <Col span={24}>
            <Form.Item>
              <Field
                id={FINAL_REPORT_DOCUMENTS_FORM_FIELD}
                name={FINAL_REPORT_DOCUMENTS_FORM_FIELD}
                labelIdle='<strong>Drag & Drop your files or <span class="filepond--label-action">Browse</span></strong><br>
              <div>Accepted filetypes: .kmz, .doc, .docx, .xlsx, .pdf, .msg, .png, .jpeg, .tiff, .hiec</div>'
                onFileLoad={(document_name, document_manager_guid) =>
                  onFileLoad(
                    document_name,
                    document_manager_guid,
                    INCIDENT_DOCUMENT_TYPES.final,
                    FINAL_REPORT_DOCUMENTS_FORM_FIELD
                  )
                }
                onRemoveFile={onRemoveFile}
                mineGuid={mineGuid}
                component={IncidentFileUpload}
              />
            </Form.Item>
          </Col>
        )}
        <Col span={24}>
          <DocumentTable
            documents={formatDocumentRecords(finalReportDocuments)}
            documentParent="Mine Incident"
            documentColumns={documentColumns}
            removeDocument={onDeleteDocument}
          />
          <br />
        </Col>
        {!isEditMode && finalReportDocuments?.length === 0 && (
          <Col span={24}>
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <div className="center">
                  <Typography.Paragraph strong>
                    This incident requires a final investigation report.
                  </Typography.Paragraph>
                  <Typography.Paragraph>
                    Pursuant to section 1.7.2 of the HSRC, an investigation report must be submitted
                    within 60 days of the reportable incident. Please add the final report
                    documentation by clicking below.
                  </Typography.Paragraph>
                </div>
              }
            />
          </Col>
        )}
      </Row>
    </div>
  );
};

export default IncidentFormDocuments;
