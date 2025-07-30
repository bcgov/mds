import React, { FC, useEffect, useState } from "react";
import PermitConditionsNavigation from "../permitConditions/PermitConditionsNavigation";
import { useParams } from "react-router-dom";
import CoreTable from "@mds/common/components/common/CoreTable";
import { renderTextColumn, renderActionsColumn } from "@mds/common/components/common/CoreTableCommonColumns";
import { Button, Divider, Row, Modal } from "antd";
import { IPermitConditionTag } from "@mds/common/interfaces";
import { deletePermitConditionTag, fetchPermitConditionTags, getPermitConditionTags } from "@mds/common/redux/slices/permitConditionTagSlice";
import { useAppDispatch, useAppSelector } from "@mds/common/redux/rootState";
import AuthorizationGuard from "@/HOC/AuthorizationGuard";
import * as Permission from "@/constants/permissions";
import { openModal, closeModal } from "@mds/common/redux/actions/modalActions";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { TagEditForm } from "./TagEditForm";
import { FORM } from "@mds/common/constants/forms";

const TagManagement: FC = () => {
  const { tab } = useParams<{ tab: string }>();
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(false);

  const conditionTags: IPermitConditionTag[] = useAppSelector(getPermitConditionTags)
  useEffect(() => {
    if (conditionTags?.length === 0) {
      setIsLoading(true);
      dispatch(fetchPermitConditionTags(undefined))
      setIsLoading(false);
    }
  }, [conditionTags]);

  const refreshConditionTags = () => {
    dispatch(fetchPermitConditionTags(undefined))
  };

  const handleOpenModal = (record) => {
    dispatch(openModal({
      props: {
        title: `Update Tag`,
        existingTag: record,
        formName: FORM.EDIT_PERMIT_CONDITION_TAG,
        handleClose: () => dispatch(closeModal()),
      },
      content: TagEditForm,
    }));
  };

  const openAddModal = () => {
    dispatch(
      openModal({
        props: {
          title: "Add New Tag",
          formName: FORM.ADD_PERMIT_CONDITION_TAG,
          handleClose: () => dispatch(closeModal()),
        },
        content: TagEditForm,
      })
    );
  }

  const handleDelete = async (conditionTagGuid) => {
    await dispatch(deletePermitConditionTag(conditionTagGuid))
    refreshConditionTags();
  };

  const getActions = () => {
    return [
      {
        key: "edit",
        label: "Edit",
        icon: <EditOutlined />,
        clickFunction: (event, record) => {
          return Modal.confirm({
            title: "Updating this name will change it in all conditions where it is used. Do you want to continue?",
            okText: "Confirm",
            cancelText: "Cancel",
            onOk: () => handleOpenModal(record),
          })
        }
      },
      {
        key: "delete",
        label: "Delete",
        icon: <DeleteOutlined />,
        clickFunction: (event, record) => {
          return Modal.confirm({
            title: "Deleting this tag will remove it from all the items it is currently attached to. Do you wish to continue?",
            okText: "Delete",
            cancelText: "Cancel",
            onOk: () => handleDelete(record.permit_condition_tag_guid)
          })
        }
      }
    ];
  }

  const columns = [
    renderTextColumn("description", "Tag", true),
    renderActionsColumn({
      actions: getActions(),
    }),
  ];

  return (
    <div>
      <div className="landing-page__header">
        <h1>Permit Condition Management</h1>
      </div>
      <PermitConditionsNavigation
        activeButton="tag-management"
        openSubMenuKey={[tab]}
      />
      <div className="tab__content">
        <h2>Permit Condition Tags</h2>
        <Divider />
        <Row justify="end">
          <Button
            onClick={() => openAddModal()}
            loading={isLoading}
            type="primary"
            icon={<PlusOutlined />}
          >
            Add Tag
          </Button>
        </Row>
        <CoreTable
          condition={!isLoading}
          columns={columns}
          dataSource={conditionTags}
        />
      </div>
    </div>
  )
};

export default AuthorizationGuard(Permission.EDIT_TEMPLATE_PERMIT_CONDITIONS)(
  TagManagement
);
