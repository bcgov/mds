import React, { FC, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import CoreTable from "../../common/CoreTable";
import { renderTextColumn } from "../../common/CoreTableCommonColumns";
import { formatDate } from "@mds/common/redux/utils/helpers";
import { getFormattedUserName } from "@mds/common/redux/selectors/authenticationSelectors";
import {
  clearSpatialData,
  fetchGeomarkMapData,
  fetchSpatialBundle,
  getGeomarkMapData,
  getSpatialBundle,
  groupSpatialBundles,
} from "@mds/common/redux/slices/spatialDataSlice";
import { IMineDocument } from "@mds/common/interfaces";
import CoreMap from "../../common/Map";
import { getIsModalOpen } from "@mds/common/redux/selectors/modalSelectors";

export interface ViewSpatialDetailProps {
  spatialDocuments: (IMineDocument & { geomark_id?: string })[];
}

const ViewSpatialDetail: FC<ViewSpatialDetailProps> = ({ spatialDocuments }) => {
  const dispatch = useDispatch();
  const username = useSelector(getFormattedUserName);
  const spatialBundle = useSelector(getSpatialBundle);
  const geomarkMapData = useSelector(getGeomarkMapData);
  const isModalOpen = useSelector(getIsModalOpen);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [bundleNotYetCreated, setBundleNotYetCreated] = useState<boolean | null>();

  const handleGetSpatialBundles = async () => {
    if (!spatialDocuments[0].geomark_id) {
      const spatialBundles = groupSpatialBundles(spatialDocuments);
      await dispatch(fetchSpatialBundle(spatialBundles[0].bundle_id));
      setBundleNotYetCreated(false);
    } else {
      setBundleNotYetCreated(true);
    }

    setIsLoaded(true);
  };

  useEffect(() => {
    if (spatialDocuments && !isLoaded) {
      handleGetSpatialBundles();
    }
  }, [spatialDocuments, isModalOpen]);

  const handleFetchMapData = () => {
    setMapLoaded(false);
    const geomarkId = bundleNotYetCreated
      ? spatialDocuments[0].geomark_id
      : spatialBundle.geomark_id;

    dispatch(fetchGeomarkMapData(geomarkId));
  };

  useEffect(() => {
    if ((!mapLoaded && spatialBundle) || bundleNotYetCreated) {
      handleFetchMapData();
    }
    return () => {
      setMapLoaded(false);
      dispatch(clearSpatialData());
    };
  }, [spatialBundle, bundleNotYetCreated, isModalOpen]);

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
