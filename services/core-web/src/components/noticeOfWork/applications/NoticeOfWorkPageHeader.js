import React from "react";
import { Tag } from "antd";
import {
  ArrowLeftOutlined,
  UserOutlined,
  TagOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import * as Strings from "@common/constants/strings";
import * as router from "@/constants/routes";
import CustomPropTypes from "@/customPropTypes";
import { getInspectorsHash } from "@mds/common/redux/selectors/partiesSelectors";
import { getNoticeOfWorkApplicationStatusOptionsHash } from "@mds/common/redux/selectors/staticContentSelectors";
import { connect } from "react-redux";

const propTypes = {
  noticeOfWork: CustomPropTypes.importedNOWApplication.isRequired,
  inspectorsHash: PropTypes.objectOf(PropTypes.string).isRequired,
  noticeOfWorkApplicationStatusOptionsHash: PropTypes.objectOf(PropTypes.string).isRequired,
  applicationPageFromRoute: CustomPropTypes.ApplicationPageFromRoute.isRequired,
  fixedTop: PropTypes.bool.isRequired,
};

export const NoticeOfWorkPageHeader = (props) => {
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

  return (
    <div className="padding-lg">
      <h1>
        {headerName}:&nbsp;{nowNumber}&nbsp;
        <span>
          <Tag title={`Mine: ${nowMineName}`}>
            <Link
              style={{ textDecoration: "none" }}
              to={router.MINE_GENERAL.dynamicRoute(props.noticeOfWork.mine_guid)}
              disabled={!props.noticeOfWork.mine_guid}
            >
              <EnvironmentOutlined className="padding-sm--right" />
              {nowMineName}
            </Link>
          </Tag>
          <Tag title={`Lead Inspector: ${nowLeadInspectorName}`}>
            <Link
              style={{ textDecoration: "none" }}
              to={router.PARTY_PROFILE.dynamicRoute(props.noticeOfWork.lead_inspector_party_guid)}
              disabled={!props.noticeOfWork.lead_inspector_party_guid}
            >
              <UserOutlined className="padding-sm--right" />
              {nowLeadInspectorName}
            </Link>
          </Tag>
          <Tag title={`Status: ${nowStatus}`}>
            <TagOutlined className="padding-sm--right" />
            {nowStatus}
          </Tag>
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

NoticeOfWorkPageHeader.propTypes = propTypes;

const mapStateToProps = (state) => ({
  inspectorsHash: getInspectorsHash(state),
  noticeOfWorkApplicationStatusOptionsHash: getNoticeOfWorkApplicationStatusOptionsHash(state),
});

export default connect(mapStateToProps)(NoticeOfWorkPageHeader);
