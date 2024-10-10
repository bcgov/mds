import React, { FC } from "react";
import { useSelector } from "react-redux";
import { Row, Col, Typography, Descriptions, Card, Input, Checkbox, Form } from "antd";
import * as Strings from "@mds/common/constants/strings";
import DocumentTable from "@mds/common/components/documents/DocumentTable";
import { documentNameColumn, uploadDateColumn } from "@/components/common/DocumentColumns";
import MajorMineApplicationCallout from "@/components/Forms/projects/majorMineApplication/MajorMineApplicationCallout";
import { MAJOR_MINE_APPLICATION_SUBMISSION_STATUSES } from "@/components/pages/Project/MajorMineApplicationPage";
import ArchivedDocumentsSection from "@common/components/documents/ArchivedDocumentsSection";
import { getMineDocuments } from "@mds/common/redux/selectors/mineSelectors";
import { MajorMineApplicationDocument } from "@mds/common/models/documents/document";
import { renderCategoryColumn } from "@mds/common/components/common/CoreTableCommonColumns";
import { IProject } from "@mds/common/interfaces/projects/project.interface";
import { useLocation } from "react-router-dom";
import { getFormattedProjectApplication } from "@mds/common/redux/selectors/projectSelectors";

const inputStyle = { width: "100%" };

interface MajorMineApplicationReviewSubmitProps {
  project: IProject;
  refreshData: () => Promise<void>;

  applicationSubmitted?: boolean;
  tabbedView?: boolean;

  confirmedSubmission?: boolean;
  toggleConfirmedSubmission?: () => void;
}

export const MajorMineApplicationReviewSubmit: FC<MajorMineApplicationReviewSubmitProps> = ({
  project,
  refreshData,
  applicationSubmitted = false,
  tabbedView = false,
  confirmedSubmission = false,
  toggleConfirmedSubmission,
}) => {
  const mineDocuments = useSelector(getMineDocuments);
  const { state: routeState } = useLocation<{ applicationSubmitted?: boolean }>();
  const routeApplicationSubmitted = routeState?.applicationSubmitted;
  const major_mine_application = useSelector(getFormattedProjectApplication);

  const {
    primary_contact,
    primary_documents,
    spatial_documents,
    supporting_documents,
  } = major_mine_application;

  const isApplicationSubmitted =
    applicationSubmitted ||
    routeApplicationSubmitted ||
    MAJOR_MINE_APPLICATION_SUBMISSION_STATUSES.includes(major_mine_application?.status_code);

  const documentColumns = [documentNameColumn(), uploadDateColumn()];

  const columnStyleConfig = tabbedView ? { style: { maxWidth: "67%", margin: "0 auto" } } : {};

  return (
    <>
      {isApplicationSubmitted && tabbedView && (
        <Row>
          <Col span={24}>
            <Typography.Title level={2}>Major Mines Application</Typography.Title>
          </Col>
          <Col span={24} {...columnStyleConfig}>
            <MajorMineApplicationCallout
              majorMineApplicationStatus={major_mine_application?.status_code}
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
              <Input value={primary_contact || Strings.EMPTY_FIELD} disabled />
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
            documents={primary_documents}
            documentParent="Major Mine Application"
            canArchiveDocuments={true}
            onArchivedDocuments={() => refreshData()}
            showVersionHistory={true}
            enableBulkActions={true}
          />
          <Typography.Title level={4}>Spatial Components</Typography.Title>
          <DocumentTable
            documents={spatial_documents}
            documentParent="Major Mine Application"
            canArchiveDocuments={false}
            onArchivedDocuments={() => refreshData()}
            showVersionHistory={true}
            enableBulkActions={true}
          />
          <Typography.Title level={4}>Supporting Documents</Typography.Title>
          <DocumentTable
            documents={supporting_documents}
            documentParent="Major Mine Application"
            canArchiveDocuments={true}
            onArchivedDocuments={() => refreshData()}
            showVersionHistory={true}
            enableBulkActions={true}
          />

          <ArchivedDocumentsSection
            additionalColumns={[
              renderCategoryColumn("category_code", "Category", Strings.CATEGORY_CODE, true),
            ]}
            documents={
              mineDocuments?.length > 0
                ? mineDocuments.map((doc) => new MajorMineApplicationDocument(doc))
                : []
            }
            documentColumns={documentColumns}
          />
        </Col>
        {!isApplicationSubmitted && (
          <Col span={24}>
            <Card>
              <>
                <p>
                  <b>Confirmation of Submission</b>
                </p>
                <Form.Item required>
                  <Checkbox checked={confirmedSubmission} onChange={toggleConfirmedSubmission}>
                    I confirm that any information provided is accurate and complete to the best of
                    my knowledge.
                  </Checkbox>
                </Form.Item>
              </>
            </Card>
            <br />
          </Col>
        )}
      </Row>
    </>
  );
};

export default MajorMineApplicationReviewSubmit;
