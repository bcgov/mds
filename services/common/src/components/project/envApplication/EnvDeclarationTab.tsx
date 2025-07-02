import React from "react";
import { Typography } from "antd";
import { Field } from "../../forms/form";
import { required } from "@mds/common/redux/utils/Validate";
import RenderCheckbox from "../../forms/RenderCheckbox";
import PageFoldScrollWrapper from "../../common/PageFoldScrollWrapper";

const terms = (
    <ol type="1" className="declaration-page-content">
        <li>In this section:
            <div style={{ paddingLeft: "15px" }}>
                <div>
                    “Applicant” means the applicant as identified in section 2 of this
                    application form;
                </div>
                <div>
                    “Authorization” means the permit, approval, operational certificate, or
                    amended permit, approval, operational certificate, sought pursuant to this
                    application;
                </div>
                <div>
                    “Director” means any statutory decision maker under EMA;
                </div>
                <div>
                    “EMA” means the <i>Environmental Management Act,</i> S.B.C. 2003, c. 53, as amended
                    or replaced from time to time;
                </div>
                <div>
                    “FOIPPA” means the Freedom of Information and Protection of Privacy Act,
                    R.S.B.C. 1996, c. 165, as amended or replaced from time to time;
                </div>
                <div>
                    “Province” means His Majesty the King in Right of British Columbia;
                </div>
                <div>“Regulatory Document” means:</div>
                <ol type="a">
                    <li>this application form,</li>
                    <li>
                        ny document that the Applicant submits or causes to be provided
                        submitted to the Province or the Director in support of this application,
                        and
                    </li>
                    <li>
                        any document that the Applicant submitted or causes to be submitted to
                        the Director or the Province pursuant to
                    </li>
                    <ol type="i">
                        <li>the Authorization;</li>
                        <li>
                            any regulation made under EMA that regulates the facility described above or the
                            discharge of waste from that facility; or
                        </li>
                        <li>
                            any order issued under EMA directed against the Applicant that is related to the
                            facility described above or the discharge of waste from that facility.
                        </li>
                    </ol>
                </ol>
            </div>
        </li>
        <li>
            In consideration of the Province receiving this application, subject to paragraph 3, the
            Applicant hereby irrevocably authorizes the Province to publish on the B.C. government website
            the entirety of any Regulatory Document.
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
            The Applicant certifies that the information provided in this application form is true,
            complete and accurate, and acknowledges that the submission of insufficient information may result in this registration being returned causing
            delays in the registration review process.
        </li>
    </ol>
);
const EnvDeclarationTab = () => {
    const submitButtonRowHeight =
        document.querySelector(".stepped-form-button-row")?.clientHeight ?? 0;
    const rowVerticalGutter = 16;
    const aboveFoldContentHeight = document.getElementById("above-fold")?.clientHeight ?? 0;
    const offsetBottom = aboveFoldContentHeight + submitButtonRowHeight + rowVerticalGutter * 2 + 8;

    return (
        <>
            <Typography.Title level={3}>Declaration</Typography.Title>
            <Typography.Text>By completing this Application for an authorization, the Applicant understands and agrees with the following terms and conditions:</Typography.Text>
            <PageFoldScrollWrapper id="terms-and-conditions" offsetBottom={offsetBottom}>
                {terms}
            </PageFoldScrollWrapper>
            <div
                id="above-fold"
                className="grey-filled-box"
                style={{ marginBottom: rowVerticalGutter }}
            >
                <Typography.Text strong>Confirmation of Submission</Typography.Text>
                <Field
                    name="is_submitting"
                    label="I understand that this submission, along with any supporting files, is being submitted on behalf of the owner, agent, or mine manager. The reporter may be contacted by the Province for further follow-up."
                    required
                    validate={[required]}
                    component={RenderCheckbox}
                />
            </div>
        </>)
};

export default EnvDeclarationTab;