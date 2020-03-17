/* eslint-disable */
import React from "react";
import { Menu, Dropdown, Button, Icon, Tooltip } from "antd";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { downloadFileFromDocumentManager } from "@common/utils/actionlessNetworkCalls";
import * as Strings from "@common/constants/strings";
import NullScreen from "@/components/common/NullScreen";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import * as Permission from "@/constants/permissions";
import CustomPropTypes from "@/customPropTypes";
import { EDIT_OUTLINE, EDIT_OUTLINE_VIOLET, EDIT, CARAT } from "@/constants/assets";
import LinkButton from "@/components/common/LinkButton";
import CoreTable from "@/components/common/CoreTable";

/**
 * @class  MineBondTable - displays a table of permits with their related bonds
 */

const propTypes = {
  permits: PropTypes.arrayOf(CustomPropTypes.permit).isRequired,
};

const defaultProps = {
  partyRelationships: [],
};

export const MineBondTable = (props) => {
  const columns = [
    {
      title: "Permit No.",
      dataIndex: "permitNo",
      key: "permitNo",
      render: (text, record) => <div title="Permit No.">{text}</div>,
    },
    {
      title: "Security Total",
      dataIndex: "permitNo",
      key: "permitNo",
      render: (text, record) => <div title="Permit No.">{text}</div>,
    },
    {
      title: "Total Bonds",
      dataIndex: "permitNo",
      key: "permitNo",
      render: (text, record) => <div title="Permit No.">{text}</div>,
    },
    {
      title: "",
      dataIndex: "addEditButton",
      key: "addEditButton",
      align: "right",
      render: (text, record) => {
        return (
          <AuthorizationWrapper permission={Permission.EDIT_SECURITIES}>
            <Button
              type="secondary"
              className="permit-table-button"
              onClick={props.openAddBondModal}
            >
              <div className="padding-small">
                <img className="padding-small--right icon-svg-filter" src={EDIT} alt="Add/Edit" />
                Add Bond
              </div>
            </Button>
          </AuthorizationWrapper>
        );
      },
    },
  ];

  const RenderTableExpandIcon = (rowProps) => (
    <a
      role="link"
      className="expand-row-icon"
      onClick={(e) => rowProps.onExpand(rowProps.record, e)}
      onKeyPress={(e) => rowProps.onExpand(rowProps.record, e)}
      style={{ cursor: "pointer" }}
      tabIndex="0"
    >
      {rowProps.expanded ? (
        <Tooltip title="Click to hide amendment history." placement="right" mouseEnterDelay={1}>
          <Icon type="minus-square" theme="filled" className="icon-lg--grey" />
        </Tooltip>
      ) : (
        <Tooltip title="Click to view amendment history." placement="right" mouseEnterDelay={1}>
          <Icon type="plus-square" theme="filled" className="icon-lg--grey" />
        </Tooltip>
      )}
    </a>
  );

  return (
    <CoreTable
      condition={props.isLoaded}
      dataSource={props.permits}
      columns={columns}
      tableProps={{
        className: "nested-table",
        rowClassName: "table-row-align-middle pointer fade-in",
        align: "left",
        pagination: false,
        locale: { emptyText: <NullScreen type="generic" /> },
        // expandIcon: RenderTableExpandIcon,
        // expandRowByClick: true,
        // expandedRowRender: bonds,
        // expandedRowKeys: props.expandedRowKeys,
        // onExpand: props.onExpand,
      }}
    />
  );
};

MineBondTable.propTypes = propTypes;
MineBondTable.defaultProps = defaultProps;

export default MineBondTable;
