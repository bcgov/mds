import { Skeleton } from "antd";
import React, { FC, Suspense } from "react";
import LeafletMap from "./LeafletMap";

// const LeafletMap = React.lazy(() => import("./LeafletMap"));

interface MapProps {
  controls: boolean;
  additionalPins: string[][];
}
const Map: FC<MapProps> = (props) => {
  return <Suspense fallback={<Skeleton />}>{<LeafletMap {...props} />}</Suspense>;
};

export default Map;
