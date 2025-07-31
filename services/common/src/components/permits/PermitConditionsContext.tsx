import { IPermitAmendment } from "@mds/common/interfaces/permits";
import React, { FC } from "react";

interface PermitConditionsContextType {
    mineGuid?: string;
    permitGuid?: string;
    latestAmendment?: IPermitAmendment;
    previousAmendment?: IPermitAmendment;
    currentAmendment?: IPermitAmendment;
    standardConditionType?: string;
    isNowEditor?: boolean;
    loading: boolean;
    setLoading: (loading: boolean) => void;
    refreshData: () => Promise<any>;
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
}> = ({ children, value }) => {
    // undefined default value causes problems in permit condition form
    const defaultValue = {
        isNowEditor: false,
    };

    const contextValue = {
        ...defaultValue,
        ...value,
    };
    return (
        <PermitConditionsContext.Provider value={contextValue}>
            {children}
        </PermitConditionsContext.Provider>
    );
};