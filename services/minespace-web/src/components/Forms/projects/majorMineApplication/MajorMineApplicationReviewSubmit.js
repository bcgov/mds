import React from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { CALLOUT_SEVERITY } from "@common/constants/strings";
import { Checkbox, Row, Col, Typography, Descriptions, Card, Input } from "antd";
import PropTypes from "prop-types";
import * as Strings from "@common/constants/strings";
import {
  removeDocumentFromMajorMineApplication,
  fetchProjectById,
} from "@common/actionCreators/projectActionCreator";
import Callout from "@/components/common/Callout";
import DocumentTable from "@/components/common/DocumentTable";
import { uploadDateColumn } from "@/components/common/DocumentColumns";
import CustomPropTypes from "@/customPropTypes";

const propTypes = {
  project: CustomPropTypes.project.isRequired,
  confirmedSubmission: PropTypes.bool.isRequired,
  removeDocumentFromMajorMineApplication: PropTypes.func.isRequired,
  fetchProjectById: PropTypes.func.isRequired,
  setConfirmedSubmission: PropTypes.func.isRequired,
};

const inputStyle = { width: "100%" };

export const MajorMineApplicationReviewSubmit = ({
  project,
  removeDocumentFromMajorMineApplication: removeDocument,
  fetchProjectById: fetchProject,
  confirmedSubmission,
  setConfirmedSubmission,
}) => {
  const handleDeleteDocument = async ({
    projectGuid,
    majorMineApplicationGuid,
    mineDocumentGuid,
  }) => {
    await removeDocument(projectGuid, majorMineApplicationGuid, mineDocumentGuid);
    return fetchProject(projectGuid);
  };

  const {
    project_guid: projectGuid,
    contacts,
    major_mine_application: { major_mine_application_guid: majorMineApplicationGuid },
  } = project;

  const primaryContact = contacts?.find((c) => c.is_primary) || {};

  const primaryDocuments = project.major_mine_application?.documents?.filter(
    (d) => d.major_mine_application_document_type_code === "PRM"
  );
  const spatialDocuments = project.major_mine_application?.documents?.filter(
    (d) => d.major_mine_application_document_type_code === "SPT"
  );
  const supportDocuments = project.major_mine_application?.documents?.filter(
    (d) => d.major_mine_application_document_type_code === "SPR"
  );
  const documentColumns = [uploadDateColumn("upload_date")];

  return (
    <>
      <Callout
        message={
          <div>
            <h4 style={{ fontWeight: "bold" }}>Confirm your Submission</h4>
            <p>
              Please confirm the contents of your submission below. When you are happy with your
              review click the submit button to begin the review process.
            </p>
          </div>
        }
        severity={CALLOUT_SEVERITY.warning}
      />
      <br />
      <Typography.Title level={4}>Basic Information</Typography.Title>
      <Row>
        <Col xs={24} md={12}>
          <Descriptions layout="vertical" colon={false}>
            <Descriptions.Item
              style={inputStyle}
              label="Primary Contact"
              className="vertical-description"
            >
              <Input value={primaryContact?.name || Strings.EMPTY_FIELD} disabled />
            </Descriptions.Item>
          </Descriptions>
        </Col>
        <Col xs={24} md={12}>
          <Descriptions layout="vertical" colon={false}>
            <Descriptions.Item
              style={inputStyle}
              label="Mine Name"
              className="vertical-description"
            >
              <Input value={project?.mine_name || Strings.EMPTY_FIELD} disabled />
            </Descriptions.Item>
          </Descriptions>
        </Col>
        <Col span={24}>
          <Typography.Title level={4}>Primary Document</Typography.Title>
          <DocumentTable
            documents={primaryDocuments}
            documentColumns={documentColumns}
            documentParent="Major Mine Application"
            handleDeleteDocument={handleDeleteDocument}
            deletePayload={{ projectGuid, majorMineApplicationGuid }}
          />
          <Typography.Title level={4}>Spatial Components</Typography.Title>
          <DocumentTable
            documents={spatialDocuments}
            documentColumns={documentColumns}
            documentParent="Major Mine Application"
            handleDeleteDocument={handleDeleteDocument}
            deletePayload={{ projectGuid, majorMineApplicationGuid }}
          />
          <Typography.Title level={4}>Supporting Documents</Typography.Title>
          <DocumentTable
            documents={supportDocuments}
            documentParent="Major Mine Application"
            documentColumns={documentColumns}
            handleDeleteDocument={handleDeleteDocument}
            deletePayload={{ projectGuid, majorMineApplicationGuid }}
          />
        </Col>
        <Col span={24}>
          <Card>
            <>
              <p>
                <b>Confirmation of Submission</b>
              </p>
              <p>
                <span>
                  <Checkbox checked={confirmedSubmission} onChange={setConfirmedSubmission} />
                  &nbsp;&nbsp;
                </span>
                I understand that this application and supporting files are submitted on behalf of
                the owner, agent or mine manager of this project.
                <span style={{ color: "red" }}>*</span>
              </p>
            </>
          </Card>
          <br />
        </Col>
      </Row>
    </>
  );
};

MajorMineApplicationReviewSubmit.propTypes = propTypes;

const mapDispatchToProps = (dispatch) =>
  bindActionCreators({ removeDocumentFromMajorMineApplication, fetchProjectById }, dispatch);

export default connect(null, mapDispatchToProps)(MajorMineApplicationReviewSubmit);
