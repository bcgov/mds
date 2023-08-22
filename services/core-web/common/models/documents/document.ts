import { USER_ROLES } from "@mds/common";

export enum FileOperations {
  View = "Open in document viewer",
  Download = "Download file",
  Replace = "Replace file",
  Archive = "Archive file",
  Delete = "Delete",
}

/* 
A base class for Mine Documents

There is an issue with antd where sorting a table that has children (ie matchChildColumnsToParent)
will transform the records into type <any> (with versions still maintaining their type) so properties accessed
by the table should be *set* to the specific object, cannot expect to be able to consistently call its methods

include "user_roles" property in the json used in the constructor to set allowed actions based on the user
*/
export class MineDocument {
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

  // generated
  public key: string;

  public file_type: string;

  public number_prev_versions: number;

  public versions: MineDocument[]; // all previous file versions, not including latest

  public allowed_actions: FileOperations[];

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
    this.setCalculatedProperties(jsonObject);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected makeChild(params: any, _constructorArgs: any) {
    return new MineDocument(params);
  }

  protected setCalculatedProperties(jsonObject: any) {
    this.key = this.is_latest_version
      ? this.mine_document_guid
      : jsonObject.document_manager_version_guid;
    this.file_type = this.getFileType();

    const versions = jsonObject.versions ?? [];
    if (this.is_latest_version && versions.length) {
      this.number_prev_versions = versions.length - 1;
      this.versions = versions
        .slice(1)
        .map((version) => this.makeChild({ ...version, is_latest_version: false }, jsonObject));
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
  protected getAllowedActions(_userRoles: string[] = []) {
    const canModify = this.is_latest_version && !this.is_archived;
    return [
      this.file_type === ".pdf" && FileOperations.View,
      FileOperations.Download,
      canModify && FileOperations.Replace,
      canModify && FileOperations.Archive,
      canModify && FileOperations.Delete,
    ];
  }
}

export class MajorMineApplicationDocument extends MineDocument {
  public major_mine_application_document_type_code: string;

  public versions: MajorMineApplicationDocument[];

  public entity_title: string;

  constructor(jsonObject: any) {
    super(jsonObject);
    this.major_mine_application_document_type_code =
      jsonObject.major_mine_application_document_type_code;
    this.entity_title = jsonObject.project_title;
  }

  protected makeChild(params: any, constructorArgs: any) {
    return new MajorMineApplicationDocument({
      ...params,
      major_mine_application_document_type_code:
        constructorArgs.major_mine_application_document_type_code,
    });
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
