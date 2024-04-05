import { Button, Col, Form, Menu, Popconfirm, Row } from "antd";
import LeftOutlined from "@ant-design/icons/LeftOutlined";
import RightOutlined from "@ant-design/icons/RightOutlined";
import React, { useEffect, useState } from "react";

import PropTypes from "prop-types";
import { indexOf } from "lodash";
import { formatUrlToUpperCaseString } from "@mds/common/redux/utils/helpers";

const propTypes = {
  children: PropTypes.arrayOf(PropTypes.any).isRequired,
  handleTabChange: PropTypes.func.isRequired,
  handleSaveDraft: PropTypes.func,
  handleSaveData: PropTypes.func,
  handleCancel: PropTypes.func,
  activeTab: PropTypes.string.isRequired,
  errors: PropTypes.arrayOf(PropTypes.string),
  submitText: PropTypes.string,
  cancelText: PropTypes.string,
  cancelConfirmMessage: PropTypes.string,
  sectionChangeText: PropTypes.string,
};

const defaultProps = {
  submitText: undefined,
  cancelText: undefined,
  handleSaveDraft: undefined,
  handleSaveData: undefined,
  handleCancel: undefined,
  cancelConfirmMessage: undefined,
  errors: [],
  sectionChangeText: undefined,
};

const SteppedForm = (props) => {
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
    errors,
    sectionChangeText,
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

      if (handleTabChange) {
        handleTabChange(tab);
      }
    }
  };

  const handleNextClick = async (evt, tab) => {
    evt.preventDefault();

    setIsSubmitting(true);

    try {
      if (handleSaveData) {
        await handleSaveData(null, tab);
      }
      if (errors.length > 0) return;

      setTabIndex(indexOf(tabs, tab));
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFirst = tabIndex === 0;
  const isLast = tabs.length - 1 === tabIndex;

  const items = tabs.map((tab) => {
    const child = children.find((childTab) => childTab.key === tab);
    return {
      label: formatUrlToUpperCaseString(tab),
      key: tab,
      disabled: child?.props?.disabled,
      className: "stepped-menu-item",
      onClick: () => handleTabClick(tabs[indexOf(tabs, tab)]),
    };
  });

  return (
    <Row>
      <Col span={6} className="stepped-form-menu-container">
        <Menu className="stepped-form" mode="inline" selectedKeys={tabs[tabIndex]} items={items} />
      </Col>
      <Col span={18}>
        {children && (
          <div className="stepped-form-form-container">
            <Form layout="vertical">{children.find((child) => child.key === tabs[tabIndex])}</Form>
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
                    type="primary"
                    disabled={isSubmitting}
                    onClick={(e) => handleNextClick(e, tabs[tabIndex + 1])}
                  >
                    {sectionChangeText ?? <>Save &amp; Continue</>}
                    <RightOutlined />
                  </Button>
                </div>
              )}
              {isLast && (
                <Button type="primary" disabled={isSubmitting} onClick={handleSaveData}>
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
