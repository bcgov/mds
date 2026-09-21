import React from "react";
import { Col, Row, Typography } from "antd";
import {
  MAJOR_MINE_AUTH_GUIDE_URL,
  JOINT_APPLICATION_INFORMATION_REQUIREMENTS_GUIDE_URL,
} from "@mds/common/constants/strings";
import { Link } from "react-router-dom";

export const MajorMineApplicationGetStarted = () => {
  return (
    <Row>
      <Col style={{ marginLeft: "15%" }}>
        <Typography.Title level={3}>
          Getting Started with your Major Mine Submission
        </Typography.Title>
        <Typography.Paragraph>Submit Your Authorization Application Documents</Typography.Paragraph>
        <Typography.Paragraph>
          This is where you submit your application documents related to your{" "}
          <b>
            <i>Mines Act authorization</i>
          </b>
          .
          <br />
          Your submission must include:
          <ul style={{ listStyleType: "disc" }}>
            <li>
              A <b>primary document</b> that outlines the core details of your application.
            </li>
            <li>
              <b>Appendix files</b> including engagement information, mine plans, technical reports,
              studies, or assessments that support your application.
            </li>
            <li>
              <b>Spatial files</b> formatted according to the prescribed standards.
            </li>
            <li style={{ paddingLeft: "24px", textIndent: "-20px" }}>
              <b>Supporting documents</b> such as Information Requirements Tables of Concordance,
              Professional Qualifications, confidential information and additional supporting
              information related to your application.
            </li>
          </ul>
        </Typography.Paragraph>
        <Typography.Paragraph>
          If you are submitting a{" "}
          <b>
            joint <i>Mines Act / Environmental Management Act</i>
          </b>{" "}
          (EMA) application, please also include any files that are relevant to the entire
          application package as identified in the Joint Application Instruction Document. This
          ensures coordinated review and alignment with the Joint Application Information
          Requirements (JAIR).
        </Typography.Paragraph>
        <Typography.Paragraph>
          When uploading your documents, you will be required to <b>tag each file by type</b>, which
          supports efficient processing and review.
        </Typography.Paragraph>
        <Typography.Paragraph>
          For more information on the coordinated authorizations process and expectations for major
          mines, refer to the{" "}
          <Link to={{ pathname: MAJOR_MINE_AUTH_GUIDE_URL }} target="_blank">
            Major Mines Authorizations Guide
          </Link>{" "}
          and the{" "}
          <Link
            to={{ pathname: JOINT_APPLICATION_INFORMATION_REQUIREMENTS_GUIDE_URL }}
            target="_blank"
          >
            JAIR Guidance Document
          </Link>
          .
        </Typography.Paragraph>
      </Col>
    </Row>
  );
};

export default MajorMineApplicationGetStarted;
