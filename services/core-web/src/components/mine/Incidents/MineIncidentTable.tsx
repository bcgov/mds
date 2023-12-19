import React, { FC, useEffect, useState } from "react";
import { connect, useDispatch } from "react-redux";
import { Link, useHistory, withRouter } from "react-router-dom";
import { Button, Drawer, Popconfirm } from "antd";
import { CloseOutlined, EyeOutlined } from "@ant-design/icons";
import _ from "lodash";
import {
  getDropdownIncidentStatusCodeOptions,
  getHSRCMComplianceCodesHash,
  getIncidentCategoryCodeHash,
  getIncidentDeterminationHash,
  getIncidentStatusCodeHash,
} from "@mds/common/redux/selectors/staticContentSelectors";
import { dateSorter, formatDateTimeTz, optionsFilterLabelAndValue } from "@common/utils/helpers";
import * as Strings from "@mds/common/constants/strings";
import {
  IMineIncident,
  parseServerSideSearchOptions,
  serverSidePaginationOptions,
} from "@mds/common";
import { EDIT_OUTLINE_VIOLET, TRASHCAN } from "@/constants/assets";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import * as Permission from "@/constants/permissions";
import DocumentLink from "@/components/common/DocumentLink";
import CoreTable from "@mds/common/components/common/CoreTable";
import MineIncidentNotes from "@/components/mine/Incidents/MineIncidentNotes";
import { CoreTooltip } from "@/components/common/CoreTooltip";
import * as router from "@/constants/routes";
import { clearMineIncident, storeMineIncident } from "@mds/common/redux/actions/incidentActions";

const hideColumn = (condition) => (condition ? "column-hide" : "");

const renderDownloadLinks = (files, mine_incident_document_type_code) => {
  const links = files
    .filter((file) => file.mine_incident_document_type_code === mine_incident_document_type_code)
    .map((file) => (
      <div key={file.mine_document_guid}>
        <DocumentLink
          documentManagerGuid={file.document_manager_guid}
          documentName={file.document_name}
        />
      </div>
    ));
  return links && links.length > 0 ? links : false;
};

interface MineIncidentTableProps {
  incidents: IMineIncident[];
  followupActions: any[];
  handleEditMineIncident: (incident: IMineIncident) => void;
  handleDeleteMineIncident: (incident: IMineIncident) => void;
  isLoaded: boolean;
  incidentStatusCodeOptions: any[];
  history: any;
  incidentDeterminationHash: any;
  complianceCodesHash: any;
  incidentStatusCodeHash: any;
  incidentCategoryCodeHash: any;
  isDashboardView: boolean;
  handleUpdate: (searchOptions) => void;
  pageData: any;
}

const MineIncidentTable: FC<MineIncidentTableProps> = (props) => {
  const dispatch = useDispatch();
  const browserHistory = useHistory();

  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [mineIncident, setMineIncident] = useState<IMineIncident>();
  const [paginationOptions, setPaginationOptions] = useState<any>();

  const {
    isDashboardView,
    incidentStatusCodeOptions,
    incidentCategoryCodeHash,
    incidentStatusCodeHash,
    incidents,
    complianceCodesHash,
    followupActions,
    isLoaded,
    handleUpdate,
    pageData,
  } = props;

  const handleNavigateToIncident = async (record) => {
    const editIncident = incidents.find((incident) => incident.mine_incident_guid === record.key);
    await dispatch(storeMineIncident(editIncident));

    browserHistory.replace(
      router.VIEW_MINE_INCIDENT.dynamicRoute(
        editIncident.mine_guid,
        editIncident.mine_incident_guid
      )
    );

    // This is a temp fix to force the page to reload and prevent a stale data issue when deleting incident documents
    location.reload();
  };

  const transformRowData = (
    rawIncidents,
    actions,
    handleEditMineIncident,
    handleDeleteMineIncident,
    determinationHash,
    statusHash
  ) =>
    rawIncidents.map((incident) => {
      return {
        key: incident.mine_incident_guid,
        mine_guid: incident.mine_guid,
        mine_incident_report_no: incident.mine_incident_report_no,
        incident_timestamp: formatDateTimeTz(
          incident.incident_timestamp,
          incident.incident_timezone
        ),
        reported_by: incident.reported_by_name || Strings.EMPTY_FIELD,
        mine_name: incident.mine_name || Strings.EMPTY_FIELD,
        incident_status: statusHash[incident.status_code] || Strings.EMPTY_FIELD,
        determination: determinationHash[incident.determination_type_code] || Strings.EMPTY_FIELD,
        code: incident.dangerous_occurrence_subparagraph_ids || Strings.EMPTY_FIELD,
        docs: incident.documents,
        followup_action: actions.find(
          (x) =>
            x.mine_incident_followup_investigation_type_code ===
            incident.followup_investigation_type_code
        ),
        incident_types:
          incident.categories && incident.categories.length > 0
            ? incident.categories.map(
                (type) => incidentCategoryCodeHash[type.mine_incident_category_code]
              )
            : [],
        handleEditMineIncident,
        handleDeleteMineIncident,
        incident,
      };
    });

  const sortIncidentNumber = (a, b) =>
    a.incident.mine_incident_id_year - b.incident.mine_incident_id_year ||
    a.incident.mine_incident_id - b.incident.mine_incident_id;

  const toggleDrawer = (drawerMineIncident) => {
    setIsDrawerVisible(!isDrawerVisible);
    setMineIncident(drawerMineIncident);
  };

  const columns = [
    {
      title: "Number",
      key: "mine_incident_report_no",
      dataIndex: "mine_incident_report_no",
      sortField: "mine_incident_report_no",
      sorter: isDashboardView || sortIncidentNumber,
      render: (text) => <div title="Number">{text}</div>,
    },
    {
      title: "Occurred On",
      key: "incident_timestamp",
      dataIndex: "incident_timestamp",
      sortField: "incident_timestamp",
      sorter: isDashboardView || dateSorter("incident_timestamp"),
      render: (text) => <span title="Occurred On">{text}</span>,
    },
    {
      title: "Mine",
      key: "mine_name",
      dataIndex: "mine_name",
      sortField: "mine_name",
      sorter: isDashboardView,
      className: hideColumn(!isDashboardView),
      render: (text, record) => (
        <div title="Mine" className={hideColumn(!isDashboardView)}>
          <Link to={router.MINE_SUMMARY.dynamicRoute(record.incident.mine_guid)}>{text}</Link>
        </div>
      ),
    },
    {
      title: "Incident Type(s)",
      key: "incident_types",
      dataIndex: "incident_types",
      render: (text) => (
        <div title="Incident Type(s)">
          {(text && text.length > 0 && text.join(", ")) || Strings.EMPTY_FIELD}
        </div>
      ),
    },
    {
      title: "Status",
      key: "incident_status",
      dataIndex: "incident_status",
      sortField: "incident_status",
      sorter: isDashboardView || ((a, b) => a.incident_status.localeCompare(b.incident_status)),
      filtered: !isDashboardView,
      onFilter: (value, record) => record.incident.status_code === value,
      filters:
        !isDashboardView &&
        (incidentStatusCodeOptions ? optionsFilterLabelAndValue(incidentStatusCodeOptions) : []),
      render: (text) => <span title="Status">{text}</span>,
    },
    {
      title: "Inspector Responsible",
      key: "responsible_inspector_party",
      render: (text, record) => (
        <span title="Inspector Responsible">{record.incident.responsible_inspector_party}</span>
      ),
      onFilter: (value, record) => record.incident?.responsible_inspector_party === value,
      filters: _.reduce(
        incidents,
        (reporterList, incident) => {
          if (
            incident?.responsible_inspector_party &&
            !reporterList.map((x) => x.value).includes(incident.responsible_inspector_party)
          ) {
            reporterList.push({
              value: incident.responsible_inspector_party,
              text: incident.responsible_inspector_party,
            });
          }
          return reporterList;
        },
        []
      ),
    },
    {
      title: "Determination",
      key: "determination",
      dataIndex: "determination",
      sortField: "determination",
      sorter: isDashboardView,
      className: hideColumn(!isDashboardView),
      render: (text) => (
        <span title="Determination" className={hideColumn(!isDashboardView)}>
          {text}
        </span>
      ),
    },
    {
      title: "Code",
      key: "code",
      dataIndex: "code",
      className: hideColumn(!isDashboardView),
      render: (text) => (
        <span title="Incident Codes" className={hideColumn(!isDashboardView)}>
          {text.length === 0 ? (
            <span>{Strings.EMPTY_FIELD}</span>
          ) : (
            <span>
              {text.map((code) => (
                <div key={code}>{complianceCodesHash[code]}</div>
              ))}
            </span>
          )}
        </span>
      ),
    },
    {
      title: "EMLI Action",
      key: "followup_action",
      dataIndex: "followup_action",
      className: hideColumn(true),
      render: (action, record) => (
        <div title="EMLI Action" className={hideColumn(true)}>
          {action ? action.description : record.incident.followup_type_code}
        </div>
      ),
      onFilter: (value, record) => record.incident.followup_investigation_type_code === value,
      filters: followupActions.map((action) => ({
        value: action.mine_incident_followup_investigation_type_code,
        text: action.mine_incident_followup_investigation_type_code,
      })),
    },
    {
      title: "Initial Report Documents",
      key: "initialDocuments",
      dataIndex: "initialDocuments",
      className: hideColumn(isDashboardView),
      render: (text, record) => (
        <div
          title="Initial Report Documents"
          className={`${hideColumn(isDashboardView)} cap-col-height`}
        >
          {(record.docs &&
            record.docs.length > 0 &&
            renderDownloadLinks(record.docs, Strings.INCIDENT_DOCUMENT_TYPES.initial)) ||
            Strings.EMPTY_FIELD}
        </div>
      ),
    },
    {
      title: "Final Report Documents",
      key: "finalDocuments",
      dataIndex: "finalDocuments",
      className: hideColumn(isDashboardView),
      render: (text, record) => (
        <div
          title="Final Report Documents"
          className={`${hideColumn(isDashboardView)} cap-col-height`}
        >
          {(record.docs &&
            record.docs.length > 0 &&
            renderDownloadLinks(record.docs, Strings.INCIDENT_DOCUMENT_TYPES.final)) ||
            Strings.EMPTY_FIELD}
        </div>
      ),
    },
    {
      title: "",
      key: "handleEditModal",
      dataIndex: "handleEditModal",
      render: (text, record) => (
        <div className="btn--middle flex">
          <AuthorizationWrapper permission={Permission.EDIT_DO}>
            <Button
              type="primary"
              size="small"
              ghost
              onClick={() => handleNavigateToIncident(record)}
            >
              <img src={EDIT_OUTLINE_VIOLET} alt="Edit Incident" />
            </Button>
          </AuthorizationWrapper>
          <Button
            type="primary"
            size="small"
            ghost
            onClick={() =>
              props.history.push({
                pathname: router.VIEW_MINE_INCIDENT.dynamicRoute(record.mine_guid, record.key),
              })
            }
          >
            <EyeOutlined className="icon-lg icon-svg-filter" />
          </Button>
          <AuthorizationWrapper permission={Permission.ADMIN}>
            <Popconfirm
              placement="topLeft"
              title="Are you sure you want to delete this incident?"
              onConfirm={() => record.handleDeleteMineIncident(record.incident)}
              okText="Delete"
              cancelText="Cancel"
            >
              <Button ghost size="small" type="primary">
                <img src={TRASHCAN} alt="Remove Incident" />
              </Button>
            </Popconfirm>
          </AuthorizationWrapper>
        </div>
      ),
    },
  ];

  useEffect(() => {
    dispatch(clearMineIncident());
  }, []);

  useEffect(() => {
    setPaginationOptions(serverSidePaginationOptions(pageData));
  }, [pageData]);

  const handleTableUpdate = (pagination, filters, sorter) => {
    const searchOptions = parseServerSideSearchOptions(pagination, filters, sorter);
    handleUpdate(searchOptions);
  };

  return (
    <div>
      <Drawer
        title={
          <>
            Internal Communication for Mine Incident {mineIncident?.mine_incident_report_no}
            <CoreTooltip title="Anything written in Internal Communications may be requested under FOIPPA. Keep it professional and concise." />
          </>
        }
        placement="right"
        closable={false}
        onClose={toggleDrawer}
        visible={isDrawerVisible}
      >
        <Button ghost className="modal__close" onClick={toggleDrawer}>
          <CloseOutlined />
        </Button>
        <MineIncidentNotes mineIncidentGuid={mineIncident?.mine_incident_guid} />
      </Drawer>
      <CoreTable
        condition={isLoaded}
        columns={columns}
        dataSource={transformRowData(
          incidents,
          followupActions,
          props.handleEditMineIncident,
          props.handleDeleteMineIncident,
          props.incidentDeterminationHash,
          incidentStatusCodeHash
        )}
        onChange={handleTableUpdate}
        pagination={paginationOptions}
      />
    </div>
  );
};

const mapStateToProps = (state) => ({
  incidentDeterminationHash: getIncidentDeterminationHash(state),
  incidentStatusCodeHash: getIncidentStatusCodeHash(state),
  // @ts-ignore
  incidentCategoryCodeHash: getIncidentCategoryCodeHash(state, false),
  complianceCodesHash: getHSRCMComplianceCodesHash(state),
  incidentStatusCodeOptions: getDropdownIncidentStatusCodeOptions(state),
});

export default withRouter(connect(mapStateToProps)(MineIncidentTable));
