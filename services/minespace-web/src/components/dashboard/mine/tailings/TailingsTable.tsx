import { Button, Typography } from "antd";
import {
  CONSEQUENCE_CLASSIFICATION_CODE_HASH,
  DAM_OPERATING_STATUS_HASH,
  EMPTY_FIELD,
} from "@mds/common/constants/strings";
import {
  getITRBExemptionStatusCodeOptionsHash,
  getTSFOperatingStatusCodeOptionsHash,
} from "@mds/common/redux/selectors/staticContentSelectors";
import { useHistory } from "react-router-dom";
import React, { FC, useContext } from "react";
import { getHighestConsequence } from "@common/utils/helpers";
import { storeDam } from "@mds/common/redux/slices/damSlice";
import { storeTsf } from "@mds/common/redux/actions/tailingsActions";
import { EDIT_PENCIL } from "@/constants/assets";
import { EDIT_DAM } from "@/constants/routes";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import CoreTable from "@mds/common/components/common/CoreTable";
import { Feature } from "@mds/common/utils/featureFlag";
import { useFeatureFlag } from "@mds/common/providers/featureFlags/useFeatureFlag";
import { renderActionsColumn } from "@mds/common/components/common/CoreTableCommonColumns";
import { EditOutlined, EyeOutlined } from "@ant-design/icons";
import { useAppDispatch, useAppSelector } from "@mds/common/redux/rootState";
import { ColumnsType } from "antd/lib/table";
import { ColumnType } from "antd/es/table";
import { IMine, ITailingsStorageFacility } from "@mds/common/interfaces";
import { SidebarContext } from "@mds/common/components/common/SidebarWrapper";

interface TailingsTableProps {
  tailings: ITailingsStorageFacility[];
  openEditTailingsModal: (event, onSubmit, record: ITailingsStorageFacility) => void;
  handleEditTailings: (values: ITailingsStorageFacility) => void;
  editTailings: (event, mineTsf: ITailingsStorageFacility, isEditMode: boolean) => void;
  canEditTSF: boolean;
}

export const TailingsTable: FC<TailingsTableProps> = (props) => {
  const history = useHistory();
  const { mine } = useContext<{ mine: IMine }>(SidebarContext);
  const { mine_guid } = mine;
  const { isFeatureEnabled } = useFeatureFlag();
  const dispatch = useAppDispatch();

  const TSFOperatingStatusCodeHash = useAppSelector(getTSFOperatingStatusCodeOptionsHash);
  const itrmExemptionStatusCodeHash = useAppSelector(getITRBExemptionStatusCodeOptionsHash);

  const { editTailings, tailings, openEditTailingsModal, handleEditTailings, canEditTSF } = props;

  const tsfV2Enabled = isFeatureEnabled(Feature.TSF_V2);

  const handleEditDam = (event, dam, isEditMode, canEditDam) => {
    event.preventDefault();
    dispatch(storeDam(dam));
    const tsf = tailings.find(
      (t) => t.mine_tailings_storage_facility_guid === dam.mine_tailings_storage_facility_guid
    );
    if (tsf) {
      dispatch(storeTsf(tsf));
    }
    const url = EDIT_DAM.dynamicRoute(
      mine_guid,
      dam.mine_tailings_storage_facility_guid,
      dam.dam_guid,
      isEditMode,
      canEditDam
    );
    history.push(url);
  };

  const renderOldTSFActions = (): ColumnType<any> => {
    return {
      dataIndex: "edit",
      fixed: "right",
      render: (text, record) => {
        return (
          <div title="" style={{ textAlign: "right" }}>
            <AuthorizationWrapper>
              <Button
                type="link"
                onClick={(event) => openEditTailingsModal(event, handleEditTailings, record)}
              >
                <img src={EDIT_PENCIL} alt="Edit" />
              </Button>
            </AuthorizationWrapper>
          </div>
        );
      },
    };
  };

  const newTSFActions = [
    {
      key: "view",
      label: "View TSF",
      icon: <EyeOutlined />,
      clickFunction: (event, record) => {
        editTailings(event, record, false);
      },
    },
    ...(canEditTSF
      ? [
          {
            key: "edit",
            label: "Edit TSF",
            icon: <EditOutlined />,
            clickFunction: (event, record) => {
              editTailings(event, record, true);
            },
          },
        ]
      : []),
  ];

  const damActions = [
    {
      key: "view",
      label: "View Dam",
      icon: <EyeOutlined />,
      clickFunction: (event, record) => {
        handleEditDam(event, record, false, false);
      },
    },
    ...(canEditTSF
      ? [
          {
            key: "edit",
            label: "Edit Dam",
            icon: <EditOutlined />,
            clickFunction: (event, record) => {
              handleEditDam(event, record, true, true);
            },
          },
        ]
      : []),
  ];

  const columns: ColumnsType<any> = [
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
    ...(tsfV2Enabled ? [renderActionsColumn({ actions: newTSFActions })] : [renderOldTSFActions()]),
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
    renderActionsColumn({ actions: damActions }),
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

export default TailingsTable;
