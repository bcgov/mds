import React from "react";
import { connect } from "react-redux";
import { Row, Col, Card, Button, Typography } from "antd";
import * as Strings from "@common/constants/strings";
import PropTypes from "prop-types";
import * as COMMON_ENV from "@mds/common";
// Uncomment when image is re-introduced
// import { MAP_LOGO } from "@/constants/assets";
import * as MINESPACE_ENV from "@/constants/environment";
import { isAuthenticated } from "@/selectors/authenticationSelectors";
import { AuthorizationWrapper } from "@/components/common/wrappers/AuthorizationWrapper";
import LoginButton from "../common/LoginButton";

const propTypes = {
  isAuthenticated: PropTypes.bool.isRequired,
};

export const LandingPage = (props: { isAuthenticated: boolean }) => (
  <div>
    {/* Use this instead and not the below Row when we want to display the image! */}
    {/* <Row
      type="flex"
      justify="center"
      align="middle"
      gutter={[{ sm: 0, xl: 64 }]}
      className="landing-header"
    >
      <Col sm={1} xl={2} xxl={4} />
      <Col span={6}>
        <img src={MAP_LOGO} />
      </Col>
      <Col sm={22} xl={10}>
        <Typography.Title>Welcome to MineSpace</Typography.Title>
        <Typography.Paragraph className="header-text">
          Manage applications, see inspection histories, submit reports, and more.
        </Typography.Paragraph>
        <Button type="primary" size="large" className="login">
          <a
            href={`${COMMON_ENV.KEYCLOAK.loginURL}${MINESPACE_ENV.BCEID_LOGIN_REDIRECT_URI}&kc_idp_hint=${COMMON_ENV.KEYCLOAK.bceid_idpHint}`}
          >
            Log in
          </a>
        </Button>
      </Col>
      <Col sm={1} xl={2} xxl={4} />
    </Row> */}
    <Row
      justify="center"
      align="top"
      className="landing-header"
      // gutter={[{ sm: 0, xl: 64 }]}
    >
      <Col xl={{ span: 24 }} xxl={{ span: 20 }}>
        <Typography.Title>Welcome to MineSpace</Typography.Title>
        <Typography.Paragraph className="header-text">
          Manage applications, see inspection histories, submit reports, and more.
        </Typography.Paragraph>
        {!props.isAuthenticated && (
          <div>
            <LoginButton />
            <AuthorizationWrapper inTesting>
              <Button type="primary" size="large" className="login">
                <a
                  href={`${COMMON_ENV.KEYCLOAK.loginURL}${MINESPACE_ENV.BCEID_LOGIN_REDIRECT_URI}&kc_idp_hint=${COMMON_ENV.KEYCLOAK.vcauthn_idpHint}`}
                >
                  Log in with Verifiable Credentials
                </a>
              </Button>
            </AuthorizationWrapper>
          </div>
        )}
      </Col>
    </Row>
    <Row
      // gutter={[{ sm: 0, xl: 64 }]}
      justify="center"
      align="top"
      className="landing-section"
    >
      <Col sm={{ span: 24 }} xl={{ span: 12 }} xxl={{ span: 10 }}>
        <Typography.Title level={4}>What is MineSpace?</Typography.Title>
        <Typography.Paragraph>
          The{" "}
          <Typography.Text strong>
            Ministry of Energy, Mines and Low Carbon Innovation
          </Typography.Text>{" "}
          is developing a system to make it easier for the public, industry and government to see
          what&apos;s happening in the mining industry across British Columbia. The system is
          called&nbsp;
          <Typography.Text strong>Mines Digital Services (MDS)</Typography.Text>.
        </Typography.Paragraph>
        <Typography.Paragraph>
          <Typography.Text strong>MineSpace</Typography.Text> is part of the MDS system, developed
          specifically for industry. It is intended to make it easier for businesses to manage
          applications, see their inspection history and submit reports.
        </Typography.Paragraph>
        <Typography.Paragraph>
          This system is being developed iteratively and with input from people who operate mines
          across B.C.
        </Typography.Paragraph>

        <Typography.Title level={4}>What can I do in MineSpace?</Typography.Title>
        <ul className="landing-list">
          <li>Upload any report specified in the Health, Safety and Reclamation Code</li>
          <li>View all code variances granted to and incidents reported by your mine</li>
          <li>View your mine permit and amendment history</li>
          <li>See all the contacts the Ministry has on file for your mine</li>
          <li>Find important Ministry contacts</li>
        </ul>
        <Typography.Paragraph />
      </Col>
      <Col sm={{ span: 24 }} xl={{ span: 12 }} xxl={{ span: 10 }}>
        <Typography.Title level={4}>How do I get access?</Typography.Title>
        <Typography.Paragraph>
          You must have a <Typography.Text strong>Business or Basic BCeID</Typography.Text> and then
          contact us to request access to MineSpace.
        </Typography.Paragraph>
        <Typography.Paragraph strong>If you have a BCeID:</Typography.Paragraph>
        <Typography.Paragraph>
          Contact us at&nbsp;
          <a href={`mailto:${Strings.MDS_EMAIL}`}>{Strings.MDS_EMAIL}</a>
          &nbsp;to request access to MineSpace.
        </Typography.Paragraph>
        <Typography.Paragraph strong>
          If you have multiple employees who need to use MineSpace:
        </Typography.Paragraph>

        <Typography.Paragraph>
          <Typography.Text>Add them to your Business BCeID</Typography.Text>
          <Typography.Text>
            Let us know you want them to be able to access MineSpace
          </Typography.Text>
        </Typography.Paragraph>

        <Typography.Title level={4}>Don&apos;t have a BCeID?</Typography.Title>
        <Typography.Paragraph>
          In order to access MineSpace, you need to register for a Business or Basic BCeID. It can
          take several weeks to process the request, so give yourself plenty of lead time.
        </Typography.Paragraph>
        <Typography.Paragraph>
          Once you have your BCeID, you can add employees and delegates. You can request that anyone
          added to your Business BCeID account be given access to MineSpace.
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
    </Row>
    <Row
      // gutter={[{ sm: 0, xl: 64 }]}
      justify="center"
      align="top"
      className="landing-section"
    >
      <Col sm={{ span: 24 }} xl={{ span: 12 }} xxl={{ span: 10 }}>
        <Card title="Questions?">
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
    </Row>
  </div>
);

const mapStateToProps = (state) => ({
  isAuthenticated: isAuthenticated(state),
});

LandingPage.propTypes = propTypes;

export default connect(mapStateToProps)(LandingPage);
