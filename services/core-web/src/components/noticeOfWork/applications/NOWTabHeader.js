/* eslint-disable */
import React, { Component } from "react";
import { PropTypes } from "prop-types";
import { Button, Popconfirm, Popover } from "antd";
import NOWActionWrapper from "@/components/noticeOfWork/NOWActionWrapper";
import NOWStatusIndicator from "@/components/noticeOfWork/NOWStatusIndicator";
import NOWProgressActions from "@/components/noticeOfWork/NOWProgressActions";
import NOWProgressStatus from "@/components/noticeOfWork/NOWProgressStatus";
import { TAB_DISCLAIMERS } from "@/constants/NOWConditions";

/**
 * @constant NOWTabHeader renders react children with an active indicator if the id is in the url.
 */

const propTypes = {
  tabSection: PropTypes.string.isRequired,
  handleDraftPermit: PropTypes.func,
  fixedTop: PropTypes.bool.isRequired,
  isEditMode: PropTypes.bool,
  tabActions: PropTypes.any,
  tracked: PropTypes.bool,
};

const defaultProps = { handleDraftPermit: null, isEditMode: false, tabActions: "", tracked: true };

export class NOWTabHeader extends Component {
  render() {
    return (
      <div className={this.props.fixedTop ? "view--header fixed-scroll" : "view--header"}>
        <div className="inline-flex between view--header--content">
          <div className="inline-flex">
            <h2 className="tab-title">
              <Popover placement="topLeft" content={TAB_DISCLAIMERS[this.props.tab]}>
                {this.props.tabName}
              </Popover>
            </h2>
            <div className="view--header--content--actions">
              <NOWProgressActions
                tab={this.props.tab}
                handleDraftPermit={this.props.handleDraftPermit}
              />
              <>{this.props.tabActions}</>
            </div>
          </div>
          <div>
            <NOWProgressStatus tab={this.props.tab} />
          </div>
        </div>
        <NOWStatusIndicator
          type="banner"
          tabSection={this.props.tab}
          isEditMode={this.props.isEditMode}
        />
      </div>
    );
  }
}

NOWTabHeader.propTypes = propTypes;

export default NOWTabHeader;
