import React, { useState } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { withRouter, useParams } from "react-router-dom";
import { EyeOutlined } from "@ant-design/icons";
import { Button, Typography } from "antd";
import {
  CONSEQUENCE_CLASSIFICATION_CODE_HASH,
  DAM_OPERATING_STATUS_HASH,
  EMPTY_FIELD,
} from "@common/constants/strings";
import { getHighestConsequence } from "@common/utils/helpers";
import {
  getITRBExemptionStatusCodeOptionsHash,
  getTSFOperatingStatusCodeOptionsHash,
} from "@common/selectors/staticContentSelectors";
import { detectProdEnvironment as IN_PROD } from "@common/utils/environmentUtils";
import { bindActionCreators } from "redux";
import { storeDam } from "@common/actions/damActions";
import { storeTsf } from "@common/actions/tailingsActions";
import CoreTable from "@/components/common/CoreTable";
import { EDIT_OUTLINE_VIOLET } from "@/constants/assets";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import * as Permission from "@/constants/permissions";
import { EDIT_DAM, MINE_TAILINGS_DETAILS } from "@/constants/routes";

const propTypes = {
  TSFOperatingStatusCodeHash: PropTypes.objectOf(PropTypes.string).isRequired,
  itrmExemptionStatusCodeHash: PropTypes.objectOf(PropTypes.string).isRequired,
  tailings: PropTypes.arrayOf(PropTypes.any).isRequired,
  openEditTailingsModal: PropTypes.func.isRequired,
  handleEditTailings: PropTypes.func.isRequired,
  isLoaded: PropTypes.bool.isRequired,
  history: PropTypes.shape({ push: PropTypes.func }).isRequired,
  storeDam: PropTypes.func.isRequired,
  storeTsf: PropTypes.func.isRequired,
};

const defaultProps = {};

const MineTailingsTable = (props) => {
  const { id: mineGuid } = useParams();
  const {
    TSFOperatingStatusCodeHash,
    itrmExemptionStatusCodeHash,
    openEditTailingsModal,
    handleEditTailings,
    tailings,
  } = props;
  const [expandedRows, setExpandedRows] = useState([]);

  const handleRowExpand = (record) => {
    const key = record.mine_tailings_storage_facility_guid;
    const expandedRowKeys = expandedRows.includes(key)
      ? expandedRows.filter((k) => k !== key)
      : expandedRows.concat(key);
    setExpandedRows(expandedRowKeys);
  };

  const transformRowData = (items) => {
    return items.map((tailing) => {
      return {
        key: tailing.mine_tailings_storage_facility_guid,
        ...tailing,
      };
    });
  };

  const handleEditDam = (event, dam) => {
    event.preventDefault();
    props.storeDam(dam);
    const tsf = tailings.find(
      (t) => t.mine_tailings_storage_facility_guid === dam.mine_tailings_storage_facility_guid
    );
    if (tsf) {
      props.storeTsf(tsf);
    }
    const url = EDIT_DAM.dynamicRoute(
      mineGuid,
      dam.mine_tailings_storage_facility_guid,
      dam.dam_guid
    );
    props.history.push(url);
    // history.push(url);
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "mine_tailings_storage_facility_name",
      render: (text) => <div title="Name">{text}</div>,
    },
    {
      title: "Operating Status",
      dataIndex: "tsf_operating_status_code",
      render: (text) => (
        <div title="Operating Status">{TSFOperatingStatusCodeHash[text] || EMPTY_FIELD}</div>
      ),
    },
    {
      title: "Consequence Classification",
      dataIndex: "consequence_classification_status_code",
      render: (text, record) => <Typography.Text>{getHighestConsequence(record)}</Typography.Text>,
    },
    {
      title: "Independent Tailings Review Board",
      dataIndex: "itrb_exemption_status_code",
      width: "5%",
      render: (text) => (
        <div title="Has Independent Tailings Review Board?">
          {itrmExemptionStatusCodeHash[text] || EMPTY_FIELD}
        </div>
      ),
    },
    {
      title: "Permit #",
      dataIndex: "mines_act_permit_no",
      key: "mines_act_permit_no",
      sorter: (a, b) => (a.itrb_exemption_status_code > b.itrb_exemption_status_code ? -1 : 1),
    },
    {
      title: "Engineer of Record",
      dataIndex: "engineer_of_record",
      render: (text) => (
        <div title="Engineer of Record">{text ? text.party.name : EMPTY_FIELD}</div>
      ),
    },
    {
      title: "Qualified Person",
      dataIndex: "qualified_person",
      render: (text) => <div title="Qualified Person">{text ? text.party.name : EMPTY_FIELD}</div>,
    },
    {
      title: "Latitude",
      dataIndex: "latitude",
      render: (text) => <div title="Latitude">{text || EMPTY_FIELD}</div>,
    },
    {
      title: "Longitude",
      dataIndex: "longitude",
      render: (text) => <div title="Longitude">{text || EMPTY_FIELD}</div>,
    },
    {
      key: "operations",
      title: "Actions",
      fixed: "right",
      render: (text, record) => {
        return (
          <div align="right">
            <AuthorizationWrapper permission={Permission.EDIT_TSF}>
              <Button
                type="primary"
                size="small"
                ghost
                onClick={(event) => openEditTailingsModal(event, handleEditTailings, record)}
              >
                <img src={EDIT_OUTLINE_VIOLET} alt="Edit TSF" />
              </Button>

              {!IN_PROD() && (
                <Button
                  type="primary"
                  size="small"
                  ghost
                  onClick={() =>
                    props.history.push(
                      MINE_TAILINGS_DETAILS.dynamicRoute(
                        record.mine_guid,
                        record.mine_tailings_storage_facility_guid
                      )
                    )
                  }
                >
                  <EyeOutlined className="icon-lg icon-svg-filter" />
                </Button>
              )}
            </AuthorizationWrapper>
          </div>
        );
      },
    },
  ];

  const expandedRowRender = (expandedRecord) => {
    const expandedColumns = [
      { title: "Dam Name", dataIndex: "dam_name", key: "dam_name" },
      {
        title: "Operating Status",
        key: "operating_status",
        render: (record) => (
          <Typography.Text>{DAM_OPERATING_STATUS_HASH[record.operating_status]}</Typography.Text>
        ),
      },
      {
        title: "Consequence Classification",
        key: "consequence_classification",
        render: (record) => (
          <Typography.Text>
            {CONSEQUENCE_CLASSIFICATION_CODE_HASH[record.consequence_classification]}
          </Typography.Text>
        ),
      },
      {
        title: "",
        fixed: "right",
        dataIndex: "edit",
        render: (text, record) => {
          return (
            <div title="" align="right">
              <AuthorizationWrapper>
                <Button
                  type="primary"
                  size="small"
                  ghost
                  onClick={(event) => {
                    handleEditDam(event, record);
                  }}
                >
                  <img src={EDIT_OUTLINE_VIOLET} alt="Edit Dam" />
                </Button>
              </AuthorizationWrapper>
            </div>
          );
        },
      },
    ];
    return (
      <CoreTable
        columns={expandedColumns}
        dataSource={expandedRecord.dams}
        tableProps={{
          size: "small",
          pagination: false,
          rowKey: (record) => record.dam_guid,
          className: "tailings-nested-table",
        }}
        condition={props.isLoaded}
      />
    );
  };

  return (
    <CoreTable
      condition={props.isLoaded}
      dataSource={transformRowData(props.tailings)}
      columns={columns}
      tableProps={{
        className: "tailings-table",
        align: "center",
        pagination: false,
        expandable: IN_PROD() ? null : { expandedRowRender },
        expandRowByClick: true,
        onExpand: (expanded, record) => handleRowExpand(record),
        expandedRows,
        rowExpandable: (record) => record.dams.length > 0,
        indentSize: 500,
        expandedRowClassName: () => "tailings-table-expanded-row",
        rowKey: (record) => record.mine_tailings_storage_facility_guid,
      }}
    />
  );
};

MineTailingsTable.propTypes = propTypes;
MineTailingsTable.defaultProps = defaultProps;

const mapDispatchToProps = (dispatch) => bindActionCreators({ storeDam, storeTsf }, dispatch);

const mapStateToProps = (state) => ({
  TSFOperatingStatusCodeHash: getTSFOperatingStatusCodeOptionsHash(state),
  itrmExemptionStatusCodeHash: getITRBExemptionStatusCodeOptionsHash(state),
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(MineTailingsTable));
