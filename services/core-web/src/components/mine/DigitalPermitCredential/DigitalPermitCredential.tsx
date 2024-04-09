import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { IPermit, VC_CONNECTION_STATES } from "@mds/common";
import CoreTable from "@mds/common/components/common/CoreTable";
import { useHistory, useParams } from "react-router-dom";
import { getPermits } from "@mds/common/redux/selectors/permitSelectors";
import { ColumnsType } from "antd/es/table";
import {
  renderActionsColumn,
  renderDateColumn,
  renderTextColumn,
} from "@mds/common/components/common/CoreTableCommonColumns";
import { MINE_PERMIT_DIGITAL_CREDENTIALS } from "@/constants/routes";

export const DigitalPermitCredential = () => {
  const history = useHistory();
  const { id: mineGuid } = useParams<{ id: string }>();
  const [verifiableCredentialPermits, setVerifiableCredentialPermits] = useState<IPermit[]>([]);

  const permits = useSelector((state) => getPermits(state));

  useEffect(() => {
    if (permits && permits.length > 0) {
      setVerifiableCredentialPermits(
        permits.filter(
          ({ current_permittee_digital_wallet_connection_state }) =>
            !!current_permittee_digital_wallet_connection_state
        )
      );
    }
  }, [permits]);

  const COLUMNS: ColumnsType<IPermit> = [
    renderTextColumn("permit_no", "Permit No."),
    {
      key: "current_permittee_digital_wallet_connection_state",
      title: "Status",
      dataIndex: "current_permittee_digital_wallet_connection_state",
      render: (text) => <div>{VC_CONNECTION_STATES[text]}</div>,
    },
    renderTextColumn("current_permittee", "Permitee Name"),
    renderDateColumn("lastIssued", "Last Issued"),
    renderActionsColumn({
      actions: [
        {
          key: "view_credential",
          label: "View",
          clickFunction: (event, permit: IPermit) => {
            history.push(
              MINE_PERMIT_DIGITAL_CREDENTIALS.dynamicRoute(mineGuid, permit.permit_guid)
            );
          },
        },
      ],
    }),
  ];

  const transformRowData = () => {
    return verifiableCredentialPermits.map((permit) => {
      const filteredAmendments = permit.permit_amendments.filter(
        (a) => a.permit_amendment_status_code !== "DFT"
      );
      const latestAmendment = filteredAmendments[0];

      return {
        ...permit,
        key: permit.permit_guid,
        lastIssued: latestAmendment.issue_date,
      };
    });
  };

  return (
    <div>
      <br />
      <div className="inline-flex between">
        <h4 className="uppercase">Digital Permit Credentials</h4>
      </div>
      <br />
      <CoreTable columns={COLUMNS} dataSource={transformRowData()} />
    </div>
  );
};

export default DigitalPermitCredential;
