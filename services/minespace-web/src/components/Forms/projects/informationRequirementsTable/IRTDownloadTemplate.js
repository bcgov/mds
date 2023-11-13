import React, { Component } from "react";
import { Button, Col, Row, Typography } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import { ENVIRONMENT } from "@mds/common";
import * as API from "@mds/common/constants/API";
import LinkButton from "@/components/common/LinkButton";

export class IRTDownloadTemplate extends Component {
  downloadIRTTemplate = (url) => {
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.style.display = "none";
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
  };

  render() {
    return (
      <Row>
        <Col>
          <Typography.Title level={3}>Download IRT template</Typography.Title>
          <Typography.Paragraph>
            The first step in composing an IRT is to download the official{" "}
            <LinkButton
              onClick={() =>
                this.downloadIRTTemplate(
                  ENVIRONMENT.apiUrl + API.INFORMATION_REQUIREMENTS_TABLE_TEMPLATE_DOWNLOAD
                )
              }
            >
              IRT template
            </LinkButton>
            . This template is to be used for the final IRT submission, make sure the IRT template
            structure is not modified or the submission might fail.
          </Typography.Paragraph>
          <Typography.Paragraph>
            If you need guidance on the table, refer to{" "}
            <a
              href="https://www2.gov.bc.ca/assets/gov/environment/waste-management/industrial-waste/industrial-waste/mining-smelt-energy/2019_09_24_joint_application_information_requirements.pdf"
              target="_blank"
              rel="noopener noreferrer"
            >
              Joint Application Information Requirements for Mines Act and Environmental Management
              Act Permits
            </a>
          </Typography.Paragraph>
          <Typography.Paragraph>
            If you are unsure how to proceed, please email the Major Mines Office at&nbsp;
            <a href="mailto:permrecl@gov.bc.ca">permrecl@gov.bc.ca</a>&nbsp;or contact the&nbsp;
            <a
              href="https://www2.gov.bc.ca/gov/content/industry/mineral-exploration-mining/further-information/emli-mines-contact-information"
              target="_blank"
              rel="noopener noreferrer"
            >
              Regional Mines Office
            </a>
            &nbsp;closest to your project location.
          </Typography.Paragraph>
          <br />
          <Typography.Paragraph>
            <div>
              <Button
                type="primary"
                className="full-mobile"
                onClick={() =>
                  this.downloadIRTTemplate(
                    ENVIRONMENT.apiUrl + API.INFORMATION_REQUIREMENTS_TABLE_TEMPLATE_DOWNLOAD
                  )
                }
              >
                <DownloadOutlined className="padding-sm--right icon-sm" />
                Download IRT template
              </Button>
            </div>
          </Typography.Paragraph>
        </Col>
      </Row>
    );
  }
}

export default IRTDownloadTemplate;
