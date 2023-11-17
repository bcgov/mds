import React from "react";
import { PropTypes } from "prop-types";
import { Popover } from "antd";
import NOWStatusIndicator from "@/components/noticeOfWork/NOWStatusIndicator";
import NOWProgressActions from "@/components/noticeOfWork/NOWProgressActions";
import NOWProgressStatus from "@/components/noticeOfWork/NOWProgressStatus";
import { TAB_DISCLAIMERS } from "@/constants/NOWConditions";
import CustomPropTypes from "@/customPropTypes";
import * as Strings from "@mds/common/constants/strings";

/**
 * @constant NOWTabHeader renders react children with an active indicator if the id is in the url.
 */

const propTypes = {
  handleDraftPermit: PropTypes.func,
  fixedTop: PropTypes.bool.isRequired,
  noticeOfWork: CustomPropTypes.importedNOWApplication.isRequired,
  isEditMode: PropTypes.bool,
  // eslint-disable-next-line react/forbid-prop-types
  tabActions: PropTypes.any,
  // eslint-disable-next-line react/forbid-prop-types
  tabEditActions: PropTypes.any,
  tab: PropTypes.string.isRequired,
  tabName: PropTypes.string.isRequired,
  showProgressButton: PropTypes.bool,
  isNoticeOfWorkTypeDisabled: PropTypes.bool,
  showActionsAndProgress: PropTypes.bool,
};

const defaultProps = {
  handleDraftPermit: null,
  isEditMode: false,
  tabActions: "",
  tabEditActions: "",
  showProgressButton: true,
  isNoticeOfWorkTypeDisabled: true,
  showActionsAndProgress: true,
};

export const NOWTabHeader = (props) => (
  <div className={props.fixedTop ? "view--header fixed-scroll" : "view--header"}>
    {!props.isEditMode ? (
      <div className="inline-flex between view--header--content">
        <div className="inline-flex">
          <h2 className="tab-title">
            <Popover placement="topLeft" content={TAB_DISCLAIMERS[props.tab]}>
              {props.tabName}
            </Popover>
            {props.fixedTop && (
              <div className="view--header--sub">
                {props.noticeOfWork?.application_type_code === "NOW"
                  ? "Notice of Work"
                  : "Administrative Amendment"}
                :
                <br />#{props.noticeOfWork.now_number || Strings.NOT_APPLICABLE}
              </div>
            )}
          </h2>
          <div className="view--header--content--actions">
            {props.showProgressButton && props.showActionsAndProgress && (
              <NOWProgressActions
                tab={props.tab}
                handleDraftPermit={props.handleDraftPermit}
                isNoticeOfWorkTypeDisabled={props.isNoticeOfWorkTypeDisabled}
              />
            )}
            {props.showActionsAndProgress && <>{props.tabActions}</>}
          </div>
        </div>
        {props.showActionsAndProgress && (
          <div>
            <NOWProgressStatus tab={props.tab} showProgress={props.showProgressButton} />
          </div>
        )}
      </div>
    ) : (
      <div className="inline-flex flex-center view--header--content">{props.tabEditActions}</div>
    )}
    <NOWStatusIndicator type="banner" tabSection={props.tab} isEditMode={props.isEditMode} />
  </div>
);

NOWTabHeader.propTypes = propTypes;
NOWTabHeader.defaultProps = defaultProps;

export default NOWTabHeader;
