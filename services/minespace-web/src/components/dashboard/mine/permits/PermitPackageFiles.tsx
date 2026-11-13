import React, { FC } from "react";
import { IPermitPackageFile } from "@mds/common/interfaces";
import { downloadFileFromDocumentManager } from "@mds/common/redux/utils/actionlessNetworkCalls";
import { truncatePermitPackageLabel } from "@mds/common/utils/permitPackageDocuments";
import LinkButton from "@/components/common/LinkButton";
import * as Strings from "@/constants/strings";

interface PermitPackageFilesProps {
  files: IPermitPackageFile[];
}

// Lists the permit package files in the order the API returns them, which matches the issued permit
// Long labels are shortened (reference always kept), with the full label on hover
export const PermitPackageFiles: FC<PermitPackageFilesProps> = ({ files }) => {
  if (!files?.length) {
    return <div title="Permit Package">{Strings.EMPTY_FIELD}</div>;
  }

  return (
    <div title="Permit Package">
      <ul className="permit-file-list">
        {files.map((file) => {
          const displayLabel = truncatePermitPackageLabel(file.reference, file.title);
          return (
            <li key={file.now_application_document_xref_guid} className="wrapped-text">
              {file.mine_document?.document_manager_guid ? (
                <LinkButton
                  onClick={() => downloadFileFromDocumentManager(file.mine_document)}
                  title={file.label}
                >
                  {displayLabel}
                </LinkButton>
              ) : (
                <span title={file.label}>{displayLabel}</span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default PermitPackageFiles;
