import { FileOperations, MineDocument } from "@mds/common/models/documents/document";
import { ColumnType } from "antd/es/table";

interface DocumentTableProps {
  additionalColumnProps?: { key: string; colProps: any }[];
  additionalColumns?: ColumnType<MineDocument>[];
  archiveMineDocuments?: (mineGuid: string, mineDocumentGuids: string[]) => void;
  canArchiveDocuments?: boolean;
  defaultSortKeys?: string[];
  documentColumns?: ColumnType<unknown>[];
  documentParent?: string;
  documents: MineDocument[];
  enableBulkActions?: boolean;
  excludedColumnKeys?: string[];
  fileOperationPermissionMap?: { operation: FileOperations; permission: string | boolean }[];
  handleRowSelectionChange?: (arg1: MineDocument[]) => void;
  isLoaded?: boolean;
  isViewOnly?: boolean;
  onArchivedDocuments?: (docs?: MineDocument[]) => void;
  onReplaceDocument?: (document: MineDocument) => void;
  openDocument?: any;
  removeDocument?: (event, doc_guid: string, mine_guid: string) => void;
  replaceAlertMessage?: string;
  showVersionHistory?: boolean;
  userRoles?: string[];
  view?: "standard" | "minimal";
  openModal?: (arg1: any) => void;
  closeModal?: (arg1: any) => void;
}

export default DocumentTableProps;
