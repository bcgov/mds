import { USER_ROLES } from "@mds/common/constants/environment";
import { IMineDocument, IMineDocumentVersion } from "@mds/common/interfaces";
import { isFeatureEnabled, Feature } from "@mds/common/utils";
import { MAJOR_MINES_APPLICATION_DOCUMENT_SUBTYPE_CODE } from "@mds/common/constants/strings";
import { UNIQUELY_SPATIAL } from "@mds/common/constants/fileTypes";

export enum FileOperations {
  View = "Open in document viewer",
  Download = "Download file",
  Replace = "Replace file",
  Archive = "Archive file",
  Delete = "Delete",
}

export class MineDocumentVersion {
  public mine_document_guid: string;

  public mine_document_version_guid: string;

  public mine_guid: string;

  public document_manager_guid: string;

  public document_manager_version_guid: string;

  public document_name: string;

  public upload_date: string;

  public create_user: string;

  public update_user: string;

  public update_timestamp: string;

  public allowed_actions: FileOperations[];

  // A replaced file keeps the category/type of the document it belongs to,
  // not its own independent metadata, so these are inherited from the parent.
  public category?: string;

  public category_code?: string;

  public file_type: string;

  constructor(jsonObject: any) {
    this.mine_document_guid = jsonObject.mine_document_guid;
    this.mine_document_version_guid = jsonObject.mine_document_version_guid;
    this.mine_guid = jsonObject.mine_guid;
    this.document_manager_guid = jsonObject.document_manager_guid;
    this.document_manager_version_guid = jsonObject.document_manager_version_guid;
    this.document_name = jsonObject.document_name;
    this.upload_date = jsonObject.upload_date;
    this.create_user = jsonObject.create_user;
    this.update_user = jsonObject.update_user;
    this.update_timestamp = jsonObject.update_timestamp;
    this.allowed_actions = jsonObject.allowed_actions;
    this.category = jsonObject.category;
    this.category_code = jsonObject.category_code;
    this.file_type = this.getFileType();
  }

  public getFileType() {
    const index = this.document_name.lastIndexOf(".");
    return index === -1 ? null : this.document_name.substring(index).toLocaleLowerCase();
  }
}

/*
A base class for Mine Documents

There is an issue with antd where sorting a table that has children (ie matchChildColumnsToParent)
will transform the records into type <any> (with versions still maintaining their type) so properties accessed
by the table should be *set* to the specific object, cannot expect to be able to consistently call its methods

include "user_roles" property in the json used in the constructor to set allowed actions based on the user
*/
export class MineDocument implements IMineDocument {
  public category_code: string;

  public mine_document_guid: string;

  public mine_guid: string;

  public document_manager_guid: string;

  public document_name: string;

  public create_user: string;

  public update_user: string;

  public upload_date: string;

  public update_timestamp: string;

  public is_archived: boolean;

  public archived_by: string;

  public archived_date: string;

  public is_latest_version: boolean;

  public category?: string;

  public label?: string;

  // generated
  public key: string;

  public file_type: string;

  public number_prev_versions: number;

  public versions: IMineDocumentVersion[]; // all previous file versions, not including latest

  public allowed_actions: FileOperations[];

  public entity_title: string;

  public document_manager_version_guid?: string;

  public mine_document_bundle_id?: string;

  constructor(jsonObject: any) {
    this.mine_document_guid = jsonObject.mine_document_guid;
    this.mine_guid = jsonObject.mine_guid;
    this.document_manager_guid = jsonObject.document_manager_guid;
    this.document_name = jsonObject.document_name;
    this.create_user = jsonObject.create_user;
    this.update_user = jsonObject.update_user;
    this.upload_date = jsonObject.upload_date;
    this.update_timestamp = jsonObject.update_timestamp;
    this.category = jsonObject.category;
    this.is_archived = jsonObject.is_archived ?? false;
    this.archived_by = jsonObject.archived_by;
    this.archived_date = jsonObject.archived_date;
    this.is_latest_version = jsonObject.is_latest_version ?? true;
    this.entity_title = jsonObject.entity_title ?? "";
    this.document_manager_version_guid = jsonObject.document_manager_version_guid ?? undefined;
    this.setCalculatedProperties(jsonObject);
    this.mine_document_bundle_id = jsonObject?.mine_document_bundle_id ?? undefined;
  }

  protected makeChild(params: any, _constructorArgs: any) {
    return new MineDocumentVersion(params);
  }

  protected setCalculatedProperties(jsonObject: any) {
    this.key = this.is_latest_version
      ? this.mine_document_guid
      : jsonObject.document_manager_version_guid;
    this.file_type = this.getFileType();

    const versions = jsonObject.versions ?? [];
    if (this.is_latest_version && versions.length) {
      this.number_prev_versions = versions.length;
      this.versions = versions
        .map((version: MineDocument) =>
          this.makeChild(
            {
              ...version,
              mine_guid: jsonObject.mine_guid,
              is_latest_version: false,
              mine_document_guid: this.mine_document_guid,
              document_manager_guid: this.document_manager_guid,
              allowed_actions: this.getAllowedActions(jsonObject.user_roles, false).filter(Boolean),
              category: this.category,
              category_code: this.category_code,
            },
            jsonObject
          )
        )
        .reverse();
    } else {
      this.number_prev_versions = 0;
      this.versions = [];
    }
    this.setAllowedActions(jsonObject.user_roles);
  }

  public getFileType() {
    const index = this.document_name.lastIndexOf(".");
    return index === -1 ? null : this.document_name.substring(index).toLocaleLowerCase();
  }

  public setAllowedActions(userRoles: string[] = []) {
    this.allowed_actions = this.getAllowedActions(userRoles).filter(Boolean);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected getAllowedActions(
    _userRoles: string[] = [],
    is_latest_version: boolean = this.is_latest_version
  ) {
    const canModify = is_latest_version && !this.is_archived && this.mine_document_guid;
    const canView = this.file_type === ".pdf" && this.document_manager_guid;
    return [
      canView && FileOperations.View,
      FileOperations.Download,
      isFeatureEnabled(Feature.DOCUMENTS_REPLACE_FILE) && canModify && FileOperations.Replace,
      canModify && FileOperations.Archive,
      canModify && FileOperations.Delete,
    ];
  }
}

export class MajorMineApplicationDocument extends MineDocument {
  public project_summary_document_xref: { project_summary_document_type_code: string };

  public project_decision_package_document_xref: {
    project_decision_package_document_type_code: string;
  };

  public information_requirements_table_document_xref: {
    information_requirements_table_document_type_code: string;
  };

  public major_mine_application_document_xref: {
    major_mine_application_document_type_code: string;
    major_mine_application_document_subtype_code?: string;
  };

  public major_mine_application_document_type_code: string;
  public major_mine_application_document_subtype_code: string;
  public label: string | undefined;

  constructor(jsonObject: any) {
    super(jsonObject);
    const typeCode = jsonObject.major_mine_application_document_type_code ?? jsonObject.major_mine_application_document_xref?.major_mine_application_document_type_code;
    const subtypeCode = jsonObject.major_mine_application_document_subtype_code ?? jsonObject.major_mine_application_document_xref?.major_mine_application_document_subtype_code;
    this.major_mine_application_document_type_code = typeCode;
    if (subtypeCode) {
      this.major_mine_application_document_subtype_code = subtypeCode;
      this.label = this.getSubtypeLabel(
        typeCode,
        subtypeCode
      );
    } else {
      this.label = undefined;
    }
    this.category_code = this.determineCategoryCode(jsonObject);
  }

  protected determineCategoryCode(jsonObject: any): string | undefined {
    const {
      project_summary_document_xref,
      project_decision_package_document_xref,
      information_requirements_table_document_xref,
      major_mine_application_document_xref,
    } = jsonObject;

    return (
      project_summary_document_xref?.project_summary_document_type_code ??
      project_decision_package_document_xref?.project_decision_package_document_type_code ??
      information_requirements_table_document_xref?.information_requirements_table_document_type_code ??
      major_mine_application_document_xref?.major_mine_application_document_type_code
    );
  }

  private getSubtypeLabel(typeCode: string, subtypeCode: string): string | undefined {
    const subtypes = MAJOR_MINES_APPLICATION_DOCUMENT_SUBTYPE_CODE[typeCode];
    if (subtypes && subtypes[subtypeCode]) {
      return subtypes[subtypeCode];
    }

    return undefined;
  }

  public getAllowedActions(userRoles: string[] = []) {
    const allowedActions = super.getAllowedActions();

    const canModifyRoles = [
      USER_ROLES.role_edit_major_mine_applications,
      USER_ROLES.role_minespace_proponent,
    ];
    const canModify = userRoles.some((role) => canModifyRoles.includes(role));

    return allowedActions.filter(
      (action) => canModify || [FileOperations.View, FileOperations.Download].includes(action)
    );
  }
}

// Matches NOW_SPATIAL_FILE_EXTENSIONS in core-api (app/api/constants.py). Spatial files can be archived but not replaced.
export const NOW_SPATIAL_FILE_EXTENSIONS = [...Object.keys(UNIQUELY_SPATIAL), ".shp.xml"];

const NOW_APPLICATION_LOCKED_STATUS_CODES = ["AIA", "REJ", "WDN", "NPR"];
const NOW_APPLICATION_DOCUMENT_SUB_TYPE_CODES = ["AAF", "MDO", "SDO"];
const NOW_GOVERNMENT_DOCUMENT_SUB_TYPE_CODE = "GDO";

/*
A document on a Notice of Work application's Manage Documents page.

Replace and Archive follow the same rules core-api enforces (now_document_file_management.py).
Previous versions can only be downloaded, as the document viewer always opens the latest version of a file.
Delete is not offered here, the NoW tables keep their own delete button.

Expects the mine_document fields flattened onto the json alongside the xref fields.
*/
export class NoWApplicationDocument extends MineDocument {
  public now_application_document_xref_guid: string;

  public now_application_document_sub_type_code: string;

  public is_final_package: boolean;

  public is_referral_package: boolean;

  public is_consultation_package: boolean;

  public is_system_generated: boolean;

  // vFCBC submission documents (now_application_document_identity_xref) have no sub type code
  public is_imported_submission_document: boolean;

  public now_application_status_code: string;

  public is_delayed: boolean;

  public is_view_mode: boolean;

  constructor(jsonObject: any) {
    super(jsonObject);
    this.now_application_document_xref_guid = jsonObject.now_application_document_xref_guid;
    this.now_application_document_sub_type_code = jsonObject.now_application_document_sub_type_code;
    this.is_final_package = jsonObject.is_final_package ?? false;
    this.is_referral_package = jsonObject.is_referral_package ?? false;
    this.is_consultation_package = jsonObject.is_consultation_package ?? false;
    this.is_system_generated = jsonObject.is_system_generated ?? false;
    this.is_imported_submission_document = jsonObject.is_imported_submission_document ?? false;
    this.now_application_status_code = jsonObject.now_application_status_code;
    this.is_delayed = jsonObject.is_delayed ?? false;
    this.is_view_mode = jsonObject.is_view_mode ?? false;
    // MineDocument works out allowed actions inside its own constructor, before the fields above are set, so we have to work them out again
    this.setAllowedActions(jsonObject.user_roles);
  }

  protected getAllowedActions(
    userRoles: string[] = [],
    is_latest_version: boolean = this.is_latest_version
  ) {
    const canView = is_latest_version && this.file_type === ".pdf" && this.document_manager_guid;
    const canChange = is_latest_version && this.canChangeFile(userRoles);
    return [
      canView && FileOperations.View,
      FileOperations.Download,
      canChange && !this.isSpatialFile() && FileOperations.Replace,
      canChange && FileOperations.Archive,
    ];
  }

  private canChangeFile(userRoles: string[]) {
    // Not set yet while MineDocument's constructor runs
    if (this.now_application_status_code === undefined) {
      return false;
    }
    if (this.is_view_mode || !userRoles.includes(USER_ROLES.role_edit_permits)) {
      return false;
    }
    // No mine_document_guid means a vFCBC submission document that hasn't been imported yet
    if (!this.mine_document_guid || this.is_archived || this.is_system_generated) {
      return false;
    }
    if (this.is_referral_package || this.is_consultation_package) {
      return false;
    }

    if (this.is_final_package) {
      const isLocked = NOW_APPLICATION_LOCKED_STATUS_CODES.includes(this.now_application_status_code);
      return !isLocked && !this.is_delayed;
    }
    if (
      this.is_imported_submission_document ||
      NOW_APPLICATION_DOCUMENT_SUB_TYPE_CODES.includes(this.now_application_document_sub_type_code)
    ) {
      return true;
    }
    if (this.now_application_document_sub_type_code === NOW_GOVERNMENT_DOCUMENT_SUB_TYPE_CODE) {
      return !this.is_delayed;
    }
    return false;
  }

  private isSpatialFile() {
    const documentName = this.document_name.toLowerCase();
    return NOW_SPATIAL_FILE_EXTENSIONS.some((extension) => documentName.endsWith(extension));
  }
}
