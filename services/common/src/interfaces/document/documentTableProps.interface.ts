import { FileOperations, MineDocument } from "@mds/common/models/documents/document";
import { ColumnType } from "antd/es/table";

export interface GenericDocTableProps<T> {
  additionalColumnProps?: { key: string; colProps: any }[];
  additionalColumns?: ColumnType<T>[];
  archiveMineDocuments?: (mineGuid: string, mineDocumentGuids: string[]) => void;
  canArchiveDocuments?: boolean;
  defaultSortKeys?: string[];
  documentColumns?: ColumnType<unknown>[];
  documentParent?: string;
  documents: any[];
  enableBulkActions?: boolean;
  excludedColumnKeys?: string[];
  fileOperationPermissionMap?: { operation: FileOperations; permission: string | boolean }[];
  handleRowSelectionChange?: (arg1: T[]) => void;
  isLoaded?: boolean;
  isViewOnly?: boolean;
  onArchivedDocuments?: (docs?: T[]) => void;
  onReplaceDocument?: (document: T) => void;
  openDocument?: any;
  removeDocument?: (event, doc_guid: string, mine_guid: string) => void;
  replaceAlertMessage?: string;
  showVersionHistory?: boolean;
  userRoles?: string[];
  view?: "standard" | "minimal";
  openModal?: (arg1: any) => void;
  closeModal?: (arg1: any) => void;
}

interface DocumentTableProps extends GenericDocTableProps<MineDocument> {
  documents: MineDocument[];
}

export default DocumentTableProps;
