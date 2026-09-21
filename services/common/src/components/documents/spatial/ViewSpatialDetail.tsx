import React, { FC, useEffect, useMemo, useState } from "react";
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
import { useAppDispatch, useAppSelector } from "@mds/common/redux/rootState";

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
  const dispatch = useAppDispatch();
  const geomarkMapData = useAppSelector(getGeomarkMapData);
  const [previewState, setPreviewState] = useState<"loading" | "loaded" | "failed">("loading");

  useEffect(() => {
    if (!geomarkId) {
      return undefined;
    }

    let active = true;
    setPreviewState("loading");

    const loadPreview = async () => {
      try {
        await dispatch(fetchGeomarkMapData(geomarkId)).unwrap();
        if (active) {
          setPreviewState("loaded");
        }
      } catch {
        if (active) {
          setPreviewState("failed");
        }
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
  const dispatch = useAppDispatch();
  const username = useAppSelector(getFormattedUserName);
  const spatialBundle = useAppSelector(getSpatialBundle);
  const geomarkMapData = useAppSelector(getGeomarkMapData);

  const mineGuid = spatialDocuments[0]?.mine_guid;
  // Documents imported before their bundle existed carry the geomark id themselves.
  const documentGeomarkId = spatialDocuments[0]?.geomark_id;
  const bundleId = useMemo(
    () => (documentGeomarkId ? null : groupSpatialBundles(spatialDocuments)[0]?.bundle_id),
    [documentGeomarkId, spatialDocuments]
  );

  useEffect(() => {
    if (mineGuid && bundleId) {
      dispatch(fetchSpatialBundle({ mineGuid, mine_document_bundle_id: bundleId }));
    }
  }, [dispatch, mineGuid, bundleId]);

  // A rejected fetch leaves no bundle in the store, so no map is requested for a missing geometry.
  const geomarkId = documentGeomarkId ?? spatialBundle?.geomark_id;

  useEffect(() => {
    if (geomarkId) {
      dispatch(fetchGeomarkMapData(geomarkId));
    }
  }, [dispatch, geomarkId]);

  useEffect(() => {
    return () => {
      dispatch(clearSpatialData());
    };
  }, [dispatch]);

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
