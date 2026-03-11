import React, { FC, useEffect } from "react";
import { Tag } from "antd";
import {
  ArrowLeftOutlined,
  UserOutlined,
  TagOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";
import * as Strings from "@mds/common/constants/strings";
import * as router from "@/constants/routes";
import { EDIT_OUTLINE } from "@/constants/assets";
import { getInspectorsHash } from "@mds/common/redux/slices/partiesSlice";
import { getNoticeOfWorkApplicationStatusOptionsHash, getNoticeOfWorkTierOptionsHash } from "@mds/common/redux/selectors/staticContentSelectors";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { openModal, closeModal } from "@mds/common/redux/actions/modalActions";
import { updateNoticeOfWorkApplication, fetchImportedNoticeOfWorkApplication } from "@mds/common/redux/actionCreators/noticeOfWorkActionCreator";
import { useAppSelector } from "@mds/common/redux/rootState";
import { userHasRole } from "@mds/common/redux/selectors/authenticationSelectors";
import { USER_ROLES } from "@mds/common/constants/environment";
import * as Permission from "@/constants/permissions";
import { modalConfig } from "@/components/modalContent/config";
import { INoticeOfWork } from "@mds/common/interfaces";
import { useFeatureFlag } from "@mds/common/providers/featureFlags/useFeatureFlag";
import { Feature } from "@mds/common/utils/featureFlag";

interface NoticeOfWorkPageHeaderProps {
  noticeOfWork: INoticeOfWork;
  inspectorsHash: { [key: string]: string };
  noticeOfWorkApplicationStatusOptionsHash: { [key: string]: string };
  noticeOfWorkTierOptionsHash: { [key: string]: string };
  applicationPageFromRoute: { route: string; title: string };
  fixedTop: boolean;
  openModal: (config: any) => void;
  closeModal: () => void;
  updateNoticeOfWorkApplication: (values: any, guid: string, message: string) => Promise<any>;
  fetchImportedNoticeOfWorkApplication: (guid: string) => Promise<any>;
}

export const NoticeOfWorkPageHeader: FC<NoticeOfWorkPageHeaderProps> = (props) => {
  const { isFeatureEnabled } = useFeatureFlag();

  const tierFeatureEnabled = isFeatureEnabled(Feature.NOTICE_OF_WORK_TIER);

  useEffect(() => {
    console.log("tierFeatureEnabled", tierFeatureEnabled);
  }, [tierFeatureEnabled]);
  
  const userCanEdit = useAppSelector(userHasRole(USER_ROLES.role_edit_permits));
  const nowNumber = props.noticeOfWork.now_number || Strings.EMPTY_FIELD;
  const nowLeadInspectorName =
    props.inspectorsHash[props.noticeOfWork.lead_inspector_party_guid] || Strings.UNASSIGNED;
  const nowMineName = props.noticeOfWork.mine_name || Strings.UNASSIGNED;
  const nowStatus =
    props.noticeOfWorkApplicationStatusOptionsHash[
    props.noticeOfWork.now_application_status_code
    ] || Strings.UNASSIGNED;
  const headerName =
    props.noticeOfWork.application_type_code === "NOW"
      ? "Notice of Work"
      : "Administrative Amendment";

  const nowTierCategoryName =
    props.noticeOfWorkTierOptionsHash[props.noticeOfWork.now_application_tier_code] ||
    Strings.UNASSIGNED;

  const handleUpdateTier = (values) => {
    return props
      .updateNoticeOfWorkApplication(
        values,
        props.noticeOfWork.now_application_guid,
        "Successfully updated Tier Category"
      )
      .then(() => {
        props.fetchImportedNoticeOfWorkApplication(props.noticeOfWork.now_application_guid);
        props.closeModal();
      });
  };

  const openUpdateTierModal = (event) => {
    event.preventDefault();
    props.openModal({
      props: {
        title: "Update Tier Category",
        noticeOfWork: props.noticeOfWork,
        onSubmit: handleUpdateTier,
      },
      content: modalConfig.UPDATE_NOW_TIER_MODAL,
    });
  };

  return (
    <div className="padding-lg">
      <h1>
        {headerName}:&nbsp;{nowNumber}&nbsp;
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
          {isFeatureEnabled(Feature.NOTICE_OF_WORK_TIER) && (
            <Tag title={`Tier Category: ${nowTierCategoryName}`}>
              <TagOutlined className="padding-sm--right" />
              {nowTierCategoryName}
              {userCanEdit && (
                <a onClick={openUpdateTierModal} style={{ marginLeft: "5px" }}>
                  <img src={EDIT_OUTLINE} alt="Edit" title="Edit" style={{ width: "16px", height: "16px" }} />
                </a>
              )}
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

const mapStateToProps = (state) => ({
  inspectorsHash: getInspectorsHash(state),
  noticeOfWorkApplicationStatusOptionsHash: getNoticeOfWorkApplicationStatusOptionsHash(state),
  noticeOfWorkTierOptionsHash: getNoticeOfWorkTierOptionsHash(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      openModal,
      closeModal,
      updateNoticeOfWorkApplication,
      fetchImportedNoticeOfWorkApplication,
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(NoticeOfWorkPageHeader);
