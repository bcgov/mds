import { Button, Typography } from "antd";
import {
  CONSEQUENCE_CLASSIFICATION_CODE_HASH,
  DAM_OPERATING_STATUS_HASH,
  EMPTY_FIELD,
} from "@common/constants/strings";
import {
  getITRBExemptionStatusCodeOptionsHash,
  getTSFOperatingStatusCodeOptionsHash,
} from "@common/selectors/staticContentSelectors";
import { useHistory, useParams } from "react-router-dom";

import PropTypes from "prop-types";
import React from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { getHighestConsequence } from "@common/utils/helpers";
import { storeDam } from "@common/actions/damActions";
import { storeTsf } from "@common/actions/tailingsActions";
import { EDIT_PENCIL } from "@/constants/assets";
import { EDIT_DAM } from "@/constants/routes";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import CoreTable from "@/components/common/CoreTable";
import { Feature } from "@mds/common";
import { useFeatureFlag } from "@common/providers/featureFlags/useFeatureFlag";

const propTypes = {
  tailings: PropTypes.arrayOf(PropTypes.any).isRequired,
  openEditTailingsModal: PropTypes.func.isRequired,
  handleEditTailings: PropTypes.func.isRequired,
  TSFOperatingStatusCodeHash: PropTypes.objectOf(PropTypes.string).isRequired,
  itrmExemptionStatusCodeHash: PropTypes.objectOf(PropTypes.string).isRequired,
  editTailings: PropTypes.func.isRequired,
  storeDam: PropTypes.func.isRequired,
  storeTsf: PropTypes.func.isRequired,
};

export const TailingsTable = (props) => {
  const history = useHistory();
  const { id: mineGuid } = useParams();
  const { isFeatureEnabled } = useFeatureFlag();

  // const [expandedRows, setExpandedRows] = React.useState([]);
  const {
    editTailings,
    tailings,
    openEditTailingsModal,
    handleEditTailings,
    TSFOperatingStatusCodeHash,
    itrmExemptionStatusCodeHash,
  } = props;

  const tsfV2Enabled = isFeatureEnabled(Feature.TSF_V2);

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
    history.push(url);
  };

  // const handleRowExpand = (record) => {
  //   const key = record.mine_tailings_storage_facility_guid;
  //   const expandedRowKeys = expandedRows.includes(key)
  //     ? expandedRows.filter((k) => k !== key)
  //     : expandedRows.concat(key);
  //   setExpandedRows(expandedRowKeys);
  // };

  const columns = [
    {
      title: "Name",
      dataIndex: "mine_tailings_storage_facility_name",
      render: (text) => <div title="Name">{text}</div>,
      sorter: (a, b) =>
        a.mine_tailings_storage_facility_name > b.mine_tailings_storage_facility_name ? -1 : 1,
    },
    {
      title: "Operating Status",
      dataIndex: "tsf_operating_status_code",
      render: (text) => (
        <div title="Operating Status">{TSFOperatingStatusCodeHash[text] || EMPTY_FIELD}</div>
      ),
      sorter: (a, b) => (a.tsf_operating_status_code > b.tsf_operating_status_code ? -1 : 1),
    },
    {
      title: "Consequence Classification",
      dataIndex: "consequence_classification_status_code",
      render: (text, record) => <Typography.Text>{getHighestConsequence(record)}</Typography.Text>,
      sorter: (a, b) =>
        a.consequence_classification_status_code > b.consequence_classification_status_code
          ? -1
          : 1,
    },
    {
      title: "Has Independent Tailings Review Board",
      dataIndex: "itrb_exemption_status_code",
      render: (text) => (
        <div title="Has Independent Tailings Review Board?">
          {itrmExemptionStatusCodeHash[text] || EMPTY_FIELD}
        </div>
      ),
      sorter: (a, b) => (a.itrb_exemption_status_code > b.itrb_exemption_status_code ? -1 : 1),
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
      sorter: (a, b) => (a.engineer_of_record > b.engineer_of_record ? -1 : 1),
    },
    {
      title: "Qualified Person",
      dataIndex: "qualified_person",
      render: (text) => <div title="Qualified Person">{text ? text.party.name : EMPTY_FIELD}</div>,
      sorter: (a, b) => (a.qualified_person > b.qualified_person ? -1 : 1),
    },
    {
      title: "Latitude",
      dataIndex: "latitude",
      render: (text) => <div title="Latitude">{text || EMPTY_FIELD}</div>,
      sorter: (a, b) => (a.latitude > b.latitude ? -1 : 1),
    },
    {
      title: "Longitude",
      dataIndex: "longitude",
      render: (text) => <div title="Longitude">{text || EMPTY_FIELD}</div>,
      sorter: (a, b) => (a.longitude > b.longitude ? -1 : 1),
    },
    {
      title: "Notes",
      dataIndex: "notes",
      render: (text) => <div title="Notes">{text || EMPTY_FIELD}</div>,
      sorter: (a, b) => (a.notes > b.notes ? -1 : 1),
    },
    {
      title: "",
      dataIndex: "edit",
      fixed: "right",
      render: (text, record) => {
        return (
          <div title="" align="right">
            <AuthorizationWrapper>
              {tsfV2Enabled ? (
                <Button type="link" onClick={(event) => editTailings(event, record)}>
                  <img src={EDIT_PENCIL} alt="Edit" />
                </Button>
              ) : (
                <Button
                  type="link"
                  onClick={(event) => openEditTailingsModal(event, handleEditTailings, record)}
                >
                  <img src={EDIT_PENCIL} alt="Edit" />
                </Button>
              )}
            </AuthorizationWrapper>
          </div>
        );
      },
    },
  ];

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
                type="link"
                onClick={(event) => {
                  handleEditDam(event, record);
                }}
              >
                <img src={EDIT_PENCIL} alt="Edit" />
              </Button>
            </AuthorizationWrapper>
          </div>
        );
      },
    },
  ];

  return (
    <CoreTable
      columns={columns}
      rowKey={(record) => record.mine_tailings_storage_facility_guid}
      emptyText="This mine has no tailing storage facilities data."
      dataSource={tailings}
      // FEATURE FLAG: TSF
      expandProps={
        tsfV2Enabled
          ? {
              recordDescription: "associated dams",
              getDataSource: (record) => record.dams,
              subTableColumns: expandedColumns,
            }
          : null
      }
    />
  );
};

TailingsTable.propTypes = propTypes;

const mapDispatchToProps = (dispatch) => bindActionCreators({ storeDam, storeTsf }, dispatch);

const mapStateToProps = (state) => ({
  TSFOperatingStatusCodeHash: getTSFOperatingStatusCodeOptionsHash(state),
  itrmExemptionStatusCodeHash: getITRBExemptionStatusCodeOptionsHash(state),
});

export default connect(mapStateToProps, mapDispatchToProps)(TailingsTable);
