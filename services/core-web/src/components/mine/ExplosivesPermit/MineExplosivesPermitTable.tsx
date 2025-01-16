import React, { FC } from "react";
import { RouteComponentProps, withRouter } from "react-router-dom";
import { useSelector } from "react-redux";
import { Col, Row, Typography } from "antd";
import { DeleteOutlined, EditOutlined, EyeOutlined } from "@ant-design/icons";
import * as Strings from "@mds/common/constants/strings";
import CoreTable from "@mds/common/components/common/CoreTable";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import * as Permission from "@/constants/permissions";
import { CoreTooltip } from "@/components/common/CoreTooltip";
import {
  IExplosivesPermit,
  IExplosivesPermitAmendment,
} from "@mds/common/interfaces";
import { ColumnType } from "antd/lib/table";
import moment from "moment-timezone";
import {
  ITableAction,
  renderDateColumn,
  renderTextColumn,
} from "@mds/common/components/common/CoreTableCommonColumns";
import ActionMenu, {
  deleteConfirmWrapper,
} from "@mds/common/components/common/ActionMenu";
import { userHasRole } from "@mds/common/redux/reducers/authenticationReducer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFiles } from "@fortawesome/pro-light-svg-icons";
import { COLOR } from "@/constants/styles";
import { ColumnsType } from "antd/es/table";
import { ESUP_DOCUMENT_GENERATED_TYPES } from "@mds/common/constants/strings";

interface MineExplosivesPermitTableProps {
  data: IExplosivesPermit[];
  isLoaded: boolean;
  handleOpenExplosivesPermitDecisionModal: (event, record: IExplosivesPermit) => void;
  handleDeleteExplosivesPermit: (event, record: IExplosivesPermit) => void;
  handleOpenEditExplosivesPermitModal: (
    event,
    record: IExplosivesPermit,
    actionKey: string
  ) => void;
  isPermitTab: boolean;
  explosivesPermitDocumentTypeOptionsHash: any;
  explosivesPermitStatusOptionsHash: any;
  handleOpenViewMagazineModal: (event, record: IExplosivesPermit, type: string) => void;
  handleOpenViewExplosivesPermitModal: (event, record: IExplosivesPermit) => void;
  handleOpenAmendExplosivesPermitModal: (event, record: IExplosivesPermit) => void;
}

type MineExplosivesTableItem = (IExplosivesPermit | IExplosivesPermitAmendment) & {
  key: string;
  isExpired: boolean;
};

const transformRowData = (permits: IExplosivesPermit[]) => {
  return permits.map((permit) => {
    const mostRecentVersion =
      permit.explosives_permit_amendments.length > 0
        ? permit.explosives_permit_amendments[permit.explosives_permit_amendments.length - 1]
        : permit;

    const amendments = [...permit.explosives_permit_amendments, permit];

    return {
      ...mostRecentVersion,
      explosives_permit_amendments: amendments,
      key: mostRecentVersion.explosives_permit_guid,
      documents: mostRecentVersion.documents,
      isExpired: mostRecentVersion.expiry_date && moment(mostRecentVersion.expiry_date).isBefore(),
    };
  });
};

const MineExplosivesPermitTable: FC<RouteComponentProps & MineExplosivesPermitTableProps> = ({
  data,
  isLoaded,
  isPermitTab,
  explosivesPermitDocumentTypeOptionsHash,
  explosivesPermitStatusOptionsHash,
  handleOpenViewMagazineModal,
  handleOpenViewExplosivesPermitModal,
  ...props
}) => {
  const isAdmin = useSelector((state) => userHasRole(state, Permission.ADMIN));
  const editIcon = <EditOutlined />;
  const viewIcon = <EyeOutlined />;

  const viewPermitAction: ITableAction = {
    key: "view",
    label: "View",
    clickFunction: handleOpenViewExplosivesPermitModal,
    icon: viewIcon,
  };

  const editPermitFunction = (actionKey) => (event, permitRecord) =>
    props.handleOpenEditExplosivesPermitModal(event, permitRecord, actionKey);

  const editDocumentAction: ITableAction = {
    key: "edit_documents",
    label: "Edit Documents",
    clickFunction: editPermitFunction("edit_documents"),
    icon: editIcon,
  };
  const editPermitAction: ITableAction = {
    key: "edit",
    label: "Edit Draft",
    clickFunction: editPermitFunction("edit"),
    icon: editIcon,
  };
  const processPermitAction: ITableAction = {
    key: "process",
    label: "Process",
    clickFunction: props.handleOpenExplosivesPermitDecisionModal,
    icon: editIcon,
  };
  const amendPermitAction: ITableAction = {
    key: "amend",
    label: "Create Amendment",
    clickFunction: props.handleOpenAmendExplosivesPermitModal,
    icon: editIcon,
  };

  const actionsColumn = (type?: "permit" | "amendment"): ColumnType<MineExplosivesTableItem> => {
    return {
      title: "",
      key: "addEditButton",
      align: "right",
      render: (record) => {
        const isApproved = record.application_status === "APP";
        const isProcessed = record.application_status !== "REC";
        const hasDocuments =
          record.documents?.filter((doc) =>
            Object.keys(ESUP_DOCUMENT_GENERATED_TYPES).includes(
              doc.explosives_permit_document_type_code
            )
          )?.length > 0;
        const isCoreSource = record.originating_system === "Core";

        const approvedMenu: ITableAction[] = [viewPermitAction, editDocumentAction, amendPermitAction];
        const menu: ITableAction[] = !isProcessed
          ? [viewPermitAction, processPermitAction, editPermitAction]
          : [];
        const deleteAction: ITableAction = {
          key: "delete",
          label: "Delete",
          clickFunction: (event) => {
            deleteConfirmWrapper(
              `Explosives Storage & Use Permit${isPermitTab ? "" : " Application"}`,
              () => props.handleDeleteExplosivesPermit(event, record)
            );
          },
          icon: <DeleteOutlined />,
        };

        const currentMenu = isApproved ? approvedMenu : menu;
        const showActions = !isApproved || (isApproved && isPermitTab);
        const showDelete =
          (isAdmin &&
            record.application_status !== "APP" &&
            record.amendment_count === 0 &&
            !isPermitTab) ||
          (isApproved && isPermitTab);

        if (showDelete) {
          currentMenu.push(deleteAction);
        }

        return (
          <div className="btn--middle flex">
            {isApproved && !hasDocuments && isCoreSource && (
              <AuthorizationWrapper permission={Permission.EDIT_EXPLOSIVES_PERMITS}>
              </AuthorizationWrapper>
            )}
            {showActions && (
              <AuthorizationWrapper permission={Permission.EDIT_EXPLOSIVES_PERMITS}>
                <ActionMenu
                  record={record}
                  actionItems={type === "amendment" ? [viewPermitAction] : currentMenu}
                  category="ESUP"
                />
              </AuthorizationWrapper>
            )}
          </div>
        );
      },
    };
  };

  const esupCommonColumns = (
    type: "permit" | "amendment"
  ): ColumnsType<MineExplosivesTableItem> => {
    return [
      {
        title: "Status",
        key: "is_closed",
        render: (record) => {
          return <Typography.Text>{record.is_closed ? "Closed" : "Open"}</Typography.Text>;
        },
      },
      renderDateColumn("expiry_date", "Expiry Date", false, null, Strings.EMPTY_FIELD),
      {
        title: (
          <Row>
            <Typography.Text className="margin-medium--right">Explosives</Typography.Text>
            <CoreTooltip
              title="This is the total quantity stored on site. Click to view more details"
              icon="question"
              iconColor={COLOR.darkGrey}
            />
          </Row>
        ),
        key: "total_explosive_quantity",
        dataIndex: "total_explosive_quantity",
        render: (text, record) => (
          <div
            className="underline"
            onClick={(event) => handleOpenViewMagazineModal(event, record, "EXP")}
          >
            {text || "0"} kg
          </div>
        ),
      },
      {
        title: (
          <Row>
            <Typography.Text className="margin-medium--right">Detonators</Typography.Text>
            <CoreTooltip
              title="This is the total quantity stored on site. Click to view more details"
              icon="question"
              iconColor={COLOR.darkGrey}
            />
          </Row>
        ),
        key: "total_detonator_quantity",
        dataIndex: "total_detonator_quantity",
        render: (text, record) => (
          <div
            className="underline"
            onClick={(event) => handleOpenViewMagazineModal(event, record, "DET")}
          >
            {text || "0"} units
          </div>
        ),
      },
      actionsColumn(type),
    ];
  };

  const columns: ColumnType<MineExplosivesTableItem>[] = [
    {
      title: "ESUP #",
      key: "permit_number",
      render: (record) => {
        return (
          <Row justify="space-between">
            <Col>
              <Typography.Text>{record.permit_number || Strings.EMPTY_FIELD}</Typography.Text>
            </Col>
            {record.amendment_count > 0 && (
              <Col className="amendments-badge">
                <FontAwesomeIcon icon={faFiles} />
                {record.amendment_count}
              </Col>
            )}
          </Row>
        );
      },
    },
    renderTextColumn("mines_permit_number", "Mines Act Permit #"),
    renderTextColumn("now_number", "Notice of Work #"),
    renderTextColumn("amendment_count", "Amendments"),
    ...esupCommonColumns("permit"),
  ];

  const amendmentDetailColumns: ColumnType<MineExplosivesTableItem>[] = [
    renderTextColumn("amendment_no", "Amendment"),
    ...esupCommonColumns("amendment"),
  ];

  return (
    <CoreTable
      condition={isLoaded}
      dataSource={transformRowData(data)}
      classPrefix="explosives-permits"
      columns={columns}
      expandProps={{
        rowExpandable: (record: IExplosivesPermit) => record.amendment_count > 0,
        recordDescription: "amendment details",
        getDataSource: (record: IExplosivesPermit) =>
          record.explosives_permit_amendments.sort((a, b) => b.amendment_no - a.amendment_no),
        subTableColumns: amendmentDetailColumns,
      }}
    />
  );
};

export default withRouter(MineExplosivesPermitTable);
