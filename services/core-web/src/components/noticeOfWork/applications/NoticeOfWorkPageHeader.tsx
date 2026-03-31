import React, { FC } from "react";
import { Tag, Button } from "antd";
import {
  ArrowLeftOutlined,
  UserOutlined,
  TagOutlined,
  EnvironmentOutlined,
  HistoryOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";
import * as Strings from "@mds/common/constants/strings";
import * as router from "@/constants/routes";
import { EDIT_OUTLINE } from "@/constants/assets";
import { getInspectorsHash } from "@mds/common/redux/slices/partiesSlice";
import {
  getNoticeOfWorkApplicationStatusOptionsHash,
  getNoticeOfWorkTierOptionsHash,
} from "@mds/common/redux/selectors/staticContentSelectors";
import { openModal, closeModal } from "@mds/common/redux/actions/modalActions";
import {
  updateNoticeOfWorkApplication,
  fetchImportedNoticeOfWorkApplication,
} from "@mds/common/redux/actionCreators/noticeOfWorkActionCreator";
import { useAppDispatch, useAppSelector } from "@mds/common/redux/rootState";
import { userHasRole } from "@mds/common/redux/selectors/authenticationSelectors";
import { USER_ROLES } from "@mds/common/constants/environment";
import { modalConfig } from "@/components/modalContent/config";
import { INoticeOfWork } from "@mds/common/interfaces";
import { useFeatureFlag } from "@mds/common/providers/featureFlags/useFeatureFlag";
import { Feature } from "@mds/common/utils/featureFlag";

interface NoticeOfWorkPageHeaderProps {
  noticeOfWork: INoticeOfWork;
  applicationPageFromRoute: { route: string; title: string };
  fixedTop: boolean;
}

export const NoticeOfWorkPageHeader: FC<NoticeOfWorkPageHeaderProps> = (props) => {
  const dispatch = useAppDispatch();
  const { isFeatureEnabled } = useFeatureFlag();

  const inspectorsHash = useAppSelector(getInspectorsHash);
  const noticeOfWorkApplicationStatusOptionsHash = useAppSelector(
    getNoticeOfWorkApplicationStatusOptionsHash
  );
  const noticeOfWorkTierOptionsHash = useAppSelector(getNoticeOfWorkTierOptionsHash);

  const userCanEdit = useAppSelector(userHasRole(USER_ROLES.role_edit_permits));
  const nowNumber = props.noticeOfWork.now_number || Strings.EMPTY_FIELD;
  const nowLeadInspectorName =
    inspectorsHash[props.noticeOfWork.lead_inspector_party_guid] || Strings.UNASSIGNED;
  const nowMineName = props.noticeOfWork.mine_name || Strings.UNASSIGNED;
  const nowStatus =
    noticeOfWorkApplicationStatusOptionsHash[props.noticeOfWork.now_application_status_code] ||
    Strings.UNASSIGNED;
  const headerName =
    props.noticeOfWork.application_type_code === "NOW"
      ? "Notice of Work"
      : "Administrative Amendment";

  const isExploration =
    props.noticeOfWork?.notice_of_work_type_code === "MIN" ||
    props.noticeOfWork?.notice_of_work_type_code === "COL";

  let nowTierCategoryName =
    noticeOfWorkTierOptionsHash[props.noticeOfWork.now_application_tier_code] || Strings.UNASSIGNED;
  const isInitialIntake =
    props.noticeOfWork.now_application_tier_created_date &&
    props.noticeOfWork.now_application_tier_created_date ===
    props.noticeOfWork.now_application_tier_updated_date;

  console.log('isInitialIntake', isInitialIntake)

  if (isInitialIntake) {
    nowTierCategoryName = `${nowTierCategoryName} (initial intake)`;
  }

  const handleUpdateTier = (values) => {
    return dispatch(
      updateNoticeOfWorkApplication(
        values,
        props.noticeOfWork.now_application_guid,
        "Successfully updated Tier Category"
      )
    ).then(() => {
      return dispatch(
        fetchImportedNoticeOfWorkApplication(props.noticeOfWork.now_application_guid)
      ).then(() => {
        dispatch(closeModal());
      });
    });
  };

  const openUpdateTierModal = () => {
    dispatch(
      openModal({
        props: {
          title: "Update Tier Category",
          noticeOfWork: props.noticeOfWork,
          onSubmit: handleUpdateTier,
        },
        content: modalConfig.UPDATE_NOW_TIER_MODAL,
      })
    );
  };

  const openTierHistoryModal = () => {
    dispatch(
      openModal({
        props: {
          title: "Timeline Tier History",
          applicationGuid: props.noticeOfWork.now_application_guid,
        },
        content: modalConfig.NOW_TIER_HISTORY_MODAL,
      })
    );
  };

  return (
    <div className="padding-lg">
      <h1>
        {headerName}:&nbsp;{nowNumber}
        <span>
          <Tag title={`Mine: ${nowMineName}`}>
            {props.noticeOfWork.mine_guid ? (
              <Link
                style={{ textDecoration: "none" }}
                to={router.MINE_GENERAL.dynamicRoute(props.noticeOfWork.mine_guid)}
              >
                <EnvironmentOutlined className="padding-sm--right" />
                {nowMineName}
              </Link>
            ) : (
              <span>
                <EnvironmentOutlined className="padding-sm--right" />
                {nowMineName}
              </span>
            )}
          </Tag>
          <Tag title={`Lead Inspector: ${nowLeadInspectorName}`}>
            {props.noticeOfWork.lead_inspector_party_guid ? (
              <Link
                style={{ textDecoration: "none" }}
                to={router.PARTY_PROFILE.dynamicRoute(props.noticeOfWork.lead_inspector_party_guid)}
              >
                <UserOutlined className="padding-sm--right" />
                {nowLeadInspectorName}
              </Link>
            ) : (
              <span>
                <UserOutlined className="padding-sm--right" />
                {nowLeadInspectorName}
              </span>
            )}
          </Tag>
          <Tag title={`Status: ${nowStatus}`}>
            <TagOutlined className="padding-sm--right" />
            {nowStatus}
          </Tag>
          {isFeatureEnabled(Feature.NOTICE_OF_WORK_TIER) && isExploration && (
            <Tag title={`Tier Category: ${nowTierCategoryName}`}>
              <TagOutlined className="padding-sm--right" />
              Timeline Tier: {nowTierCategoryName}
              {userCanEdit && props.noticeOfWork.imported_to_core && (
                <Button
                  type="text"
                  onClick={openUpdateTierModal}
                  style={{
                    border: "none",
                    padding: 0,
                    margin: 0,
                    marginLeft: "10px",
                    height: "auto",
                    background: "transparent",
                  }}
                >
                  <img
                    src={EDIT_OUTLINE}
                    alt="Edit"
                    title="Edit"
                    style={{ width: "16px", height: "16px" }}
                  />
                </Button>
              )}
              <Button
                type="text"
                onClick={openTierHistoryModal}
                style={{ border: "none", padding: 0, margin: 0, marginLeft: "10px", height: "auto", background: "transparent" }}
              >
                <HistoryOutlined style={{ fontSize: "18px", color: "rgba(0, 0, 0, 0.45)" }} title="History" />
              </Button>
            </Tag>
          )}
        </span>
      </h1>
      {props.applicationPageFromRoute && !props.fixedTop && (
        <Link to={props.applicationPageFromRoute.route}>
          <ArrowLeftOutlined className="padding-sm--right" />
          Back to: {props.applicationPageFromRoute.title}
        </Link>
      )}
    </div>
  );
};

export default NoticeOfWorkPageHeader;
