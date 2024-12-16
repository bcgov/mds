import React, { FC, useState } from "react";
import { connect } from "react-redux";
import { compose, bindActionCreators } from "redux";
import {
  Field,
  change,
  formValueSelector,
  getFormValues,
  InjectedFormProps,
} from "redux-form";
import { Button, Col, Row, Popconfirm, Alert, Typography, Radio } from "antd";
import {
  IOption,
  IGroupedDropdownList,
  IPermit,
  IimportedNOWApplication,
  IPermitPartyRelationship,
  IExplosivesPermit,
} from "@mds/common";
import { getNoticeOfWorkList } from "@mds/common/redux/selectors/noticeOfWorkSelectors";
import {
  required,
  maxLength,
  dateNotInFuture,
  number,
  lat,
  lon,
  requiredRadioButton,
  lonNegative,
} from "@common/utils/Validate";
import { resetForm, createDropDownList, formatDate } from "@common/utils/helpers";
import {
  getPartyRelationships,
  getAllPartyRelationships,
} from "@mds/common/redux/selectors/partiesSelectors";
import { getPermits } from "@mds/common/redux/selectors/permitSelectors";
import { renderConfig } from "@/components/common/config";
import * as FORM from "@/constants/forms";
import DocumentCategoryForm from "@/components/Forms/DocumentCategoryForm";
import MagazineForm from "@/components/Forms/ExplosivesPermit/MagazineForm";

import { Feature } from "@mds/common";
import { useFeatureFlag } from "@mds/common/providers/featureFlags/useFeatureFlag";
import ExplosivesPermitMap from "@mds/common/components/explosivespermits/ExplosivesPermitMap";
import FormWrapper from "@mds/common/components/forms/FormWrapper";

interface StateProps {
  permits: IPermit[];
  documents: any[];
  mines_permit_guid: string;
  formValues: IExplosivesPermit;
  partyRelationships: IPermitPartyRelationship[];
  allPartyRelationships: IPermitPartyRelationship[];
  noticeOfWorkApplications: IimportedNOWApplication[];
  submitting: boolean;
  handleSubmit: any;
}

interface ExplosivesPermitFormProps {
  closeModal: () => void;
  initialValues: any;
  mineGuid: string;
  isProcessed: boolean;
  documentTypeDropdownOptions: IOption[];
  isPermitTab: boolean;
  inspectors: IGroupedDropdownList[];
}

const closedOptions = [
  {
    value: false,
    label: "Open",
  },
  {
    value: true,
    label: "Closed",
  },
];

export const ExplosivesPermitForm: FC<ExplosivesPermitFormProps &
  StateProps &
  InjectedFormProps<any>> = ({
    initialValues = {},
    mines_permit_guid = null,
    isProcessed = false,
    ...props
  }) => {
    const partiesData = props.isPermitTab ? props.allPartyRelationships : props.partyRelationships;
    const mineManagers = partiesData.filter(
      ({ mine_party_appt_type_code }) => mine_party_appt_type_code === "MMG"
    );
    const permittee = partiesData.filter(
      ({ mine_party_appt_type_code, related_guid }) =>
        mine_party_appt_type_code === "PMT" && related_guid === mines_permit_guid
    );

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
    const disabled = isProcessed;

    const [radioSelection, setRadioSelection] = useState<number>(props.isPermitTab ? 1 : 2);
    const [parentView, setParentView] = useState<boolean>(true);
    const [isAmend, setIsAmend] = useState<boolean>(false);
    const { isFeatureEnabled } = useFeatureFlag();

    const handleRadioChange = (e) => {
      setRadioSelection(e.target.value);
      setIsHistoric(e.target.value == 1);
      setIsAmend(e.target.value == 3);
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
            Click on the “Create Amendment” button at the bottom left corner of the permit details
            page.
          </li>
          <li>Fill out the amendment form with the required information and documents.</li>
          <li>Complete the amendment and issue the permit.</li>
        </ul>
      </div>
    );

    //Below ESUP_PERMIT_AMENDMENT feature is unreachable code as it's moved to ExplosivesPermitFormNew component.
    //And new feature flow get dicided in AddExplosivesPermitModal.
    return isFeatureEnabled(Feature.ESUP_PERMIT_AMENDMENT) && parentView ? (
      <FormWrapper
        name={FORM.EXPLOSIVES_PERMIT}
        onSubmit={() => { }}
        reduxFormConfig={{
          touchOnBlur: true,
          onSubmitSuccess: resetForm(FORM.EXPLOSIVES_PERMIT),
        }}
      >
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
            onClick={() => handleOpenAddExplosivesPermitModal()}
          >
            Next
          </Button>
        </div>
      </FormWrapper>
    ) : (
      <FormWrapper
        name={FORM.EXPLOSIVES_PERMIT}
        onSubmit={props.handleSubmit}
        reduxFormConfig={{
          touchOnBlur: true,
          onSubmitSuccess: resetForm(FORM.EXPLOSIVES_PERMIT),
        }}
      >
        {isHistoric && (
          <Alert
            message="Adding a Historic Explosives Storage & Use Permit"
            description="By creating an Explosives Permit on the Permit Tab, the permit will be created with a status of Approved and an Originating System of MMS. If you would like to create an Explosives Permit Application, navigate to the Application Tab."
            type="info"
            showIcon
          />
        )}
        {disabled && (
          <Alert
            message="Editing Disabled"
            description="If details of this permit need to be cleaned up for data quality purposes, contact the MDS administrators at mds@gov.bc.ca"
            type="info"
            showIcon
          />
        )}
        <br />
        <Row gutter={48}>
          <Col md={12} sm={24}>
            <h4>Explosives Permit Details</h4>
            {props.isPermitTab && (
              <>
                <Row gutter={6}>
                  <Col span={12}>
                    <Field
                      id="issue_date"
                      name="issue_date"
                      label="Issue Date"
                      component={renderConfig.DATE}
                      required
                      validate={[required, dateNotInFuture]}
                      disabled={disabled}
                    />
                  </Col>
                  <Col span={12}>
                    <Field
                      id="expiry_date"
                      name="expiry_date"
                      label="Expiry Date"
                      component={renderConfig.DATE}
                      required
                      validate={[required]}
                      disabled={disabled}
                    />
                  </Col>
                </Row>
                <Row gutter={6}>
                  <Col span={24}>
                    <Field
                      id="issuing_inspector_party_guid"
                      name="issuing_inspector_party_guid"
                      label="Issuing Inspector"
                      component={renderConfig.GROUPED_SELECT}
                      placeholder="Start typing the Issuing Inspector's name"
                      required
                      validate={[required]}
                      data={props.inspectors}
                      disabled={disabled}
                    />
                  </Col>
                </Row>
              </>
            )}
            <Row gutter={6}>
              {props.isPermitTab && (
                <Col span={12}>
                  <Field
                    id="permit_number"
                    name="permit_number"
                    placeholder="Explosives Permit Number"
                    label="Explosives Permit Number"
                    component={renderConfig.FIELD}
                    required
                    validate={[required]}
                    disabled={disabled}
                  />
                </Col>
              )}
              <Col span={props.isPermitTab ? 12 : 24}>
                <Field
                  id="permit_guid"
                  name="permit_guid"
                  placeholder="Select a Permit"
                  label="Mines Act Permit"
                  component={renderConfig.SELECT}
                  data={permitDropdown}
                  required
                  validate={[required]}
                  disabled={disabled}
                />
              </Col>
            </Row>
            <Field
              id="now_application_guid"
              name="now_application_guid"
              placeholder="Select a NoW"
              label="Notice of Work Number"
              component={renderConfig.SELECT}
              data={nowDropdown}
              disabled={disabled}
            />
            <Row gutter={6}>
              <Col span={12}>
                <Field
                  id="mine_manager_mine_party_appt_id"
                  name="mine_manager_mine_party_appt_id"
                  label={"Mine Manager"}
                  placeholder="Select Mine Manager"
                  partyLabel="Mine Manager"
                  required={!props.isPermitTab}
                  validate={
                    props.isPermitTab
                      ? []
                      : [required]
                  }
                  component={renderConfig.SELECT}
                  data={mineManagersDropdown}
                  disabled={disabled}
                />
              </Col>
              <Col span={12}>
                <Field
                  id="permittee_mine_party_appt_id"
                  name="permittee_mine_party_appt_id"
                  label="Permittee"
                  component={renderConfig.SELECT}
                  placeholder="Select Permittee"
                  required
                  validate={[required]}
                  data={permitteeDropdown}
                  disabled={disabled || !mines_permit_guid}
                />
              </Col>
            </Row>
            <Field
              id="application_date"
              name="application_date"
              label="Application Date"
              component={renderConfig.DATE}
              required
              validate={[required, dateNotInFuture]}
              disabled={disabled}
            />
            <Field
              id="description"
              name="description"
              label="Other Information"
              component={renderConfig.AUTO_SIZE_FIELD}
              disabled={disabled}
            />
            <h4>Storage Details</h4>
            <Row gutter={6}>
              <Col span={12}>
                <Field
                  id="latitude"
                  name="latitude"
                  label="Latitude"
                  required
                  validate={[number, maxLength(10), lat, required]}
                  component={renderConfig.FIELD}
                  disabled={disabled}
                />
              </Col>
              <Col span={12}>
                <Field
                  id="longitude"
                  name="longitude"
                  label="Longitude"
                  required
                  validate={[number, maxLength(12), lon, required, lonNegative]}
                  component={renderConfig.FIELD}
                  disabled={disabled}
                />
              </Col>
            </Row>
            <ExplosivesPermitMap pin={[props.formValues?.latitude, props.formValues?.longitude]} />
            <br />
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
                    <Field
                      id="is_closed"
                      name="is_closed"
                      label="Permit Status"
                      component={renderConfig.RADIO}
                      customOptions={closedOptions}
                      required
                      validate={[requiredRadioButton]}
                    />
                  </Col>
                  <Col span={12}>
                    <Field
                      id="closed_timestamp"
                      name="closed_timestamp"
                      label="Date Permit was Closed"
                      component={renderConfig.DATE}
                      disabled={disabled}
                    />
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={24}>
                    <Field
                      id="closed_reason"
                      name="closed_reason"
                      label="Reason for Closure"
                      component={renderConfig.AUTO_SIZE_FIELD}
                    />
                  </Col>
                </Row>
              </>
            )}
            <br />
            <MagazineForm isProcessed={disabled} />
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
            <Button className="full-mobile" type="default">
              Cancel
            </Button>
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
      </FormWrapper>
    );
  };

const selector = formValueSelector(FORM.EXPLOSIVES_PERMIT);
const mapStateToProps = (state) => ({
  permits: getPermits(state),
  documents: selector(state, "documents"),
  mines_permit_guid: selector(state, "permit_guid"),
  formValues: getFormValues(FORM.EXPLOSIVES_PERMIT)(state),
  partyRelationships: getPartyRelationships(state),
  allPartyRelationships: getAllPartyRelationships(state),
  noticeOfWorkApplications: getNoticeOfWorkList(state),
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
)((ExplosivesPermitForm) as any) as FC<ExplosivesPermitFormProps>;
