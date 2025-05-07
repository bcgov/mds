import React, { FC, useEffect, useState } from "react";
import { Field } from "@mds/common/components/forms/form";
import { Alert, Button, Col, Modal, Row, Typography } from "antd";
import { useAppDispatch, useAppSelector } from "@mds/common/redux/rootState";
import {
  IMineReport,
  IMineReportPermitRequirement,
  IPermitCondition,
} from "@mds/common/interfaces";
import { required, requiredRadioButton, maxLength } from "@mds/common/redux/utils/Validate";
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
import LinkButton from "@mds/common/components/common/LinkButton";
import {
  deleteMineReportPermitRequirement,
  updateMineReportPermitRequirement,
} from "@mds/common/redux/slices/mineReportPermitRequirementSlice";
import { deleteConfirmWrapper } from "@mds/common/components/common/ActionMenu";
import { usePermitConditions } from "@mds/common/components/permits/PermitConditionsContext";
import { getMineReportPermitRequirementsByAmendment, getPermitConditionCategories } from "@mds/common/redux/selectors/permitSelectors";
import CoreButton from "../common/CoreButton";
import RenderMultiSelect from "../forms/RenderMultiSelect";


interface ReportPermitRequirementProps {
  onSubmit?: (values: Partial<IMineReport>) => void | Promise<void>;
  condition: IPermitCondition;
  isModal?: boolean;
  mineReportPermitRequirement?: IMineReportPermitRequirement;
  canEditPermitConditions: boolean;
  refreshData: () => Promise<void>;
}

export const ReportPermitRequirementForm: FC<ReportPermitRequirementProps> = ({
  onSubmit,
  condition,
  isModal = false,
  mineReportPermitRequirement,
  canEditPermitConditions,
  refreshData,
}) => {
  const { loading, currentAmendment, permitGuid, mineGuid } = usePermitConditions();
  const [selectedRequirement, setSelectedRequirement] = useState(mineReportPermitRequirement);
  const dispatch = useAppDispatch();
  const [isEditMode, setIsEditMode] = useState(isModal && canEditPermitConditions);
  const existingRequirements = useAppSelector(getMineReportPermitRequirementsByAmendment(permitGuid, currentAmendment.permit_amendment_guid));
  const hasExistingRequirements = existingRequirements?.length > 0;
  const existingRequirementsOptions = existingRequirements.map((r) => { return { label: r.report_name, value: r.mine_report_permit_requirement_id } });
  const disableFields = mineReportPermitRequirement?.mine_report_permit_requirement_id !== selectedRequirement?.mine_report_permit_requirement_id;
  const multipleConditions = selectedRequirement?.permit_condition_ids.length > 1;
  const { conditionMap } = useAppSelector(getPermitConditionCategories(permitGuid, currentAmendment.permit_amendment_guid));

  const getLinkedConditionList = (includeSelf = false) => {
    if (!hasExistingRequirements || !selectedRequirement) {
      return [];
    }
    const condition_ids = includeSelf
      ? selectedRequirement.permit_condition_ids
      : selectedRequirement.permit_condition_ids.filter((id) => id !== condition.permit_condition_id);

    const linked = condition_ids
      .map((id) => {
        return conditionMap[id];
      }).sort((a, b) => a.stepPath.localeCompare(b.stepPath));

    return <ul>
      {linked.map((lc) => {
        return <li key={lc.permit_condition_id}>{lc.stepPath}</li>
      })}
    </ul>;
  };

  useEffect(() => {
    if (!canEditPermitConditions) {
      setIsEditMode(false);
    }
  }, [canEditPermitConditions]);

  const handleDeleteReportRequirement = async ({ mine_report_permit_requirement_id, permit_condition_ids }, deleteAll = false) => {
    const updateData = async () => {
      await refreshData();
      setIsEditMode(false);
    };

    const new_permit_ids = permit_condition_ids.filter((id) => id !== condition.permit_condition_id);
    const values = {
      ...selectedRequirement,
      permit_condition_ids: new_permit_ids
    }

    const deleteFunction = deleteAll || permit_condition_ids.length == 1
      ? async () => dispatch(deleteMineReportPermitRequirement({ mineGuid, mine_report_permit_requirement_id }))
      : async () => dispatch(updateMineReportPermitRequirement({ mineGuid, values }));

    if (deleteAll && permit_condition_ids.length > 1) {

      const modalContent = {
        title: "Confirm Deletion",
        content: <>Are you sure you want to delete this Report Requirement? It will also be deleted from the following conditions: {getLinkedConditionList(true)}</>,
        okText: "Delete",
        onOk: deleteFunction
      };
      Modal.confirm(modalContent);

    } else {
      deleteConfirmWrapper("Report Requirement", async () => {
        await deleteFunction().then(async () => {
          updateData();
        });
      });
    }
  };

  const handleEditReportRequirement = async (values) => {
    await dispatch(updateMineReportPermitRequirement({ mineGuid, values })).then(async () => {
      await refreshData();
      setIsEditMode(false);
    });
  };

  const handleSelectReportRequirement = (requirement_id: number) => {
    // revert to empty or initial requirement if select is cleared
    if (!requirement_id) {
      setSelectedRequirement(mineReportPermitRequirement);
      return;
    }
    const requirement = existingRequirements.find((r) => r.mine_report_permit_requirement_id === requirement_id);
    const permit_condition_ids = [...requirement.permit_condition_ids, condition.permit_condition_id];
    setSelectedRequirement({ ...requirement, permit_condition_ids });
  };

  return (
    <div style={{ minHeight: isModal ? "380px" : "" }}>
      <FormWrapper
        name={`${FORM.ADD_REPORT_TO_PERMIT_CONDITION}-${condition.permit_condition_id}`}
        onSubmit={!isModal ? handleEditReportRequirement : onSubmit}
        isModal={isModal}
        isEditMode={isEditMode}
        scrollOnToggleEdit={false}
        reduxFormConfig={{ enableReinitialize: true }}
        initialValues={
          selectedRequirement
            ? {
              ...selectedRequirement,
              stepPath: condition.stepPath,
              permit_amendment_id: currentAmendment?.permit_amendment_id,
            }
            : {
              mine_report_status_code: MINE_REPORT_SUBMISSION_CODES.NON,
              stepPath: condition.stepPath,
              permit_condition_category_code: condition.condition_category_code,
              permit_condition_type_code: REPORT_TYPE_CODES.PRR,
              permit_condition_ids: [condition.permit_condition_id],
              permit_guid: permitGuid,
              permit_amendment_id: currentAmendment?.permit_amendment_id,
            }
        }
      >
        <Row gutter={[16, 16]}>
          {hasExistingRequirements && isEditMode &&
            <>
              <Col span={24}>
                <Field
                  name="mine_report_permit_requirement_id"
                  label="Select an existing report requirement"
                  data={existingRequirementsOptions}
                  component={RenderSelect}
                  onChange={(value) => handleSelectReportRequirement(value)}
                  allowClear={!mineReportPermitRequirement}
                />
              </Col>
              {multipleConditions && <Col span={24}>
                <Alert
                  message="This report is linked to the following conditions. Editing this report requirement will affect all linked report requirements."
                  description={getLinkedConditionList()}
                  showIcon
                  type="warning"
                />
              </Col>}
            </>}
          <Col span={24}>
            <Field
              name="stepPath"
              label="Condition"
              required
              validate={required}
              component={RenderField}
              disabled
            />
          </Col>
          {/* <Field
            name="permit_condition_ids"
            label="Other linked conditions"
            component={RenderMultiSelect}
            data={Object.values(conditionMap).map((cond) => ({ label: cond.stepPath, value: cond.permit_condition_id }))}
          /> */}
          <Col span={24}>
            <Field
              name="report_name"
              label="Report Type"
              required
              validate={[required, maxLength(255)]}
              component={RenderField}
              disabled={loading || disableFields}
            />
          </Col>
          <Col span={12}>
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
              disabled={loading || disableFields}
            />
          </Col>
          <Col md={12} sm={24}>
            <Field
              name="initial_due_date"
              label="Initial Due Date"
              placeholder="Select date"
              formatViewDate
              component={RenderDate}
              disabled={loading || disableFields}
            />
          </Col>
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
                disabled={loading || disableFields}
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
                disabled={loading || disableFields}
              />
            )}
          </Col>
        </Row>
        <Row justify={isEditMode && mineReportPermitRequirement ? "space-between" : "end"}>
          {isEditMode && mineReportPermitRequirement && (
            <Col>
              <CoreButton
                disabled={loading}
                type="primary"
                danger
                className="form-btn"
                onClick={() => handleDeleteReportRequirement(mineReportPermitRequirement, true)}
              >
                Delete Report
              </CoreButton>
              {multipleConditions && <LinkButton
                disabled={loading}
                className="form-btn report-delete-button"
                onClick={() => handleDeleteReportRequirement(mineReportPermitRequirement, false)}
              >
                Delete Report from this condition
              </LinkButton>}
            </Col>
          )}
          {isEditMode ? (
            <div>
              <RenderCancelButton
                loading={loading}
                cancelFunction={!isModal ? () => setIsEditMode(false) : undefined}
              />
              <Button type="primary" htmlType="submit" loading={loading}>
                {mineReportPermitRequirement ? "Update" : "Add"} Report
              </Button>
            </div>
          ) : (canEditPermitConditions &&
            <Button
              loading={loading}
              type="primary"
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
