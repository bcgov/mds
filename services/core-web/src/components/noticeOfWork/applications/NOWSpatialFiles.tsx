import React, { FC, useMemo } from "react";
import { useSelector } from "react-redux";
import SpatialDocumentTable, {
  ISpatialFocusRequest,
} from "@mds/common/components/documents/spatial/SpatialDocumentTable";
import { getSpatialBundlePurposeCodes } from "@mds/common/redux/selectors/staticContentSelectors";
import { getUserAccessData } from "@mds/common/redux/selectors/authenticationSelectors";
import { ISpatialBundle } from "@mds/common/interfaces/document/spatialBundle.interface";
import * as Permission from "@/constants/permissions";

interface NOWSpatialFilesProps {
  spatialDocumentBundles?: ISpatialBundle[];
  isViewMode: boolean;
  focusRequest?: ISpatialFocusRequest | null;
  mineGuid?: string;
}

const NOWSpatialFiles: FC<NOWSpatialFilesProps> = ({
  spatialDocumentBundles = [],
  isViewMode,
  focusRequest = null,
  mineGuid,
}) => {
  const purposeCodesAll = useSelector(getSpatialBundlePurposeCodes) || [];
  const userRoles = useSelector(getUserAccessData) || [];
  const canEdit = !isViewMode && userRoles.includes(Permission.EDIT_PERMITS);

  const purposeCodes = useMemo(
    () => purposeCodesAll.filter((p) => p.active_ind !== false),
    [purposeCodesAll]
  );

  if (!spatialDocumentBundles.length) {
    return null;
  }

  return (
    <SpatialDocumentTable
      documents={[]}
      spatialBundles={spatialDocumentBundles}
      title="Spatial Files"
      showCountBadge
      collapsible
      showValidation
      showType
      purposeCodes={purposeCodes}
      canEditPurposes={canEdit}
      showPreviewShape
      showDetails
      compactColumns
      focusRequest={focusRequest}
      mineGuid={mineGuid}
      description="A read-only view of spatial files detected during import. Mine Boundary selections are preserved when a bundle is re-synced. To replace or archive a file, use the Application Documents table below."
      emptyText="No spatial files detected on this application."
    />
  );
};

export default NOWSpatialFiles;
