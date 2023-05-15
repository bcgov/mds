import React, { FC } from "react";
import TailingsContext from "./TailingsContext";

interface TailingsProviderProps {
  children: React.ReactNode;
  components: any;
  renderConfig: any;
  addContactModalConfig: any;
  tsfFormName: string;
  tsfGuid: string;
  showUpdateTimestamp: boolean;
  routes: any;
  eorHistoryColumns: string[];
  canAssignEor: boolean;
  isCore: boolean;
}

const TailingsProvider: FC<TailingsProviderProps> = (props) => {
  return <TailingsContext.Provider value={props}>{props.children}</TailingsContext.Provider>;
};

export default TailingsProvider;
