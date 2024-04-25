import { Button, Modal, Table, Typography } from "antd";
import React, { FC, useEffect, useState } from "react";
import { isEqual } from "lodash";
import { IExplosivesPermit } from "@mds/common/interfaces/permits/explosivesPermit.interface";
import DiffColumn from "../history/DiffColumn";
import { IDiffColumn } from "../history/DiffColumn.interface";

interface ExplosivesPermitDiffModalProps {
  explosivesPermit: IExplosivesPermit;
  open: boolean;
  onCancel: () => void;
}

interface IPermitDifferencesByAmendment {
  [amendmentId: string]: IDiffColumn[];
}

const ExplosivesPermitDiffModal: FC<ExplosivesPermitDiffModalProps> = ({
  explosivesPermit,
  open = false,
  onCancel,
}) => {
  const [currentDiff, setCurrentDiff] = useState<IPermitDifferencesByAmendment>({});

  const getPermitDifferences = (permit: IExplosivesPermit): IPermitDifferencesByAmendment => {
    const comparablePermit = {
      explosives_permit_amendment_id: undefined,
      ...permit,
    };

    const permitVersions = [comparablePermit, ...permit.explosives_permit_amendments].sort(
      (a, b) => a.explosives_permit_amendment_id - b.explosives_permit_amendment_id
    );

    const ignoredFields = [
      "explosives_permit_amendment_id",
      "explosives_permit_amendment_guid",
      "issuing_inspector_party_guid",
      "isAmendment",
      "amendment_no",
    ];

    return permitVersions.reduce((acc, currAmendment, i) => {
      if (i === 0) {
        acc["0"] = [];
        return acc;
      }

      const previousAmendment = permitVersions[i - 1];

      Object.entries(currAmendment).forEach(([key, newValue]) => {
        const oldValue = previousAmendment[key];

        if (
          (key === "detonator_magazines" || key === "explosive_magazines") &&
          Array.isArray(newValue)
        ) {
          for (const [idx, newVal] of newValue.entries()) {
            const oldVal = oldValue[idx];

            if (!isEqual(newVal, oldVal)) {
              if (!acc[currAmendment.explosives_permit_amendment_id]) {
                acc[currAmendment.explosives_permit_amendment_id] = [];
              }

              for (const [magazineKey, magazineValue] of Object.entries(newVal)) {
                const oldMagazineValue = oldVal?.[magazineKey];
                const ignoredMagazineFields = [
                  "explosives_permit_amendment_magazine_id",
                  "explosives_permit_amendment_magazine_type_code",
                  "explosives_permit_magazine_id",
                  "explosives_permit_magazine_type_code",
                ];

                if (
                  magazineValue !== oldMagazineValue &&
                  !ignoredMagazineFields.includes(magazineKey)
                ) {
                  const fieldPrefix =
                    key === "detonator_magazines" ? "Detonator Magazine" : "Explosive Magazine";
                  const diff: IDiffColumn = {
                    field_name: `${fieldPrefix} ${idx} - ${magazineKey}`,
                    from: oldMagazineValue,
                    to: magazineValue,
                  };
                  acc[currAmendment.explosives_permit_amendment_id].push(diff);
                }
              }
            }
          }

          return;
        }

        if (typeof newValue === "object" && newValue !== null) {
          return;
        }

        if (!acc[currAmendment.explosives_permit_amendment_id]) {
          acc[currAmendment.explosives_permit_amendment_id] = [];
        }

        if (newValue !== oldValue && !ignoredFields.includes(key)) {
          const diff: IDiffColumn = {
            field_name: key,
            from: oldValue,
            to: newValue,
          };

          acc[currAmendment.explosives_permit_amendment_id].push(diff);
        }
      });

      const amendmentDocuments = currAmendment.documents.map((doc) => doc.document_name);
      if (amendmentDocuments && amendmentDocuments.length > 0) {
        acc[currAmendment.explosives_permit_amendment_id].push({
          field_name: "Documents",
          from: [],
          to: amendmentDocuments,
        });
      }
      return acc;
    }, {});
  };

  useEffect(() => {
    if (explosivesPermit) {
      const differencesList = getPermitDifferences(explosivesPermit);
      setCurrentDiff(differencesList);
    }
  }, [explosivesPermit]);

  const columns = [
    {
      title: "Notice of Work #",
      dataIndex: "now_number",
      key: "now_number",
    },
    {
      title: "Status",
      key: "is_closed",
      render: (record: any) => {
        return record.is_closed ? "Closed" : "Open";
      },
    },
    {
      title: "Amendment",
      key: "amendment_no",
      dataIndex: "amendment_no",
    },
    {
      title: "Changes",
      dataIndex: "differences",
      key: "differences",
      render: (differences: IDiffColumn[]) => {
        return <DiffColumn differences={differences} />;
      },
    },
  ];

  const data = Object.keys(currentDiff)
    .map((key: any, index: number) => {
      const amendment = explosivesPermit.explosives_permit_amendments.find(
        (amendment) => amendment.explosives_permit_amendment_id == key
      );

      const permit = key === "0" ? explosivesPermit : amendment;

      return {
        ...permit,
        differences: currentDiff[key].length > 0 ? currentDiff[key] : [{ field_name: "None" }],
      };
    })
    .reverse();

  return (
    <Modal
      title="Explosive Storage and Use Permit History"
      open={open}
      onCancel={onCancel}
      footer={[
        <Button key="back" onClick={onCancel}>
          Close
        </Button>,
      ]}
      width={1000}
    >
      <Typography.Title level={3}>View History</Typography.Title>
      <Typography.Paragraph>
        You are viewing the past history of explosive storage and use permits for this permit (
        <Typography.Text strong>Permit #</Typography.Text> {explosivesPermit.permit_number})
      </Typography.Paragraph>
      <Table
        className="diff-table"
        rowClassName="diff-table-row"
        pagination={false}
        columns={columns}
        dataSource={data}
        rowKey="explosives_permit_amendment_id"
      />
    </Modal>
  );
};

export default ExplosivesPermitDiffModal;
