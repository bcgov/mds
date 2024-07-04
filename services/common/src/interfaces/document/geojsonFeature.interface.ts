export interface IGeoJsonFeature {
  type: string;
  geometry: { type: string; coordinates: number[][][] };
  properties: {
    area: number;
    centroidX: number;
    centroidY: number;
    createDate: string;
    geometryType: string;
    id: string;
    isRobust: boolean;
    isSimple: boolean;
    isValid: boolean;
    length: number;
    maxX: number;
    maxY: number;
    minX: number;
    minY: number;
    minimumClearance: number;
    numParts: number;
    numPolygons: number;
    numVertices: number;
    url: string;
  };
}
