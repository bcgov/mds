import FormWrapper from "@mds/common/components/forms/FormWrapper";
import RenderField from "@mds/common/components/forms/RenderField";
import RenderSubmitButton from "@mds/common/components/forms/RenderSubmitButton";
import { FORM } from "@mds/common/constants/forms";
import { IPermitConditionCategory } from "@mds/common/interfaces";
import { Button, Popconfirm, Tooltip, Typography } from "antd";
import React, { useState } from "react";
import { Field } from "redux-form";
import { useDispatch, useSelector } from "react-redux";
import { TRASHCAN } from "@/constants/assets";
import CoreButton from "@mds/common/components/common/CoreButton";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowDown, faArrowUp, faTrash } from "@fortawesome/pro-light-svg-icons";
import PermitConditionCategorySelector from "./PermitConditionCategorySelector";

export interface IPermitConditionCategoryProps {
  onChange: (category: IPermitConditionCategory) => void | Promise<void>;
  onDelete: (category: IPermitConditionCategory) => void | Promise<void>;
  moveUp: (category: IPermitConditionCategory) => void | Promise<void>;
  moveDown: (category: IPermitConditionCategory) => void | Promise<void>;
  category: IPermitConditionCategory;
  conditionCount: number;
  currentPosition: number;
  categoryCount: number;
}

export const PermitConditionCategory = (props: IPermitConditionCategoryProps) => {
  const [isEditMode, setIsEditMode] = useState(false);

  const enableEditMode = () => {
    setIsEditMode(true);
  };

  const handleSubmit = (cat) => {
    props.onChange(cat);
    setIsEditMode(false);
  }

  const handleDelete = (cat) => {
    props.onDelete(cat);
  }

  return (
    <Tooltip title="Click to edit">
      <div onClick={enableEditMode}>
        <FormWrapper name={`${FORM.INLINE_EDIT_PERMIT_CONDITION_CATEGORY}}-${props.category.condition_category_code}`} onSubmit={handleSubmit} initialValues={props.category} isEditMode={isEditMode}>
          <Typography.Paragraph className="flex">
            <Typography.Title level={3} className="margin-none">
              <Field name="step" component={RenderField} required={true} />{!isEditMode ? '.' : ''}&nbsp;
              <PermitConditionCategorySelector />
            </Typography.Title>
            {!isEditMode && <Typography.Text>&nbsp;({props.conditionCount})</Typography.Text>}
            &nbsp;{isEditMode && <RenderSubmitButton buttonText="Confirm" />}

            {isEditMode && (
              <>
                <Popconfirm
                  disabled={props.conditionCount > 0}
                  placement="topRight"
                  title={
                    <>
                      <Typography.Paragraph>Are you sure you want to delete {props.category.description}?</Typography.Paragraph>
                      <Typography.Paragraph>This action cannot be undone.</Typography.Paragraph>
                    </>
                  }
                  onConfirm={() => handleDelete(props.category)}
                  okText="Yes, Delete Category"
                  cancelText="No"
                >
                  <Button disabled={props.conditionCount > 0} danger={true} icon={<FontAwesomeIcon icon={faTrash} />} />
                </Popconfirm>

                <Button
                  disabled={props.currentPosition <= 0}
                  onClick={(event) => {
                    event.stopPropagation();
                    props.moveUp(props.category);
                  }}
                  type="default"
                  icon={<FontAwesomeIcon icon={faArrowUp} />}
                />
                <Button
                  disabled={props.currentPosition >= props.categoryCount - 1}
                  onClick={(event) => {
                    event.stopPropagation();
                    props.moveDown(props.category);
                  }}
                  icon={<FontAwesomeIcon icon={faArrowDown} />}
                />

              </>
            )}
          </Typography.Paragraph>
        </FormWrapper>
      </div>
    </Tooltip >
  )
};
