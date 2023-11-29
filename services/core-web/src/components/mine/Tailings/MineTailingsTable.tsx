import React, { FC } from "react";
import { connect } from "react-redux";
import { RouteComponentProps, useParams, withRouter } from "react-router-dom";
import { EyeOutlined } from "@ant-design/icons";
import { Button, Typography, Dropdown, MenuProps } from "antd";
import {
  CONSEQUENCE_CLASSIFICATION_CODE_HASH,
  DAM_OPERATING_STATUS_HASH,
  EMPTY_FIELD,
} from "@mds/common/constants/strings";
import { getHighestConsequence } from "@common/utils/helpers";
import {
  getITRBExemptionStatusCodeOptionsHash,
  getTSFOperatingStatusCodeOptionsHash,
} from "@mds/common/redux/selectors/staticContentSelectors";
import { bindActionCreators } from "redux";
import { storeDam } from "@mds/common/redux/actions/damActions";
import { storeTsf } from "@mds/common/redux/actions/tailingsActions";
import CoreTable from "@/components/common/CoreTable";
import { EDIT_OUTLINE_VIOLET, CARAT } from "@/constants/assets";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import * as Permission from "@/constants/permissions";
import { EDIT_DAM, MINE_TAILINGS_DETAILS } from "@/constants/routes";
import { IDam, ITailingsStorageFacility } from "@mds/common";
import { ColumnsType } from "antd/lib/table";
import { FixedType } from "rc-table/lib/interface";
import {
  renderCategoryColumn,
  renderTextColumn,
} from "@mds/common/components/common/CoreTableCommonColumns";

interface MineTailingsTableProps {
  tailings: ITailingsStorageFacility[];
  isLoaded: boolean;
  openEditTailingsModal: (
    tailings,
    handleEditTailings: (event, tailings: ITailingsStorageFacility) => void,
    record
  ) => void;
  handleEditTailings: (event, tailings: ITailingsStorageFacility) => void;
  TSFOperatingStatusCodeHash?: any;
  itrmExemptionStatusCodeHash?: any;
  history?: any;
  storeDam?: typeof storeDam;
  storeTsf?: typeof storeTsf;
  tsfV2Enabled: boolean;
  canEditTSF: boolean;
}

const MineTailingsTable: FC<RouteComponentProps & MineTailingsTableProps> = (props) => {
  const { id: mineGuid } = useParams<{ id: string }>();
  const {
    TSFOperatingStatusCodeHash,
    itrmExemptionStatusCodeHash,
    openEditTailingsModal,
    handleEditTailings,
    tailings,
    tsfV2Enabled,
    canEditTSF,
  } = props;

  const transformRowData = (items: ITailingsStorageFacility[]) => {
    return items?.map((tailing) => {
      return {
        key: tailing.mine_tailings_storage_facility_guid,
        ...tailing,
      };
    });
  };

  const handleEditDam = (event, dam: IDam) => {
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
  };

  const renderOldTSFEditView = (record) => {
    return (
      <div>
        <AuthorizationWrapper permission={Permission.EDIT_TSF}>
          <Button
            type="primary"
            size="small"
            ghost
            onClick={(event) => openEditTailingsModal(event, handleEditTailings, record)}
          >
            <img src={EDIT_OUTLINE_VIOLET} alt="Edit TSF" />
          </Button>
        </AuthorizationWrapper>
      </div>
    );
  };

  const renderOldDamEditView = (record) => {
    return (
      <div>
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
  };

  const renderNewEditViewDropdown = (menu) => {
    return (
      <div>
        <Dropdown menu={{ items: menu }} placement="bottomLeft">
          <Button className="permit-table-button" type="primary">
            Actions
            <img
              className="padding-sm--right icon-svg-filter"
              src={CARAT}
              alt="Menu"
              style={{ paddingLeft: "5px" }}
            />
          </Button>
        </Dropdown>
      </div>
    );
  };

  const editViewIcon = canEditTSF ? (
    <img src={EDIT_OUTLINE_VIOLET} className="icon-sm padding-sm--right violet" />
  ) : (
    <EyeOutlined className="icon-sm padding-sm--right violet" />
  );

  const columns: ColumnsType<ITailingsStorageFacility> = [
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
      key: "consequence_classification_status_code",
      render: (record) => <Typography.Text>{getHighestConsequence(record)}</Typography.Text>,
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
      render: (record) => {
        const editViewText = canEditTSF ? "Edit TSF" : "View TSF";
        const menu: MenuProps["items"] = [
          {
            key: "0",
            icon: editViewIcon,
            label: (
              <Button
                className="permit-table-button"
                type="primary"
                onClick={() => {
                  props.history.push(
                    MINE_TAILINGS_DETAILS.dynamicRoute(
                      record.mine_tailings_storage_facility_guid,
                      record.mine_guid
                    )
                  );
                }}
              >
                <div>{editViewText}</div>
              </Button>
            ),
          },
        ];

        return tsfV2Enabled ? renderNewEditViewDropdown(menu) : renderOldTSFEditView(record);
      },
    },
  ];

  const damColumns = [
    renderTextColumn("dam_name", "Dam Name"),
    renderCategoryColumn("operating_status", "Operating Status", DAM_OPERATING_STATUS_HASH),
    renderCategoryColumn(
      "consequence_classification",
      "Consequence Classification",
      CONSEQUENCE_CLASSIFICATION_CODE_HASH
    ),
    {
      title: "",
      fixed: "right" as FixedType,
      key: "edit",
      render: (record) => {
        const editViewText = canEditTSF ? "Edit Dam" : "View Dam";
        const menu: MenuProps["items"] = [
          {
            key: "0",
            icon: editViewIcon,
            label: (
              <Button
                className="permit-table-button"
                type="primary"
                onClick={(event) => {
                  handleEditDam(event, record);
                }}
              >
                <div>{editViewText}</div>
              </Button>
            ),
          },
        ];

        return tsfV2Enabled ? renderNewEditViewDropdown(menu) : renderOldDamEditView(record);
      },
    },
  ];

  return (
    <CoreTable
      condition={props.isLoaded}
      dataSource={transformRowData(props.tailings)}
      columns={columns}
      rowKey="mine_tailings_storage_facility_guid"
      classPrefix="tailings"
      expandProps={
        !tsfV2Enabled
          ? null
          : {
              rowKey: "dam_guid",
              rowExpandable: (record: any) => record.dams.length > 0,
              recordDescription: "associated dams",
              getDataSource: (record: any) => record.dams,
              subTableColumns: damColumns,
            }
      }
    />
  );
};

const mapDispatchToProps = (dispatch) => bindActionCreators({ storeDam, storeTsf }, dispatch);

const mapStateToProps = (state) => ({
  TSFOperatingStatusCodeHash: getTSFOperatingStatusCodeOptionsHash(state),
  itrmExemptionStatusCodeHash: getITRBExemptionStatusCodeOptionsHash(state),
});

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(MineTailingsTable as FC<MineTailingsTableProps>) as FC<
    MineTailingsTableProps & RouteComponentProps
  >
);
