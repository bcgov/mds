import React, { FC, useEffect, useState } from "react";
import PermitConditionsNavigation from "../permitConditions/PermitConditionsNavigation";
import { useParams } from "react-router-dom";
import CoreTable from "@mds/common/components/common/CoreTable";
import { renderTextColumn } from "@mds/common/components/common/CoreTableCommonColumns";
import { Button, Divider, Popconfirm } from "antd";
import { EDIT_OUTLINE_VIOLET, TRASHCAN } from "@/constants/assets";
import { IPermitConditionTag } from "@mds/common/interfaces";
import { fetchPermitConditionTags } from "@mds/common/redux/actionCreators/permitActionCreator";
import { getPermitConditionTags } from "@mds/common/redux/reducers/permitReducer";
import { useAppDispatch, useAppSelector } from "@mds/common/redux/rootState";
import AuthorizationGuard from "@/HOC/AuthorizationGuard";
import * as Permission from "@/constants/permissions";

const TagManagement: FC = () => {
  const { tab } = useParams<{ tab: string }>();
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(false);

  const conditionTags: IPermitConditionTag[] = useAppSelector(getPermitConditionTags)
  useEffect(() => {
      if (conditionTags?.length === 0) {
        setIsLoading(true);
        dispatch(fetchPermitConditionTags())
        setIsLoading(false);
      }
    }, [conditionTags]);

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
            //onClick={(e) => record.update(e, record)}
            ghost
            type="primary"
          >
            <img src={EDIT_OUTLINE_VIOLET} alt="Edit Tag" />
          </Button>
          <Popconfirm
            placement="topLeft"
            title={`Are you sure you want to delete ${record.description}?`}
            onConfirm={() => text(record.permit_condition_tag_guid)}
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
        activeButton="hsrc-management"
        openSubMenuKey={[tab]}
      />
      <div className="tab__content">
        <h2>Permit Condition Tags</h2>
        <Divider />
        <br />
        <CoreTable
            condition={!isLoading}
            columns={columns}
            dataSource={conditionTags.sort((a, b) => a.description.localeCompare(b.description))}
          />
      </div>
    </div>
  )
};

export default AuthorizationGuard(Permission.EDIT_TEMPLATE_PERMIT_CONDITIONS)(
  TagManagement
);
