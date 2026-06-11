import React, { FC, useState } from "react";
import { Field, getFormValues } from "@mds/common/components/forms/form";
import { Row, Col } from "antd";
import { faCheck, faXmark } from "@fortawesome/pro-regular-svg-icons";
import {
  IFormattedConditionCategory,
  IGroupedDropdownList,
  IPermitCondition,
} from "@mds/common/interfaces";
import { ERROR } from "@mds/common/constants/actionTypes";
import FormWrapper from "@mds/common/components/forms/FormWrapper";
import RenderAutoSizeField from "@mds/common/components/forms/RenderAutoSizeField";
import RenderCancelButton from "@mds/common/components/forms/RenderCancelButton";
import RenderSubmitButton from "@mds/common/components/forms/RenderSubmitButton";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useAppDispatch, useAppSelector } from "@mds/common/redux/rootState";
import { createPermitCondition, createStandardPermitCondition } from "@mds/common/redux/actionCreators/permitActionCreator";
import { FORM } from "@mds/common/constants/forms";
import RenderGroupedSelect from "@mds/common/components/forms/RenderGroupedSelect";
import { usePermitConditions } from "./PermitConditionsContext";
import { required } from "@mds/common/redux/utils/Validate";

interface SubConditionFormProps {
  level?: number;
  conditionCategory?: IFormattedConditionCategory;
  parentCondition?: IPermitCondition;
  handleCancel: () => void;
  onSubmit: () => Promise<void>;
  permitAmendmentGuid?: string;
  categoryOptions?: IGroupedDropdownList[];
}

const SubConditionForm: FC<SubConditionFormProps> = ({
  level = 1,
  parentCondition,
  conditionCategory,
  permitAmendmentGuid,
  categoryOptions,
  handleCancel,
  onSubmit,
}) => {
  const dispatch = useAppDispatch();
  const { setLoading,
    addSubmittingCondition,
    removeSubmittingCondition,
    standardConditionType,
    isStandardConditionEditor
  } = usePermitConditions();
  const formValues = useAppSelector(getFormValues(FORM.EDIT_PERMIT_CONDITION)) as IPermitCondition;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (values) => {
    const parentId = parentCondition?.permit_condition_id;
    setLoading(true);
    setIsSubmitting(true);
    if (parentId) {
      addSubmittingCondition(parentId);
    }
    let resp;
    if (permitAmendmentGuid && !isStandardConditionEditor) {
      resp = await dispatch(createPermitCondition(permitAmendmentGuid, values));
    } else {
      resp = await dispatch(createStandardPermitCondition(standardConditionType, values));
    }

    // @ts-ignore
    if (resp?.type !== ERROR) {
      await onSubmit();
      if (parentId) {
        removeSubmittingCondition(parentId);
      }
    } else if (parentId) {
      removeSubmittingCondition(parentId);
    }
    setLoading(false);
    setIsSubmitting(false);
  };

  const getConditionTypeCode = () => {
    if (!parentCondition) {
      return "SEC";
    }
    if (parentCondition.condition_type_code === "SEC") {
      return "CON";
    }
    return "LIS";
  };

  const getCategoryText = () => {
    if (!categoryOptions?.length) {
      return "";
    }
    const allOptions = categoryOptions.reduce((acc, group) => { return [...acc, ...group.opt] }, []);
    const selectedOption = allOptions.find((o) => o.value === formValues?.condition_category_code);
    return selectedOption?.label;
  };

  const parentText = parentCondition?.stepPath ?? getCategoryText();
  const getPlaceHolderText = (conditionTypeCode: string = "SEC") => {
    return {
      SEC: `Enter Sub-Section title for ${parentText}`,
      CON: `Enter condition text for ${parentText}`,
      LIS: `Enter list item text for ${parentText}`,
    }[conditionTypeCode];
  };

  const emptyCondition = parentCondition
    ? {
      condition_category_code: parentCondition.condition_category_code,
      condition_type_code: getConditionTypeCode(),
      display_order: parentCondition.sub_conditions.length + 1,
      parent_permit_condition_id: parentCondition.permit_condition_id,
      top_level_parent_permit_condition_id: parentCondition.top_level_parent_permit_condition_id
        ? parentCondition.top_level_parent_permit_condition_id
        : parentCondition.parent_permit_condition_id,
    }
    : {
      condition_category_code: conditionCategory.condition_category_code,
      condition_type_code: getConditionTypeCode(),
      display_order: conditionCategory.conditions.length + 1,
    };
  return (
    <FormWrapper
      name={FORM.EDIT_PERMIT_CONDITION}
      isEditMode={true}
      onSubmit={handleSubmit}
      initialValues={emptyCondition}
      scrollOnToggleEdit={false}
    >
      <div
        className={`condition-layer condition-layer--${level} condition-${emptyCondition.condition_type_code} fade-in`}
      >
        {categoryOptions && (
          <Row>
            <Col span={24}>
              <Field
                showOptional={false}
                label="Condition Category:"
                component={RenderGroupedSelect}
                name="condition_category_code"
                data={categoryOptions}
                allowClear={false}
                className="horizontal-form-item"
                disabled={isSubmitting}
              />
            </Col>
          </Row>
        )}
        <Row wrap={false}>
          <Col span={24}>
            <Field
              label={getPlaceHolderText(emptyCondition.condition_type_code)}
              name="condition"
              component={RenderAutoSizeField}
              autoFocus
              disabled={isSubmitting}
              required
              validate={[required]}
            />
          </Col>
        </Row>
        <Row gutter={8} className="condition-edit-buttons">
          <Col>
            <RenderCancelButton
              disabled={isSubmitting}
              cancelFunction={handleCancel}
              buttonProps={{
                type: "primary",
                icon: <FontAwesomeIcon icon={faXmark} />,
              }}
              iconButton
            />
          </Col>
          <Col>
            <RenderSubmitButton
              disabled={isSubmitting}
              buttonProps={{
                icon: <FontAwesomeIcon icon={faCheck} />,
              }}
              iconButton
            />
          </Col>
        </Row>
      </div>
    </FormWrapper>
  );
};

export default React.memo(SubConditionForm);
