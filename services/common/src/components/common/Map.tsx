import { Skeleton } from "antd";
import React, { FC, Suspense } from "react";
import { LeafletMapProps } from "./LeafletMap";

const LeafletMap = React.lazy(() => import("./LeafletMap"));

const CoreMap: FC<LeafletMapProps> = (props) => {
  return <Suspense fallback={<Skeleton />}>{<LeafletMap {...props} />}</Suspense>;
};

export default CoreMap;
