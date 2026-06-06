import React, { FC, useEffect, useState } from "react";
import { change, Field } from "@mds/common/components/forms/form";
import { Alert, Button, Col, Modal, Row, Typography } from "antd";
import { useAppDispatch, useAppSelector } from "@mds/common/redux/rootState";
import {
  IMineReportPermitRequirement,
  IPermitCondition,
} from "@mds/common/interfaces";
import { required, requiredRadioButton, maxLength, requiredList, notInList } from "@mds/common/redux/utils/Validate";
import FormWrapper from "@mds/common/components/forms/FormWrapper";
import RenderSelect from "@mds/common/components/forms/RenderSelect";
import RenderDate from "@mds/common/components/forms/RenderDate";
import RenderCancelButton from "@mds/common/components/forms/RenderCancelButton";
import RenderField from "@mds/common/components/forms/RenderField";
import RenderGroupCheckbox, {
  normalizeGroupCheckBox,
} from "@mds/common/components/forms/RenderGroupCheckbox";
import RenderRadioButtons from "@mds/common/components/forms/RenderRadioButtons";
import { FORM } from "@mds/common/constants/forms";
import { MINE_REPORT_SUBMISSION_CODES, REPORT_TYPE_CODES } from "@mds/common/constants/enums";
import { REPORT_FREQUENCY_HASH, REPORT_MINISTRY_RECIPIENT_HASH, REPORT_REGULATORY_AUTHORITY_CODES_HASH } from "@mds/common/constants/strings";
import {
  createMineReportPermitRequirement,
  deleteMineReportPermitRequirement,
  getStandardReportRequirements,
  updateMineReportPermitRequirement,
} from "@mds/common/redux/slices/mineReportPermitRequirementSlice";
import { deleteConfirmWrapper } from "@mds/common/components/common/ActionMenu";
import { usePermitConditions } from "@mds/common/components/permits/PermitConditionsContext";
import { getMineReportPermitRequirementsByAmendment, getNowDraftConditionsFormatted, getPermitConditionCategories, getStandardPermitConditionsFormatted } from "@mds/common/redux/selectors/permitSelectors";
import CoreButton from "../common/CoreButton";
import RenderTreeSelect, { parseTreeValues } from "../forms/RenderTreeSelect";
import RenderSubmitButton from "../forms/RenderSubmitButton";
import { closeModal } from "@mds/common/redux/actions/modalActions";


interface ReportPermitRequirementProps {
  condition?: IPermitCondition;
  isModal?: boolean;
  mineReportPermitRequirement?: IMineReportPermitRequirement;
  canEditPermitConditions: boolean;
  refreshData: (closeForm?: boolean) => Promise<void>;
  conditionId?: number;
  conditionFamilyLoading?: boolean;
}

export const ReportPermitRequirementForm: FC<ReportPermitRequirementProps> = ({
  condition,
  isModal = false,
  mineReportPermitRequirement,
  canEditPermitConditions,
  refreshData,
  conditionId,
  conditionFamilyLoading = false,
}) => {
  const formName = `${FORM.ADD_REPORT_TO_PERMIT_CONDITION}-${condition?.permit_condition_id ?? mineReportPermitRequirement?.mine_report_permit_requirement_id}`;

  const { currentAmendment,
    permitGuid,
    mineGuid,
    isNowEditor,
    isStandardConditionEditor,
    setActiveConditionId,
    clearActiveConditionId,
    setLoading,
    addSubmittingCondition,
    removeSubmittingCondition
  } = usePermitConditions();
  const [selectedRequirement, setSelectedRequirement] = useState(mineReportPermitRequirement);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (
      !selectedRequirement ||
      selectedRequirement.mine_report_permit_requirement_id === mineReportPermitRequirement?.mine_report_permit_requirement_id
    ) {
      setSelectedRequirement(mineReportPermitRequirement);
    }
  }, [mineReportPermitRequirement]);
  const [isEditMode, setIsEditMode] = useState(isModal && canEditPermitConditions);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const standardRequirements = useAppSelector(getStandardReportRequirements);
  const permitRequirements = useAppSelector(getMineReportPermitRequirementsByAmendment(permitGuid, currentAmendment?.permit_amendment_guid, isNowEditor));
  const existingRequirements = isStandardConditionEditor ? standardRequirements : permitRequirements;

  const hasExistingRequirements = existingRequirements?.length > 0;
  const existingRequirementsOptions = existingRequirements.map((r) => { return { label: r.report_name, value: r.mine_report_permit_requirement_id } });
  const disableFields = mineReportPermitRequirement?.mine_report_permit_requirement_id !== selectedRequirement?.mine_report_permit_requirement_id;
  const multipleConditions = selectedRequirement?.permit_condition_ids.length > 1;

  const nowConditions = useAppSelector(getNowDraftConditionsFormatted);
  const permitConditions = useAppSelector(getPermitConditionCategories(permitGuid, currentAmendment?.permit_amendment_guid));
  const standardConditions = useAppSelector(getStandardPermitConditionsFormatted());

  const conditions = isStandardConditionEditor
    ? standardConditions
    : isNowEditor ? nowConditions : permitConditions;

  const { conditionMap, categoriesWithConditions } = conditions;


  const getLinkedConditionList = () => {
    if (!hasExistingRequirements || !selectedRequirement) {
      return [];
    }
    const condition_ids = selectedRequirement.permit_condition_ids

    const linked = condition_ids
      .map((id) => {
        return conditionMap[id];
      })
      .filter(Boolean)
      .sort((a, b) => a.stepPath.localeCompare(b.stepPath));

    return <ul>
      {linked.map((lc) => {
        return <li key={lc.permit_condition_id}>{lc.stepPath}</li>
      })}
    </ul>;
  };

  useEffect(() => {
    if (!canEditPermitConditions) {
      setIsEditMode(false);
      if (!isModal && conditionId) {
        setActiveConditionId(null);
      }
    }
  }, [canEditPermitConditions]);

  const handleDeleteReportRequirement = async ({ mine_report_permit_requirement_id, permit_condition_ids }) => {
    const updateData = async () => {
      await refreshData(false);
      setIsEditMode(false);
      if (conditionId !== undefined) {
        clearActiveConditionId(conditionId);
      }
    };

    const deleteFunction = async () => {
      setIsSubmitting(true);
      setLoading(true);
      permit_condition_ids.forEach((id) => addSubmittingCondition(id));
      await dispatch(deleteMineReportPermitRequirement({ mineGuid, mine_report_permit_requirement_id }));
      await updateData();
      permit_condition_ids.forEach((id) => removeSubmittingCondition(id));
      setLoading(false);
      setIsSubmitting(false);
    };

    if (permit_condition_ids.length > 1) {
      const modalContent = {
        title: "Confirm Deletion",
        content: <>Are you sure you want to delete this Report Requirement? It will also be deleted from the following conditions: {getLinkedConditionList()}</>,
        okText: "Delete",
        onOk: deleteFunction
      };
      Modal.confirm(modalContent);

    } else {
      deleteConfirmWrapper("Report Requirement", deleteFunction);
    }
  };


  const handleEditReportRequirement = async (values) => {
    const conditionIds: number[] = values.permit_condition_ids ?? [];
    setIsSubmitting(true);
    setLoading(true);
    conditionIds.forEach((id) => addSubmittingCondition(id));
    let resp;
    if (values.mine_report_permit_requirement_id) {
      resp = await dispatch(updateMineReportPermitRequirement({ mineGuid, values }));
    } else {
      resp = await dispatch(createMineReportPermitRequirement({ mineGuid, values }));
    }
    if (resp.payload) {
      await refreshData();
      if (conditionId !== undefined) {
        clearActiveConditionId(conditionId);
      }
      // this is for an edge case where an existing report is edited and so it has a form on the page
      // and it was not getting updated so not showing the correct conditions there.
      if (condition && values.mine_report_permit_requirement_id) {
        const mainFormName = `${FORM.ADD_REPORT_TO_PERMIT_CONDITION}-${values.mine_report_permit_requirement_id}`
        dispatch(change(mainFormName, 'permit_condition_ids', resp.payload.permit_condition_ids))
      }
      if (isModal) {
        dispatch(closeModal());
      } else {
        setIsEditMode(false);
      }
    }
    conditionIds.forEach((id) => removeSubmittingCondition(id));
    setLoading(false);
    setIsSubmitting(false);
  };

  const handleSelectReportRequirement = (requirement_id: number) => {
    // revert to empty or initial requirement if select is cleared
    if (!requirement_id) {
      setSelectedRequirement(mineReportPermitRequirement);
      return;
    }
    const requirement = existingRequirements.find((r) => r.mine_report_permit_requirement_id === requirement_id);
    const permit_condition_ids = requirement.permit_condition_ids.includes(condition?.permit_condition_id)
      ? requirement.permit_condition_ids
      : [...requirement.permit_condition_ids, condition.permit_condition_id];
    setSelectedRequirement({ ...requirement, permit_condition_ids });
  };

  const conditionToTree = (condition: IPermitCondition) => {
    const children = condition.sub_conditions.map((c) => conditionToTree(c));
    const value = condition.permit_condition_id;
    const title = condition.stepPath;

    return ({
      value,
      key: condition.permit_condition_id,
      title,
      children,
      checkable: true,
      disabled: condition.mineReportPermitRequirement && condition.mineReportPermitRequirement !== mineReportPermitRequirement
    });
  };

  const conditionTreeData = categoriesWithConditions
    .sort((a, b) => a.display_order - b.display_order)
    .map((cat) => {
      return ({
        value: cat.condition_category_code,
        key: cat.condition_category_code,
        title: <span className="color-primary">{cat.description}</span>,
        children: cat.conditions.map(conditionToTree),
        checkable: false
      })
    });

  const getInitialValues = () => {
    const initialValues = {
      permit_amendment_id: currentAmendment?.permit_amendment_id,
      permit_guid: permitGuid,
      permit_condition_type_code: REPORT_TYPE_CODES.PRR,
      mine_report_status_code: MINE_REPORT_SUBMISSION_CODES.NON,
    };

    if (selectedRequirement) {
      return ({
        ...selectedRequirement,
        cim_or_cpo: selectedRequirement.cim_or_cpo ?? "NONE",
        ...initialValues
      });
    }
    if (condition) {
      return ({
        ...initialValues,
        permit_condition_ids: [condition.permit_condition_id],
      })
    }
    return initialValues;
  };

  const otherReportNames = existingRequirements
    .filter((r) => r.report_name && r.mine_report_permit_requirement_id !== selectedRequirement?.mine_report_permit_requirement_id)
    .map((r) => r.report_name);
  return (
    <div style={{ minHeight: isModal ? "380px" : "" }}>
      <FormWrapper
        name={formName}
        onSubmit={handleEditReportRequirement}
        isModal={isModal}
        isEditMode={isEditMode}
        scrollOnToggleEdit={false}
        reduxFormConfig={{ enableReinitialize: true }}
        initialValues={getInitialValues()}
      >
        <Row gutter={[16, 16]}>
          {hasExistingRequirements && isEditMode && condition &&
            <Col span={24}>
              <Field
                name="mine_report_permit_requirement_id"
                label="Select an Existing Report"
                data={existingRequirementsOptions}
                component={RenderSelect}
                onChange={(value) => handleSelectReportRequirement(value)}
                allowClear={!mineReportPermitRequirement}
              />
              OR
            </Col>}
          {isEditMode && multipleConditions && <Col span={24}>
            <Alert
              message="This report is linked to the following conditions. Editing this report requirement will affect all linked report requirements."
              description={getLinkedConditionList()}
              showIcon
              type="warning"
            />
          </Col>}
          {!isSubmitting && <Col span={24}>
            <Field
              name="permit_condition_ids"
              label="Condition(s)"
              required
              validate={[requiredList]}
              component={RenderTreeSelect}
              treeData={conditionTreeData}
              parse={parseTreeValues}
              multiple
            />
          </Col>}
          <Col span={24}>
            <Field
              name="report_name"
              label="Report Name"
              required
              validate={[required, maxLength(255), notInList(
                otherReportNames,
                "Report Name already exists for this permit. Please select from the Existing Report selector or create a new Report Name.")
              ]}
              component={RenderField}
              disabled={isSubmitting || disableFields}
            />
          </Col>
          <Col span={isStandardConditionEditor ? 24 : 12}>
            <Field
              name="due_date_period_months"
              label="Report Frequency"
              required
              validate={[required]}
              component={RenderSelect}
              data={Object.keys(REPORT_FREQUENCY_HASH).map((key) => {
                return {
                  value: REPORT_FREQUENCY_HASH[key],
                  label: key,
                };
              })}
              disabled={isSubmitting || disableFields}
            />
          </Col>
          {!isStandardConditionEditor &&
            <Col md={12} sm={24}>
              <Field
                name="initial_due_date"
                label="Initial Due Date"
                placeholder="Select date"
                formatViewDate
                component={RenderDate}
                disabled={isSubmitting || disableFields}
              />
            </Col>}
          <Col md={12} sm={24}>
            {!isModal && !isEditMode ? (
              <div>
                <Typography.Paragraph strong className="margin-none">
                  Regulatory Authority
                </Typography.Paragraph>
                <Typography.Paragraph>
                  {mineReportPermitRequirement?.cim_or_cpo
                    ? REPORT_REGULATORY_AUTHORITY_CODES_HASH[mineReportPermitRequirement.cim_or_cpo]
                    : "Not Specified"}
                </Typography.Paragraph>
              </div>
            ) : (
              <Field
                name="cim_or_cpo"
                labelSubtitle="Who is the report for?"
                label="Regulatory Authority"
                required
                customOptions={Object.keys(REPORT_REGULATORY_AUTHORITY_CODES_HASH).map((key) => {
                  return {
                    value: key,
                    label: REPORT_REGULATORY_AUTHORITY_CODES_HASH[key],
                  };
                })}
                isVertical
                validate={[requiredRadioButton]}
                component={RenderRadioButtons}
                disabled={isSubmitting || disableFields}
              />
            )}
          </Col>
          <Col md={12} sm={24}>
            {!isModal && !isEditMode ? (
              <div>
                <Typography.Paragraph strong className="margin-none">
                  Ministry Recipient
                </Typography.Paragraph>
                <Typography.Paragraph>
                  {mineReportPermitRequirement?.ministry_recipient?.map(
                    (dest, index) =>
                      `${REPORT_MINISTRY_RECIPIENT_HASH[dest]}${index < mineReportPermitRequirement.ministry_recipient.length - 1 ? ", " : ""} `
                  ) ?? "None Specified"}
                </Typography.Paragraph>
              </div>
            ) : (
              <Field
                name="ministry_recipient"
                labelSubtitle="What office is the report for?"
                label="Ministry Recipient"
                normalize={normalizeGroupCheckBox}
                component={RenderGroupCheckbox}
                options={Object.keys(REPORT_MINISTRY_RECIPIENT_HASH).map((key) => {
                  return {
                    value: key,
                    label: REPORT_MINISTRY_RECIPIENT_HASH[key],
                  };
                })}
                disabled={isSubmitting || disableFields}
              />
            )}
          </Col>
        </Row>
        <Row justify={isEditMode && mineReportPermitRequirement ? "space-between" : "end"}>
          {isEditMode && mineReportPermitRequirement && (
            <Col>
              <CoreButton
                disabled={isSubmitting}
                type="primary"
                danger
                className="form-btn"
                onClick={() => handleDeleteReportRequirement(mineReportPermitRequirement)}
              >
                Delete Report
              </CoreButton>
            </Col>
          )}
          {isEditMode ? (
            <div>
              <RenderCancelButton
                loading={isSubmitting}
                resetForm
                cancelFunction={!isModal ? () => setIsEditMode(false) : undefined}
              />
              <RenderSubmitButton
                loading={isSubmitting}
                disableOnClean={false}
                buttonText={`${mineReportPermitRequirement ? "Update" : "Add"} Report`}
              />
            </div>
          ) : (canEditPermitConditions &&
            <Button
              loading={isSubmitting}
              type="primary"
              disabled={conditionFamilyLoading}
              onClick={(event) => {
                event.preventDefault();
                setIsEditMode(true);
              }}
            >
              Edit Report
            </Button>
          )}
        </Row>
      </FormWrapper>
    </div >
  );
};

export default ReportPermitRequirementForm;
