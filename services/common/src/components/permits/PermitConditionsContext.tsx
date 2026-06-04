import { IPermitAmendment } from "@mds/common/interfaces/permits";
import React, { FC, useMemo } from "react";

interface PermitConditionsContextType {
  mineGuid?: string;
  permitGuid?: string;
  latestAmendment?: IPermitAmendment;
  previousAmendment?: IPermitAmendment;
  currentAmendment?: IPermitAmendment;
  standardConditionType?: string;
  isStandardConditionEditor?: boolean;
  isNowEditor?: boolean;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  refreshData: () => Promise<any>;
  activeConditionId: number | null;
  setActiveConditionId: (id: number | null) => void;
  clearActiveConditionId: (id: number) => void;
  submittingConditionIds: number[];
  addSubmittingCondition: (id: number) => void;
  removeSubmittingCondition: (id: number) => void;
}

const PermitConditionsContext = React.createContext<PermitConditionsContextType | undefined>(
  undefined
);

export const usePermitConditions = () => {
  const context = React.useContext(PermitConditionsContext);
  if (!context) {
    throw new Error("usePermitConditions must be used within a PermitConditionsProvider");
  }
  return context;
};

export const PermitConditionsProvider: FC<{
  children: React.ReactNode;
  value: PermitConditionsContextType;
}> = ({ children, value }) => {
  // undefined default value causes problems in permit condition form
  const defaultValue = {
    isNowEditor: false,
    isStandardConditionEditor: false,
    activeConditionId: null,
    setActiveConditionId: () => { },
    clearActiveConditionId: () => { },
    submittingConditionIds: [],
    addSubmittingCondition: () => { },
    removeSubmittingCondition: () => { },
  };

  const contextValue = useMemo(() => {
    return {
      ...defaultValue,
      ...value,
    };
  }, [value]);

  return (
    <PermitConditionsContext.Provider value={contextValue}>
      {children}
    </PermitConditionsContext.Provider>
  );
};
