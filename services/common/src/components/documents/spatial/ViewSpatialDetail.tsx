import React, { FC, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Alert, Skeleton } from "antd";
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

export interface GeomarkMapPreviewProps {
  geomarkId?: string;
  minHeight?: number;
  /** Sizes the map to an exact height; without it Leaflet grows to fill its parent */
  height?: number;
  mapId?: string;
}

export const GeomarkMapPreview: FC<GeomarkMapPreviewProps> = ({
  geomarkId,
  minHeight = 240,
  height,
  mapId,
}) => {
  const dispatch = useDispatch();
  const geomarkMapData = useSelector(getGeomarkMapData);
  const [previewState, setPreviewState] = useState<"loading" | "loaded" | "failed">("loading");

  useEffect(() => {
    if (!geomarkId) {
      return;
    }

    let active = true;
    setPreviewState("loading");

    const loadPreview = async () => {
      const result = (await dispatch(fetchGeomarkMapData(geomarkId) as any)) as any;
      if (active) {
        setPreviewState(result.type?.endsWith("/fulfilled") ? "loaded" : "failed");
      }
    };

    loadPreview();

    return () => {
      active = false;
    };
  }, [dispatch, geomarkId]);

  if (!geomarkId) {
    return null;
  }
  if (previewState === "loading") {
    return <Skeleton active />;
  }
  if (previewState === "failed" || !geomarkMapData) {
    return (
      <Alert
        type="warning"
        showIcon
        message="Map preview unavailable"
        description="The geometry could not be loaded from GeoMark."
      />
    );
  }
  const map = (
    <CoreMap geojsonFeature={geomarkMapData} minHeight={height ?? minHeight} mapId={mapId} />
  );
  return height ? <div style={{ height }}>{map}</div> : map;
};

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
      if (spatialDocuments[0].mine_guid && spatialBundles[0]?.bundle_id) {
        await dispatch(
          fetchSpatialBundle({
            mineGuid: spatialDocuments[0].mine_guid,
            mine_document_bundle_id: spatialBundles[0].bundle_id,
          })
        );
      }
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
