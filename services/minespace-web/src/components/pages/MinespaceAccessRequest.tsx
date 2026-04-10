import React, { FC, useEffect, useMemo } from "react";
import moment from "moment";
import { arrayPush, arrayRemove, Field, getFormValues } from "@mds/common/components/forms/form";
import FormWrapper from "@mds/common/components/forms/FormWrapper";
import RenderField from "@mds/common/components/forms/RenderField";
import { useAppSelector, useAppDispatch } from "@mds/common/redux/rootState";
import { getUserInfo } from "@mds/common/redux/selectors/authenticationSelectors";
import { getMineSearchResultsForNewUser } from "@mds/common/redux/selectors/mineSelectors";
import { fetchMineSearchResultsForNewUser } from "@mds/common/redux/actionCreators/mineActionCreator";
import {
  email,
  maxLength,
  phoneNumber,
  required,
  requiredList,
  requiredNewFiles,
} from "@mds/common/redux/utils/Validate";
import { Typography } from "antd";
import RenderFileUpload from "../common/FileUpload";
import RenderCheckbox from "@mds/common/components/forms/RenderCheckbox";
import RenderSubmitButton from "@mds/common/components/forms/RenderSubmitButton";
import RenderMultiSelect from "@mds/common/components/forms/RenderMultiSelect";
import { DOCUMENT } from "@mds/common/constants/fileTypes";
import { IMinespaceUser } from "@mds/common/interfaces";
import RenderSelect from "@mds/common/components/forms/RenderSelect";
import { NEW_MINESPACE_USER_DOCUMENTS } from "@mds/common/constants/API";
import {
  fetchCurrentUserAccessRequest,
  getCurrentUserAccessRequest,
  submitNewUserAccessRequest,
} from "@mds/common/redux/slices/minespaceSlice";
import { MINESPACE_POSITIONS, NULL_MINESPACE_POSITION } from "@mds/common/constants/strings";
import { FORM } from "@mds/common/constants/forms";
import { normalizePhone } from "@mds/common/redux/utils/helpers";

const PRIVACY_NOTICE = (
  <>
    <Typography.Paragraph strong>Why we're collecting your information</Typography.Paragraph>
    <Typography.Paragraph>
      Your personal information (e.g., name, email, business name, BCeID username, mine permit
      number, and authorization details) is being collected to:
    </Typography.Paragraph>
    <ul>
      <li>Verify your identity and confirm your eligibility for access to MineSpace.</li>
      <li>Determine your association with a specific mine or permit.</li>
      <li>Obtain authorization from the permittee or appropriate ministry staff.</li>
      <li>Communicate status updates and regulatory requirements.</li>
    </ul>

    <Typography.Paragraph strong>Legal Authority</Typography.Paragraph>
    <Typography.Paragraph>
      We are collecting this information under the authority of the{" "}
      <em>Freedom of Information and Protection of Privacy Act</em> (RSBC 1996, c. 165),
      specifically sections 26(c) and 26(d), which allow public bodies to collect personal
      information needed to carry out their statutory mandate.
    </Typography.Paragraph>
    <Typography.Paragraph strong>How we will use and share your information</Typography.Paragraph>
    <Typography.Paragraph>Your information will be shared with:</Typography.Paragraph>
    <ul>
      <li>The permittee (e.g., mine manager) responsible for granting access.</li>
      <li>
        Ministry of Mining and Critical Minerals staff for verification and administrative purposes.
      </li>
      <li>Other provincial public bodies if required for compliance or enforcement activities.</li>
    </ul>

    <Typography.Paragraph strong>
      What happens if you don't provide all required information
    </Typography.Paragraph>
    <Typography.Paragraph>
      If you do not provide at least one valid mine permit number or sufficient authorization
      details, or refuse to consent to information collection, your application cannot be processed.
    </Typography.Paragraph>
    <Typography.Paragraph strong>How long we'll keep your information</Typography.Paragraph>
    <Typography.Paragraph>
      {" "}
      We will retain your information for the duration of your account and as required to support
      ongoing regulatory compliance, communication, or audit needs.
    </Typography.Paragraph>
    <Typography.Paragraph strong>Your privacy rights</Typography.Paragraph>
    <ul>
      <li>
        <b>Access and correction:</b> You have the right to request access to or correction of your
        personal information under FOIPPA.
      </li>
      <li>
        <b>Complaints:</b> If you feel your privacy rights have been violated, you may contact the
        Office of the Information and Privacy Commissioner of BC:
        <ul>
          <li>
            <b>Email:</b> info@oipc.bc.ca
          </li>
          <li>
            <b>Phone:</b> 1 800 663-7867 (toll-free in BC)
          </li>
        </ul>
      </li>
    </ul>
    <Typography.Paragraph>
      <b>Questions or concerns?</b>
      <div>Contact the Mines Digital Services</div>
      <div>
        <b>Email:</b> MDS@gov.bc.ca
      </div>
    </Typography.Paragraph>
  </>
);
const TERMS_OF_USE = (
  <>
    <ol className="bold-first-line">
      <li>
        <div>Purpose of Access</div>
        <div>
          MineSpace is provided by the Ministry of Mining and Critical Minerals (Ministry) to
          support mine management, regulatory compliance, and communication. Access is granted only
          to individuals who are permittees or authorized representatives (e.g., mine managers).
        </div>
      </li>
      <li>
        <div>Accuracy of Information</div>
        <div>
          You agree to provide accurate, complete, and current information during registration and
          while using MineSpace. Misrepresentation may result in suspension or termination of
          access.
        </div>
      </li>
      <li>
        <div>Authorization</div>
        <div>
          If you are requesting access as a mine manager or representative, you confirm that you
          have been authorized by the permittee to act on their behalf. You may be required to
          provide supporting documentation or undergo verification.
        </div>
      </li>
      <li>
        <div>Confidentiality and Security</div>
        <div>
          You agree to maintain the confidentiality of your login credentials and any sensitive
          information accessed through MineSpace. Sharing credentials or unauthorized disclosure of
          data is strictly prohibited.
        </div>
      </li>
      <li>
        <div>Compliance with Laws and Regulations</div>
        <div>
          You agree to comply with all applicable laws, regulations, and ministry policies when
          using MineSpace. Misuse of the platform may result in legal action or revocation of
          access.
        </div>
      </li>
      <li>
        <div>Ministry Rights</div>
        <div>
          The Ministry reserves the right to verify your identity and authorization, monitor
          platform usage, and revoke access at its discretion without prior notice.
        </div>
      </li>
      <li>
        <div>Consent to Communication</div>
        <div>
          By using MineSpace, you consent to receive electronic communications related to your
          account, mine permits, and regulatory obligations.
        </div>
      </li>
      <li>
        <div>Limitation of Liability</div>
        <div>
          The Ministry is not liable for any damages resulting from the use or inability to use
          MineSpace, except as required by law.
        </div>
      </li>
      <li>
        <div>Acceptance</div>
        <div>
          By proceeding, you acknowledge that you have read, understood, and agree to these Terms of
          Use.
        </div>
      </li>
    </ol>
  </>
);

const MinespaceAccessRequest: FC = () => {
  const formName = FORM.NEW_MINESPACE_USER;
  const dispatch = useAppDispatch();
  const info = useAppSelector(getUserInfo);
  const currentUserAccessRequest = useAppSelector(getCurrentUserAccessRequest);
  const mineSearchResults = useAppSelector(getMineSearchResultsForNewUser);
  const userCreated = Boolean(currentUserAccessRequest?.access_request?.submitted_timestamp);

  const formValues = (useAppSelector(getFormValues(formName)) ?? {
    access_request: {},
    mineNotInList: false,
    documents: [],
    delegation_letter: [],
  }) as IMinespaceUser;
  const { access_request, documents } = formValues;
  const { mineNotInList, role_requested, permittee } = access_request ?? {};
  const isPermittee = role_requested === "PMT";
  const isAdmin = role_requested === "ADM";
  const requirePermitteeLetter = !isPermittee && !Boolean(permittee);
  const requirePermitteeContact = !isPermittee && !documents?.length;

  useEffect(() => {
    if (currentUserAccessRequest === undefined) {
      dispatch(fetchCurrentUserAccessRequest());
    }
  }, [currentUserAccessRequest]);

  const mineOptions = useMemo(() => {
    return mineSearchResults.map((result) => ({
      value: result.mine_guid,
      label: `#${result.mine_no}`,
    }));
  }, [mineSearchResults]);

  const handleMineSearch = (searchTerm: string) => {
    if (searchTerm && searchTerm.length >= 3) {
      dispatch(fetchMineSearchResultsForNewUser(searchTerm));
    }
  };

  const handleFileLoad = (document_name, document_manager_guid) => {
    dispatch(
      arrayPush(formName, "documents", {
        document_name,
        document_manager_guid,
      })
    );
  };

  const handleDelegationLetterLoad = (document_name, document_manager_guid) => {
    dispatch(
      arrayPush(formName, "delegation_letter", {
        document_name,
        document_manager_guid,
      })
    );
  };

  const handleFileRemove = (_error, file) => {
    const document_manager_guid = file?.serverId;
    const docIndex = formValues.documents?.findIndex(
      (d) => d.document_manager_guid === document_manager_guid
    );
    if (docIndex >= 0) {
      dispatch(arrayRemove(formName, "documents", docIndex));
    }
  };

  const handleDelegationLetterRemove = (_error, file) => {
    const document_manager_guid = file?.serverId;
    const docIndex = formValues.delegation_letter?.findIndex(
      (d) => d.document_manager_guid === document_manager_guid
    );
    if (docIndex >= 0) {
      dispatch(arrayRemove(formName, "delegation_letter", docIndex));
    }
  };

  const onSubmit = async (values) => {
    // Merge delegation_letter into documents if present
    const payload = { ...values };
    if (payload.delegation_letter?.length) {
      payload.documents = [...(payload.documents ?? []), ...payload.delegation_letter];
      delete payload.delegation_letter;
    }
    await dispatch(submitNewUserAccessRequest(payload));
  };

  if (userCreated) {
    return (
      <div>
        <Typography.Title level={1}>Access Request Submitted</Typography.Title>
        <Typography.Paragraph>
          Your access request has been successfully submitted and is currently under review.
        </Typography.Paragraph>
        <Typography.Paragraph>
          You will receive an email notification once your request has been processed.
        </Typography.Paragraph>
        <Typography.Paragraph>
          Submitted on:{" "}
          {moment(currentUserAccessRequest.access_request.submitted_timestamp).format(
            "M/D/YYYY, h:mm:ss A"
          )}
        </Typography.Paragraph>
      </div>
    );
  }

  return (
    <div>
      <FormWrapper name={formName} onSubmit={onSubmit} initialValues={info}>
        <div className="form-section">
          <Typography.Title level={1}>Request Access to MineSpace</Typography.Title>
          <Typography.Paragraph>
            Use this form to apply for access to MineSpace using your Business BCeID account. Your
            request will be reviewed by the Ministry of Mining and Critical Minerals staff to
            confirm authorization. Access is granted only to individuals who are permittees or
            authorized representatives (e.g., mine managers, contractors).
          </Typography.Paragraph>
          <Typography.Paragraph>
            <b>Important:</b>{" "}
            <em>
              You must provide at least one mine number from your Mines Act permit. If you cannot
              locate the permit number in the dropdown list, check “My mine is not in the list” and
              enter the mine name and/or permit number in the text box provided.
            </em>
          </Typography.Paragraph>
          <Typography.Paragraph>Typical processing time: 5-10 business days</Typography.Paragraph>
          <Typography.Paragraph strong>What you'll need:</Typography.Paragraph>
          <ul>
            <li>Your role and associated business name (as registered with Business BCeID)</li>
            <li>Mine number(s) or permit details</li>
            <li>Authorization from the permittee (letter or contact information)</li>
          </ul>
        </div>
        <div className="hide-required-indicator form-section">
          <Typography.Title level={2}>Your User Information (read-only)</Typography.Title>
          <Typography.Paragraph strong>
            Signed in with the wrong account? Log out and sign in with the BCeID account you want to
            use.
          </Typography.Paragraph>
          <Field name="preferred_username" component={RenderField} label="Username" disabled />
          <Field name="display_name" component={RenderField} label="Full Name" disabled />
          <Field name="email" component={RenderField} label="Email Address" disabled />
        </div>
        <div className="form-section">
          <Typography.Title level={2}>Your Request Details</Typography.Title>
          <Field
            name="access_request.role_requested"
            component={RenderSelect}
            data={[...MINESPACE_POSITIONS, NULL_MINESPACE_POSITION]}
            label="Your role"
            required
            validate={[required]}
          />
          <Field
            name="access_request.business_name"
            component={RenderField}
            label="Legal Business Name"
            required
            validate={[required, maxLength(256)]}
          />
          <Field
            name="mines"
            component={RenderMultiSelect}
            label="Mine number(s) from your Mines Act permit"
            help={`Enter at least one mine number from your Mines Act permit. Example: 88112329. If you can't find it in the list, check "My mine is not in the list" and enter the mine name or permit number. Mineral Title claim or lease numbers are not accepted.`}
            required={!mineNotInList}
            validate={mineNotInList ? [] : [requiredList]}
            data={mineOptions}
            onSearch={handleMineSearch}
            placeholder="Search by mine number or permit number (minimum 3 characters)"
          />
          <Field
            name="access_request.mineNotInList"
            component={RenderCheckbox}
            label="My mine is not in the list"
          />
          {mineNotInList && (
            <Field
              name="access_request.access_request_text"
              component={RenderField}
              label="List mine name and/or permit number"
              help="If your mine number isn't listed, enter the mine name and/or permit number. Mineral title claim and lease number are not accepted."
              required
              validate={[required, maxLength(100)]}
            />
          )}
        </div>
        <div className="form-section">
          <Typography.Title level={2}>Authorization</Typography.Title>
          {!isPermittee && (
            <>
              <Typography.Title level={3}>Choice A: Upload Authorization Letter</Typography.Title>
              <div className="form-item-help">
                Provide a letter of authorization from the permittee authorizing your access.
              </div>

              <Field
                name="documents"
                component={RenderFileUpload}
                label="Authorization Letter"
                help="Please note if you are not the permittee of a mine we require written authorization from the permittee before you can gain access"
                required={requirePermitteeLetter}
                validate={!requirePermitteeLetter ? [] : [requiredNewFiles]}
                uploadUrl={NEW_MINESPACE_USER_DOCUMENTS}
                allowRevert
                maxFileSize="400MB"
                acceptedFileTypesMap={DOCUMENT}
                onFileLoad={handleFileLoad}
                onRemoveFile={handleFileRemove}
              />
              <Typography.Title level={3}>
                Choice B: Provide permittee/authorized administrator contact
              </Typography.Title>
              <div className="form-item-help">
                Enter the permittee's contact information so we can verify your authorization
              </div>
              <Field
                name="access_request.permittee.business"
                component={RenderField}
                label="Business Name"
                required={requirePermitteeContact}
                validate={requirePermitteeContact ? [required, maxLength(60)] : [maxLength(60)]}
              />
              <Field
                name="access_request.permittee.name"
                component={RenderField}
                label="Name"
                required={requirePermitteeContact}
                validate={requirePermitteeContact ? [required, maxLength(60)] : [maxLength(60)]}
              />
              <Field
                name="access_request.permittee.title"
                component={RenderField}
                label="Title"
                validate={[maxLength(60)]}
              />
              <Field
                name="access_request.permittee.email"
                component={RenderField}
                label="Email"
                required={requirePermitteeContact}
                validate={
                  requirePermitteeContact
                    ? [required, email, maxLength(60)]
                    : [email, maxLength(60)]
                }
              />
              <Field
                name="access_request.permittee.phone"
                component={RenderField}
                label="Phone"
                required={requirePermitteeContact}
                validate={
                  requirePermitteeContact
                    ? [required, phoneNumber, maxLength(12)]
                    : [phoneNumber, maxLength(12)]
                }
                normalize={normalizePhone}
              />
            </>
          )}
          <Field
            name="access_request.ministry_contact"
            component={RenderField}
            label="Ministry contact (MCM inspector/staff email) to assist routing"
            help="If you've spoken with an MCM Inspector or staff member about this request, enter their email to help us process your application."
            validate={[maxLength(100)]}
          />

          {isAdmin && (
            <Field
              name="delegation_letter"
              component={RenderFileUpload}
              label="Proof of Delegation Letter"
              help="for Minespace administrator"
              required
              validate={[requiredNewFiles]}
              uploadUrl={NEW_MINESPACE_USER_DOCUMENTS}
              allowRevert
              maxFileSize="400MB"
              acceptedFileTypesMap={DOCUMENT}
              onFileLoad={handleDelegationLetterLoad}
              onRemoveFile={handleDelegationLetterRemove}
            />
          )}
        </div>
        <div className="form-section">
          <Typography.Title level={2}>Privacy and Consent</Typography.Title>
          <Typography.Title level={3}>Terms of Use</Typography.Title>
          <div className="terms-container">{TERMS_OF_USE}</div>
          <Typography.Title level={3}>Privacy Collection Notice</Typography.Title>
          <div className="terms-container">{PRIVACY_NOTICE}</div>
          <Typography.Title level={3}>Consent</Typography.Title>
          <Field
            name="access_request.consent_privacy"
            component={RenderCheckbox}
            required
            validate={[required]}
            label="I consent to the collection, use, and disclosure of my information as described in the Privacy Notice"
          />
          <Field
            name="access_request.consent_electronic"
            component={RenderCheckbox}
            required
            validate={[required]}
            label="I consent to receive electronic communications related to my MineSpace account and Regulatory obligations."
          />
        </div>
        <RenderSubmitButton buttonText="Submit" />
      </FormWrapper>
    </div>
  );
};

export default MinespaceAccessRequest;
