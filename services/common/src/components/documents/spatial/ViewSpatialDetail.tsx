import React, { FC, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import CoreTable from "../../common/CoreTable";
import { renderTextColumn } from "../../common/CoreTableCommonColumns";
import { formatDate } from "@mds/common/redux/utils/helpers";
import { getFormattedUserName } from "@mds/common/redux/selectors/authenticationSelectors";
import {
  fetchGeomarkMapData,
  spatialBundlesFromFiles,
  clearSpatialData,
  getGeomarkMapData,
} from "@mds/common/redux/slices/spatialDataSlice";
import { IMineDocument } from "@mds/common/interfaces";
import CoreMap from "../../common/Map";

export interface ViewSpatialDetailProps {
  spatialDocuments: IMineDocument[];
}
const ViewSpatialDetail: FC<ViewSpatialDetailProps> = ({ spatialDocuments }) => {
  const dispatch = useDispatch();
  const username = useSelector(getFormattedUserName);
  const geomarkMapData = useSelector(getGeomarkMapData);
  const [mapLoaded, setMapLoaded] = useState(false);
  const spatialBundle = spatialBundlesFromFiles(spatialDocuments)[0];

  const handleFetchMapData = () => {
    setMapLoaded(false);
    dispatch(fetchGeomarkMapData(spatialBundle));
  };

  useEffect(() => {
    if (!mapLoaded) {
      handleFetchMapData();
    }
    return () => dispatch(clearSpatialData());
  }, []);

  return (
    <>
      {geomarkMapData && <CoreMap geojsonFeature={geomarkMapData} />}
      <CoreTable
        size="small"
        rowKey="document_manager_guid"
        showHeader={false}
        dataSource={spatialDocuments}
        columns={[
          renderTextColumn("document_name", ""),
          {
            dataIndex: "document_name",
            key: "fileType",
            render: (text) => {
              return text.split(".")[1].toUpperCase();
            },
          },
          {
            key: "upload_date",
            dataIndex: "upload_date",
            render: (text) => {
              return formatDate(text ?? new Date());
            },
          },
          {
            key: "create_user",
            dataIndex: "create_user",
            render: (text) => {
              return text ?? username;
            },
          },
        ]}
      />
    </>
  );
};

export default ViewSpatialDetail;
