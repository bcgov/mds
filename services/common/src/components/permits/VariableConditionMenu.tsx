import React, { FC, useState } from "react";
import { useSelector } from "react-redux"
import { Col, Menu, Row, Space, Tooltip } from "antd";
import { change, getFormValues } from "@mds/common/components/forms/form";
import { getNOWReclamationSummary } from "@mds/common/redux/selectors/noticeOfWorkSelectors";
import { getDropdownNoticeOfWorkActivityTypeOptions } from "@mds/common/redux/selectors/staticContentSelectors";
import { isEmpty } from "lodash";
import { IConditionSection, INoWGeneratedPermit } from "@mds/common/interfaces";
import { useAppDispatch } from "@mds/common/redux/rootState";
import { FORM } from "@mds/common/constants/forms";
import { DownOutlined, QuestionCircleOutlined } from "@ant-design/icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/pro-regular-svg-icons";

interface VariableConditionMenuProps {
  isManagementView?: boolean,
  conditionForm: string
};

const VariableConditionMenu: FC<VariableConditionMenuProps> = ({
  isManagementView = false,
  conditionForm
}) => {
  const dispatch = useAppDispatch();
  const conditionFormValues = useSelector(getFormValues(conditionForm)) as IConditionSection;
  const generatePermitFormValues = useSelector(getFormValues(FORM.GENERATE_PERMIT)) as INoWGeneratedPermit;
  const reclamationSummary = useSelector(getNOWReclamationSummary);
  const activityTypeOptions = useSelector(getDropdownNoticeOfWorkActivityTypeOptions);
  const [show, setShow] = useState(false);
 
  const mouseHover = () => setShow(prev => !prev)

  const handleClick = (value) => {
    if (!isEmpty(conditionFormValues)) {
      const newValues = `${conditionFormValues.condition ?? ""} ${value.key}`;
      dispatch(change(conditionForm, "condition", newValues));
    } else {
      const preambleText = generatePermitFormValues.preamble_text
        ? generatePermitFormValues.preamble_text
        : "";

      const newPreambleText = `${preambleText} ${value.key}`;
      dispatch(change(FORM.GENERATE_PERMIT, "preamble_text", newPreambleText));
    }
  }

    const filteredActivityTypes = activityTypeOptions.filter(
      ({ value }) =>
        // filter out activities that do not have reclamation data
        value !== "placer" && value !== "water_supply" && value !== "blasting_operation"
    );
    // The standard permit condition management can see all reclamation options, draft permit tab can only use reclamation activities related to the NoW.
    const reclamationMenuOptions = isManagementView
      ? filteredActivityTypes
      : reclamationSummary;
    return (
      <div className="condition-menu-container"
        onMouseEnter={mouseHover}
        onMouseLeave={mouseHover}
      >
        <Col>
          <div className="fa-icon-container ant-primary" style={{color: "white"}}>
            <span style={{ fontWeight: 600 }}>Condition Data Variables </span>
            <DownOutlined />
            <Tooltip title={"Hover your mouse over the menus until you find the variable data you'd like to enter. Put it into your edited Permit Condition by clicking on it. This will populate the edited condition with a variable in the Draft permit screen. The Data from the Application tab will show up correctly in the PDF Draft permit in place of the variable. Please ensure all variable data fields you select have the correct information in the Application tab before adding these fields to your draft permit."}
            placement="right" mouseEnterDelay={0.3} overlayClassName="core-tooltip" getPopupContainer={triggerNode => triggerNode.parentNode as HTMLElement}>
                <QuestionCircleOutlined className="icon-sm" style={{ marginLeft: 8 }} />
              </Tooltip>
          </div>
        </Col>
   
        <div className={`variable-menu-animated${show ? " show" : ""}`}>
          <Menu
            onClick={(values) => handleClick(values)}
            className="variable-menu"
            mode="vertical"
          >
            <Menu.SubMenu key="mine" title="Mine">
              <Menu.Item key="{mine_name}" className="variable-item">
                Mine Name
              </Menu.Item>
              <Menu.Item key="{mine_no}" className="variable-item">
                Mine Number
              </Menu.Item>
            </Menu.SubMenu>
            <Menu.SubMenu key="now" title="Notice of Work">
              <Menu.Item key="{proposed_annual_maximum_tonnage}" className="variable-item">
                Proposed Annual Tonnage
              </Menu.Item>
              {reclamationMenuOptions.length > 0 && (
                <Menu.SubMenu key="rec" title="Reclamation">
                  {reclamationMenuOptions?.map((activity, i) => (
                    <Menu.SubMenu key={i} title={activity.label}>
                      <Menu.Item
                        key={`{${activity.value}.total}{hectare_unit}`}
                        className="variable-item"
                      >
                        Total Disturbed Area
                      </Menu.Item>
                      <Menu.Item key={`{${activity.value}.cost}`} className="variable-item">
                        Total Cost
                      </Menu.Item>
                    </Menu.SubMenu>
                  ))}
                </Menu.SubMenu>
              )}
              <Menu.Item key="{application_type}" className="variable-item">
                Application Type
              </Menu.Item>
              <Menu.Item key="{application_dated}" className="variable-item">
                Application Dated
              </Menu.Item>
              <Menu.Item key="{application_last_updated_date}" className="variable-item">
                Application Last Updated
              </Menu.Item>
            </Menu.SubMenu>
            <Menu.SubMenu key="draft" title="Draft Permit">
              <Menu.Item key="{issue_date}" className="variable-item">
                Issue Date
              </Menu.Item>
              <Menu.Item key="{authorization_end_date}" className="variable-item">
                Authorization End Date
              </Menu.Item>
              <Menu.Item key="{permit_no}" className="variable-item">
                Permit Number
              </Menu.Item>
            </Menu.SubMenu>
            <Menu.SubMenu key="sec" title="Security">
              <Menu.Item key="{total_liability}" className="variable-item">
                Total Liability
              </Menu.Item>
              <Menu.Item key="{liability_adjustment}" className="variable-item">
                Assessed Liability Adjustment
              </Menu.Item>
              <Menu.Item key="{security_received_date}" className="variable-item">
                Security Received Date
              </Menu.Item>
            </Menu.SubMenu>
            <Menu.SubMenu key="email" title="Emails">
              <Menu.Item key="{major_mine_inbox}" className="variable-item">
                Major Mine Inbox
              </Menu.Item>
              <Menu.Item key="{regional_mine_inbox}" className="variable-item">
                <Space>
                Regional Mine Inbox
                <Tooltip title={"Defaults to the region associated with the Mine."} placement="right" mouseEnterDelay={0.3} overlayClassName="core-tooltip">
                  <QuestionCircleOutlined className="icon-sm" />
                </Tooltip>
                </Space>
              </Menu.Item>
            </Menu.SubMenu>
          </Menu>
        </div>
      </div>
    );
}

export default VariableConditionMenu;
