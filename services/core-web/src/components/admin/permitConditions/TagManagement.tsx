import React, { FC, useEffect, useState } from "react";
import PermitConditionsNavigation from "../permitConditions/PermitConditionsNavigation";
import { useParams } from "react-router-dom";
import CoreTable from "@mds/common/components/common/CoreTable";
import { renderTextColumn } from "@mds/common/components/common/CoreTableCommonColumns";
import { Button, Divider, Popconfirm, Row } from "antd";
import { EDIT_OUTLINE_VIOLET, TRASHCAN } from "@/constants/assets";
import { IPermitConditionTag } from "@mds/common/interfaces";
import { deletePermitConditionTag, fetchPermitConditionTags, getPermitConditionTags } from "@mds/common/redux/slices/permitConditionTagSlice";
import { useAppDispatch, useAppSelector } from "@mds/common/redux/rootState";
import AuthorizationGuard from "@/HOC/AuthorizationGuard";
import * as Permission from "@/constants/permissions";
import { openModal, closeModal } from "@mds/common/redux/actions/modalActions";
import { PlusOutlined } from "@ant-design/icons";
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

  const columns = [
    renderTextColumn("description", "Tag", true),
    {
      title: "",
      dataIndex: "delete",
      width: 175,
      render: (text, record) => (
        <div title="">
          <Button
            className="full-mobile"
            onClick={() => handleOpenModal(record)}
            ghost
            type="primary"
          >
            <img src={EDIT_OUTLINE_VIOLET} alt="Edit Tag" />
          </Button>
          <Popconfirm
            placement="topLeft"
            title={`Are you sure you want to delete ${record.description}?`}
            onConfirm={() => handleDelete(record.permit_condition_tag_guid)}
            okText="Delete"
            cancelText="Cancel"
          >
            <Button className="full-mobile" ghost type="primary">
              <img  src={TRASHCAN} alt="Remove Tag" />
            </Button>
          </Popconfirm>
        </div>
      ),
    },
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
