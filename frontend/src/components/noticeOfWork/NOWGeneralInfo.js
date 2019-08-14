import React, { Component } from "react";
import { Divider, Card, Col, Row } from "antd";
import * as Strings from "@/constants/strings";

export class NOWGeneralInfo extends Component {
  renderApplicationInformation = () => {
    return (
      <div>
        <h3>Application Information</h3>
        <Divider />
        <Row gutter={16} className="padding-small">
          <Col md={12} xs={24}>
            <div className="inline-flex padding-small">
              <p className="field-title">Mine Name</p>
              <p> {Strings.EMPTY_FIELD}</p>
            </div>
            <div className="inline-flex padding-small">
              <p className="field-title">Mine Number</p>
              <p> {Strings.EMPTY_FIELD}</p>
            </div>
            <div className="inline-flex padding-small">
              <p className="field-title">Region</p>
              <p> {Strings.EMPTY_FIELD}</p>
            </div>
            <div className="inline-flex padding-small">
              <p className="field-title">Lat</p>
              <p> {Strings.EMPTY_FIELD}</p>
            </div>
            <div className="inline-flex padding-small">
              <p className="field-title">Long</p>
              <p> {Strings.EMPTY_FIELD}</p>
            </div>
            <div className="inline-flex padding-small">
              <p className="field-title">Type of Notice of Work</p>
              <p> {Strings.EMPTY_FIELD}</p>
            </div>
            <div className="inline-flex padding-small">
              <p className="field-title">Permit Type</p>
              <p> {Strings.EMPTY_FIELD}</p>
            </div>
            <div className="inline-flex padding-small">
              <p className="field-title">Permit Status</p>
              <p> {Strings.EMPTY_FIELD}</p>
            </div>
          </Col>
          <Col md={12} xs={24}>
            <div className="inline-flex padding-small">
              <p className="field-title">Crown/Private</p>
              <p> {Strings.EMPTY_FIELD}</p>
            </div>
            <div className="inline-flex padding-small">
              <p className="field-title">Tenure Number</p>
              <p> {Strings.EMPTY_FIELD}</p>
            </div>
            <div className="inline-flex padding-small">
              <p className="field-title">Description of Land</p>
              <p> {Strings.EMPTY_FIELD}</p>
            </div>
            <div className="inline-flex padding-small">
              <p className="field-title">Type of Application</p>
              <p> {Strings.EMPTY_FIELD}</p>
            </div>
            <div className="inline-flex padding-small">
              <p className="field-title">Proposed Start Date</p>
              <p> {Strings.EMPTY_FIELD}</p>
            </div>
            <div className="inline-flex padding-small">
              <p className="field-title">Proposed End Date</p>
              <p> {Strings.EMPTY_FIELD}</p>
            </div>
          </Col>
        </Row>
      </div>
    );
  };

  renderContacts = () => {
    return (
      <div>
        <br />
        <h3>Contacts</h3>
        <Divider />
        <div className="padding-large--sides">
          <Row>
            <Col sm={24} lg={12} xl={8} xxl={6}>
              <Card
                title={
                  <div className="inline-flex between wrap">
                    <div>
                      <h3>{Strings.EMPTY_FIELD}</h3>
                    </div>
                  </div>
                }
                bordered={false}
              >
                <div>
                  <h3>{Strings.EMPTY_FIELD}</h3>
                  <h6>Email Address</h6>
                  {Strings.EMPTY_FIELD}
                  <h6>Phone Number</h6>
                  {Strings.EMPTY_FIELD}
                  <h6>Mailing Address</h6>
                  {Strings.EMPTY_FIELD}
                </div>
              </Card>
            </Col>
          </Row>
        </div>
      </div>
    );
  };

  renderAccess = () => {
    return (
      <div>
        <br />
        <h3>Access</h3>
        <Divider />
        <div className="padding-large--sides">
          <Row gutter={16} className="padding-small">
            <Col md={12} xs={24}>
              <p className="field-title">Directions to Site</p>
            </Col>
            <Col md={12} xs={24}>
              <p> {Strings.EMPTY_FIELD}</p>
            </Col>
          </Row>
          <Row gutter={16} className="padding-small">
            <Col md={12} xs={24}>
              <p className="field-title">
                Do you need to build a road, create stream crossings or other surface disturbances
                that will not be on your tenure?
              </p>
            </Col>
            <Col md={12} xs={24}>
              <p> {Strings.EMPTY_FIELD}</p>
            </Col>
          </Row>
          <Row gutter={16} className="padding-small">
            <Col md={12} xs={24}>
              <p className="field-title">
                Do you have the required access authorizations in place?
              </p>
            </Col>
            <Col md={12} xs={24}>
              <p> {Strings.EMPTY_FIELD}</p>
            </Col>
          </Row>
          <Row gutter={16} className="padding-small">
            <Col md={12} xs={24}>
              <p className="field-title">Access presently gated</p>
            </Col>
            <Col md={12} xs={24}>
              <p> {Strings.EMPTY_FIELD}</p>
            </Col>
          </Row>
          <Row gutter={16} className="padding-small">
            <Col md={12} xs={24}>
              <p className="field-title">Key provided to the inspector</p>
            </Col>
            <Col md={12} xs={24}>
              <p> {Strings.EMPTY_FIELD}</p>
            </Col>
          </Row>
        </div>
      </div>
    );
  };

  renderStateOfLand = () => {
    return (
      <div>
        <br />
        <h3>State of Land</h3>
        <Divider />
        <div className="padding-large--sides">
          <h4 className="h4">Present State of Land</h4>
          <Row gutter={16} className="padding-small">
            <Col md={12} xs={24}>
              <p className="field-title"> Present condition of the land</p>
            </Col>
            <Col md={12} xs={24}>
              <p> {Strings.EMPTY_FIELD}</p>
            </Col>
          </Row>
          <Row gutter={16} className="padding-small">
            <Col md={12} xs={24}>
              <p className="field-title">Type of vegetation</p>
            </Col>
            <Col md={12} xs={24}>
              <p> {Strings.EMPTY_FIELD}</p>
            </Col>
          </Row>
          <Row gutter={16} className="padding-small">
            <Col md={12} xs={24}>
              <p className="field-title">Physiography</p>
            </Col>
            <Col md={12} xs={24}>
              <p> {Strings.EMPTY_FIELD}</p>
            </Col>
          </Row>
          <Row gutter={16} className="padding-small">
            <Col md={12} xs={24}>
              <p className="field-title">Current means of access</p>
            </Col>
            <Col md={12} xs={24}>
              <p> {Strings.EMPTY_FIELD}</p>
            </Col>
          </Row>
          <Row gutter={16} className="padding-small">
            <Col md={12} xs={24}>
              <p className="field-title">Old equipment</p>
            </Col>
            <Col md={12} xs={24}>
              <p> {Strings.EMPTY_FIELD}</p>
            </Col>
          </Row>
          <Row gutter={16} className="padding-small">
            <Col md={12} xs={24}>
              <p className="field-title">Recreational trails/use</p>
            </Col>
            <Col md={12} xs={24}>
              <p> {Strings.EMPTY_FIELD}</p>
            </Col>
          </Row>
          <br />
          <h4 className="h4">Land Ownership</h4>
          <Row gutter={16} className="padding-small">
            <Col md={12} xs={24}>
              <p className="field-title">Application area in a community watershed</p>
            </Col>
            <Col md={12} xs={24}>
              <p> {Strings.EMPTY_FIELD}</p>
            </Col>
          </Row>
          <Row gutter={16} className="padding-small">
            <Col md={12} xs={24}>
              <p className="field-title">Proposed activities on private land</p>
            </Col>
            <Col md={12} xs={24}>
              <p> {Strings.EMPTY_FIELD}</p>
            </Col>
          </Row>
          <Row gutter={16} className="padding-small">
            <Col md={12} xs={24}>
              <p className="field-title">Activities in a park</p>
            </Col>
            <Col md={12} xs={24}>
              <p> {Strings.EMPTY_FIELD}</p>
            </Col>
          </Row>
          <Row gutter={16} className="padding-small">
            <Col md={12} xs={24}>
              <p className="field-title--light">
                Do you have authorization by the Lieutenant Governor in Council?
              </p>
            </Col>
            <Col md={12} xs={24}>
              <p> {Strings.EMPTY_FIELD}</p>
            </Col>
          </Row>
          <br />
          <h4 className="h4">Cultural Heritage Resources</h4>
          <Row gutter={16} className="padding-small">
            <Col md={12} xs={24}>
              <p className="field-title">
                Are you aware of any protected archaeological sites that may be affected by the
                proposed project?
              </p>
            </Col>
            <Col md={12} xs={24}>
              <p> {Strings.EMPTY_FIELD}</p>
            </Col>
          </Row>
          <Row gutter={16} className="padding-small">
            <Col md={12} xs={24}>
              <p className="field-title--light">Plan to protect the archaeological site</p>
            </Col>
            <Col md={12} xs={24}>
              <p> {Strings.EMPTY_FIELD}</p>
            </Col>
          </Row>
          <br />
          <h4 className="h4">First Nations Engagement</h4>
          <Row gutter={16} className="padding-small">
            <Col md={12} xs={24}>
              <p className="field-title">
                Have you shared information and engaged with First Nations in the area of the
                proposed activity?
              </p>
            </Col>
            <Col md={12} xs={24}>
              <p> {Strings.EMPTY_FIELD}</p>
            </Col>
          </Row>
          <Row gutter={16} className="padding-small">
            <Col md={12} xs={24}>
              <p className="field-title">Describe your First Nations engagement activities</p>
            </Col>
            <Col md={12} xs={24}>
              <p> {Strings.EMPTY_FIELD}</p>
            </Col>
          </Row>
          <Row gutter={16} className="padding-small">
            <Col md={12} xs={24}>
              <p className="field-title--light">
                As a result of the engagement, are you aware of any cultural heritage resources in
                the area where the work is proposed?
              </p>
            </Col>
            <Col md={12} xs={24}>
              <p> {Strings.EMPTY_FIELD}</p>
            </Col>
          </Row>
        </div>
      </div>
    );
  };

  render() {
    return (
      <div className="page__content--nested">
        {this.renderApplicationInformation()}
        {this.renderContacts()}
        {this.renderAccess()}
        {this.renderStateOfLand()}
      </div>
    );
  }
}

export default NOWGeneralInfo;
