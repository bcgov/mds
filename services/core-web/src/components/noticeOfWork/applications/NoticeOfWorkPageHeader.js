import React from "react";
import { Icon, Tag } from "antd";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import * as Strings from "@common/constants/strings";
import * as router from "@/constants/routes";
import CustomPropTypes from "@/customPropTypes";

const propTypes = {
  noticeOfWork: CustomPropTypes.importedNOWApplication.isRequired,
  inspectorsHash: PropTypes.objectOf(PropTypes.string).isRequired,
  noticeOfWorkApplicationStatusOptionsHash: PropTypes.objectOf(PropTypes.string).isRequired,
  noticeOfWorkPageFromRoute: CustomPropTypes.noticeOfWorkPageFromRoute.isRequired,
  fixedTop: PropTypes.bool.isRequired,
};

const NoticeOfWorkPageHeader = (props) => {
  const nowNumber = props.noticeOfWork.now_number || Strings.EMPTY_FIELD;
  const nowLeadInspectorName =
    props.inspectorsHash[props.noticeOfWork.lead_inspector_party_guid] || Strings.UNASSIGNED;
  const nowMineName = props.noticeOfWork.mine_name || Strings.UNASSIGNED;
  const nowStatus =
    props.noticeOfWorkApplicationStatusOptionsHash[
      props.noticeOfWork.now_application_status_code
    ] || Strings.UNASSIGNED;

  return (
    <div>
      <h1>
        NoW Number:&nbsp;{nowNumber}&nbsp;
        <span>
          <Tag title={`Mine: ${nowMineName}`}>
            <Link
              style={{ textDecoration: "none" }}
              to={router.MINE_GENERAL.dynamicRoute(props.noticeOfWork.mine_guid)}
              disabled={!props.noticeOfWork.mine_guid}
            >
              <Icon type="environment" className="padding-small--right" />
              {nowMineName}
            </Link>
          </Tag>
          <Tag title={`Lead Inspector: ${nowLeadInspectorName}`}>
            <Link
              style={{ textDecoration: "none" }}
              to={router.PARTY_PROFILE.dynamicRoute(props.noticeOfWork.lead_inspector_party_guid)}
              disabled={!props.noticeOfWork.lead_inspector_party_guid}
            >
              <Icon type="user" className="padding-small--right" />
              {nowLeadInspectorName}
            </Link>
          </Tag>
          <Tag title={`Status: ${nowStatus}`}>
            <Icon type="tag" className="padding-small--right" />
            {nowStatus}
          </Tag>
        </span>
      </h1>
      {props.noticeOfWorkPageFromRoute && !props.fixedTop && (
        <Link to={props.noticeOfWorkPageFromRoute.route}>
          <Icon type="arrow-left" style={{ paddingRight: "5px" }} />
          Back to: {props.noticeOfWorkPageFromRoute.title}
        </Link>
      )}
    </div>
  );
};

NoticeOfWorkPageHeader.propTypes = propTypes;

export default NoticeOfWorkPageHeader;
