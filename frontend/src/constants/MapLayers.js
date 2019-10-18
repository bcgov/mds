export const baseMapsArray = ["World Topographic Map", "World Imagery"];

export const admininstrativeBoundariesLayerArray = ["BC Mine Regions", "Natural Resource Regions"];

export const roadLayerArray = ["Roads DRA", "Forest Tenure Roads"];

export const tenureLayerArray = [
  "Coal Licence Applications",
  "Coal Leases",
  "Coal Licences",
  "Mining Leases",
  "Mineral Claims",
  "Placer Leases",
  "Placer Claims",
  "Crown Granted Mineral Claims",
];

export const tenureLayerStyles = {
  "Crown Granted Mineral Claims": {
    color: "#A83800",
    fillOpacity: 0,
    width: 1,
  },
  "Coal Licence Applications": {
    color: "#5C5C5C",
    fillOpacity: 0,
    width: 1,
  },
  "Coal Leases": {
    fillColor: "#858585",
    color: "#FFFFFF",
    fillOpacity: 0.75,
    width: 1,
  },
  "Coal Licences": {
    fillColor: "#C2C2C2",
    color: "#FFFFFF",
    fillOpacity: 0.75,
    width: 1,
  },
  "Mining Leases": {
    color: "#E600A9",
    width: 1,
    fillOpacity: 0,
  },
  "Mineral Claims": {
    fillColor: "#FF73DF",
    color: "#FFFFFF",
    fillOpacity: 0.75,
    width: 1,
  },
  "Placer Leases": {
    color: "#5200CC",
    fillOpacity: 0,
    width: 1,
  },
  "Placer Claims": {
    fillColor: "#751AFF",
    color: "#FFFFFF",
    fillOpacity: 0.75,
    width: 1,
  },
};
