import React from "react";
import { connect } from "react-redux";
import { Button, Table } from "antd";
import PropTypes from "prop-types";
import {
  getConsequenceClassificationStatusCodeOptionsHash,
  getITRBExemptionStatusCodeOptionsHash,
  getTSFOperatingStatusCodeOptionsHash,
} from "@common/selectors/staticContentSelectors";
import { detectProdEnvironment as IN_PROD } from "@common/utils/environmentUtils";
import * as Strings from "@/constants/strings";
import { EDIT_PENCIL } from "@/constants/assets";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
// import { EDIT_TAILINGS_STORAGE_FACILITY } from "@/constants/routes";

const propTypes = {
  tailings: PropTypes.arrayOf(PropTypes.any).isRequired,
  // eslint-disable-next-line react/no-unused-prop-types
  openEditTailingsModal: PropTypes.func.isRequired,
  // eslint-disable-next-line react/no-unused-prop-types
  handleEditTailings: PropTypes.func.isRequired,
  // eslint-disable-next-line react/no-unused-prop-types
  TSFOperatingStatusCodeHash: PropTypes.objectOf(PropTypes.string).isRequired,
  // eslint-disable-next-line react/no-unused-prop-types
  consequenceClassificationStatusCodeHash: PropTypes.objectOf(PropTypes.string).isRequired,
  // eslint-disable-next-line react/no-unused-prop-types
  itrmExemptionStatusCodeHash: PropTypes.objectOf(PropTypes.string).isRequired,
  editTailings: PropTypes.func.isRequired,
};

export const TailingsTable = (props) => {
  const { editTailings } = props;
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
        <div title="Operating Status">
          {props.TSFOperatingStatusCodeHash[text] || Strings.EMPTY_FIELD}
        </div>
      ),
    },
    {
      title: "Consequence Classification",
      dataIndex: "consequence_classification_status_code",
      render: (text) => (
        <div title="Consequence Classification">
          {props.consequenceClassificationStatusCodeHash[text] || Strings.EMPTY_FIELD}
        </div>
      ),
    },
    {
      title: "Has Independent Tailings Review Board",
      dataIndex: "itrb_exemption_status_code",
      render: (text) => (
        <div title="Has Independent Tailings Review Board?">
          {props.itrmExemptionStatusCodeHash[text] || Strings.EMPTY_FIELD}
        </div>
      ),
    },
    {
      title: "Engineer of Record",
      dataIndex: "engineer_of_record",
      render: (text) => (
        <div title="Engineer of Record">{text ? text.party.name : Strings.EMPTY_FIELD}</div>
      ),
    },
    {
      title: "Latitude",
      dataIndex: "latitude",
      render: (text) => <div title="Latitude">{text || Strings.EMPTY_FIELD}</div>,
    },
    {
      title: "Longitude",
      dataIndex: "longitude",
      render: (text) => <div title="Longitude">{text || Strings.EMPTY_FIELD}</div>,
    },
    {
      title: "Notes",
      dataIndex: "notes",
      render: (text) => <div title="Notes">{text || Strings.EMPTY_FIELD}</div>,
    },
    {
      title: "",
      dataIndex: "edit",
      render: (text, record) => {
        return (
          <div title="" align="right">
            <AuthorizationWrapper>
              {!IN_PROD() ? (
                <Button type="link" onClick={(event) => editTailings(event, record)}>
                  <img src={EDIT_PENCIL} alt="Edit" />
                </Button>
              ) : (
                <Button
                  type="link"
                  onClick={(event) =>
                    props.openEditTailingsModal(event, props.handleEditTailings, record)
                  }
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

  return (
    <Table
      size="small"
      pagination={false}
      columns={columns}
      rowKey={(record) => record.mine_tailings_storage_facilities}
      locale={{ emptyText: "This mine has no tailing storage facilities data." }}
      dataSource={props.tailings}
    />
  );
};

TailingsTable.propTypes = propTypes;

const mapStateToProps = (state) => ({
  TSFOperatingStatusCodeHash: getTSFOperatingStatusCodeOptionsHash(state),
  consequenceClassificationStatusCodeHash: getConsequenceClassificationStatusCodeOptionsHash(state),
  itrmExemptionStatusCodeHash: getITRBExemptionStatusCodeOptionsHash(state),
});

export default connect(mapStateToProps)(TailingsTable);
