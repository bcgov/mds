import React, { FC, useEffect, useState } from "react";
import { connect } from "react-redux";
import { bindActionCreators, compose } from "redux";
import {
  change,
  Field,
  formValueSelector,
  getFormValues,
  InjectedFormProps,
  reduxForm,
} from "redux-form";
import { Form } from "@ant-design/compatible";
import "@ant-design/compatible/assets/index.css";
import { Alert, Button, Col, Popconfirm, Row, Table, Typography, Radio } from "antd";
import { getUserAccessData } from "@common/selectors/authenticationSelectors";
import {
  USER_ROLES,
  IPermit,
  IExplosivesPermit,
  IPermitPartyRelationship,
  IimportedNOWApplication,
  IOption,
  IGroupedDropdownList,
} from "@mds/common";
import { getNoticeOfWorkList } from "@common/selectors/noticeOfWorkSelectors";
import {
  dateNotInFuture,
  lat,
  lon,
  lonNegative,
  maxLength,
  number,
  required,
  validateSelectOptions,
} from "@common/utils/Validate";
import { createDropDownList, formatDate, resetForm } from "@common/utils/helpers";
import {
  getAllPartyRelationships,
  getPartyRelationships,
} from "@common/selectors/partiesSelectors";
import { getPermits } from "@common/selectors/permitSelectors";
import { renderConfig } from "@/components/common/config";
import * as FORM from "@/constants/forms";
import ExplosivesPermitMap from "@/components/maps/ExplosivesPermitMap";
import DocumentCategoryForm from "@/components/Forms/DocumentCategoryForm";
import * as Permission from "@/constants/permissions";
import MagazineFormNew from "@/components/Forms/ExplosivesPermit/MagazineFormNew";
import {
  generatedDocColumns,
  supportingDocColumns,
} from "@/components/modalContent/ExplosivesPermitViewModal";

const defaultProps = {
  initialValues: {},
  mines_permit_guid: null,
};

const validateBusinessRules = (values) => {
  const errors: any = {};
  if (!values.mine_manager_mine_party_appt_id) {
    errors.mine_manager_mine_party_appt_id = "The Site must have a Mine Manager on record.";
  }
  if (!values.permittee_mine_party_appt_id) {
    errors.permittee_mine_party_appt_id = "The Permit must have a Permittee on record.";
  }
  return errors;
};

interface ExplosivesPermitFormNewProps {
  handleSubmit?: any;
  closeModal?: any;
  initialValues: any;
  mineGuid: string;
  isProcessed?: boolean;
  documentTypeDropdownOptions: IOption[];
  isPermitTab: boolean;
  inspectors: IGroupedDropdownList[];
  submitting?: boolean;
  noticeOfWorkApplications?: any;
  permits?: any;
  formValues?: any;
  partyRelationships?: any;
  allPartyRelationships?: any;
  mines_permit_guid?: string;
  userRoles?: any;
}

export const ExplosivesPermitFormNew: FC<ExplosivesPermitFormNewProps> = (props) => {
  const { initialValues } = props;

  const [generatedDocs, setGeneratedDocs] = useState([]);
  const [supportingDocs, setSupportingDocs] = useState([]);

  const partiesData = props.isPermitTab ? props.allPartyRelationships : props.partyRelationships;
  const mineManagers = partiesData.filter(
    ({ mine_party_appt_type_code }) => mine_party_appt_type_code === "MMG"
  );
  const permittee = partiesData.filter(
    ({ mine_party_appt_type_code, related_guid }) =>
      mine_party_appt_type_code === "PMT" && related_guid === props.mines_permit_guid
  );

  useEffect(() => {
    if (initialValues.documents) {
      const generatedTypes = ["LET", "PER"];
      setGeneratedDocs(
        initialValues.documents.filter((doc) =>
          generatedTypes.includes(doc.explosives_permit_document_type_code)
        )
      );
      setSupportingDocs(
        initialValues.documents.filter(
          (doc) => !generatedTypes.includes(doc.explosives_permit_document_type_code)
        )
      );
    }
  }, [initialValues]);

  const dropdown = (array) =>
    array.length > 0
      ? array.map((item) => {
          const endDate = formatDate(item.end_date) || "Present";
          return {
            value: item.mine_party_appt_id,
            label: `${item.party.name} (${formatDate(item.start_date)} - ${endDate})`,
          };
        })
      : [];
  const mineManagersDropdown = dropdown(mineManagers);
  const permitteeDropdown = dropdown(permittee);
  const permitDropdown = createDropDownList(props.permits, "permit_no", "permit_guid");
  const nowDropdown = createDropDownList(
    props.noticeOfWorkApplications,
    "now_number",
    "now_application_guid"
  );

  const [isHistoric, setIsHistoric] = useState<boolean>(
    !initialValues?.explosives_permit_id && props.isPermitTab
  );
  const isESUP = props.userRoles.includes(USER_ROLES[Permission.EDIT_EXPLOSIVES_PERMITS]);

  const disabled = props.isProcessed; // props.isProcessed && !hasEditPermission;

  const [radioSelection, setRadioSelection] = useState<number>(props.isPermitTab ? 1 : 2);
  const [parentView, setParentView] = useState<boolean>(true);
  const [isAmend, setIsAmend] = useState<boolean>(false);

  const handleRadioChange = (e) => {
    setRadioSelection(e.target.value);
    setIsHistoric(e.target.value === 1);
    setIsAmend(e.target.value === 3);
  };

  const handleOpenAddExplosivesPermitModal = () => {
    setParentView(false);
  };

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
          Click on the &quot;Amend Permit&quot; button at the top right corner of the permit details
          page.
        </li>
        <li>Fill out the amendment form with the required information and documents.</li>
        <li>Complete the amendment and issue the permit.</li>
      </ul>
    </div>
  );

  return parentView ? (
    <>
      <Form layout="vertical">
        <Typography.Title level={3}>Add Permit</Typography.Title>
        <div>
          <Typography.Paragraph>
            Let&apos;s get your permit started, in CORE you can...
          </Typography.Paragraph>
          {descriptionListElement}
        </div>
        <div className="landing-list">
          <h4 className="uppercase">
            DEFAULT TO &quot;ADD EXISTING&quot; FROM PERMIT PAGE / &quot;CREATE NEW&quot; FROM
            APPLICATION PAGE
          </h4>
          <br />
          <Typography.Text>Select an action below to get started:</Typography.Text>
          <div className="landing-list">
            <Radio.Group
              className="vertical-radio-group"
              value={radioSelection}
              onChange={handleRadioChange}
            >
              <Radio value={1}>Add an existing explosive storage and use permit</Radio>
              <Radio value={2}>Create new explosive storage and use permit</Radio>
              <Radio value={3}>Amend an existing explosive storage and use permit</Radio>
            </Radio.Group>
          </div>
        </div>
        <div style={{ paddingTop: "16px" }}>
          {isAmend && (
            <Alert
              message="Amend an existing permit"
              description={amendDescriptionListElement}
              type="info"
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
            <Button className="full-mobile">Cancel</Button>
          </Popconfirm>
          <Button
            disabled={isAmend}
            type="primary"
            onClick={(e) => handleOpenAddExplosivesPermitModal()}
          >
            Next
          </Button>
        </div>
      </Form>
    </>
  ) : (
    <>
      <Form layout="vertical" onSubmit={props.handleSubmit}>
        <Alert
          className="esup-alert"
          message="You are creating a new explosives storage and use permit"
          description={
            <ul>
              <li>
                To add information from a <strong>previously created permit</strong>, go to the
                permits page and add an existing permit
              </li>
              <li>
                To amend an explosives storage and use permit, open it and create an ammendment
              </li>
            </ul>
          }
          type="info"
          showIcon
        />

        <br />
        <Typography.Title level={2} className="margin-large--bottom">
          Create Explosives Storage and Use Permit
        </Typography.Title>
        <Row gutter={48}>
          <Col md={12} sm={24}>
            <Typography.Title level={4} className="purple">
              Explosives Permit Details
            </Typography.Title>
            {props.isPermitTab && (
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
                        disabled={disabled}
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
              {props.isPermitTab && (
                <Col span={12}>
                  <Form.Item>
                    <Field
                      id="permit_number"
                      name="permit_number"
                      placeholder="Explosives Permit Number"
                      label="Explosives Permit Number*"
                      component={renderConfig.FIELD}
                      validate={[required]}
                      disabled={disabled}
                    />
                  </Form.Item>
                </Col>
              )}
              <Col span={props.isPermitTab ? 12 : 24}>
                <Form.Item>
                  <Field
                    id="permit_guid"
                    name="permit_guid"
                    placeholder="Select a Permit"
                    label="Mines Act Permit*"
                    component={renderConfig.SELECT}
                    data={permitDropdown}
                    validate={[required]}
                    disabled={disabled}
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
                    label={props.isPermitTab ? "Mine Manager" : "Mine Manager*"}
                    placeholder="Select Mine Manager"
                    partyLabel="Mine Manager"
                    validate={props.isPermitTab ? [] : [required]}
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
                    disabled={disabled || !props.mines_permit_guid}
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
            <Typography.Title level={4} className="purple">
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
              <Typography.Title level={4} className="purple">
                Supporting Documents
              </Typography.Title>
              <Col span={24}>
                <Typography.Paragraph strong>Permit Documents</Typography.Paragraph>
                <Typography.Paragraph>
                  These documents were generated when this version of the permit was created. These
                  documents will be viewable by Minespace users
                </Typography.Paragraph>
              </Col>
              <Col span={24}>
                <Table
                  dataSource={generatedDocs}
                  pagination={false}
                  columns={generatedDocColumns}
                />
              </Col>
              {supportingDocs.length > 0 && (
                <div>
                  <Col span={24}>
                    <Typography.Paragraph strong>Uploaded Documents</Typography.Paragraph>
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
                </div>
              )}
            </Row>

            <DocumentCategoryForm
              categories={props.documentTypeDropdownOptions}
              mineGuid={props.mineGuid}
              isProcessed={disabled}
              infoText="Please upload any documents that support this explosives storage and use permit. Documents uploaded here will be viewable by Minespace users."
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
                      {props.initialValues?.is_closed ? "Closed" : "-"}
                    </Typography.Paragraph>
                  </Col>
                </Row>
              </>
            )}
            <br />
            <MagazineFormNew isProcessed={disabled} />
          </Col>
        </Row>
        <div className="right center-mobile" style={{ paddingTop: "14px" }}>
          <Popconfirm
            placement="topRight"
            title="Are you sure you want to cancel?"
            onConfirm={props.closeModal}
            okText="Yes"
            cancelText="No"
          >
            <Button className="full-mobile">Cancel</Button>
          </Popconfirm>
          <Button
            type="primary"
            className="full-mobile"
            htmlType="submit"
            loading={props.submitting}
          >
            Submit
          </Button>
        </div>
      </Form>
    </>
  );
};

ExplosivesPermitFormNew.defaultProps = defaultProps;

const selector = formValueSelector(FORM.EXPLOSIVES_PERMIT);
const mapStateToProps = (state) => ({
  permits: getPermits(state),
  documents: selector(state, "documents"),
  mines_permit_guid: selector(state, "permit_guid"),
  formValues: getFormValues(FORM.EXPLOSIVES_PERMIT)(state),
  partyRelationships: getPartyRelationships(state),
  allPartyRelationships: getAllPartyRelationships(state),
  noticeOfWorkApplications: getNoticeOfWorkList(state),
  userRoles: getUserAccessData(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      change,
    },
    dispatch
  );

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  reduxForm({
    form: FORM.EXPLOSIVES_PERMIT_NEW,
    touchOnBlur: true,
    validate: validateBusinessRules,
    onSubmitSuccess: resetForm(FORM.EXPLOSIVES_PERMIT_NEW),
  })
)(ExplosivesPermitFormNew as any) as FC<ExplosivesPermitFormNewProps>;
