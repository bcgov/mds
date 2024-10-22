import { IProjectSummary } from "@mds/common/interfaces";

export interface IProjectStage {
  title: string;
  key: string;
  status: string;
  payload?: IProjectSummary;
  statusHash?: any;
  required?: boolean;
  isOptional?: boolean;
  navigateForward?: (source: string, status: string) => void;
}
