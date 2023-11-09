import { Skeleton } from "antd";
import React, { FC, Suspense } from "react";

// const LeafletMap = React.lazy(() => import("./LeafletMap"));

const Map: FC = (props) => {
  return <Suspense fallback={<Skeleton />}>{/* <LeafletMap {...props} /> */}</Suspense>;
};

export default Map;
