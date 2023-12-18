import { IMineIncident, IMineIncidentDocument, INCIDENT_DOCUMENT_TYPES } from "@mds/common";
import React, { FC } from "react";
import { Col, Divider, Empty, Form, Row, Typography } from "antd";
import { LockOutlined } from "@ant-design/icons";
import { Field } from "redux-form";
import {
  documentColumns,
  formatDocumentRecords,
  INTERNAL_MINISTRY_DOCUMENTS_FORM_FIELD,
} from "@/components/Forms/incidents/IncidentForm";
import { useParams } from "react-router-dom";
import IncidentFileUpload from "@/components/Forms/incidents/IncidentFileUpload";
import { DocumentTable } from "@/components/common/DocumentTable";
import { MinistryInternalComments } from "@/components/mine/Incidents/MinistryInternalComments";

interface IncidentFormInternalDocumentCommentsProps {
  documents: IMineIncidentDocument[];
  incident: IMineIncident;
  isEditMode: boolean;
  onFileLoad: (
    document_name: string,
    document_manager_guid: string,
    documentTypeCode: string,
    documentFormField: string
  ) => void;
  onDeleteDocument: (event, documentGuid: string, incidentGuid: string) => void;
  onRemoveFile: (err, fileItem, documentFormField) => void;
  formValues: Partial<IMineIncident>;
}

const IncidentFormInternalDocumentComments: FC<IncidentFormInternalDocumentCommentsProps> = ({
  documents,
  incident,
  isEditMode,
  onFileLoad,
  formValues,
  onDeleteDocument,
  onRemoveFile,
}) => {
  const { mineGuid } = useParams<{ mineGuid: string }>();
  const incidentCreated = Boolean(formValues?.mine_incident_guid);
  const internalMinistryDocuments = documents.filter(
    (doc) => doc.mine_incident_document_type_code === "INM"
  );

  return (
    <div className="ant-form-vertical">
      <Row>
        <Col span={24}>
          <Typography.Title level={3} id="internal-documents">
            <LockOutlined className="violet" />
            Internal Documents and Comments (Ministry Visible Only)
          </Typography.Title>
          <Divider />
          {!incidentCreated ? (
            <div className="center">
              <Empty
                description={
                  <Typography.Paragraph strong className="center padding-md--top">
                    The internal ministry documentation section will be displayed after this
                    incident is created.
                  </Typography.Paragraph>
                }
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            </div>
          ) : (
            <Row>
              <Col span={24}>
                <Row>
                  <Col xs={24} md={12}>
                    <h4>Internal Ministry Documentation</h4>
                  </Col>
                </Row>
                <br />
                <Typography.Paragraph strong>
                  These files are for internal staff only and will not be shown to proponents.
                  Upload internal documents that are created durring the review process.
                </Typography.Paragraph>
              </Col>
              {isEditMode && (
                <Col span={24}>
                  <Form.Item>
                    <Field
                      id={INTERNAL_MINISTRY_DOCUMENTS_FORM_FIELD}
                      name={INTERNAL_MINISTRY_DOCUMENTS_FORM_FIELD}
                      labelIdle='<strong>Drag & Drop your files or <span class="filepond--label-action">Browse</span></strong><br>
                    <div>Accepted filetypes: .kmz, .doc, .docx, .xlsx, .pdf</div>'
                      onFileLoad={(document_name, document_manager_guid) =>
                        onFileLoad(
                          document_name,
                          document_manager_guid,
                          INCIDENT_DOCUMENT_TYPES.internalMinistry,
                          INTERNAL_MINISTRY_DOCUMENTS_FORM_FIELD
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
                  documents={formatDocumentRecords(internalMinistryDocuments)}
                  documentParent="Mine Incident"
                  documentColumns={documentColumns}
                  removeDocument={onDeleteDocument}
                />
              </Col>
              <Col span={24}>
                <br />
                <MinistryInternalComments
                  mineIncidentGuid={incident?.mine_incident_guid}
                  isEditMode={isEditMode}
                />
              </Col>
            </Row>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default IncidentFormInternalDocumentComments;
