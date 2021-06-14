import React from "react";
import { PropTypes } from "prop-types";
import { Popover } from "antd";
import NOWStatusIndicator from "@/components/noticeOfWork/NOWStatusIndicator";
import NOWProgressActions from "@/components/noticeOfWork/NOWProgressActions";
import NOWProgressStatus from "@/components/noticeOfWork/NOWProgressStatus";
import { TAB_DISCLAIMERS } from "@/constants/NOWConditions";

/**
 * @constant NOWTabHeader renders react children with an active indicator if the id is in the url.
 */

const propTypes = {
  handleDraftPermit: PropTypes.func,
  fixedTop: PropTypes.bool.isRequired,
  isEditMode: PropTypes.bool,
  // eslint-disable-next-line react/forbid-prop-types
  tabActions: PropTypes.any,
  // eslint-disable-next-line react/forbid-prop-types
  tabEditActions: PropTypes.any,
  tab: PropTypes.string.isRequired,
  tabName: PropTypes.string.isRequired,
  showProgressButton: PropTypes.bool,
  isNoticeOfWorkTypeDisabled: PropTypes.bool,
};

const defaultProps = {
  handleDraftPermit: null,
  isEditMode: false,
  tabActions: "",
  tabEditActions: "",
  showProgressButton: true,
  isNoticeOfWorkTypeDisabled: true,
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
          </h2>
          <div className="view--header--content--actions">
            {props.showProgressButton && (
              <NOWProgressActions
                tab={props.tab}
                handleDraftPermit={props.handleDraftPermit}
                isNoticeOfWorkTypeDisabled={props.isNoticeOfWorkTypeDisabled}
              />
            )}
            <>{props.tabActions}</>
          </div>
        </div>
        <div>
          <NOWProgressStatus tab={props.tab} showProgress={props.showProgressButton} />
        </div>
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
