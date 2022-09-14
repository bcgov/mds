import React, { useEffect, useState } from "react";
import { Button, Col, Menu, Row } from "antd";
import PropTypes from "prop-types";
import { formatUrlToUpperCaseString } from "@common/utils/helpers";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import { indexOf } from "lodash";
import { Form } from "@ant-design/compatible";

const { Item } = Menu;

const propTypes = {
  children: PropTypes.arrayOf(PropTypes.node).isRequired,
  handleTabChange: PropTypes.func.isRequired,
  handleSaveDraft: PropTypes.func,
  handleSaveData: PropTypes.func,
  activeTab: PropTypes.string.isRequired,
  errors: PropTypes.arrayOf(PropTypes.string).isRequired,
};

const defaultProps = {
  handleSaveDraft: undefined,
  handleSaveData: undefined,
};

const SteppedForm = (props) => {
  // eslint-disable-next-line no-unused-vars
  const { children, handleTabChange, activeTab, handleSaveDraft, handleSaveData } = props;
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
      handleTabChange(tab);
      setTabIndex(indexOf(tabs, tab));
      handleTabChange(tab);
    }
  };

  const isFirst = tabIndex === 0;
  const isLast = tabs.length - 1 === tabIndex;

  return (
    <Row>
      <Col span={6} className="stepped-form-menu-container">
        <Menu className="stepped-form" mode="inline" items={tabs} selectedKeys={tabs[tabIndex]}>
          {tabs.map((tab) => {
            return (
              <Item
                disabled={props.errors.length > 0 && indexOf(tabs, tab) > tabIndex}
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
            <Row justify={isFirst ? "end" : "space-between"}>
              {!isFirst && (
                <Button type="primary" onClick={() => handleTabClick(tabs[tabIndex - 1])}>
                  <LeftOutlined /> Back
                </Button>
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
                    disabled={props.errors.length > 0}
                    onClick={() => handleTabClick(tabs[tabIndex + 1], false)}
                  >
                    Next <RightOutlined />
                  </Button>
                </div>
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