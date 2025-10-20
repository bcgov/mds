import FormWrapper from "@mds/common/components/forms/FormWrapper";
import RenderField from "@mds/common/components/forms/RenderField";
import RenderSubmitButton from "@mds/common/components/forms/RenderSubmitButton";
import { FORM } from "@mds/common/constants/forms";
import { IPermitConditionCategory } from "@mds/common/interfaces";
import { Button, Col, Popconfirm, Row, Tooltip, Typography } from "antd";
import React, { FC, useState } from "react";
import { Field, reset } from "@mds/common/components/forms/form";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowDown, faArrowUp, faCheck, faTrash, faXmark } from "@fortawesome/pro-light-svg-icons";
import PermitConditionCategorySelector from "@mds/common/components/permits/PermitConditionCategorySelector";
import { required } from "@mds/common/redux/utils/Validate";
import { useDispatch } from "react-redux";
import { formatPermitConditionStep } from "@mds/common/utils/helpers";
import { usePermitConditions } from "./PermitConditionsContext";

export interface IPermitConditionCategoryProps {
  canEdit: boolean;
  onChange: (category: IPermitConditionCategory) => void | Promise<void>;
  onDelete: (category: IPermitConditionCategory) => void | Promise<void>;
  moveUp: (category: IPermitConditionCategory) => void | Promise<void>;
  moveDown: (category: IPermitConditionCategory) => void | Promise<void>;
  category: IPermitConditionCategory;
  conditionCount: number;
  currentPosition: number;
  categoryCount: number;
}

export const EditPermitConditionCategoryInline: FC<IPermitConditionCategoryProps> = ({ category, ...props }) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const { condition_category_code } = category;
  const { loading } = usePermitConditions();

  const dispatch = useDispatch();
  const formName = `${FORM.INLINE_EDIT_PERMIT_CONDITION_CATEGORY}}-${condition_category_code}`;
  const enableEditMode = (evt) => {
    evt.stopPropagation();
    evt.preventDefault();
    setIsEditMode(true);
  };

  const handleSubmit = (cat) => {
    props.onChange(cat);
    setIsEditMode(false);
  }

  const handleDelete = (cat) => {
    props.onDelete(cat);
  }

  const cancel = (evt) => {
    evt.stopPropagation();


    dispatch(reset(formName));
    setIsEditMode(false);
  }

  const titleElement = <span style={{ marginBottom: 0 }}>{formatPermitConditionStep(category.step)} {category.description} ({props.conditionCount})</span>;
  if (!props.canEdit) {
    return titleElement;
  }

  if (!isEditMode) {
    return (
      <Tooltip title="Click to edit">
        <div data-title="Click to edit" onClick={enableEditMode} onKeyDown={enableEditMode}>
          {titleElement}
        </div>
      </Tooltip>
    );
  }

  return (
    <FormWrapper scrollOnToggleEdit={false} name={formName} onSubmit={handleSubmit} initialValues={category} isEditMode={isEditMode}>
      <Row style={{ gap: '0.5em' }}>
        <Col flex-shrink="1" style={{ maxWidth: '40px' }}>
          <Field
            name="step"
            component={RenderField}
            required={true}
            validate={[required]}
            style={{ marginRight: 0, }}
            disabled={loading}
          />
        </Col>
        <Col>
          <PermitConditionCategorySelector showLabel={false} />
        </Col>
        <Col flex="auto" style={{ display: 'flex', gap: '0.5em' }}>
          <Button
            disabled={loading}
            className="icon-button-container"
            style={{ marginRight: 0 }}
            onClick={cancel}
            type="primary"
            icon={<FontAwesomeIcon icon={faXmark} />}
          />

          <RenderSubmitButton
            disabled={loading}
            icon={<FontAwesomeIcon icon={faCheck} />}
            buttonProps={{ "aria-label": "Confirm", className: "fa-icon-container", style: { marginRight: 0, marginLeft: 0 } }}
          />

          <Popconfirm
            disabled={props.conditionCount > 0}
            placement="topRight"
            title={
              <>
                <Typography.Paragraph>Are you sure you want to delete {category.description}?</Typography.Paragraph>
                <Typography.Paragraph>This action cannot be undone.</Typography.Paragraph>
              </>
            }
            onConfirm={() => handleDelete(category)}
            okText="Yes, Delete Category"
            cancelText="No"
          >
            <Button
              loading={loading}
              disabled={props.conditionCount > 0}
              danger={true}
              icon={<FontAwesomeIcon icon={faTrash} />}
              aria-label="Delete Category" />
          </Popconfirm>

          <Button
            disabled={props.currentPosition <= 0 || loading}
            onClick={(event) => {
              event.stopPropagation();
              props.moveUp(category);
            }}
            type="default"
            aria-label="Move Category Up"
            icon={<FontAwesomeIcon icon={faArrowUp} />}
          />
          <Button
            style={{ marginLeft: 0 }}
            disabled={props.currentPosition >= props.categoryCount - 1 || loading}
            aria-label="Move Category Down"
            onClick={(event) => {
              event.stopPropagation();
              props.moveDown(category);
            }}
            icon={<FontAwesomeIcon icon={faArrowDown} />}
          />
        </Col>
      </Row>
    </FormWrapper >
  )
};
