import React, { FC } from "react";
import TailingsContext from "./TailingsContext";

interface TailingsProviderProps {
  children: React.ReactNode[];
}

const TailingsProvider: FC<TailingsProviderProps> = (props) => {
  return <TailingsContext.Provider value={props}>{props.children}</TailingsContext.Provider>;
};

export default TailingsProvider;
