import React, { FC, ReactNode } from "react";
import { Button, Dropdown, Modal } from "antd";
import CaretDownOutlined from "@ant-design/icons/CaretDownOutlined";
import DownOutlined from "@ant-design/icons/DownOutlined";
import { ITableAction } from "@mds/common/components/common/CoreTableCommonColumns";

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
          disabled={action.disabled}
          className={`full actions-dropdown-button`}
          data-testid={`action-button-${action.key}`}
          onClick={(event) => action.clickFunction(event, record)}
        >
          <div>{action.label}</div>
        </button>
      ),
    };
  });
};

export interface IHeaderAction {
  key: string;
  label: string;
  icon?: ReactNode;
  clickFunction: () => void | Promise<void>;
}
// Looks like a button, intended for page-scope, not record-scope in the actions
export const ActionMenuButton: FC<{ buttonText?: string; actions: IHeaderAction[] }> = ({
  actions,
  buttonText = "Action",
}) => {
  const items = generateActionMenuItems((actions as unknown) as ITableAction[], null);

  return (
    <Dropdown menu={{ items }} placement="bottomLeft">
      <Button type="ghost" className="actions-dropdown-button">
        {buttonText}
        <DownOutlined />
      </Button>
    </Dropdown>
  );
};

interface ActionMenuProps {
  record: any;
  actionItems: ITableAction[];
  category: string;
}
const ActionMenu: FC<ActionMenuProps> = ({ record, actionItems, category }) => {
  const items = generateActionMenuItems(actionItems, record);
  return (
    <Dropdown menu={{ items }} placement="bottomLeft">
      <Button type="text" className="actions-dropdown-button">
        Actions
        <CaretDownOutlined alt={`${category} Actions`} />
      </Button>
    </Dropdown>
  );
};

export default ActionMenu;
