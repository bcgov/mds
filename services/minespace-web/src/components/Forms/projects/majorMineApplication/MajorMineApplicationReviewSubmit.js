import React from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { Checkbox, Row, Col, Typography, Descriptions, Card, Input } from "antd";
import PropTypes from "prop-types";
import * as Strings from "@common/constants/strings";
import {
  removeDocumentFromMajorMineApplication,
  fetchProjectById,
} from "@common/actionCreators/projectActionCreator";
import DocumentTable from "@/components/common/DocumentTable";
import { uploadDateColumn } from "@/components/common/DocumentColumns";
import CustomPropTypes from "@/customPropTypes";
import MajorMineApplicationCallout from "@/components/Forms/projects/majorMineApplication/MajorMineApplicationCallout";

const propTypes = {
  project: CustomPropTypes.project.isRequired,
  confirmedSubmission: PropTypes.bool.isRequired,
  removeDocumentFromMajorMineApplication: PropTypes.func.isRequired,
  fetchProjectById: PropTypes.func.isRequired,
  setConfirmedSubmission: PropTypes.func.isRequired,
  location: PropTypes.shape({
    state: PropTypes.shape({
      applicationSubmitted: PropTypes.bool,
    }),
  }),
  tabbedView: PropTypes.bool,
  applicationSubmitted: PropTypes.bool,
};

const defaultProps = {
  tabbedView: false,
  applicationSubmitted: false,
  location: {
    state: {
      applicationSubmitted: false,
    },
  },
};

const inputStyle = { width: "100%" };

export const MajorMineApplicationReviewSubmit = (props) => {
  const handleDeleteDocument = async ({
    projectGuid,
    majorMineApplicationGuid,
    mineDocumentGuid,
  }) => {
    await props.removeDocumentFromMajorMineApplication(
      projectGuid,
      majorMineApplicationGuid,
      mineDocumentGuid
    );
    return props.fetchProjectById(projectGuid);
  };

  const {
    project_guid: projectGuid,
    contacts,
    major_mine_application: { major_mine_application_guid: majorMineApplicationGuid },
  } = props.project;
  const { project, tabbedView } = props;
  const applicationSubmitted =
    props.applicationSubmitted || props?.location?.state?.applicationSubmitted || false;

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

  const columnStyleConfig = tabbedView ? { style: { maxWidth: "67%", margin: "0 auto" } } : {};

  return (
    <>
      {applicationSubmitted && tabbedView && (
        <Row>
          <Col span={24}>
            <Typography.Title level={2}>Major Mines Application</Typography.Title>
          </Col>
          <Col span={24} {...columnStyleConfig}>
            <MajorMineApplicationCallout
              majorMineApplicationStatus={project.major_mine_application?.status_code}
            />
          </Col>
        </Row>
      )}
      <Row>
        <Col span={24} {...columnStyleConfig}>
          <Typography.Title level={3}>Basic Information</Typography.Title>
        </Col>
      </Row>
      <Row>
        <Col xs={24} md={12}>
          <Descriptions
            layout="vertical"
            colon={false}
            style={tabbedView ? { maxWidth: "67%", float: "right" } : {}}
          >
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
          <Descriptions
            layout="vertical"
            colon={false}
            style={tabbedView ? { maxWidth: "67%" } : {}}
          >
            <Descriptions.Item
              style={inputStyle}
              label="Mine Name"
              className="vertical-description"
            >
              <Input value={project?.mine_name || Strings.EMPTY_FIELD} disabled />
            </Descriptions.Item>
          </Descriptions>
        </Col>
        <Col span={24} {...columnStyleConfig}>
          <br />
          <Typography.Title level={3}>Application Files</Typography.Title>
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
        {!applicationSubmitted && (
          <Col span={24}>
            <Card>
              <>
                <p>
                  <b>Confirmation of Submission</b>
                </p>
                <p>
                  <span>
                    <Checkbox
                      checked={props.confirmedSubmission}
                      onChange={props.setConfirmedSubmission}
                    />
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
        )}
      </Row>
    </>
  );
};

MajorMineApplicationReviewSubmit.propTypes = propTypes;
MajorMineApplicationReviewSubmit.defaultProps = defaultProps;

const mapDispatchToProps = (dispatch) =>
  bindActionCreators({ removeDocumentFromMajorMineApplication, fetchProjectById }, dispatch);

export default withRouter(connect(null, mapDispatchToProps)(MajorMineApplicationReviewSubmit));
