import React from "react";
import { PropTypes } from "prop-types";
import { Field, reduxForm } from "redux-form";
import { Form, Divider, Row, Col, Card, Table } from "antd";
import CustomPropTypes from "@/customPropTypes";
import RenderField from "@/components/common/RenderField";
import RenderDate from "@/components/common/RenderDate";
import RenderRadioButtons from "@/components/common/RenderRadioButtons";
import * as FORM from "@/constants/forms";
import * as Strings from "@/constants/strings";
import ScrollContentWrapper from "@/components/common/wrappers/ScrollContentWrapper";
import ReviewActivities from "@/components/noticeOfWork/applications/review/ReviewActivities";
import NullScreen from "@/components/common/NullScreen";
import Address from "@/components/common/Address";
import LinkButton from "@/components/common/LinkButton";
import { downloadNowDocument } from "@/utils/actionlessNetworkCalls";
import { UNIQUELY_SPATIAL } from "@/constants/fileTypes";
/**
 * @constant ReviewNOWApplication renders edit/view for the NoW Application review step
 */

const propTypes = {
  // isViewMode is being passed into field Component, thus ReviewNOWApplication.js assumes it isn't being used
  // eslint-disable-next-line
  isViewMode: PropTypes.bool.isRequired,
  noticeOfWork: CustomPropTypes.importedNOWApplication.isRequired,
};

export const ReviewNOWApplication = (props) => {
  const renderApplicationInfo = () => (
    <div>
      <Row gutter={16}>
        <Col md={12} sm={24}>
          <div className="field-title">Name of Property</div>
          <Field
            id="property_name"
            name="property_name"
            component={RenderField}
            disabled={props.isViewMode}
          />
        </Col>
        <Col md={12} sm={24}>
          <div className="field-title">Permit Status**</div>
          <Field
            id="permit_status_code"
            name="permit_status_code"
            component={RenderField}
            disabled={props.isViewMode}
          />
        </Col>
      </Row>
      <Row gutter={16}>
        <Col md={12} sm={24}>
          <div className="field-title">Mine Number</div>
          <Field id="mine_no" name="mine_no" component={RenderField} disabled />
        </Col>
        <Col md={12} sm={24}>
          <div className="field-title">Individual or Company/Organization?**</div>
          <Field
            id="permit_status_code"
            name="permit_status_code"
            component={RenderField}
            disabled={props.isViewMode}
          />
        </Col>
      </Row>
      <Row gutter={16}>
        <Col md={12} sm={24}>
          <div className="field-title">Region</div>
          <Field
            id="pproperty_name"
            name="property_name"
            component={RenderField}
            disabled={props.isViewMode}
          />
        </Col>
        <Col md={12} sm={24}>
          <div className="field-title">Relationship to Individual or Company/Organization?**</div>
          <Field
            id="permit_status_code"
            name="permit_status_code"
            component={RenderField}
            disabled={props.isViewMode}
          />
        </Col>
      </Row>
      <Row gutter={16}>
        <Col md={12} sm={24}>
          <div className="field-title">Lat</div>
          <Field
            id="latitude"
            name="latitude"
            component={RenderField}
            disabled={props.isViewMode}
          />
        </Col>
        <Col md={12} sm={24}>
          <div className="field-title">Description of Land</div>
          <Field
            id="description_of_land"
            name="description_of_land"
            component={RenderField}
            disabled={props.isViewMode}
          />
        </Col>
      </Row>
      <Row gutter={16}>
        <Col md={12} sm={24}>
          <div className="field-title">Long</div>
          <Field
            id="longitude"
            name="longitude"
            component={RenderField}
            disabled={props.isViewMode}
          />
        </Col>
        <Col md={12} sm={24}>
          <div className="field-title">Type of Application**</div>
          <Field
            id="permit_status_code"
            name="permit_status_code"
            component={RenderField}
            disabled={props.isViewMode}
          />
        </Col>
      </Row>
      <Row gutter={16}>
        <Col md={12} sm={24}>
          <div className="field-title">Type of Notice of Work</div>
          <Field
            id="notice_of_work_type_code"
            name="notice_of_work_type_code"
            component={RenderField}
            disabled={props.isViewMode}
          />
        </Col>
        <Col md={12} sm={24}>
          <div className="field-title">Term of Application**</div>
          <Field
            id="permit_status_code"
            name="permit_status_code"
            component={RenderField}
            disabled={props.isViewMode}
          />
        </Col>
      </Row>
      <Row gutter={16}>
        <Col md={12} sm={24}>
          <div className="field-title">Permit Type**</div>
          <Field
            id="permit_type"
            name="permit_typpe"
            component={RenderField}
            disabled={props.isViewMode}
          />
        </Col>
        <Col md={12} sm={24}>
          <div className="field-title">Proposed Start Date</div>
          <Field
            id="proposed_start_date"
            name="proposed_start_date"
            component={RenderDate}
            disabled={props.isViewMode}
          />
        </Col>
      </Row>
      <Row gutter={16}>
        <Col md={12} sm={24}>
          <div className="field-title">Crown Grant / District Lot Numbers**</div>
          <Field
            id="pproperty_name"
            name="property_name"
            component={RenderField}
            disabled={props.isViewMode}
          />
        </Col>
        <Col md={12} sm={24}>
          <div className="field-title">Proposed End Date</div>
          <Field
            id="proposed_end_date"
            name="proposed_end_date"
            component={RenderDate}
            disabled={props.isViewMode}
          />
        </Col>
      </Row>
      <Row gutter={16}>
        <Col md={12} sm={24}>
          <div className="field-title">Tenure Number(s)</div>
          <Field
            id="tenure_number"
            name="tenure_number"
            component={RenderField}
            disabled={props.isViewMode}
          />
        </Col>
      </Row>
    </div>
  );

  const renderContacts = () => (
    <div>
      {props.noticeOfWork.contacts && props.noticeOfWork.contacts.length >= 1 ? (
        <Row gutter={16}>
          {props.noticeOfWork.contacts.map((contact) => {
            const formattedPhoneNo = contact.phone_ext
              ? `${contact.phone_no} ext: ${contact.phone_ext}`
              : contact.phone_no;
            return (
              <Col sm={24} lg={12} key={contact.party_guid}>
                <Card
                  title={
                    <div className="inline-flex between wrap">
                      <div>
                        <h3>{contact.type || Strings.EMPTY_FIELD}</h3>
                      </div>
                    </div>
                  }
                  bordered={false}
                >
                  <div className="contact-card--long">
                    <h3>{contact.name}</h3>
                    <h6>Email Address</h6>
                    {contact.email || Strings.EMPTY_FIELD}
                    <h6>Phone Number</h6>
                    {formattedPhoneNo || Strings.EMPTY_FIELD}
                    <h6>Mailing Address</h6>
                    <Address address={contact.address} />
                  </div>
                </Card>
              </Col>
            );
          })}
        </Row>
      ) : (
        <NullScreen type="now-contacts" />
      )}
    </div>
  );

  const renderAccess = () => (
    <div>
      <Row gutter={16}>
        <Col md={12} sm={24}>
          <div className="field-title">Directions to Site</div>
          <Field
            id="property_name"
            name="property_name"
            component={RenderField}
            disabled={props.isViewMode}
          />
        </Col>
        <Col md={12} sm={24}>
          <div className="field-title">
            Do you have the required access authorizations in place?**
          </div>
          <Field
            id="permit_status_code"
            name="permit_status_code"
            component={RenderRadioButtons}
            disabled={props.isViewMode}
          />
        </Col>
      </Row>
      <Row gutter={16}>
        <Col md={12} sm={24}>
          <div className="field-title">
            Do you need to build a road, create stream crossings or other surface distrubance that
            will not be on your tenure?**
          </div>
          <Field
            id="property_name"
            name="property_name"
            component={RenderRadioButtons}
            disabled={props.isViewMode}
          />
        </Col>
        <Col md={12} sm={24}>
          <div className="field-title">Access presently gated**</div>
          <Field
            id="permit_status_code"
            name="permit_status_code"
            component={RenderRadioButtons}
            disabled={props.isViewMode}
          />
        </Col>
      </Row>
      <Row gutter={16}>
        <Col md={12} sm={24}>
          <Field
            id="property_name"
            name="property_name"
            component={RenderField}
            disabled={props.isViewMode}
          />
        </Col>
        <Col md={12} sm={24}>
          <div className="field-title">Key provided to the inspector**</div>
          <Field
            id="permit_status_code"
            name="permit_status_code"
            component={RenderRadioButtons}
            disabled={props.isViewMode}
          />
        </Col>
      </Row>
    </div>
  );

  const renderStateOfLand = () => (
    <div>
      <h4>Present State of Land</h4>
      <Row gutter={16}>
        <Col md={12} sm={24}>
          <div className="field-title">Present condition of the land**</div>
          <Field
            id="property_name"
            name="property_name"
            component={RenderField}
            disabled={props.isViewMode}
          />
        </Col>
        <Col md={12} sm={24}>
          <div className="field-title">Current means of access**</div>
          <Field
            id="permit_status_code"
            name="permit_status_code"
            component={RenderField}
            disabled={props.isViewMode}
          />
        </Col>
      </Row>
      <Row gutter={16}>
        <Col md={12} sm={24}>
          <div className="field-title">Physiography**</div>
          <Field
            id="property_name"
            name="property_name"
            component={RenderField}
            disabled={props.isViewMode}
          />
        </Col>
        <Col md={12} sm={24}>
          <div className="field-title">Old Equipment**</div>
          <Field
            id="permit_status_code"
            name="permit_status_code"
            component={RenderField}
            disabled={props.isViewMode}
          />
        </Col>
      </Row>
      <Row gutter={16}>
        <Col md={12} sm={24}>
          <div className="field-title">Type of vegetation**</div>
          <Field
            id="property_name"
            name="property_name"
            component={RenderField}
            disabled={props.isViewMode}
          />
        </Col>
        <Col md={12} sm={24}>
          <div className="field-title">Recreational trail/use**</div>
          <Field
            id="permit_status_code"
            name="permit_status_code"
            component={RenderField}
            disabled={props.isViewMode}
          />
        </Col>
      </Row>

      <br />
      <h4>Land Ownership</h4>
      <Row gutter={16}>
        <Col md={12} sm={24}>
          <div className="field-title">Application in a community watershed**</div>
          <Field
            id="property_name"
            name="property_name"
            component={RenderRadioButtons}
            disabled={props.isViewMode}
          />
        </Col>
        <Col md={12} sm={24}>
          <div className="field-title">Activities in park**</div>
          <Field
            id="permit_status_code"
            name="permit_status_code"
            component={RenderRadioButtons}
            disabled={props.isViewMode}
          />
        </Col>
      </Row>
      <Row gutter={16}>
        <Col md={12} sm={24}>
          <div className="field-title">Proposed activities on private land**</div>
          <Field
            id="property_name"
            name="property_name"
            component={RenderRadioButtons}
            disabled={props.isViewMode}
          />
        </Col>
        <Col md={12} sm={24}>
          <div className="field-title p-light">
            Do you have authorization by the Lieutenant Governor in Council?**
          </div>
          <Field
            id="permit_status_code"
            name="permit_status_code"
            component={RenderRadioButtons}
            disabled={props.isViewMode}
          />
          <Field
            id="property_name"
            name="property_name"
            component={RenderField}
            disabled={props.isViewMode}
          />
        </Col>
      </Row>

      <br />
      <h4>Cultural Heritage Resources</h4>
      <Row gutter={16}>
        <Col md={12} sm={24}>
          <div className="field-title">
            Are you aware of any protected archaeological sites that may be affected by the proposed
            project?**
          </div>
          <Field
            id="property_name"
            name="property_name"
            component={RenderRadioButtons}
            disabled={props.isViewMode}
          />
          <div className="field-title">Plan to protect the archaeological site**</div>
          <Field
            id="permit_status_code"
            name="permit_status_code"
            component={RenderRadioButtons}
            disabled={props.isViewMode}
          />
        </Col>
      </Row>

      <br />
      <h4>First Nations Engagement</h4>
      <Row gutter={16}>
        <Col md={12} sm={24}>
          <div className="field-title">
            Have you shared information and engaged with First Nations in the area of the proposed
            activity?**
          </div>
          <Field
            id="property_name"
            name="property_name"
            component={RenderRadioButtons}
            disabled={props.isViewMode}
          />
        </Col>
        <Col md={12} sm={24}>
          <div className="field-title">
            As a result of the engagement, are you aware of any cultural heritage resources in the
            area where the work is proposed?**
          </div>
          <Field
            id="permit_status_code"
            name="permit_status_code"
            component={RenderRadioButtons}
            disabled={props.isViewMode}
          />
        </Col>
      </Row>
      <Row gutter={16}>
        <Col md={12} sm={24}>
          <div className="field-title">Describe your First Nations engagement activities**</div>
          <Field
            id="property_name"
            name="property_name"
            component={RenderField}
            disabled={props.isViewMode}
          />
        </Col>
        <Col md={12} sm={24}>
          <div className="field-title">Describe any cultural heritage resources in the area**</div>
          <Field
            id="permit_status_code"
            name="permit_status_code"
            component={RenderField}
            disabled={props.isViewMode}
          />
        </Col>
      </Row>
    </div>
  );

  const renderFirstAid = () => (
    <div>
      <Row gutter={16}>
        <Col md={12} sm={24}>
          <div className="field-title">Proposed First Aid equipment on site**</div>
          <Field
            id="property_name"
            name="property_name"
            component={RenderField}
            disabled={props.isViewMode}
          />
        </Col>
        <Col md={12} sm={24}>
          <div className="field-title">Level of First Aid Certificate held by attendant**</div>
          <Field
            id="permit_status_code"
            name="permit_status_code"
            component={RenderField}
            disabled={props.isViewMode}
          />
        </Col>
      </Row>
    </div>
  );

  const renderEquipment = () => <div>THIS WILL BE A TABLE</div>;
  const renderWorkPlan = () => (
    <Row gutter={16}>
      <Col md={12} sm={24}>
        <div className="field-title">Description of Work**</div>
        <Field
          id="property_name"
          name="property_name"
          component={RenderField}
          disabled={props.isViewMode}
        />
      </Col>
    </Row>
  );

  const renderReclamation = () => (
    <div>
      <Row gutter={16}>
        <Col md={12} sm={24}>
          <div className="field-title">Description of Work**</div>
          <Field
            id="property_name"
            name="property_name"
            component={RenderField}
            disabled={props.isViewMode}
          />
        </Col>
      </Row>
      A TABLE WILL GO HERE
    </div>
  );

  const renderDocuments = () => {
    const columns = [
      {
        title: "File name",
        dataIndex: "filename",
        key: "filename",
        render: (text, record) => (
          <div title="File Name">
            <LinkButton
              onClick={() =>
                downloadNowDocument(record.key, record.application_guid, record.filename)
              }
            >
              <span>{text}</span>
            </LinkButton>
          </div>
        ),
      },
      {
        title: "Category",
        dataIndex: "category",
        key: "category",
        render: (text) => <div title="Category">{text}</div>,
      },
      {
        title: "Proponent Description",
        dataIndex: "description",
        key: "description",
        render: (text) => <div title="Proponent Description">{text}</div>,
      },
    ];

    const isSpatialFile = (document) =>
      document.documenttype === "SpatialFileDoc" ||
      (document.filename &&
        Object.keys(UNIQUELY_SPATIAL).includes(
          document.filename.substr(document.filename.length - 4)
        ));

    const transfromData = (documents, application_guid, spatial = false) =>
      documents
        .filter((document) => (spatial ? isSpatialFile(document) : !isSpatialFile(document)))
        .map((document) => ({
          key: document.id,
          application_guid,
          filename: document.filename || Strings.EMPTY_FIELD,
          url: document.documenturl,
          category: document.documenttype || Strings.EMPTY_FIELD,
          description: document.description || Strings.EMPTY_FIELD,
        }));

    return (
      <div>
        <br />
        <h4>Documents</h4>
        <Divider />
        <div>
          {props.noticeOfWork.documents && props.noticeOfWork.documents.length >= 1 ? (
            <Table
              align="left"
              pagination={false}
              columns={columns}
              dataSource={transfromData(
                props.noticeOfWork.documents,
                props.noticeOfWork.application_guid
              )}
              locale={{ emptyText: "There are no documents associated with this Notice of Work" }}
            />
          ) : (
            <NullScreen type="documents" />
          )}
        </div>
        <br />
        <h4>Spatial Files</h4>
        <Divider />
        <div>
          {props.noticeOfWork.documents && props.noticeOfWork.documents.length >= 1 ? (
            <Table
              align="left"
              pagination={false}
              columns={columns}
              dataSource={transfromData(
                props.noticeOfWork.documents,
                props.noticeOfWork.application_guid,
                true
              )}
              locale={{
                emptyText: "There are no spacial files associated with this Notice of Work",
              }}
            />
          ) : (
            <NullScreen type="documents" />
          )}
        </div>
      </div>
    );
  };

  return (
    <div>
      <Form layout="vertical" onSubmit={() => console.log("submitting form")}>
        <div className="side-menu--content">
          <h2>General Information</h2>
          <Divider />
          <ScrollContentWrapper id="application-info" title="Application Info">
            {renderApplicationInfo()}
          </ScrollContentWrapper>
          <ScrollContentWrapper id="contacts" title="Contacts">
            {renderContacts()}
          </ScrollContentWrapper>
          <ScrollContentWrapper id="access" title="Access">
            {renderAccess()}
          </ScrollContentWrapper>
          <ScrollContentWrapper id="state-of-land" title="State of Land">
            {renderStateOfLand()}
          </ScrollContentWrapper>
          <ScrollContentWrapper id="first-aid" title="First Aid">
            {renderFirstAid()}
          </ScrollContentWrapper>
          <ScrollContentWrapper id="equipment" title="Equipment">
            {renderEquipment()}
          </ScrollContentWrapper>
          <br />
          <h2>Work Plan</h2>
          <Divider />
          {renderWorkPlan()}
          <br />
          <ScrollContentWrapper id="reclamation" title="Summary of Reclamation">
            {renderReclamation()}
          </ScrollContentWrapper>
          <ReviewActivities
            isViewMode={props.isViewMode}
            initialValues={props.noticeOfWork}
            noticeOfWork={props.noticeOfWork}
          />
          <ScrollContentWrapper id="documents" title="Documents">
            {renderDocuments()}
          </ScrollContentWrapper>
        </div>
      </Form>
    </div>
  );
};

ReviewNOWApplication.propTypes = propTypes;

export default reduxForm({
  form: FORM.EDIT_NOTICE_OF_WORK,
  touchOnBlur: true,
})(ReviewNOWApplication);
