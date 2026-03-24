import React, { FC } from "react";
import { Row, Col, Card, Button, Typography } from "antd";
import * as Strings from "@mds/common/constants/strings";
import LoginButton from "../common/LoginButton";
import { useFeatureFlag } from "@mds/common/providers/featureFlags/useFeatureFlag";
import { Feature } from "@mds/common/utils";
import { LANDING_BG } from "@/constants/assets";

export const LandingPage: FC = () => {
  const { isFeatureEnabled } = useFeatureFlag();
  const newSignupEnabled = isFeatureEnabled(Feature.MINESPACE_SIGNUP);

  const colSpans = {
    xs: { span: 24 },
    xxl: { span: 20 },
  };

  const msActivities = [
    "Receive permits online",
    "Track and manage mining applications",
    "Record and track mine incidents",
    "Check compliance requirements",
    "Submit required reports",
    "Request Mines Act digital credentials",
  ];

  const relatedLinks = [
    {
      href: "https://www2.gov.bc.ca/gov/content/industry/mineral-exploration-mining/mineral-titles/mineral-placer-titles/mineraltitlesonline",
      title: "Mineral Titles Online",
    },
    {
      href: "https://portalext.nrs.gov.bc.ca/web/client/-/frontcounter-bc-online-self-service.html",
      title: "virtual FrontCounter BC",
    },
  ];

  return (
    <div style={{ width: "100%" }}>
      <div id="landing-page-header">
        <img id="landing-page-header-image" alt="minespace-background-image" src={LANDING_BG} />
        <div id="landing-page-header-text">
          <Typography.Title style={{ color: "white", margin: 0 }}>
            Welcome to MineSpace
          </Typography.Title>
          <Typography.Paragraph>
            MineSpace is an online portal for managing mining permits, compliance, and reporting
            online.
          </Typography.Paragraph>
        </div>
      </div>
      <Row justify="center">
        <Col xs={24} lg={22} xl={20} xxl={18} className="app-container-column">
          <div className="landing-section">
            <Col {...colSpans}>
              <div>
                MineSpace is part of Mines Digital Services (MDS), developed by the Ministry of
                Mining and Critical Minerals with industry input. It provides tools to streamline
                permitting, compliance tracking, and reporting
              </div>
            </Col>
          </div>
          <div className="landing-section">
            <Col {...colSpans}>
              <Typography.Title level={2}>With MineSpace you can:</Typography.Title>
              <Row gutter={[16, 16]}>
                {msActivities.map((activity) => {
                  return (
                    <Col xs={24} sm={12} md={8} key={activity} className="ms-activity-col">
                      <div className="ms-activity-container">{activity}</div>
                    </Col>
                  );
                })}
              </Row>
            </Col>
          </div>
          <div className="landing-section">
            <Col {...colSpans}>
              <Typography.Title level={2}>Access MineSpace</Typography.Title>
              <div>
                <LoginButton />
                <LoginButton isNewUser />
              </div>
            </Col>
            <Col {...colSpans}>
              <Typography.Title level={4}>How do I get access?</Typography.Title>
              <Typography.Paragraph>
                You must have a <Typography.Text strong>Business BCeID</Typography.Text> and request
                access to MineSpace using the{" "}
                <Typography.Text strong>Join MineSpace</Typography.Text> online request form.
              </Typography.Paragraph>
              <Typography.Paragraph strong>
                If you have multiple employees who need to use MineSpace:
              </Typography.Paragraph>

              <Typography.Paragraph>
                <Typography.Text>1. Add them to your Business BCeID</Typography.Text>
                <br />
                <Typography.Text>
                  {newSignupEnabled ? (
                    <>
                      2. Have them click the <b>Join MineSpace</b> button to complete the sign-up
                      process
                    </>
                  ) : (
                    <>2. Let us know you want them to be able to access MineSpace</>
                  )}
                </Typography.Text>
              </Typography.Paragraph>

              <Typography.Title level={4}>Don&apos;t have a BCeID?</Typography.Title>
              <Typography.Paragraph>
                In order to access MineSpace, you need to register for a Business BCeID. It can take
                several weeks to process the request, so give yourself plenty of lead time.
              </Typography.Paragraph>
              <Typography.Paragraph>
                Once you have your BCeID, you can add employees and delegates. You can request that
                anyone added to your Business BCeID account be given access to MineSpace.
              </Typography.Paragraph>
              <Row justify="center">
                <Col span={24}>
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
            </Col>
            <Col {...colSpans}>
              <Card className="landing-page-card" title="Related Links">
                {relatedLinks.map((link) => {
                  return (
                    <Typography.Paragraph>
                      <a href={link.href} title={link.title} target="_blank">
                        {link.title}
                      </a>
                    </Typography.Paragraph>
                  );
                })}
              </Card>
            </Col>
            <Col {...colSpans}>
              <Card title="Questions?" className="landing-page-card">
                <Row>
                  <Col span={24}>
                    <Typography.Paragraph>
                      Please let us know about any questions or comments you have regarding your
                      experience using MineSpace.
                    </Typography.Paragraph>
                    <Typography.Paragraph>
                      Email us at&nbsp;
                      <a href={`mailto:${Strings.MDS_EMAIL}`}>{Strings.MDS_EMAIL}</a>.
                    </Typography.Paragraph>
                  </Col>
                </Row>
              </Card>
            </Col>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default LandingPage;
