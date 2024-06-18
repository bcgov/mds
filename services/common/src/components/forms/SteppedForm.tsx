import React, { FC, ReactElement, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getFormSyncErrors, getFormValues, submit } from "redux-form";
import { Button, Col, Menu, Popconfirm, Row, StepProps } from "antd";
import LeftOutlined from "@ant-design/icons/LeftOutlined";
import RightOutlined from "@ant-design/icons/RightOutlined";
import { indexOf } from "lodash";
import { flattenObject, formatUrlToUpperCaseString } from "@mds/common/redux/utils/helpers";
import FormWrapper, { FormWrapperProps } from "./FormWrapper";

interface SteppedFormProps extends Omit<FormWrapperProps, "onSubmit"> {
  children: Array<ReactElement<StepProps>>;
  handleTabChange: (newTab: string) => void | Promise<void>;
  handleSaveDraft?: (formValues) => Promise<void>;
  handleSaveData?: (values, newActiveTab?: string) => Promise<void>;
  handleCancel?: () => void | Promise<void>;
  transformPayload?: (values: any) => any;
  activeTab: string;
  submitText?: string; // "Submit"
  cancelText?: string; // "Cancel"
  cancelConfirmMessage?: string;
  sectionChangeText?: string; // Save & Continue
  nextText?: string; // "Next"
  disableTabsOnError?: boolean;
}

const SteppedForm: FC<SteppedFormProps> = ({
  name,
  initialValues,
  children,
  reduxFormConfig,
  transformPayload,
  handleTabChange,
  handleSaveDraft,
  handleSaveData,
  handleCancel,
  activeTab,
  isEditMode = true,
  submitText = "Submit",
  cancelText = "Cancel",
  cancelConfirmMessage,
  sectionChangeText = "Save & Continue",
  nextText = "Next",
  disableTabsOnError = true,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);
  const tabs = children.map((child) => child.key);
  const dispatch = useDispatch();
  const formValues = useSelector(getFormValues(name));
  const formErrors = useSelector((state) => getFormSyncErrors(name)(state));
  const errors = Object.keys(flattenObject(formErrors));

  useEffect(() => {
    setTabIndex(tabs.indexOf(activeTab));
  }, []);

  useEffect(() => {
    if (tabIndex !== tabs.indexOf(activeTab)) {
      setTabIndex(tabs.indexOf(activeTab));
    }
  }, [activeTab]);

  const handleTabClick = (tab) => {
    if (tabIndex !== tabs.indexOf(tab)) {
      setTabIndex(indexOf(tabs, tab));

      if (handleTabChange) {
        handleTabChange(tab);
      }
    }
  };

  // checks for validation errors before saving draft or save & continues
  const saveCheck = async () => {
    await dispatch(submit(name));
    const valid = !errors.length;
    return valid;
  };

  const getValues = (formValues) => {
    if (transformPayload) {
      return transformPayload(formValues);
    }
    return formValues;
  };

  const handleDraftClick = async (evt, tab) => {
    evt.preventDefault();
    setIsSubmitting(true);

    try {
      if (handleSaveDraft && (await saveCheck())) {
        await handleSaveDraft(getValues(formValues));
      }
      if (errors.length > 0) return;
      setTabIndex(indexOf(tabs, tab));
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFirst = tabIndex === 0;
  const isLast = tabs.length - 1 === tabIndex;

  const handleNextClick = async (evt, tab) => {
    evt.preventDefault();
    setIsSubmitting(true);
    try {
      if (handleSaveData && (await saveCheck())) {
        await handleSaveData(getValues(formValues), tab);
      }
      if (errors.length > 0) return;
      setTabIndex(indexOf(tabs, tab));
    } finally {
      setIsSubmitting(false);
    }
  };

  const items = tabs.map((tab) => {
    const child = children.find((childTab) => childTab.key === tab);
    return {
      label: formatUrlToUpperCaseString(tab),
      key: tab,
      disabled: child?.props?.disabled || (disableTabsOnError && errors.length > 0),
      className: "stepped-menu-item",
      onClick: () => handleTabClick(tabs[indexOf(tabs, tab)]),
    };
  });

  return (
    <Row>
      <Col span={6} className="stepped-form-menu-container">
        <Menu
          className="stepped-form"
          mode="inline"
          selectedKeys={[tabs[tabIndex].toString()]}
          items={items}
        />
      </Col>
      <Col span={18}>
        {children && (
          <div className="stepped-form-form-container">
            <FormWrapper
              name={name}
              onSubmit={() => {}}
              initialValues={initialValues}
              isEditMode={isEditMode}
              reduxFormConfig={
                reduxFormConfig ?? {
                  touchOnBlur: true,
                  touchOnChange: false,
                  enableReinitialize: true,
                }
              }
            >
              {children.find((child) => child.key === tabs[tabIndex])}
            </FormWrapper>
            <Row
              justify={isFirst && tabs.length > 1 ? "end" : "space-between"}
              className="stepped-form-button-row"
            >
              {!isFirst && (
                <Button
                  type="default"
                  onClick={() => handleTabClick(tabs[tabIndex - 1])}
                  disabled={isSubmitting}
                >
                  <LeftOutlined /> Back
                </Button>
              )}
              {handleCancel && (
                <Popconfirm
                  title={cancelConfirmMessage}
                  disabled={!cancelConfirmMessage}
                  onConfirm={handleCancel}
                  okText="Yes"
                  cancelText="No"
                >
                  <Button type="default" disabled={isSubmitting}>
                    {cancelText || "Cancel"}
                  </Button>
                </Popconfirm>
              )}

              {isEditMode && !isLast && (
                <div>
                  {handleSaveDraft && (
                    <Button
                      type="text"
                      className="full-mobile draft-button"
                      onClick={(e) => handleDraftClick(e, tabs[tabIndex + 1])}
                      style={{ marginRight: 16 }}
                    >
                      Save Draft
                    </Button>
                  )}
                  <Button
                    type="primary"
                    htmlType="button"
                    disabled={isSubmitting}
                    onClick={(e) => handleNextClick(e, tabs[tabIndex + 1])}
                  >
                    {sectionChangeText}
                    <RightOutlined />
                  </Button>
                </div>
              )}
              {!isEditMode && !isLast && (
                <Button type="primary" htmlType="button" onClick={() => setTabIndex(tabIndex + 1)}>
                  {nextText}
                </Button>
              )}
              {isEditMode && isLast && (
                <Button
                  type="primary"
                  onClick={(e) => handleNextClick(e, null)}
                  disabled={isSubmitting}
                >
                  {submitText || "Submit"}
                </Button>
              )}
            </Row>
          </div>
        )}
      </Col>
    </Row>
  );
};

export default SteppedForm;
