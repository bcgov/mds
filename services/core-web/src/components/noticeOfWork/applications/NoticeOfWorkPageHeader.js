import React from "react";
import { Icon, Tag } from "antd";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import * as router from "@/constants/routes";
import CustomPropTypes from "@/customPropTypes";
import * as Strings from "@/constants/strings";

const propTypes = {
  noticeOfWork: CustomPropTypes.nowApplication.isRequired,
  inspectorsHash: PropTypes.objectOf(PropTypes.string).isRequired,
  noticeOfWorkPageFromRoute: CustomPropTypes.noticeOfWorkPageFromRoute.isRequired,
};

const NoticeOfWorkPageHeader = (props) => {
  const getNumber = () => {
    return props.noticeOfWork.now_number || Strings.EMPTY_FIELD;
  };

  const getLeadInspectorName = () => {
    return props.inspectorsHash[props.noticeOfWork.lead_inspector_party_guid] || Strings.UNASSIGNED;
  };

  const getMineName = () => {
    return props.noticeOfWork.mine_name || Strings.UNASSIGNED;
  };

  return (
    <div>
      <h1>
        NoW Number:&nbsp;{getNumber()}
        <span className="padding-md--left">
          <Tag title={`Mine: ${getMineName()}`}>
            <Link
              style={{ textDecoration: "none" }}
              to={router.MINE_GENERAL.dynamicRoute(props.noticeOfWork.mine_guid)}
              disabled={!props.noticeOfWork.mine_guid}
            >
              <Icon type="environment" className="padding-small--right" />
              {getMineName()}
            </Link>
          </Tag>
          <Tag title={`Lead Inspector: ${getLeadInspectorName()}`}>
            <Link
              style={{ textDecoration: "none" }}
              to={router.PARTY_PROFILE.dynamicRoute(props.noticeOfWork.lead_inspector_party_guid)}
              disabled={!props.noticeOfWork.lead_inspector_party_guid}
            >
              <Icon type="user" className="padding-small--right" />
              {getLeadInspectorName()}
            </Link>
          </Tag>
        </span>
      </h1>
      {props.noticeOfWorkPageFromRoute && (
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
