import { Button, Dropdown, Modal } from "antd";
import { CaretDownOutlined } from "@ant-design/icons";
import React, { FC } from "react";
import { ITableAction } from "@/components/common/CoreTableCommonColumns";

interface ActionMenuProps {
  record: any;
  actionItems: ITableAction[];
  category: string;
}

export const deleteConfirmWrapper = (recordDescription: string, onOk: () => void) => {
  const title = `Confirm Deletion`;
  const content = `Are you sure you want to delete this ${recordDescription}?`;
  const modalContent = {
    title,
    content,
    onOk,
    okText: "Delete",
  };
  return Modal.confirm(modalContent);
};

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
      <Button type="text" className="permit-table-button">
        Actions
        <CaretDownOutlined alt={`${category} Actions`} />
      </Button>
    </Dropdown>
  );
};

export default ActionMenu;
