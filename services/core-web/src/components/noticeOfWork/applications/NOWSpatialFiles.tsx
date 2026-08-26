import React, { FC, useMemo } from "react";
import { useSelector } from "react-redux";
import SpatialDocumentTable, {
  ISpatialFocusRequest,
} from "@mds/common/components/documents/spatial/SpatialDocumentTable";
import { getSpatialBundlePurposeCodes } from "@mds/common/redux/selectors/staticContentSelectors";
import { getUserAccessData } from "@mds/common/redux/selectors/authenticationSelectors";
import { IMineDocument } from "@mds/common/interfaces";
import { ISpatialBundle } from "@mds/common/interfaces/document/spatialBundle.interface";
import { isSpatialFilename } from "@mds/common/utils/spatialFiles";
import * as Permission from "@/constants/permissions";

interface NOWSpatialFilesProps {
  filteredSubmissionDocuments: any[];
  documents?: any[];
  spatialDocumentBundles?: ISpatialBundle[];
  isViewMode: boolean;
  focusRequest?: ISpatialFocusRequest | null;
  mineGuid?: string;
}

const NOWSpatialFiles: FC<NOWSpatialFilesProps> = ({
  filteredSubmissionDocuments = [],
  documents = [],
  spatialDocumentBundles = [],
  isViewMode,
  focusRequest = null,
  mineGuid,
}) => {
  const purposeCodesAll = useSelector(getSpatialBundlePurposeCodes) || [];
  const userRoles = useSelector(getUserAccessData) || [];
  const canEdit =
    !isViewMode && userRoles.includes(Permission.EDIT_PERMITS);

  const purposeCodes = useMemo(
    () => purposeCodesAll.filter((p) => p.active_ind !== false),
    [purposeCodesAll]
  );

  const spatialDocuments: IMineDocument[] = useMemo(() => {
    const submissionDocuments = (filteredSubmissionDocuments || [])
      .filter((doc) => isSpatialFilename(doc.filename || doc.document_name))
      .map((doc) => ({
        mine_document_guid: doc.mine_document_guid,
        document_manager_guid: doc.document_manager_guid,
        document_name: doc.filename || doc.document_name,
        mine_document_bundle_id: doc.mine_document_bundle_id,
        upload_date: doc.update_timestamp || doc.upload_date,
        create_user: doc.create_user,
        mine_guid: doc.mine_guid || mineGuid,
      }));

    const addedDocuments = (documents || [])
      .map((doc) => doc.mine_document)
      .filter((mineDoc) => mineDoc && isSpatialFilename(mineDoc.document_name))
      .map((mineDoc) => ({
        mine_document_guid: mineDoc.mine_document_guid,
        document_manager_guid: mineDoc.document_manager_guid,
        document_name: mineDoc.document_name,
        mine_document_bundle_id: mineDoc.mine_document_bundle_id,
        upload_date: mineDoc.upload_date,
        create_user: mineDoc.create_user,
        mine_guid: mineDoc.mine_guid || mineGuid,
      }));

    const seen = new Set<string>();
    return [...submissionDocuments, ...addedDocuments].filter((doc) => {
      const key = doc.mine_document_guid || doc.document_manager_guid;
      if (!key || seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }, [filteredSubmissionDocuments, documents, mineGuid]);

  if (!spatialDocuments.length && !spatialDocumentBundles.length) {
    return null;
  }

  return (
    <SpatialDocumentTable
      documents={spatialDocuments}
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
