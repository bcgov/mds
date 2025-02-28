import React from "react";

interface TailingsProviderContext {
    addContactModalConfig: any;
}
export const TailingsContext = React.createContext<TailingsProviderContext>({
    addContactModalConfig: undefined
});

export const { Provider: TailingsProvider } = TailingsContext;