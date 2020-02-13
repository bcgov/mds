import React from "react";
import { connect } from "react-redux";
import { Row, Col, Card, Button, Typography } from "antd";
import * as Strings from "@common/constants/strings";
import PropTypes from "prop-types";
import * as COMMON_ENV from "@common/constants/environment";
// Uncomment when image is re-introduced
// import { MAP_LOGO } from "@/constants/assets";
import * as MINESPACE_ENV from "@/constants/environment";
import { isAuthenticated } from "@/selectors/authenticationSelectors";

const { Paragraph, Text, Title } = Typography;

const propTypes = {
  isAuthenticated: PropTypes.bool.isRequired,
};

export const LandingPage = (props) => (
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
        <Title>Welcome to MineSpace</Title>
        <Paragraph className="header-text">
          Manage applications, see inspection histories, submit reports, and more.
        </Paragraph>
        <Button type="primary" size="large" className="login">
          <a
            href={`${COMMON_ENV.KEYCLOAK.loginURL}${MINESPACE_ENV.BCEID_LOGIN_REDIRECT_URI}&kc_idp_hint=${COMMON_ENV.KEYCLOAK.idpHint}`}
          >
            Log in
          </a>
        </Button>
      </Col>
      <Col sm={1} xl={2} xxl={4} />
    </Row> */}
    <Row
      type="flex"
      justify="center"
      align="top"
      className="landing-header"
      gutter={[{ sm: 0, xl: 64 }]}
    >
      <Col xl={{ span: 24 }} xxl={{ span: 20 }}>
        <Title>Welcome to MineSpace</Title>
        <Paragraph className="header-text">
          Manage applications, see inspection histories, submit reports, and more.
        </Paragraph>
        {!props.isAuthenticated && (
          <Button type="primary" size="large" className="login">
            <a
              href={`${COMMON_ENV.KEYCLOAK.loginURL}${MINESPACE_ENV.BCEID_LOGIN_REDIRECT_URI}&kc_idp_hint=${COMMON_ENV.KEYCLOAK.idpHint}`}
            >
              Log in
            </a>
          </Button>
        )}
      </Col>
    </Row>
    <Row
      gutter={[{ sm: 0, xl: 64 }]}
      type="flex"
      justify="center"
      align="top"
      className="landing-section"
    >
      <Col sm={{ span: 24 }} xl={{ span: 12 }} xxl={{ span: 10 }}>
        <Title level={4}>What is MineSpace?</Title>
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

        <Title level={4}>What can I do in MineSpace?</Title>
        <ul className="landing-list">
          <li>Upload any report specified in the Health, Safety and Reclamation Code</li>
          <li>View all code variances granted to and incidents reported by your mine</li>
          <li>View your mine permit and amendment history</li>
          <li>See all the contacts the Ministry has on file for your mine</li>
          <li>Find important Ministry contacts</li>
        </ul>
        <Paragraph />
      </Col>
      <Col sm={{ span: 24 }} xl={{ span: 12 }} xxl={{ span: 10 }}>
        <Title level={4}>How do I get access?</Title>
        <Paragraph>
          You must have a <Text strong>Business or Personal BCeID</Text> and then contact us to
          request access to MineSpace.
        </Paragraph>
        <Paragraph strong>If you have a BCeID:</Paragraph>
        <Paragraph>
          Contact us at&nbsp;
          <a href={`mailto:${Strings.MDS_EMAIL}`}>{Strings.MDS_EMAIL}</a>
          &nbsp;to request access to MineSpace.
        </Paragraph>
        <Paragraph strong>If you have multiple employees who need to use MineSpace:</Paragraph>

        <Paragraph>
          <Text>Add them to your Business BCeID</Text>
          <Text>Let us know you want them to be able to access MineSpace</Text>
        </Paragraph>

        <Title level={4}>Don&apos;t have a BCeID?</Title>
        <Paragraph>
          In order to access MineSpace, you need to register for a Business or Personal BCeID. It
          can take several weeks to process the request, so give yourself plenty of lead time.
        </Paragraph>
        <Paragraph>
          Once you have your BCeID, you can add employees and delegates. You can request that anyone
          added to your Business BCeID account be given access to MineSpace.
        </Paragraph>
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
      </Col>
    </Row>
    <Row
      gutter={[{ sm: 0, xl: 64 }]}
      type="flex"
      justify="center"
      align="top"
      className="landing-section"
    >
      <Col sm={{ span: 24 }} xl={{ span: 12 }} xxl={{ span: 10 }}>
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

const mapStateToProps = (state) => ({
  isAuthenticated: isAuthenticated(state),
});

LandingPage.propTypes = propTypes;

export default connect(mapStateToProps)(LandingPage);
