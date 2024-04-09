import React, { FC } from "react";
import { connect } from "react-redux";
import {
  Feature,
  IExplosivesPermit,
  IExplosivesPermitAmendment,
  IPermit,
  IPermitAmendment,
  isFeatureEnabled,
} from "@mds/common";
import { openModal, closeModal } from "@mds/common/redux/actions/modalActions";
import { truncateFilename } from "@common/utils/helpers";
import { getDropdownPermitStatusOptions } from "@mds/common/redux/selectors/staticContentSelectors";
import { downloadFileFromDocumentManager } from "@common/utils/actionlessNetworkCalls";
import LinkButton from "@/components/common/LinkButton";
import * as Strings from "@/constants/strings";
import CoreTable from "@mds/common/components/common/CoreTable";
import {
  renderActionsColumn,
  renderCategoryColumn,
  renderDateColumn,
  renderTextColumn,
} from "@mds/common/components/common/CoreTableCommonColumns";
import { SortOrder } from "antd/lib/table/interface";
import { VIEW_ESUP } from "@/constants/routes";
import { useHistory } from "react-router-dom";
import { useParams } from "react-router-dom";

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
  openModal: (value: any) => void;
  closeModal: (value: any) => void;
}

export const PermitsTable: FC<PermitsTableProps> = (props) => {
  const history = useHistory();
  const { id } = useParams<{ id: string }>();

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
  ];

  const handleOpenViewEsup = (event, record: any) => {
    event.preventDefault();
    event.stopPropagation();
    history.push(VIEW_ESUP.dynamicRoute(id, record.key));
  };

  if (isFeatureEnabled(Feature.MINESPACE_ESUPS)) {
    const actions = [
      {
        key: "view_esup",
        label: "View",
        clickFunction: (event, esup: IExplosivesPermit) => {
          handleOpenViewEsup(event, esup);
        },
      },
    ];

    const filterActions = (record, actionList) => {
      let filteredActionList = actionList;

      // filter for feature flag and view_esup key
      if (!isFeatureEnabled(Feature.MINESPACE_ESUPS) || record.permit_type !== permitTypes.ESUP) {
        filteredActionList = filteredActionList.filter((a) => a.key !== "view_esup");
      }

      return filteredActionList;
    };

    const actionColumn = renderActionsColumn({ actions, recordActionsFilter: filterActions });
    columns.push(actionColumn);
  }

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

const mapStateToProps = (state) => ({
  permitStatusOptions: getDropdownPermitStatusOptions(state),
});

const mapDispatchToProps = {
  openModal,
  closeModal,
};

export default connect(mapStateToProps, mapDispatchToProps)(PermitsTable);
