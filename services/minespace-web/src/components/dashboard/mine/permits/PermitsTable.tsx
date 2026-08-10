import React, { FC } from "react";
import {
  IExplosivesPermit,
  IExplosivesPermitAmendment,
  IPermit,
  IPermitAmendment,
} from "@mds/common/interfaces";
import { truncateFilename } from "@common/utils/helpers";
import { downloadFileFromDocumentManager } from "@mds/common/redux/utils/actionlessNetworkCalls";
import LinkButton from "@/components/common/LinkButton";
import * as Strings from "@/constants/strings";
import CoreTable from "@mds/common/components/common/CoreTable";
import {
  ITableAction,
  renderActionsColumn,
  renderCategoryColumn,
  renderDateColumn,
  renderTextColumn,
} from "@mds/common/components/common/CoreTableCommonColumns";
import { SortOrder } from "antd/lib/table/interface";
import { PERMIT_VIEW, VIEW_ESUP } from "@/constants/routes";
import { useHistory } from "react-router-dom";
import { Feature, isFeatureEnabled } from "@mds/common/utils/featureFlag";
import EyeOutlined from "@ant-design/icons/EyeOutlined";

const draftAmendment = "DFT";

const permitTypes = {
  ESUP: "Explosive Storage and Use",
  Permit: "Mines Act Permit",
};

interface PermitsTableProps {
  isLoaded: boolean;
  permits: IPermit[];
  explosivesPermits: IExplosivesPermit[];
  majorMineInd: boolean;
  mineGuid: string;
}

export const PermitsTable: FC<PermitsTableProps> = (props) => {
  const history = useHistory();

  const actions: ITableAction[] = [
    {
      key: "view",
      label: "View",
      clickFunction: (_event, record) => {
        _event.preventDefault();
        _event.stopPropagation();
        if (record.permit_type === permitTypes.ESUP) {
          history.push(VIEW_ESUP.dynamicRoute(props.mineGuid, record.key));
        } else {
          history.push(PERMIT_VIEW.dynamicRoute(props.mineGuid, record.permit_guid));
        }
      },
      icon: <EyeOutlined />,
    },
  ];

  const columns = [
    renderTextColumn("permit_no", "Permit No.", true),
    renderTextColumn("current_permittee", "Permittee"),
    renderTextColumn("permit_type", "Permit Type", true),
    renderCategoryColumn("permit_status_code", "Permit Status", { C: "Closed", O: "Open" }, true),
    renderDateColumn("authorization_end_date", "Authorization End Date", true),
    renderDateColumn("firstIssued", "First Issued", true),
    {
      ...renderDateColumn("lastAmended", "Last Amended", true),
      defaultSortOrder: "descend" as SortOrder,
    },
    renderActionsColumn({
      actions,
      recordActionsFilter: (record, actionList) => {
        let filteredActionList = actionList;

        // filter for feature flag and view_esup key
        if (!isFeatureEnabled(Feature.MINESPACE_ESUPS) && record.permit_type === permitTypes.ESUP) {
          filteredActionList = filteredActionList.filter((a) => a.key !== "view");
        }

        return filteredActionList;
      },
    }),
  ];

  const finalApplicationPackage = (amendment) => {
    const finalAppPackageCore =
      amendment?.now_application_documents?.length > 0
        ? amendment.now_application_documents.filter((doc) => doc.is_final_package)
        : [];
    const finalAppPackageImported =
      amendment?.imported_now_application_documents?.length > 0
        ? amendment.imported_now_application_documents.filter((doc) => doc.is_final_package)
        : [];
    return finalAppPackageCore.concat(finalAppPackageImported);
  };

  const transformExpandedPermitRowData = (amendment: IPermitAmendment, amendmentNumber) => ({
    ...amendment,
    amendmentNumber,
    maps: amendment.now_application_documents?.filter(
      (doc) => doc.now_application_document_sub_type_code === "MDO"
    ),
    permitPackage: finalApplicationPackage(amendment),
  });

  const transformRowData = (permit) => {
    const filteredAmendments = permit.permit_amendments.filter(
      (a) => a.permit_amendment_status_code !== draftAmendment
    );
    const latestAmendment = filteredAmendments[0];
    const firstAmendment = filteredAmendments[filteredAmendments.length - 1];

    return {
      ...permit,
      key: permit.permit_guid,
      permit_type: permitTypes.Permit,
      majorMineInd: props.majorMineInd,
      authorization_end_date: latestAmendment?.authorization_end_date,
      firstIssued: firstAmendment?.issue_date,
      lastAmended: latestAmendment?.issue_date,
      lastAmendedGuid: latestAmendment?.permit_amendment_guid,
      permit_amendments: filteredAmendments.map((amendment, index) =>
        transformExpandedPermitRowData(amendment, permit.permit_amendments.length - index)
      ),
    };
  };

  const transformEsupData = (esup: IExplosivesPermit) => {
    const transformEsupAmendment = (
      amendment: IExplosivesPermitAmendment | IExplosivesPermit,
      index = 0
    ) => {
      return {
        permit_no: amendment.permit_number,
        amendmentNumber: index + 1,
        current_permittee: amendment.permittee_name,
        permit_status_code: amendment.is_closed ? "C" : "O",
        issue_date: amendment.issue_date,
        description: amendment.description,
        authorization_end_date: amendment.expiry_date,
        related_documents: amendment.documents,
        permit_type: permitTypes.ESUP,
      };
    };

    let lastAmended = esup.issue_date;
    let isClosed = esup.is_closed;
    if (esup?.explosives_permit_amendments.length > 0) {
      const lastAmendment =
        esup.explosives_permit_amendments[esup.explosives_permit_amendments.length - 1];
      lastAmended = lastAmendment.issue_date;
      isClosed = lastAmendment.is_closed;
    }
    // esup amendments don't initially include 1st record as amendment
    const firstAmendment = transformEsupAmendment(esup);
    const permit_amendments: any[] = esup.explosives_permit_amendments
      .map((a, i) => transformEsupAmendment(a, i + 1))
      .reverse();
    permit_amendments.push(firstAmendment);

    return {
      ...firstAmendment,
      key: esup.explosives_permit_guid,
      permit_status_code: isClosed ? "C" : "O",
      firstIssued: esup.issue_date,
      lastAmended: lastAmended,
      permit_amendments: permit_amendments,
    };
  };

  const esupRowData = props.explosivesPermits.map((esup) => transformEsupData(esup));
  const permitRowData = props.permits.map((permit) => transformRowData(permit));

  let rowData: any[];
  if (isFeatureEnabled(Feature.MINESPACE_ESUPS)) {
    rowData = [...esupRowData, ...permitRowData];
  } else {
    rowData = permitRowData;
  }

  const expandedColumns = [
    renderTextColumn("amendmentNumber", "Amendment No."),
    renderDateColumn("issue_date", "Date Issued"),
    renderDateColumn("authorization_end_date", "Authorization End Date"),
    renderTextColumn("description", "Description"),
    {
      title: "Permit Package",
      dataIndex: "permitPackage",
      key: "permitPackage",
      render: (text) => (
        <div title="Permit Package">
          {(text &&
            text.length > 0 &&
            text.map((file) => (
              <LinkButton
                key={file.mine_document.document_manager_guid}
                onClick={() => downloadFileFromDocumentManager(file.mine_document)}
                title={file.mine_document.document_name}
              >
                <p className="wrapped-text">{truncateFilename(file.mine_document.document_name)}</p>
              </LinkButton>
            ))) ||
            Strings.EMPTY_FIELD}
        </div>
      ),
    },
    {
      title: "Permit Files",
      dataIndex: "related_documents",
      key: "documents",
      render: (text) => (
        <div title="Permit Files">
          {(text &&
            text.length > 0 &&
            text.map((file) => (
              <LinkButton
                key={file.document_manager_guid}
                onClick={() => downloadFileFromDocumentManager(file)}
                title={file.document_name}
              >
                <p className="wrapped-text">{truncateFilename(file.document_name)}</p>
              </LinkButton>
            ))) ||
            Strings.EMPTY_FIELD}
        </div>
      ),
    },
    {
      title: "UNTP Conformity Credential",
      dataIndex: "active_orgbook_publish_status",
      key: "untp_conformity_credential",
      render: (status) => {
        const credentialUrl = status?.orgbook_credential_id;

        if (!credentialUrl) {
          return Strings.EMPTY_FIELD;
        }

        return (
          <a href={credentialUrl} target="_blank" rel="noopener noreferrer" title={credentialUrl}>
            View Credential
          </a>
        );
      },
    },
  ];

  return (
    <CoreTable
      loading={!props.isLoaded}
      columns={columns}
      dataSource={rowData}
      emptyText="This mine has no permit data."
      expandProps={{
        getDataSource: (record) => record.permit_amendments,
        subTableColumns: expandedColumns,
        rowKey: "amendmentNumber",
        recordDescription: "amendment history",
      }}
    />
  );
};

export default PermitsTable;
