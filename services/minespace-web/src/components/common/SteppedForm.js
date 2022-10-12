import { Button, Col, Menu, Popconfirm, Row } from "antd";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import React, { useEffect, useState } from "react";

import { Form } from "@ant-design/compatible";
import PropTypes from "prop-types";
import { formatUrlToUpperCaseString } from "@common/utils/helpers";
import { indexOf } from "lodash";

const { Item } = Menu;

const propTypes = {
  children: PropTypes.arrayOf(PropTypes.node).isRequired,
  handleTabChange: PropTypes.func.isRequired,
  handleSaveDraft: PropTypes.func,
  handleSaveData: PropTypes.func,
  handleCancel: PropTypes.func,
  activeTab: PropTypes.string.isRequired,
  errors: PropTypes.arrayOf(PropTypes.string),
  submitText: PropTypes.string,
  cancelText: PropTypes.string,
  cancelConfirmMessage: PropTypes.string,
};

const defaultProps = {
  submitText: undefined,
  cancelText: undefined,
  handleSaveDraft: undefined,
  handleSaveData: undefined,
  handleCancel: undefined,
  cancelConfirmMessage: undefined,
  errors: [],
};

const SteppedForm = (props) => {
  // eslint-disable-next-line no-unused-vars
  const {
    children,
    handleTabChange,
    activeTab,
    handleSaveDraft,
    handleSaveData,
    submitText,
    cancelText,
    handleCancel,
    cancelConfirmMessage,
  } = props;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);
  const tabs = children.map((child) => child.key);

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
      handleTabChange(tab);
    }
  };

  const handleNextClick = async (evt, tab) => {
    evt.preventDefault();

    setIsSubmitting(true);

    try {
      await handleSaveData(null, tab);
      setTabIndex(indexOf(tabs, tab));
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFirst = tabIndex === 0;
  const isLast = tabs.length - 1 === tabIndex;

  return (
    <Row>
      <Col span={6} className="stepped-form-menu-container">
        <Menu className="stepped-form" mode="inline" items={tabs} selectedKeys={tabs[tabIndex]}>
          {tabs.map((tab) => {
            const child = children.find((childTab) => childTab.key === tab);

            return (
              <Item
                disabled={child?.props?.disabled}
                className="stepped-menu-item"
                key={tab}
                onClick={() => {
                  handleTabClick(tabs[indexOf(tabs, tab)]);
                }}
              >
                {formatUrlToUpperCaseString(tab)}
              </Item>
            );
          })}
        </Menu>
      </Col>
      <Col span={18}>
        {children && (
          <div className="stepped-form-form-container">
            <Form layout="vertical">{children.find((child) => child.key === tabs[tabIndex])}</Form>
            <Row justify={isFirst && tabs.length > 1 ? "end" : "space-between"}>
              {!isFirst && (
                <Button
                  type="primary"
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
                  <Button type="secondary" disabled={isSubmitting}>
                    {cancelText || "Cancel"}
                  </Button>
                </Popconfirm>
              )}

              {!isLast && (
                <div>
                  {handleSaveDraft && (
                    <Button
                      type="text"
                      className="full-mobile draft-button"
                      onClick={handleSaveDraft}
                      style={{ marginRight: 16 }}
                    >
                      Save Draft
                    </Button>
                  )}
                  <Button
                    type="secondary"
                    disabled={isSubmitting || props.errors?.length > 0}
                    onClick={(e) => handleNextClick(e, tabs[tabIndex + 1])}
                  >
                    Next <RightOutlined />
                  </Button>
                </div>
              )}
              {isLast && (
                <Button
                  type="primary"
                  disabled={isSubmitting || props.errors?.length > 0}
                  onClick={handleSaveData}
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

SteppedForm.propTypes = propTypes;
SteppedForm.defaultProps = defaultProps;

export default SteppedForm;
