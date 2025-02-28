import React, { FC, ReactNode } from "react";
import { Button, ButtonProps, Dropdown, Modal } from "antd";
import CaretDownOutlined from "@ant-design/icons/CaretDownOutlined";
import DownOutlined from "@ant-design/icons/DownOutlined";
import EllipsisOutlined from "@ant-design/icons/EllipsisOutlined";
import { ITableAction } from "@mds/common/components/common/CoreTableCommonColumns";

export const deleteConfirmWrapper = (recordDescription: string, onOk: () => void, plural = false) => {
  const title = `Confirm Deletion`;
  const article = plural ? "these" : "this"
  const content = `Are you sure you want to delete ${article} ${recordDescription}?`;
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
          className={`full actions-dropdown-button menu-item-button`}
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
export const ActionMenuButton: FC<{
  buttonText?: string;
  actions: IHeaderAction[];
  disabled?: boolean;
  buttonProps?: ButtonProps;
  useEllipsis?: boolean; // New prop to control ellipsis display
}> = ({
  actions,
  buttonText = "Action",
  buttonProps,
  disabled = false,
  useEllipsis = false
}) => {
    const items = generateActionMenuItems((actions as unknown) as ITableAction[], null);

    // Enhanced default button props for ellipsis mode to completely remove button appearance
    const defaultButtonProps: ButtonProps = useEllipsis
      ? {
        type: "text",
        icon: <EllipsisOutlined />,
        className: "actions-ellipsis-button",
        style: {
          width: '32px',
          height: '32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: 'none',
          boxShadow: 'none',
          background: 'transparent',
          padding: '0',
          minWidth: 'auto'
        }
      }
      : {
        type: "ghost",
        className: "actions-dropdown-button"
      };

    // Merge default props with any custom props provided
    const mergedButtonProps = { ...defaultButtonProps, ...buttonProps };

    return (
      <Dropdown menu={{ items }} placement="bottomLeft" disabled={disabled}>
        <Button {...mergedButtonProps}>
          {!useEllipsis && buttonText}
          {!useEllipsis && <DownOutlined />}
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
