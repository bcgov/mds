import React from "react";
import { Row, Col, Typography } from "antd";
import Callout from "@/components/common/Callout";
import { CALLOUT_SEVERITY } from "@mds/common/constants/strings";

export const ProjectDescriptionTab = () => {
  return (
    <Row gutter={[0, 16]}>
      <Col>
        <Typography.Title level={4}>Project Description Overview</Typography.Title>
        <Typography.Paragraph>
          {`Below are the authorization submissions and their status in the project description. Both the Major Mines Office and Ministry of Environments reviews must be completed for this
             stage to be considered complete.`}
        </Typography.Paragraph>
        <Callout
          style={{ marginTop: 0 }}
          message={
            <div className="nod-callout">
              <h4>{"Submission Failed"}</h4>
              <p>
                {
                  "One or more of your environment authorizations has not been submitted successfully. Please retry the submission."
                }
              </p>
            </div>
          }
          severity={CALLOUT_SEVERITY.danger}
        />
      </Col>
    </Row>
  );
};
export default ProjectDescriptionTab;
