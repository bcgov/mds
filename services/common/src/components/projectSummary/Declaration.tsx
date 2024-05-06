import React, { FC } from "react";
import { Collapse, Row, Typography } from "antd";
import { useSelector } from "react-redux";
import { Field, getFormValues } from "redux-form";
import { FORM } from "../..";
import { getAmsAuthorizationTypes } from "@mds/common/redux/selectors/projectSelectors";
import { required } from "@mds/common/redux/utils/Validate";
import RenderCheckbox from "../forms/RenderCheckbox";
import PageFoldScrollWrapper from "../common/PageFoldScrollWrapper";

const terms = (
  <ol>
    <li>
      In this section: “Applicant” means the applicant as identified in section 2 of this
      application form;
    </li>
    <li>
      “Authorization” means the permit, approval, operational certificate, or amended permit,
      approval, operational certificate, sought pursuant to this application;
    </li>
    <li>
      “Director” means any statutory decision maker under EMA; “EMA” means the Environmental
      Management Act, S.B.C. 2003, c. 53, as amended or replaced from time to time;
    </li>
    <li>
      “FOIPPA” means the Freedom of Information and Protection of Privacy Act, R.S.B.C. 1996, c.
      165, as amended or replaced from time to time;
    </li>
    <li>
      “Province” means Her Majesty the Queen in Right of British Columbia; “Regulatory Document”
      means:
    </li>
    <li>a) this application form,</li>
    <li>
      b) any document that the Applicant submits or causes to be provided submitted to the Province
      or the Director in
    </li>
    <li>support of this application, and</li>
    <li>
      c) any document that the Applicant submitted or causes to be submitted to the Director or the
      Province pursuant to
      <ol type="a">
        <li>the Authorization;</li>
        <li>
          any regulation made under EMA that regulates the facility described above or the discharge
          of waste from
        </li>
        <li>that facility; or</li>
        <li>
          any order issued under EMA directed against the Applicant that is related to the facility
          described above or
        </li>
        <li>the discharge of waste from that facility.</li>
      </ol>
    </li>
    <li>
      In consideration of the Province receiving this application, subject to paragraph 3, the
      Applicant hereby irrevocably authorizes
    </li>
    <li>
      the Province to publish on the B.C. government website the entirety of any Regulatory
      Document.
    </li>
    <li>
      Despite paragraph 2, if the Applicant clearly identifies on the face of a Regulatory Document
      that the Regulatory Document, or clearly identified portions of it, are confidential and
      provides in writing with the document a rationale for why the document or portion thereof
      could not be disclosed under FOIPPA, the Applicant does not consent to the Province publishing
      the document or any portion of it if, in the opinion of the Director, the document or portion
      could not be disclosed under FOIPPA, if it were subject to a request under section 5 of
      FOIPPA.
    </li>
    <li>
      In consideration of the Province receiving this application, the Applicant agrees that it will
      indemnify and save harmless the Province and the Province’s employees and agents from any
      claim for infringement of copyright or other intellectual property rights that the Province or
      any of the Province’s employees or agents may sustain, incur, suffer or be put to at any time
      that arise from the publication of a Regulatory Document.
    </li>
    <li>
      The Applicant certifies that the information provided in this registration form is true,
      complete and accurate, and acknowledges that the submission of insufficient information may
      result in this registration being returned causing delays in the registration review process.
    </li>
  </ol>
);

const Declaration: FC = () => {
  const { authorizationTypes = [] } = useSelector(getFormValues(FORM.ADD_EDIT_PROJECT_SUMMARY));
  const amsAuthTypes = useSelector(getAmsAuthorizationTypes);

  const hasAmsAuths = amsAuthTypes.some((type: string) => authorizationTypes?.includes(type));

  const rowVerticalGutter = 16;
  const aboveFoldContentHeight = document.getElementById("above-fold")?.clientHeight ?? 0;
  const submitButtonRowHeight =
    document.querySelector(".stepped-form-button-row")?.clientHeight ?? 0;
  const offsetBottom = aboveFoldContentHeight + submitButtonRowHeight + rowVerticalGutter * 2 + 8;

  return (
    <div id="declaration">
      <Typography.Title level={3}>Declaration</Typography.Title>
      <Row gutter={[0, rowVerticalGutter]}>
        {hasAmsAuths && (
          <Collapse expandIconPosition="end" defaultActiveKey="ams_terms">
            <Collapse.Panel
              key="ams_terms"
              collapsible="icon"
              className="collapse-no-padding"
              header={
                <Field
                  name="ams_terms_agreed"
                  required
                  validate={[required]}
                  label={
                    <>
                      By completing this Application for an authorization, the Applicant understands
                      and agrees with the terms and conditions.
                    </>
                  }
                  component={RenderCheckbox}
                />
              }
            >
              <PageFoldScrollWrapper id="terms-and-conditions" offsetBottom={offsetBottom}>
                {terms}
              </PageFoldScrollWrapper>
            </Collapse.Panel>
          </Collapse>
        )}
        <div
          id="above-fold"
          className="grey-filled-box"
          style={{ marginBottom: rowVerticalGutter }}
        >
          <Typography.Text strong>Confirmation of Submission</Typography.Text>
          <Field
            name="confirmation_of_submission"
            label="I understand that this submission, along with any supporting files, is being submitted on behalf of the owner, agent, or mine manager. The reporter may be contacted by the Ministry for further follow-up."
            required
            validate={[required]}
            component={RenderCheckbox}
          />
        </div>
      </Row>
    </div>
  );
};

export default Declaration;
