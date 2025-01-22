import { IPermitAmendment } from "@mds/common/interfaces/permits";
import React, { FC } from "react";

interface PermitConditionsContextType {
    mineGuid: string;
    permitGuid: string;
    latestAmendment: IPermitAmendment;
    previousAmendment: IPermitAmendment;
}

const PermitConditionsContext = React.createContext<PermitConditionsContextType | undefined>(undefined);

export const usePermitConditions = () => {
    const context = React.useContext(PermitConditionsContext);
    if (!context) {
        throw new Error('usePermitConditions must be used within a PermitConditionsProvider');
    }
    return context;
};

export const PermitConditionsProvider: FC<{
    children: React.ReactNode;
    value: PermitConditionsContextType;
}> = ({ children, value }) => (
    <PermitConditionsContext.Provider value={value}>
        {children}
    </PermitConditionsContext.Provider>
);