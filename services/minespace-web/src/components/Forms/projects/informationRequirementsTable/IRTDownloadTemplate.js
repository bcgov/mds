import React, { Component } from "react";
import { Button, Col, Row, Typography } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import { ENVIRONMENT } from "@common/constants/environment";
import * as API from "@common/constants/API";

export class IRTDownloadTemplate extends Component {
  downloadIRTTemplate = (url) => {
    const anchor = document.createElement("a");
    anchor.href = url;

    anchor.download = "IRT_Template.xlsx";
    anchor.style.display = "none";
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
  };

  render() {
    return (
      <Row>
        <Col span={24}>
          <Typography.Title level={4}>IRT template</Typography.Title>
          <Typography.Paragraph>
            The first step in composing an IRT is to download the official{" "}
            <a
              href="https://www2.gov.bc.ca/assets/gov/environment/waste-management/industrial-waste/industrial-waste/mining-smelt-energy/2019_09_24_information_requirements_table.pdf"
              target="_blank"
              rel="noopener noreferrer"
            >
              IRT template
            </a>
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
              Join Application Information Requirements for Mines Act and Environmental Management
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
          <Typography.Paragraph>
            <div>
              <Button
                type="primary"
                className="full-mobile"
                onClick={() =>
                  this.downloadIRTTemplate(ENVIRONMENT.apiUrl + API.IRT_TEMPLATE_DOWNLOAD)
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
