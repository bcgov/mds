import FormWrapper from "@mds/common/components/forms/FormWrapper";
import RenderField from "@mds/common/components/forms/RenderField";
import RenderSubmitButton from "@mds/common/components/forms/RenderSubmitButton";
import { FORM } from "@mds/common/constants/forms";
import { IPermitConditionCategory } from "@mds/common/interfaces";
import { Button, Col, Popconfirm, Row, Tooltip, Typography } from "antd";
import React, { useState } from "react";
import { Field, reset } from "redux-form";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowDown, faArrowUp, faCheck, faTrash, faXmark } from "@fortawesome/pro-light-svg-icons";
import PermitConditionCategorySelector from "./PermitConditionCategorySelector";
import { required } from "@mds/common/redux/utils/Validate";
import { useDispatch } from "react-redux";
import { formatPermitConditionStep } from "@mds/common/utils/helpers";

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

export const EditPermitConditionCategoryInline = (props: IPermitConditionCategoryProps) => {
  const [isEditMode, setIsEditMode] = useState(false);

  const dispatch = useDispatch();
  const formName = `${FORM.INLINE_EDIT_PERMIT_CONDITION_CATEGORY}}-${props.category.condition_category_code}`;
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

  const titleElement = <Typography.Title style={{ marginBottom: 0 }} level={3}>{formatPermitConditionStep(props.category.step)} {props.category.description} ({props.conditionCount})</Typography.Title>;
  if (!props.canEdit) {
    return titleElement;
  }

  if (!isEditMode) {
    return (
      <Tooltip title="Click to edit">
        <div onClick={enableEditMode} onKeyDown={enableEditMode}>
          {titleElement}
        </div>
      </Tooltip>
    );
  }

  return (
    <FormWrapper scrollOnToggleEdit={false} name={formName} onSubmit={handleSubmit} initialValues={props.category} isEditMode={isEditMode}>
      <Row style={{ gap: '0.5em' }}>
        <Col flex-shrink="1" style={{ maxWidth: '40px' }}>
          <Field name="step" component={RenderField} required={true} validate={[required]} style={{ marginRight: 0, }} />
        </Col>
        <Col>
          <PermitConditionCategorySelector showLabel={false} />
        </Col>
        <Col flex="auto" style={{ display: 'flex', gap: '0.5em' }}>
          <Button
            className="icon-button-container"
            style={{ marginRight: 0 }}
            onClick={cancel}
            type="primary"
            icon={<FontAwesomeIcon icon={faXmark} />}
          />

          <RenderSubmitButton buttonText="" buttonProps={{ "aria-label": "Confirm", className: "icon-button-container", style: { marginRight: 0, marginLeft: 0 }, icon: <FontAwesomeIcon icon={faCheck} /> }} />

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
            <Button
              disabled={props.conditionCount > 0}
              danger={true}
              icon={<FontAwesomeIcon icon={faTrash} />}
              aria-label="Delete Category" />
          </Popconfirm>

          <Button
            disabled={props.currentPosition <= 0}
            onClick={(event) => {
              event.stopPropagation();
              props.moveUp(props.category);
            }}
            type="default"
            aria-label="Move Category Up"
            icon={<FontAwesomeIcon icon={faArrowUp} />}
          />
          <Button
            style={{ marginLeft: 0 }}
            disabled={props.currentPosition >= props.categoryCount - 1}
            aria-label="Move Category Down"
            onClick={(event) => {
              event.stopPropagation();
              props.moveDown(props.category);
            }}
            icon={<FontAwesomeIcon icon={faArrowDown} />}
          />
        </Col>
      </Row>
    </FormWrapper >
  )
};
