import React from "react";
import { Row, Col, Divider, Card, Button, Typography, Alert } from "antd";
import * as Strings from "@/constants/strings";

const { Paragraph, Text, Title } = Typography;

export const LandingPage = () => (
  <div>
    <Row>
      <Col>
        <Alert
          message="MineSpace will launch on February 14, 2020."
          description={
            <Text>
              Please contact <a href={`mailto:${Strings.MDS_EMAIL}`}>{Strings.MDS_EMAIL}</a>
              &nbsp;if you have any questions or concerns.
            </Text>
          }
          type="warning"
          banner
        />
        <Title>Welcome to MineSpace</Title>
        <Paragraph>
          The <Text strong>Ministry of Energy, Mines and Petroleum Resources</Text> is developing a
          system to make it easier for the public, industry and government to see what&apos;s
          happening in the mining industry across British Columbia. The system is called&nbsp;
          <Text strong>Mines Digital Services (MDS)</Text>.
        </Paragraph>
        <Paragraph>
          <Text strong>MineSpace</Text> is part of the MDS system, developed specifically for
          industry. It is intended to make it easier for businesses to manage applications, see
          their inspection history and submit reports.
        </Paragraph>
        <Paragraph>
          This system is being developed iteratively and with input from people who operate mines
          across B.C.
        </Paragraph>
        <Divider />
      </Col>
    </Row>
    <Row gutter={[{ xl: 64 }, { sm: 16, xl: 0 }]}>
      <Col sm={{ span: 24 }} xl={{ span: 14 }} xxl={{ span: 13 }}>
        <Row>
          <Col>
            <Title level={2}>What can I do in MineSpace?</Title>
            <Paragraph>
              <ul>
                <li>Upload any report specified in the Health, Safety and Reclamation Code</li>
                <li>View all code variances granted to and incidents reported by your mine</li>
                {/* This bullet is commented out until we display permits for major mines */}
                {/* <li>View your mine permit and amendment history</li> */}
                <li>See all the contacts the Ministry has on file for your mine</li>
                <li>Find important Ministry contacts</li>
              </ul>
            </Paragraph>
          </Col>
        </Row>
        <Row>
          <Col>
            <Title level={2}>How do I get access?</Title>
            <Paragraph>
              You must have a <Text strong>Business or Personal BCeID</Text> and then contact us to
              request access to MineSpace.
            </Paragraph>
          </Col>
        </Row>
        <Row>
          <Col>
            <Title level={2}>If you have a BCeID</Title>
            <Paragraph>
              Contact us at&nbsp;
              <a href={`mailto:${Strings.MDS_EMAIL}`}>{Strings.MDS_EMAIL}</a>
              &nbsp;to request access to MineSpace.
            </Paragraph>
            <Paragraph>
              If you have multiple employees who need to use MineSpace:
              <ol>
                <li>Add them to your Business BCeID</li>
                <li>Let us know you want them to be able to access MineSpace</li>
              </ol>
            </Paragraph>
          </Col>
        </Row>
      </Col>
      <Col sm={{ span: 24 }} xl={{ span: 9, offset: 1 }} xxl={{ span: 8, offset: 3 }}>
        <Card title="Do you have a BCeID?">
          <Row>
            <Col>
              <Paragraph>
                In order to access MineSpace, you need to register for a Business or Personal BCeID.
                It can take several weeks to process the request, so give yourself plenty of lead
                time.
              </Paragraph>
              <Paragraph>
                Once you have your BCeID, you can add employees and delegates. You can request that
                anyone added to your Business BCeID account be given access to MineSpace.
              </Paragraph>
            </Col>
          </Row>
          <Row type="flex" justify="center">
            <Col>
              <a
                href="https://www.bceid.ca/register/business/getting_started/getting_started.aspx"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button type="primary" size="large">
                  Get a BCeID
                </Button>
              </a>
            </Col>
          </Row>
        </Card>
        <Card title="Questions?">
          <Row>
            <Col>
              <Paragraph>
                Please let us know about any questions or comments you have regarding your
                experience using MineSpace.
              </Paragraph>
              <Paragraph>
                Email us at&nbsp;
                <a href={`mailto:${Strings.MDS_EMAIL}`}>{Strings.MDS_EMAIL}</a>.
              </Paragraph>
            </Col>
          </Row>
        </Card>
      </Col>
    </Row>
  </div>
);

export default LandingPage;
