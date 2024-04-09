import React, { FC, useEffect, useState } from "react";
import { connect, useSelector } from "react-redux";
import { compose } from "redux";
import {
  Field,
  formValueSelector,
  getFormValues,
  InjectedFormProps,
  reduxForm,
  change,
} from "redux-form";
import { Form } from "@ant-design/compatible";
import "@ant-design/compatible/assets/index.css";
import { Alert, Button, Col, Popconfirm, Row, Table, Typography, Radio } from "antd";
import {
  IPermit,
  IExplosivesPermit,
  IPermitPartyRelationship,
  IimportedNOWApplication,
  IOption,
  IGroupedDropdownList,
  ESUP_DOCUMENT_GENERATED_TYPES,
  IExplosivesPermitDocument,
} from "@mds/common";
import { getNoticeOfWorkList } from "@mds/common/redux/selectors/noticeOfWorkSelectors";
import {
  dateNotInFuture,
  lat,
  lon,
  lonNegative,
  maxLength,
  number,
  required,
} from "@common/utils/Validate";
import { createDropDownList, formatDate, resetForm } from "@common/utils/helpers";
import { getAllPartyRelationships } from "@mds/common/redux/selectors/partiesSelectors";
import { getPermits } from "@mds/common/redux/selectors/permitSelectors";
import { getIsFormLoading } from "@mds/common/redux/reducers/modalReducer";
import { renderConfig } from "@/components/common/config";
import * as FORM from "@/constants/forms";
import DocumentCategoryForm from "@/components/Forms/DocumentCategoryForm";
import MagazineFormNew from "@/components/Forms/ExplosivesPermit/MagazineFormNew";
import {
  generatedDocColumns,
  supportingDocColumns,
} from "@mds/common/components/explosivespermits/ExplosivesPermitViewModal";
import ExplosivesPermitMap from "@mds/common/components/explosivespermits/ExplosivesPermitMap";

export enum EsupFormMode {
  select_type_modal,
  create_new,
  create_historic,
  amend,
  edit_document,
}

interface ExplosivesPermitFormProps {
  closeModal: () => void;
  initialValues: any;
  mineGuid: string;
  documentTypeDropdownOptions: IOption[];
  isPermitTab: boolean;
  formMode?: EsupFormMode;
  inspectors: IGroupedDropdownList[];
  documents: IExplosivesPermitDocument[];
  dispatch: any;
}

interface StateProps {
  permits: IPermit[];
  mines_permit_guid: string;
  formValues: IExplosivesPermit;
  allPartyRelationships: IPermitPartyRelationship[];
  noticeOfWorkApplications: IimportedNOWApplication[];
  submitting: boolean;
  handleSubmit: any;
}

export const ExplosivesPermitFormNew: FC<ExplosivesPermitFormProps &
  StateProps &
  InjectedFormProps<any>> = ({
  initialValues = {},
  mines_permit_guid = null,
  formMode = EsupFormMode.select_type_modal,
  documents,
  ...props
}) => {
  const [generatedDocs, setGeneratedDocs] = useState([]);
  const [supportingDocs, setSupportingDocs] = useState([]);

  const [isHistoric, setIsHistoric] = useState<boolean>(!initialValues?.explosives_permit_id);
  const [radioSelection, setRadioSelection] = useState<EsupFormMode>(
    props.isPermitTab ? EsupFormMode.create_historic : EsupFormMode.create_new
  );
  const [currentFormMode, setCurrentFormMode] = useState<EsupFormMode>(formMode);
  const [isAmendSelected, setIsAmendSelected] = useState<boolean>(false);

  const isDocumentUploading = useSelector(getIsFormLoading);

  useEffect(() => {
    if (documents) {
      const generatedTypes = Object.keys(ESUP_DOCUMENT_GENERATED_TYPES);
      setGeneratedDocs(
        documents.filter((doc) => generatedTypes.includes(doc.explosives_permit_document_type_code))
      );
      setSupportingDocs(
        documents.filter(
          (doc) => !generatedTypes.includes(doc.explosives_permit_document_type_code)
        )
      );
    }
  }, [documents]);

  useEffect(() => {
    if (currentFormMode === EsupFormMode.select_type_modal) {
      props.dispatch(change(FORM.EXPLOSIVES_PERMIT_NEW, "is_historic", isHistoric));
    }
  }, [isHistoric]);

  useEffect(() => {
    if (currentFormMode === EsupFormMode.select_type_modal) {
      setIsHistoric(radioSelection === EsupFormMode.create_historic);
      setIsAmendSelected(radioSelection === EsupFormMode.amend);
    }
  }, [radioSelection]);

  const partiesData = props.allPartyRelationships;
  const mineManagers = partiesData.filter(
    ({ mine_party_appt_type_code }) => mine_party_appt_type_code === "MMG"
  );
  const permittee = partiesData.filter(
    ({ mine_party_appt_type_code, related_guid }) =>
      mine_party_appt_type_code === "PMT" && related_guid === mines_permit_guid
  );

  const dropdown = (array = []) =>
    array.map((item) => {
      const endDate = formatDate(item.end_date) || "Present";
      return {
        value: item.mine_party_appt_id,
        label: `${item.party.name} (${formatDate(item.start_date)} - ${endDate})`,
      };
    });
  const mineManagersDropdown = dropdown(mineManagers);
  const permitteeDropdown = dropdown(permittee);
  const permitDropdown = createDropDownList(props.permits, "permit_no", "permit_guid");
  const nowDropdown = createDropDownList(
    props.noticeOfWorkApplications,
    "now_number",
    "now_application_guid"
  );

  const handleOpenAddExplosivesPermitModal = (e) => {
    e.preventDefault();
    // selecting amend DOES NOT take you to the amend screen (no record)
    const isAmend = radioSelection === EsupFormMode.amend;
    if (!isAmend) {
      setCurrentFormMode(radioSelection);
    }
    setIsAmendSelected(isAmend);
  };

  // go to the issue modal next unless adding documents or creating historic record
  // controlled in parent, this is just for button text.
  const showIssueModal = ![EsupFormMode.edit_document, EsupFormMode.create_historic].includes(
    currentFormMode
  );
  const disabled = formMode === EsupFormMode.edit_document;
  const showBackButton = formMode === EsupFormMode.select_type_modal;
  const isAmendment = formMode === EsupFormMode.amend || initialValues.isAmendment;

  const cancelButtonText = showBackButton ? "Back" : "Close";
  const cancelButtonFunc = showBackButton
    ? () => setCurrentFormMode(EsupFormMode.select_type_modal)
    : props.closeModal;

  const descriptionListElement = (
    <div>
      <Typography.Paragraph>
        <ul className="landing-list">
          <li>
            <Typography.Text strong>Add an existing permit </Typography.Text>
            <Typography.Text>
              that was previously issued but does not exist in CORE and Minespace. This will help
              you keep track of your past permits and activities.
            </Typography.Text>
          </li>
          <li>
            <Typography.Text strong>Create a new permit </Typography.Text>
            <Typography.Text>
              this is meant for new explosive storage and use permits.
            </Typography.Text>
          </li>
          <li>
            <Typography.Text strong>Amend an existing permit </Typography.Text>
            <Typography.Text>
              that has already been added to CORE and Minespace. This will allow you to make changes
              to your permit conditions, such as the dates, amount of explosives.
            </Typography.Text>
          </li>
        </ul>
      </Typography.Paragraph>
    </div>
  );

  const amendDescriptionListElement = (
    <div>
      To make changes to an existing explosive storage and use permit, follow these steps:
      <br />
      <ul className="landing-list">
        <li>
          Open the permit that you want to amend from the applications page of the mine in CORE.
        </li>
        <li>
          Click on the &quot;Create Amendment&quot; button at the bottom left corner of the permit
          details page.
        </li>
        <li>Fill out the amendment form with the required information and documents.</li>
        <li>Complete the amendment and issue the permit.</li>
      </ul>
    </div>
  );

  const selectPermitTypeForm = (
    <Form layout="vertical">
      <Typography.Title level={2}>Add Permit</Typography.Title>
      <div>
        <Typography.Paragraph>
          Let&apos;s get your permit started, in CORE you can...
        </Typography.Paragraph>
        {descriptionListElement}
      </div>
      <div className="landing-list">
        <br />
        <Typography.Text>Select an action below to get started:</Typography.Text>
        <div className="landing-list">
          <Radio.Group
            className="vertical-radio-group"
            value={radioSelection}
            onChange={(e) => setRadioSelection(e.target.value)}
          >
            <Radio value={EsupFormMode.create_historic}>
              Add an existing explosive storage and use permit
            </Radio>
            <Radio value={EsupFormMode.create_new}>
              Create new explosive storage and use permit
            </Radio>
            <Radio value={EsupFormMode.amend}>
              Amend an existing explosive storage and use permit
            </Radio>
          </Radio.Group>
        </div>
      </div>
      <div style={{ paddingTop: "16px" }}>
        {isAmendSelected && (
          <Alert
            message="Amend an existing permit"
            description={amendDescriptionListElement}
            type="info"
            className="ant-alert-grey bullet"
            showIcon
          />
        )}
      </div>
      <div className="right center-mobile" style={{ paddingTop: "14px" }}>
        <Popconfirm
          placement="topRight"
          title="Are you sure you want to cancel?"
          okText="Yes"
          cancelText="No"
          onConfirm={props.closeModal}
        >
          <Button className="full-mobile" type="ghost">
            Cancel
          </Button>
        </Popconfirm>
        <Button
          disabled={isAmendSelected}
          type="primary"
          onClick={handleOpenAddExplosivesPermitModal}
        >
          Next
        </Button>
      </div>
    </Form>
  );

  const newPermitText = {
    alertTitle: "You are creating a new explosives storage and use permit",
    alertDescription: (
      <ul>
        <li>
          To add information from a <strong>previously created permit</strong>, go to the{" "}
          <u>permits page</u> and add an existing permit
        </li>
        <li>To amend an explosives storage and use permit, open it and create an amendment</li>
      </ul>
    ),
    modalTitle: "Create Explosives Storage and Use Permit",
  };

  const newHistoricPermitText = {
    alertTitle:
      "You are creating a record of a previously issued explosives storage and use permit",
    alertDescription: (
      <ul>
        <li>
          To create a <strong>new permit</strong>, go to the <u>permit applications page</u> and
          create a new permit
        </li>
        <li>To amend an explosives storage and use permit, open it and create an amendment</li>
      </ul>
    ),
    modalTitle: "Create Explosives Storage and Use Permit",
  };

  const amendPermitText = {
    alertTitle: "You are amending an explosives storage and use permit",
    alertDescription: (
      <ul>
        <li>
          A certificate will be generated for this amendment after you confirm your changes in the
          next step.
        </li>
      </ul>
    ),
    modalTitle: "Amend Explosives Storage and Use Permit",
  };

  const editDocumentText = {
    alertTitle: "You are adding documents to an Explosives Storage and Use Permit",
    alertDescription: (
      <ul>
        <li>This action does not create an amendment record for this permit</li>
        <li>
          To <strong>amend</strong> an explosives storage and use permit, open it in Create
          Amendment View
        </li>
      </ul>
    ),
    modalTitle: "Add Documents to Permit",
  };

  const textOptions = {
    [EsupFormMode.amend]: amendPermitText,
    [EsupFormMode.create_new]: newPermitText,
    [EsupFormMode.create_historic]: newHistoricPermitText,
    [EsupFormMode.edit_document]: editDocumentText,
  };

  const dynamicText = textOptions[currentFormMode] ?? textOptions[EsupFormMode.create_new];

  const permitForm = (
    <Form layout="vertical" onSubmit={props.handleSubmit}>
      <Alert
        className="ant-alert-grey bullet"
        message={dynamicText.alertTitle}
        description={dynamicText.alertDescription}
        type="info"
        showIcon
      />

      <br />
      <Typography.Title level={2} className="margin-large--bottom">
        {dynamicText.modalTitle}
      </Typography.Title>
      <Row gutter={48}>
        <Col md={12} sm={24}>
          <Typography.Title level={3} className="purple">
            Explosives Permit Details
          </Typography.Title>
          {isHistoric && (
            <>
              <Row gutter={6}>
                <Col span={12}>
                  <Form.Item>
                    <Field
                      id="issue_date"
                      name="issue_date"
                      label="Issue Date*"
                      component={renderConfig.DATE}
                      validate={[required, dateNotInFuture]}
                      disabled={disabled || isAmendment}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item>
                    <Field
                      id="expiry_date"
                      name="expiry_date"
                      label="Expiry Date*"
                      component={renderConfig.DATE}
                      validate={[required]}
                      disabled={disabled}
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={6}>
                <Col span={24}>
                  <Form.Item>
                    <Field
                      id="issuing_inspector_party_guid"
                      name="issuing_inspector_party_guid"
                      label="Issuing Inspector*"
                      component={renderConfig.GROUPED_SELECT}
                      placeholder="Start typing the Issuing Inspector's name"
                      validate={[required]}
                      data={props.inspectors}
                      disabled={disabled}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </>
          )}
          <Row gutter={6}>
            {isHistoric && (
              <Col span={12}>
                <Form.Item>
                  <Field
                    id="permit_number"
                    name="permit_number"
                    placeholder="Explosives Permit Number"
                    label="Explosives Permit Number*"
                    component={renderConfig.FIELD}
                    validate={[required]}
                    disabled={disabled || isAmendment}
                  />
                </Form.Item>
              </Col>
            )}
            <Col span={isHistoric ? 12 : 24}>
              <Form.Item>
                <Field
                  id="permit_guid"
                  name="permit_guid"
                  placeholder="Select a Permit"
                  label="Mines Act Permit*"
                  component={renderConfig.SELECT}
                  data={permitDropdown}
                  validate={[required]}
                  disabled={disabled || isAmendment}
                />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item>
            <Field
              id="now_application_guid"
              name="now_application_guid"
              placeholder="Select a NoW"
              label="Notice of Work Number"
              component={renderConfig.SELECT}
              data={nowDropdown}
              disabled={disabled}
            />
          </Form.Item>
          <Row gutter={6}>
            <Col span={12}>
              <Form.Item>
                <Field
                  id="mine_manager_mine_party_appt_id"
                  name="mine_manager_mine_party_appt_id"
                  label={isHistoric ? "Mine Manager" : "Mine Manager*"}
                  placeholder="Select Mine Manager"
                  partyLabel="Mine Manager"
                  validate={isHistoric ? [] : [required]}
                  component={renderConfig.SELECT}
                  data={mineManagersDropdown}
                  disabled={disabled}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item>
                <Field
                  id="permittee_mine_party_appt_id"
                  name="permittee_mine_party_appt_id"
                  label="Permittee*"
                  component={renderConfig.SELECT}
                  placeholder="Select Permittee"
                  validate={[required]}
                  data={permitteeDropdown}
                  disabled={disabled || !mines_permit_guid}
                />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item>
            <Field
              id="application_date"
              name="application_date"
              label="Application Date*"
              component={renderConfig.DATE}
              validate={[required, dateNotInFuture]}
              disabled={disabled}
            />
          </Form.Item>
          <Form.Item>
            <Field
              id="description"
              name="description"
              label="Other Information"
              component={renderConfig.AUTO_SIZE_FIELD}
              disabled={disabled}
            />
          </Form.Item>
          <Typography.Title level={3} className="purple">
            Storage Details
          </Typography.Title>
          <Row gutter={6}>
            <Col span={12}>
              <Form.Item>
                <Field
                  id="latitude"
                  name="latitude"
                  label="Latitude*"
                  validate={[number, maxLength(10), lat, required]}
                  component={renderConfig.FIELD}
                  disabled={disabled}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item>
                <Field
                  id="longitude"
                  name="longitude"
                  label="Longitude*"
                  validate={[number, maxLength(12), lon, required, lonNegative]}
                  component={renderConfig.FIELD}
                  disabled={disabled}
                />
              </Form.Item>
            </Col>
          </Row>
          <ExplosivesPermitMap pin={[props.formValues?.latitude, props.formValues?.longitude]} />
          <br />
          <Row>
            <Typography.Title level={3} className="purple">
              Supporting Documents
            </Typography.Title>
            <Col span={24}>
              <Typography.Title level={4} className="dark-grey">
                Permit Documents
              </Typography.Title>
              <Typography.Paragraph>
                These documents were generated when this version of the permit was created. These
                documents will be viewable by Minespace users
              </Typography.Paragraph>
            </Col>
            <Col span={24}>
              <Table dataSource={generatedDocs} pagination={false} columns={generatedDocColumns} />
            </Col>
            {supportingDocs.length > 0 && (
              <>
                <Col span={24}>
                  <br />
                  <Typography.Title level={4} className="dark-grey">
                    Uploaded Documents
                  </Typography.Title>
                  <Typography.Paragraph>
                    Documents uploaded here will be viewable by Minespace users
                  </Typography.Paragraph>
                </Col>
                <Col span={24}>
                  <Table
                    dataSource={supportingDocs}
                    pagination={false}
                    columns={supportingDocColumns}
                  />
                </Col>
              </>
            )}
          </Row>

          <DocumentCategoryForm
            categories={props.documentTypeDropdownOptions}
            mineGuid={props.mineGuid}
            esupGuid={props.formValues?.explosives_permit_guid}
            isProcessed={disabled}
            infoText="Please upload any documents that support this explosives storage and use permit. Documents uploaded here will be viewable by Minespace users."
            isAmendment={isAmendment}
          />
        </Col>
        <Col md={12} sm={24} className="border--left--layout">
          {isHistoric && (
            <>
              <Row gutter={16}>
                <Col span={12}>
                  <Typography.Title level={4} className="purple">
                    Permit Status
                  </Typography.Title>
                  <Typography.Paragraph strong className="margin-none">
                    Permit Status
                  </Typography.Paragraph>
                  <Typography.Paragraph>
                    {initialValues?.is_closed ? "Closed" : "-"}
                  </Typography.Paragraph>
                </Col>
              </Row>
            </>
          )}
          <br />
          <MagazineFormNew isProcessed={disabled} />
        </Col>
      </Row>
      <Row className="flex-between form-button-container-row">
        <Popconfirm
          placement="topRight"
          title={`Are you sure you want to cancel?`}
          okText="Yes"
          cancelText="No"
          onConfirm={cancelButtonFunc}
        >
          <Button className="full-mobile" type="ghost">
            {cancelButtonText}
          </Button>
        </Popconfirm>
        <Button
          type="primary"
          className="full-mobile"
          htmlType="submit"
          style={{ marginLeft: "auto" }}
          loading={props.submitting || isDocumentUploading}
        >
          {showIssueModal ? "Finish And Generate Certificate" : "Submit"}
        </Button>
      </Row>
    </Form>
  );

  return currentFormMode === EsupFormMode.select_type_modal ? selectPermitTypeForm : permitForm;
};

const selector = formValueSelector(FORM.EXPLOSIVES_PERMIT_NEW);
const mapStateToProps = (state) => ({
  permits: getPermits(state),
  mines_permit_guid: selector(state, "permit_guid"),
  formValues: getFormValues(FORM.EXPLOSIVES_PERMIT_NEW)(state),
  allPartyRelationships: getAllPartyRelationships(state),
  noticeOfWorkApplications: getNoticeOfWorkList(state),
});

export default compose(
  connect(mapStateToProps),
  reduxForm({
    form: FORM.EXPLOSIVES_PERMIT_NEW,
    touchOnBlur: true,
    onSubmitSuccess: resetForm(FORM.EXPLOSIVES_PERMIT_NEW),
  })
)(ExplosivesPermitFormNew as any) as FC<ExplosivesPermitFormProps>;
