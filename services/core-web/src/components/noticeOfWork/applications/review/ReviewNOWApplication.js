import React from "react";
import { PropTypes } from "prop-types";
import { compose } from "redux";
import { connect } from "react-redux";
import { Field, reduxForm, FormSection, formValueSelector } from "redux-form";
import { Form, Divider, Row, Col } from "antd";
import RenderField from "@/components/common/RenderField";
import RenderDate from "@/components/common/RenderDate";
import RenderRadioButtons from "@/components/common/RenderRadioButtons";
import RenderAutoSizeField from "@/components/common/RenderAutoSizeField";
import * as FORM from "@/constants/forms";
import ScrollContentWrapper from "@/components/common/wrappers/ScrollContentWrapper";
import ReviewActivities from "@/components/noticeOfWork/applications/review/ReviewActivities";
import ReclamationSummary from "./activities/ReclamationSummary";
import NOWDocuments from "@/components/noticeOfWork/applications//NOWDocuments";
import NOWSubmissionDocuments from "@/components/noticeOfWork/applications//NOWSubmissionDocuments";
import ReviewNOWContacts from "./ReviewNOWContacts";

/**
 * @constant ReviewNOWApplication renders edit/view for the NoW Application review step
 */

const propTypes = {
  // isViewMode is being passed into field Component, thus ReviewNOWApplication.js assumes it isn't being used
  // eslint-disable-next-line
  isViewMode: PropTypes.bool.isRequired,
  // contacts is being passed into field Component, thus ReviewNOWApplication.js assumes it isn't being used
  // eslint-disable-next-line
  contacts: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)).isRequired,
  // reclamationSummary is being passed into field Component, thus ReviewNOWApplication.js assumes it isn't being used
  // eslint-disable-next-line
  reclamationSummary: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.strings)).isRequired,
  now_application_guid: PropTypes.string.isRequired,
  documents: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)).isRequired,
  submission_documents: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)).isRequired,
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
          <div className="field-title">Permit Status</div>
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
          <Field id="" name="" component={RenderField} disabled />
        </Col>
      </Row>
      <Row gutter={16}>
        <Col md={12} sm={24}>
          <div className="field-title">Region</div>
          <Field id="mine_region" name="mine_region" component={RenderField} disabled />
        </Col>
        <Col md={12} sm={24}>
          <div className="field-title">Relationship to Individual or Company/Organization?**</div>
          <Field id="" name="" component={RenderField} disabled />
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
          <Field id="" name="" component={RenderField} disabled />
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
          <Field id="" name="" component={RenderField} disabled />
        </Col>
      </Row>
      <Row gutter={16}>
        <Col md={12} sm={24}>
          <div className="field-title">Permit Type</div>
          <Field
            id="application_permit_type_code"
            name="application_permit_type_code"
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
          <Field id="" name="" component={RenderField} disabled />
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
            component={RenderAutoSizeField}
            disabled={props.isViewMode}
          />
        </Col>
      </Row>
    </div>
  );

  const renderAccess = () => (
    <div>
      <Row gutter={16}>
        <Col md={12} sm={24}>
          <div className="field-title">Directions to Site</div>
          <Field
            id="directions_to_site"
            name="directions_to_site"
            component={RenderAutoSizeField}
            disabled={props.isViewMode}
          />
        </Col>
        <Col md={12} sm={24}>
          <div className="field-title">
            Do you have the required access authorizations in place?**
          </div>
          <Field id="" name="" component={RenderRadioButtons} disabled />
        </Col>
      </Row>
      <Row gutter={16}>
        <Col md={12} sm={24}>
          <div className="field-title">
            Do you need to build a road, create stream crossings or other surface disturbance that
            will not be on your tenure?**
          </div>
          <Field id="" name="" component={RenderRadioButtons} disabled />
        </Col>
        <Col md={12} sm={24}>
          <div className="field-title">Access presently gated**</div>
          <Field id="" name="" component={RenderRadioButtons} disabled />
        </Col>
      </Row>
      <Row gutter={16}>
        <Col md={12} sm={24}>
          <Field id="" name="" component={RenderField} disabled />
        </Col>
        <Col md={12} sm={24}>
          <div className="field-title">Key provided to the inspector**</div>
          <Field id="" name="" component={RenderRadioButtons} disabled />
        </Col>
      </Row>
    </div>
  );

  const renderStateOfLand = () => (
    <div>
      <h4>Present State of Land</h4>
      <FormSection name="state_of_land">
        <Row gutter={16}>
          <Col md={12} sm={24}>
            <div className="field-title">Present condition of the land**</div>
            <Field id="" name="" component={RenderField} disabled />
          </Col>
          <Col md={12} sm={24}>
            <div className="field-title">Current means of access**</div>
            <Field id="" name="" component={RenderField} disabled />
          </Col>
        </Row>
        <Row gutter={16}>
          <Col md={12} sm={24}>
            <div className="field-title">Physiography**</div>
            <Field id="" name="" component={RenderField} disabled />
          </Col>
          <Col md={12} sm={24}>
            <div className="field-title">Old Equipment**</div>
            <Field id="" name="" component={RenderField} disabled />
          </Col>
        </Row>
        <Row gutter={16}>
          <Col md={12} sm={24}>
            <div className="field-title">Type of vegetation**</div>
            <Field id="" name="" component={RenderField} disabled />
          </Col>
          <Col md={12} sm={24}>
            <div className="field-title">Recreational trail/use**</div>
            <Field id="" name="" component={RenderField} disabled />
          </Col>
        </Row>

        <br />
        <h4>Land Ownership</h4>
        <Row gutter={16}>
          <Col md={12} sm={24}>
            <div className="field-title">Application in a community watershed</div>
            <Field
              id="has_community_water_shed"
              name="has_community_water_shed"
              component={RenderRadioButtons}
              disabled={props.isViewMode}
            />
          </Col>
          <Col md={12} sm={24}>
            <div className="field-title">Activities in park**</div>
            <Field id="" name="" component={RenderRadioButtons} disabled />
          </Col>
        </Row>
        <Row gutter={16}>
          <Col md={12} sm={24}>
            <div className="field-title">Proposed activities on private land**</div>
            <Field id="" name="" component={RenderRadioButtons} disabled />
          </Col>
          <Col md={12} sm={24}>
            <div className="field-title--light">
              Do you have authorization by the Lieutenant Governor in Council?**
            </div>
            <Field id="" name="" component={RenderRadioButtons} disabled />
          </Col>
        </Row>

        <br />
        <h4>Cultural Heritage Resources</h4>
        <Row gutter={16}>
          <Col md={12} sm={24}>
            <div className="field-title">
              Are you aware of any protected archaeological sites that may be affected by the
              proposed project?
            </div>
            <Field
              id="has_archaeology_sites_affected"
              name="has_archaeology_sites_affected"
              component={RenderRadioButtons}
              disabled={props.isViewMode}
            />
            <div className="field-title--light">Plan to protect the archaeological site**</div>
            <Field id="" name="" component={RenderField} disabled />
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
            <Field id="" name="" component={RenderRadioButtons} disabled />
          </Col>
          <Col md={12} sm={24}>
            <div className="field-title">
              As a result of the engagement, are you aware of any cultural heritage resources in the
              area where the work is proposed?**
            </div>
            <Field id="" name="" component={RenderRadioButtons} disabled />
          </Col>
        </Row>
        <Row gutter={16}>
          <Col md={12} sm={24}>
            <div className="field-title">Describe your First Nations engagement activities**</div>
            <Field id="" name="" component={RenderField} disabled />
          </Col>
          <Col md={12} sm={24}>
            <div className="field-title">
              Describe any cultural heritage resources in the area**
            </div>
            <Field id="" name="" component={RenderField} disabled />
          </Col>
        </Row>
      </FormSection>
    </div>
  );

  const renderFirstAid = () => (
    <div>
      <Row gutter={16}>
        <Col md={12} sm={24}>
          <div className="field-title">Proposed First Aid equipment on site</div>
          <Field
            id="first_aid_equipment_on_site"
            name="first_aid_equipment_on_site"
            component={RenderAutoSizeField}
            disabled={props.isViewMode}
          />
        </Col>
        <Col md={12} sm={24}>
          <div className="field-title">Level of First Aid Certificate held by attendant</div>
          <Field
            id="first_aid_cert_level"
            name="first_aid_cert_level"
            component={RenderField}
            disabled={props.isViewMode}
          />
        </Col>
      </Row>
    </div>
  );

  const renderWorkPlan = () => (
    <Row gutter={16}>
      <Col md={12} sm={24}>
        <div className="field-title">Description of Work**</div>
        <Field id="" name="" component={RenderField} disabled={props.isViewMode} />
      </Col>
    </Row>
  );

  const renderReclamation = () => (
    <div>
      <Row gutter={16}>
        <Col md={12} sm={24}>
          <div className="field-title">Total merchantable timber volume**</div>
          <Field id="" name="" component={RenderField} disabled={props.isViewMode} />
        </Col>
      </Row>
      <br />
      <ReclamationSummary summary={props.reclamationSummary} />
    </div>
  );

  return (
    <div>
      <Form layout="vertical">
        <div className="side-menu--content">
          <h2>General Information</h2>
          <div className="right">
            <p className="p-light">** Not available from MMS, NROS, and vFCBC</p>
          </div>
          <Divider style={{ marginTop: "0" }} />
          <ScrollContentWrapper id="application-info" title="Application Info">
            {renderApplicationInfo()}
          </ScrollContentWrapper>
          <ScrollContentWrapper id="contacts" title="Contacts">
            <ReviewNOWContacts contacts={props.contacts} />
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
          <br />
          <h2>Work Plan</h2>
          <Divider />
          {renderWorkPlan()}
          <br />
          <ScrollContentWrapper id="reclamation" title="Summary of Reclamation">
            {renderReclamation()}
          </ScrollContentWrapper>
          <ReviewActivities isViewMode={props.isViewMode} />
          <ScrollContentWrapper id="submission_documents" title="Submission Documents (VFCBC/NROS)">
            <NOWSubmissionDocuments
              now_application_guid={props.now_application_guid}
              documents={props.submission_documents}
            />
          </ScrollContentWrapper>
          <ScrollContentWrapper id="additional_documents" title="Additional Documents">
            <NOWDocuments
              now_application_guid={props.now_application_guid}
              documents={props.documents}
              isViewMode={props.isViewMode}
            />
          </ScrollContentWrapper>
        </div>
      </Form>
    </div>
  );
};

ReviewNOWApplication.propTypes = propTypes;
const selector = formValueSelector(FORM.EDIT_NOTICE_OF_WORK);

export default compose(
  connect((state) => ({
    contacts: selector(state, "contacts"),
    now_application_guid: selector(state, "now_application_guid"),
    documents: selector(state, "documents"),
    submission_documents: selector(state, "submission_documents"),
  })),
  reduxForm({
    form: FORM.EDIT_NOTICE_OF_WORK,
    touchOnBlur: true,
    enableReinitialize: true,
  })
)(ReviewNOWApplication);
