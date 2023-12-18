import { FileOperations } from "@mds/common/models/documents/document";
import { ColumnType } from "antd/es/table";
import { IMineDocument } from "@mds/common/interfaces";

interface DocumentTableProps {
  additionalColumnProps?: { key: string; colProps: any }[];
  additionalColumns?: ColumnType<IMineDocument>[];
  archiveMineDocuments?: (mineGuid: string, mineDocumentGuids: string[]) => void;
  canArchiveDocuments?: boolean;
  defaultSortKeys?: string[];
  documentColumns?: ColumnType<unknown>[];
  documentParent?: string;
  documents: IMineDocument[];
  enableBulkActions?: boolean;
  excludedColumnKeys?: string[];
  fileOperationPermissionMap?: { operation: FileOperations; permission: string | boolean }[];
  handleRowSelectionChange?: (arg1: IMineDocument[]) => void;
  isLoaded?: boolean;
  isViewOnly?: boolean;
  onArchivedDocuments?: (docs?: IMineDocument[]) => void;
  onReplaceDocument?: (document: IMineDocument) => void;
  openDocument?: any;
  removeDocument?: (event, doc_guid: string, mine_guid: string) => void;
  replaceAlertMessage?: string;
  showVersionHistory?: boolean;
  userRoles?: string[];
  view?: "standard" | "minimal";
}

export default DocumentTableProps;
