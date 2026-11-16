import React from "react";
import { IMineDocument, IPermitPackageFile } from "@mds/common/interfaces";
import { truncateFilename } from "@common/utils/helpers";
import { downloadFileFromDocumentManager } from "@mds/common/redux/utils/actionlessNetworkCalls";
import LinkButton from "@/components/common/LinkButton";
import PermitPackageFiles from "@/components/dashboard/mine/permits/PermitPackageFiles";
import * as Strings from "@/constants/strings";

// Permit Package and Permit Files columns, shared by the amendment rows of both MineSpace permit tables
export const permitFileColumns = [
  {
    title: "Permit Package",
    dataIndex: "permit_package_files",
    key: "permit_package_files",
    render: (files: IPermitPackageFile[]) => <PermitPackageFiles files={files} />,
  },
  {
    title: "Permit Files",
    dataIndex: "related_documents",
    key: "documents",
    render: (files: IMineDocument[]) => (
      <div title="Permit Files">
        {files?.length > 0 ? (
          <ul className="permit-file-list">
            {files.map((file) => (
              <li key={file.document_manager_guid} className="wrapped-text">
                <LinkButton
                  onClick={() => downloadFileFromDocumentManager(file)}
                  title={file.document_name}
                >
                  {truncateFilename(file.document_name)}
                </LinkButton>
              </li>
            ))}
          </ul>
        ) : (
          Strings.EMPTY_FIELD
        )}
      </div>
    ),
  },
];
