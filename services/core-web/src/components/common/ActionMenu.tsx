import { Button, Dropdown } from "antd";
import { CARAT } from "@/constants/assets";
import React, { FC } from "react";
import { ITableAction } from "@/components/common/CoreTableCommonColumns";

interface ActionMenuProps {
  record: any;
  actionItems: ITableAction[];
  category: string;
}

export const generateActionMenuItems = (actionItems: ITableAction[], record) => {
  return actionItems.map((action) => {
    return {
      key: action.key,
      icon: action.icon,
      label: (
        <button
          type="button"
          className={`full actions-dropdown-button`}
          onClick={(event) => action.clickFunction(event, record)}
        >
          <div>{action.label}</div>
        </button>
      ),
    };
  });
};

const ActionMenu: FC<ActionMenuProps> = ({ record, actionItems, category }) => {
  const items = generateActionMenuItems(actionItems, record);
  return (
    <Dropdown menu={{ items }} placement="bottomLeft">
      <Button
        icon={
          <img
            className="padding-sm--right icon-svg-filter"
            src={CARAT}
            alt={`${category} Actions`}
            style={{ paddingLeft: "5px" }}
          />
        }
        type="text"
        className="permit-table-button"
      >
        Actions
      </Button>
    </Dropdown>
  );
};

export default ActionMenu;
