import { INoticeOfWork } from "./noticeOfWork.interface";
import { INoticeOfWorkDraftPermit } from "./noticeOfWorkDraftPermit.interface";

export interface INoticeOfWorkApplication {
  noticeOfWork: INoticeOfWork;
  match: any;
  history: any;
  draftPermit: INoticeOfWorkDraftPermit;
  applicationPageFromRoute: string;
  fixedTop: boolean;
  mineGuid: string;
  originalNoticeOfWork: string;
  renderTabTitle: any;
}
