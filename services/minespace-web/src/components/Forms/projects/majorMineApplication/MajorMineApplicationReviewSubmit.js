import React from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { Checkbox, Row, Col, Typography, Descriptions, Card, Input } from "antd";
import PropTypes from "prop-types";
import * as Strings from "@mds/common/constants/strings";
import {
  removeDocumentFromMajorMineApplication,
  fetchProjectById,
} from "@mds/common/redux/actionCreators/projectActionCreator";
import DocumentTable from "@/components/common/DocumentTable";
import { documentNameColumn, uploadDateColumn } from "@/components/common/DocumentColumns";
import CustomPropTypes from "@/customPropTypes";
import MajorMineApplicationCallout from "@/components/Forms/projects/majorMineApplication/MajorMineApplicationCallout";
import { MAJOR_MINE_APPLICATION_SUBMISSION_STATUSES } from "@/components/pages/Project/MajorMineApplicationPage";
import ArchivedDocumentsSection from "@common/components/documents/ArchivedDocumentsSection";
import { getMineDocuments } from "@mds/common/redux/selectors/mineSelectors";
import { MajorMineApplicationDocument } from "@mds/common/models/documents/document";
import { renderCategoryColumn } from "@mds/common/components/common/CoreTableCommonColumns";

const propTypes = {
  project: CustomPropTypes.project.isRequired,
  confirmedSubmission: PropTypes.bool.isRequired,
  refreshData: PropTypes.func.isRequired,
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
    props?.applicationSubmitted ||
    props?.location?.state?.applicationSubmitted ||
    MAJOR_MINE_APPLICATION_SUBMISSION_STATUSES.includes(
      project.major_mine_application?.status_code
    );

  const primaryContact = contacts?.find((c) => c.is_primary) || {};

  const documents =
    project.major_mine_application?.documents?.map((doc) => {
      return new MajorMineApplicationDocument(doc);
    }) ?? [];

  const primaryDocuments = documents.filter(
    (d) => d.major_mine_application_document_type_code === "PRM"
  );
  const spatialDocuments = documents.filter(
    (d) => d.major_mine_application_document_type_code === "SPT"
  );
  const supportDocuments = documents.filter(
    (d) => d.major_mine_application_document_type_code === "SPR"
  );
  const documentColumns = [documentNameColumn(), uploadDateColumn()];

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
            documentParent="Major Mine Application"
            handleDeleteDocument={handleDeleteDocument}
            deletePayload={{ projectGuid, majorMineApplicationGuid }}
            deletePermission
            canArchiveDocuments={true}
            onArchivedDocuments={() => props.refreshData()}
            showVersionHistory={true}
            enableBulkActions={true}
          />
          <Typography.Title level={4}>Spatial Components</Typography.Title>
          <DocumentTable
            documents={spatialDocuments}
            documentParent="Major Mine Application"
            handleDeleteDocument={handleDeleteDocument}
            deletePayload={{ projectGuid, majorMineApplicationGuid }}
            deletePermission
            canArchiveDocuments={true}
            onArchivedDocuments={() => props.refreshData()}
            showVersionHistory={true}
            enableBulkActions={true}
          />
          <Typography.Title level={4}>Supporting Documents</Typography.Title>
          <DocumentTable
            documents={supportDocuments}
            documentParent="Major Mine Application"
            handleDeleteDocument={handleDeleteDocument}
            deletePayload={{ projectGuid, majorMineApplicationGuid }}
            deletePermission
            canArchiveDocuments={true}
            onArchivedDocuments={() => props.refreshData()}
            showVersionHistory={true}
            enableBulkActions={true}
          />

          <ArchivedDocumentsSection
            additionalColumns={[
              renderCategoryColumn("category_code", "Category", Strings.CATEGORY_CODE, true),
            ]}
            documents={
              props.mineDocuments && props.mineDocuments.length > 0
                ? props.mineDocuments.map((doc) => new MajorMineApplicationDocument(doc))
                : []
            }
            documentColumns={documentColumns}
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
                  I confirm that any information provided is accurate and complete to the best of my
                  knowledge.
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

const mapStateToProps = (state) => ({
  mineDocuments: getMineDocuments(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators({ removeDocumentFromMajorMineApplication, fetchProjectById }, dispatch);

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(MajorMineApplicationReviewSubmit)
);
