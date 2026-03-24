import React, { FC, useRef, useState } from "react";
import { Field, getFormValues } from "@mds/common/components/forms/form";
import { Button, Col, Row, Descriptions, Popconfirm } from "antd";
import EditOutlined from "@ant-design/icons/EditOutlined";
import {
  required,
  dateNotAfterOther,
  dateNotBeforeOther,
  maxLength,
} from "@mds/common/redux/utils/Validate";
import { resetForm, formatDate } from "@mds/common/redux/utils/helpers";
import {
  getEditingPreambleFlag,
  getNowDraftConditionsFormatted,
} from "@mds/common/redux/selectors/permitSelectors";
import * as FORM from "@/constants/forms";
import { renderConfig } from "@/components/common/config";
import VariableConditionMenuOld from "@/components/Forms/permits/conditions/VariableConditionMenuOld";
import ScrollContentWrapper from "@/components/noticeOfWork/applications/ScrollContentWrapper";
import FinalPermitDocuments from "@/components/noticeOfWork/applications/FinalPermitDocuments";
import PreviousAmendmentDocuments from "@/components/noticeOfWork/applications/PreviousAmendmentDocuments";
import Conditions from "@/components/Forms/permits/conditions/Conditions";
import NOWDocuments from "@/components/noticeOfWork/applications//NOWDocuments";
import PermitAmendmentTable from "@/components/noticeOfWork/applications/permitGeneration/PermitAmendmentTable";
import UploadPermitDocument from "@/components/noticeOfWork/applications/permitGeneration/UploadPermitDocument";
import ReviewSiteProperties from "@/components/noticeOfWork/applications/review/ReviewSiteProperties";
import { CoreTooltip } from "@/components/common/CoreTooltip";
import AuthorizationWrapper from "@mds/common/wrappers/AuthorizationWrapper";
import * as Permission from "@/constants/permissions";
import FormWrapper from "@mds/common/components/forms/FormWrapper";
import { useAppDispatch, useAppSelector } from "@mds/common/redux/rootState";
import {
  IFormattedConditionCategory,
  INoWApplicationForm,
  INoWGeneratedPermit,
  IOption,
  IPermit,
  IPermitAmendment,
} from "@mds/common/interfaces";
import { storeEditingPreambleFlag } from "@mds/common/redux/actions/permitActions";
import { PermitConditionsProvider } from "@mds/common/components/permits/PermitConditionsContext";
import PermitConditionViewEdit from "@mds/common/components/permits/PermitConditionViewEdit";
import { fetchDraftPermitByNOW } from "@mds/common/redux/actionCreators/permitActionCreator";
import { useFeatureFlag } from "@mds/common/providers/featureFlags/useFeatureFlag";
import { Feature } from "@mds/common/utils";
import { userHasRole } from "@mds/common/redux/selectors/authenticationSelectors";
import { USER_ROLES } from "@mds/common/constants/environment";
import VariableConditionMenu from "@mds/common/components/permits/VariableConditionMenu";
import { TextAreaRef } from "antd/lib/input/TextArea";

interface IGeneratedPermitFormProps {
  isAmendment: boolean;
  previousAmendmentDocuments: any[];
  noticeOfWork: INoWApplicationForm;
  isViewMode: boolean;
  permitAmendmentDropdown: IOption[];
  isLoaded: boolean;
  initialValues: INoWGeneratedPermit;
  draftPermit: IPermit;
  draftPermitAmendment: IPermitAmendment;
  isPermitAmendmentTypeDropDownDisabled: boolean;
  handleSavePreamble: () => void;
  handleCancelPreambleTextEdit: () => void;
}

export const GeneratePermitForm: FC<IGeneratedPermitFormProps> = (props) => {
  const dispatch = useAppDispatch();
  const formValues = (useAppSelector(getFormValues(FORM.GENERATE_PERMIT)) ??
    {}) as INoWGeneratedPermit;
  const editingPreambleFlag = useAppSelector(getEditingPreambleFlag);
  const { isFeatureEnabled } = useFeatureFlag();
  const newEditorEnabled = isFeatureEnabled(Feature.NOW_PERMIT_CONDITIONS_EDITOR);
  const [loading, setLoading] = useState(false);
  const [editingFormName, setEditingFormName] = useState<string>();
  const [addingToCategoryCode, setAddingToCategoryCode] = useState<string>();
  const { categoriesWithConditions } = useAppSelector(getNowDraftConditionsFormatted);
  const userCanEdit = useAppSelector(userHasRole(USER_ROLES.role_edit_permits));
  const preambleInputRef = useRef<TextAreaRef | null>(null);

  const formattedCategories: IFormattedConditionCategory[] = categoriesWithConditions.map((cat) => {
    return {
      href: cat.condition_category_code,
      condition_category: { description: cat.description, step: cat.step },
      conditions: cat.conditions,
      condition_category_code: cat.condition_category_code,
      title: <span>{cat.description}</span>,
    };
  });

  const conditionsProviderValue = {
    mineGuid: props.noticeOfWork.mine_guid,
    permitGuid: props.draftPermit.permit_guid,
    currentAmendment: props.draftPermitAmendment,
    isNowEditor: true,
    standardConditionType: props.noticeOfWork.notice_of_work_type_code,
    loading,
    setLoading,
    refreshData: () =>
      dispatch(
        fetchDraftPermitByNOW(props.noticeOfWork.mine_guid, props.noticeOfWork.now_application_guid)
      ),
  };

  return (
    <FormWrapper
      initialValues={props.initialValues ?? {}}
      name={FORM.GENERATE_PERMIT}
      reduxFormConfig={{
        touchOnBlur: false,
        onSubmitSuccess: resetForm(FORM.GENERATE_PERMIT),
        enableReinitialize: true,
      }}
      onSubmit={() => { }}
    >
      {!props.draftPermitAmendment.has_permit_conditions && (
        <ScrollContentWrapper id="permit" title="Permit" isLoaded={props.isLoaded}>
          <UploadPermitDocument
            draftPermitAmendment={props.draftPermitAmendment}
            mineGuid={props.noticeOfWork.mine_guid}
            draftPermit={props.draftPermit}
            NoWGuid={props.noticeOfWork.now_application_guid}
            isViewMode={props.isViewMode}
          />
        </ScrollContentWrapper>
      )}
      <ScrollContentWrapper id="general-info" title="General Information" isLoaded={props.isLoaded}>
        <>
          <Row gutter={32}>
            <Col xs={24} md={12}>
              <Field
                id="mine_no"
                name="mine_no"
                label="Mine Number"
                component={renderConfig.FIELD}
                disabled
              />
            </Col>
            <Col xs={24} md={12}>
              <Field
                id="permit_number"
                name="permit_number"
                label="Permit Number"
                component={renderConfig.FIELD}
                disabled
              />
            </Col>
          </Row>
          <Row gutter={32}>
            <Col xs={24} md={12}>
              <Field
                id="now_number"
                name="now_number"
                label="Application Number"
                component={renderConfig.FIELD}
                disabled
              />
            </Col>
            <Col xs={24} md={12}>
              <Field
                id="now_tracking_number"
                name="now_tracking_number"
                label="Application Tracking Number"
                component={renderConfig.FIELD}
                disabled
              />
            </Col>
          </Row>
          <Row gutter={32}>
            <Col xs={24} md={12}>
              <Field
                id="permittee"
                name="permittee"
                label="Permittee"
                component={renderConfig.FIELD}
                disabled
              />
            </Col>
            <Col xs={24} md={12}>
              <Field
                id="permittee_mailing_address"
                name="permittee_mailing_address"
                label="Permittee Mailing Address"
                component={renderConfig.AUTO_SIZE_FIELD}
                disabled
              />
            </Col>
          </Row>
          <Row gutter={32}>
            <Col xs={24} md={12}>
              <Field
                id="permittee_email"
                name="permittee_email"
                label="Permittee Email"
                component={renderConfig.FIELD}
                disabled
              />
            </Col>
            <Col xs={24} md={12}>
              <Field
                id="mine_location"
                name="mine_location"
                label="Mine Location"
                component={renderConfig.FIELD}
                disabled
              />
            </Col>
          </Row>
          <Row gutter={32}>
            <Col xs={24} md={12}>
              <Field
                id="lead_inspector"
                name="lead_inspector"
                label="Lead Inspector Name"
                component={renderConfig.FIELD}
                disabled
              />
            </Col>
            <Col xs={24} md={12}>
              {/* this will be converted to a drop-down menu with pre-populated title options, currently defaulting to "Inspector of Mines" and disabled */}
              <Field
                id="issuing_inspector_title"
                name="issuing_inspector_title"
                label="Issuing Inspector Title"
                component={renderConfig.FIELD}
                disabled
              />
            </Col>
          </Row>
          <Row gutter={32}>
            <Col xs={24} md={12} />
            <Col xs={24} md={12}>
              <Field
                id="regional_office"
                name="regional_office"
                label="Regional Office"
                component={renderConfig.SELECT}
                required
                validate={[required]}
                data={[
                  { value: "Cranbrook", label: "Cranbrook" },
                  { value: "Kamloops", label: "Kamloops" },
                  { value: "Prince George", label: "Prince George" },
                  { value: "Smithers", label: "Smithers" },
                  { value: "Victoria", label: "Victoria" },
                ]}
                disabled={props.isViewMode}
              />
            </Col>
          </Row>
        </>
      </ScrollContentWrapper>

      <ScrollContentWrapper
        id="authorization"
        title="Permit Authorizations"
        isLoaded={props.isLoaded}
      >
        <>
          <Descriptions column={1}>
            <Descriptions.Item label="Proposed Start Date">
              {formatDate(props.initialValues.proposed_start_date) || "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Proposed Authorization End Date">
              {formatDate(props.initialValues.proposed_end_date) || "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Proposed Term of Authorization">
              {props.initialValues.proposed_term_of_authorization || "N/A"}
            </Descriptions.Item>
          </Descriptions>

          {props.isAmendment && (
            <>
              <h4>Amendment History</h4>
              <PermitAmendmentTable permit={props.draftPermit} />
              <br />
            </>
          )}
          <br />
          <h4>
            {props.isAmendment
              ? "Issue Date and Authorization End Date for the Permit Amendment in Process."
              : "Issue Date and Authorization End Date for the Initial Permit in Process."}
          </h4>
          <Row gutter={32}>
            <Col xs={24} md={12}>
              <Field
                id="issue_date"
                name="issue_date"
                label="Issue Date"
                component={renderConfig.DATE}
                required
                validate={[dateNotAfterOther(formValues.auth_end_date)]}
                disabled={props.isViewMode}
              />
            </Col>
            <Col xs={24} md={12}>
              <Field
                id="auth_end_date"
                name="auth_end_date"
                label="Authorization End Date"
                component={renderConfig.DATE}
                required
                validate={[dateNotBeforeOther(formValues.issue_date)]}
                disabled={props.isViewMode}
              />
            </Col>
          </Row>
          <Descriptions column={1}>
            <Descriptions.Item label="New Term of Authorization">
              {props.initialValues.term_of_authorization || "N/A"}
            </Descriptions.Item>
          </Descriptions>
        </>
      </ScrollContentWrapper>
      <ScrollContentWrapper
        id="site-properties"
        title={
          <>
            Site Properties
            <CoreTooltip title="This information will be included on the permit when it is issued and will determine whether the permittee needs to file inspection fee returns." />
          </>
        }
        isLoaded={props.isLoaded}
      >
        <ReviewSiteProperties
          noticeOfWorkType={props.noticeOfWork.notice_of_work_type_code}
          isViewMode={props.isViewMode}
          initialValues={props.noticeOfWork.site_property}
          draftPermit={props.draftPermit}
        />
      </ScrollContentWrapper>
      {editingPreambleFlag && !newEditorEnabled && <VariableConditionMenuOld />}
      {props.draftPermitAmendment.has_permit_conditions && (
        <ScrollContentWrapper id="preamble" title="Preamble" isLoaded={props.isLoaded}>
          <>
            <Row gutter={32}>
              <Col xs={24} md={12}>
                <Field
                  id="application_date"
                  name="application_date"
                  label="Application Date"
                  component={renderConfig.FIELD}
                  disabled
                />
              </Col>
              <Col xs={24} md={12}>
                <Field
                  id="property"
                  name="property"
                  label="Property Name"
                  component={renderConfig.FIELD}
                  disabled
                />
              </Col>
            </Row>
            <Row gutter={32}>
              <Col xs={24} md={12}>
                <Field
                  id="application_type"
                  name="application_type"
                  label="Notice of Work Permit Type"
                  component={renderConfig.FIELD}
                  disabled
                />
              </Col>
              <Col xs={24} md={12}>
                <Field
                  id="permit_amendment_type_code"
                  name="permit_amendment_type_code"
                  placeholder="Select a Permit Amendment Type"
                  label="Permit Amendment Type"
                  doNotPinDropdown
                  component={renderConfig.SELECT}
                  data={props.permitAmendmentDropdown}
                  required
                  validate={[required]}
                  disabled={props.isViewMode ? true : props.isPermitAmendmentTypeDropDownDisabled}
                />
              </Col>
            </Row>
            {!editingPreambleFlag && (
              <div className="right">
                <br />
                <br />
                <AuthorizationWrapper permission={Permission.EDIT_PERMITS}>
                  <Button
                    type="default"
                    icon={<EditOutlined />}
                    onClick={() => {
                      dispatch(storeEditingPreambleFlag(true));
                    }}
                  >
                    Edit Preamble Text
                  </Button>
                </AuthorizationWrapper>
              </div>
            )}
            <br />
            <br />
            <div style={editingPreambleFlag ? { backgroundColor: "#f3f0f0", padding: "20px" } : {}}>
              <Row gutter={32}>
                <Col xs={48} md={24} className="condition-editor">
                  <Row className="ant-form-item-label">
                    <label htmlFor="preamble_text">Preamble Text</label>
                  </Row>
                  {editingPreambleFlag && newEditorEnabled && (
                    <VariableConditionMenu
                      conditionForm={FORM.GENERATE_PERMIT}
                      inputRef={preambleInputRef}
                    />
                  )}
                  <Field
                    id="preamble_text"
                    name="preamble_text"
                    inputRef={preambleInputRef}
                    component={renderConfig.AUTO_SIZE_FIELD}
                    disabled={!editingPreambleFlag}
                    minRows={4}
                    validate={maxLength(4000)}
                  />
                </Col>
              </Row>
              {editingPreambleFlag && (
                <div className="right center-mobile">
                  <Popconfirm
                    placement="topRight"
                    title="Are you sure you want to cancel?"
                    onConfirm={props.handleCancelPreambleTextEdit}
                    okText="Yes"
                    cancelText="No"
                  >
                    <Button className="full-mobile" type="default">
                      Cancel
                    </Button>
                  </Popconfirm>
                  <AuthorizationWrapper permission={Permission.EDIT_PERMITS}>
                    <Button htmlType="submit" type="primary" onClick={props.handleSavePreamble}>
                      Save
                    </Button>
                  </AuthorizationWrapper>
                </div>
              )}
            </div>
            <br />
            <FinalPermitDocuments
              mineGuid={props.noticeOfWork.mine_guid}
              noticeOfWork={props.noticeOfWork}
              showPreambleFileMetadata={props.draftPermitAmendment.has_permit_conditions}
              editPreambleFileMetadata={!props.isViewMode}
              initialValues={props.initialValues}
              showInUnifiedView
              showBCMIWarning={true}
            />
            {props.previousAmendmentDocuments && (
              <PreviousAmendmentDocuments
                previousAmendmentDocuments={props.previousAmendmentDocuments}
                editPreambleFileMetadata={!props.isViewMode}
              />
            )}
          </>
        </ScrollContentWrapper>
      )}
      {props.draftPermitAmendment.has_permit_conditions && (
        <ScrollContentWrapper id="conditions" title="Conditions" isLoaded={props.isLoaded}>
          {newEditorEnabled ? (
            <PermitConditionsProvider value={conditionsProviderValue}>
              <PermitConditionViewEdit
                userCanEdit={userCanEdit && !props.isViewMode}
                formattedCategories={formattedCategories}
                collapseCategories
                editingFormName={editingFormName}
                setEditingFormName={setEditingFormName}
                addingToCategoryCode={addingToCategoryCode}
                setAddingToCategoryCode={setAddingToCategoryCode}
              />
            </PermitConditionsProvider>
          ) : (
            <Conditions
              mineGuid={props.noticeOfWork.mine_guid}
              permitGuid={props.draftPermit.permit_guid}
              isViewMode={props.isViewMode}
              isSourcePermitGeneratedInCore={props.noticeOfWork.is_source_permit_generated_in_core}
              isNoWApplication={props.noticeOfWork.application_type_code === "NOW"}
            />
          )}
        </ScrollContentWrapper>
      )}
      <ScrollContentWrapper id="maps" title="Maps">
        <NOWDocuments
          documents={props.noticeOfWork.documents.filter(
            ({ now_application_document_sub_type_code }) =>
              now_application_document_sub_type_code === "MDO"
          )}
          isViewMode={props.isViewMode}
          disclaimerText="In this table, you can see all the map-related Notice of Work documents."
          categoriesToShow={["MDO"]}
          addDescriptionColumn={false}
          isStandardDocuments
        />
      </ScrollContentWrapper>
    </FormWrapper>
  );
};

export default GeneratePermitForm;
