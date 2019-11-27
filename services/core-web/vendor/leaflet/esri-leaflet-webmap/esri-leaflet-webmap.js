/* eslint-disable */
/* prettier-ignore */

/* esri-leaflet-webmap - v0.4.0 - Thu Sep 19 2019 22:39:40 GMT-0700 (Pacific Daylight Time)
 * Copyright (c) 2019 Yusuke Nunokawa <ynunokawa.dev@gmail.com>
 * MIT */
!(function(e, t) {
  typeof exports === "object" && typeof module !== "undefined"
    ? t(exports, require("leaflet"), require("leaflet-omnivore"))
    : typeof define === "function" && define.amd
    ? define(["exports", "leaflet", "leaflet-omnivore"], t)
    : t(((e.L = e.L || {}), (e.L.esri = e.L.esri || {})), e.L, e.omnivore);
})(this, function(e, t, i) {

  function o(e, t) {
    for (let i = 0; i < e.length; i++) if (e[i] !== t[i]) return !1;
    return !0;
  }
  function r(e) {
    return o(e[0], e[e.length - 1]) || e.push(e[0]), e;
  }
  function n(e) {
    let t;
      let i = 0;
      let o = 0;
      const r = e.length;
      let n = e[o];
    for (o; o < r - 1; o++) (t = e[o + 1]), (i += (t[0] - n[0]) * (t[1] + n[1])), (n = t);
    return i >= 0;
  }
  function s(e, t, i, o) {
    const r = (o[0] - i[0]) * (e[1] - i[1]) - (o[1] - i[1]) * (e[0] - i[0]);
      const n = (t[0] - e[0]) * (e[1] - i[1]) - (t[1] - e[1]) * (e[0] - i[0]);
      const s = (o[1] - i[1]) * (t[0] - e[0]) - (o[0] - i[0]) * (t[1] - e[1]);
    if (s !== 0) {
      const a = r / s;
        const l = n / s;
      if (a >= 0 && a <= 1 && l >= 0 && l <= 1) return !0;
    }
    return !1;
  }
  function a(e, t) {
    for (let i = 0; i < e.length - 1; i++)
      for (let o = 0; o < t.length - 1; o++) if (s(e[i], e[i + 1], t[o], t[o + 1])) return !0;
    return !1;
  }
  function l(e, t) {
    for (var i = !1, o = -1, r = e.length, n = r - 1; ++o < r; n = o)
      ((e[o][1] <= t[1] && t[1] < e[n][1]) || (e[n][1] <= t[1] && t[1] < e[o][1])) &&
        t[0] < ((e[n][0] - e[o][0]) * (t[1] - e[o][1])) / (e[n][1] - e[o][1]) + e[o][0] &&
        (i = !i);
    return i;
  }
  function u(e, t) {
    const i = a(e, t);
      const o = l(e, t[0]);
    return !(i || !o);
  }
  function p(e) {
    for (var t, i, o, s = [], l = [], p = 0; p < e.length; p++) {
      const f = r(e[p].slice(0));
      if (!(f.length < 4))
        if (n(f)) {
          const h = [f];
          s.push(h);
        } else l.push(f);
    }
    for (var y = []; l.length; ) {
      o = l.pop();
      let c = !1;
      for (t = s.length - 1; t >= 0; t--)
        if (((i = s[t][0]), u(i, o))) {
          s[t].push(o), (c = !0);
          break;
        }
      c || y.push(o);
    }
    for (; y.length; ) {
      o = y.pop();
      let d = !1;
      for (t = s.length - 1; t >= 0; t--)
        if (((i = s[t][0]), a(i, o))) {
          s[t].push(o), (d = !0);
          break;
        }
      d || s.push([o.reverse()]);
    }
    return s.length === 1
      ? { type: "Polygon", coordinates: s[0] }
      : { type: "MultiPolygon", coordinates: s };
  }
  function f(e) {
    const t = {};
    for (const i in e) e.hasOwnProperty(i) && (t[i] = e[i]);
    return t;
  }
  function h(e, t) {
    let i = {};
    return (
      typeof e.x === "number" &&
        typeof e.y === "number" &&
        ((i.type = "Point"), (i.coordinates = [e.x, e.y])),
      e.points && ((i.type = "MultiPoint"), (i.coordinates = e.points.slice(0))),
      e.paths &&
        (e.paths.length === 1
          ? ((i.type = "LineString"), (i.coordinates = e.paths[0].slice(0)))
          : ((i.type = "MultiLineString"), (i.coordinates = e.paths.slice(0)))),
      e.rings && (i = p(e.rings.slice(0))),
      (e.geometry || e.attributes) &&
        ((i.type = "Feature"),
        (i.geometry = e.geometry ? h(e.geometry) : null),
        (i.properties = e.attributes ? f(e.attributes) : null),
        e.attributes && (i.id = e.attributes[t] || e.attributes.OBJECTID || e.attributes.FID)),
      JSON.stringify(i.geometry) === JSON.stringify({}) && (i.geometry = null),
      i
    );
  }
  function y(e, t) {
    return new A(e, t);
  }
  function c(e, t) {
    return new R(e, t);
  }
  function d(e, t) {
    return new U(e, t);
  }
  function g(e, t) {
    return new Y(e, t);
  }
  function _(e, t) {
    return new K(e, t);
  }
  function m(e, t) {
    return new X(e, t);
  }
  function v(e, t) {
    let i;
      const o = e.drawingInfo.renderer;
      const r = {};
    switch (
      (t.options.pane && (r.pane = t.options.pane),
      e.drawingInfo.transparency && (r.layerTransparency = e.drawingInfo.transparency),
      t.options.style && (r.userDefinedStyle = t.options.style),
      o.type)
    ) {
      case "classBreaks":
        if ((b(e.geometryType, o, t), t._hasProportionalSymbols)) {
          t._createPointLayer();
          g(o, r).attachStylesToLayer(t._pointLayer), (r.proportionalPolygon = !0);
        }
        i = g(o, r);
        break;
      case "uniqueValue":
        break;
      default:
        i = m(o, r);
    }
    i.attachStylesToLayer(t);
  }
  function b(e, t, i) {
    if (
      ((i._hasProportionalSymbols = !1),
      e === "esriGeometryPolygon" &&
        (t.backgroundFillSymbol && (i._hasProportionalSymbols = !0),
        t.classBreakInfos && t.classBreakInfos.length))
    ) {
      const o = t.classBreakInfos[0].symbol;
      !o || (o.type !== "esriSMS" && o.type !== "esriPMS") || (i._hasProportionalSymbols = !0);
    }
  }
  function S(e, t) {
    return new $(e, t);
  }
  function I(e, t) {
    return new Q(e, t);
  }
  function x(e, t) {
    return new Z(e, t);
  }
  function L(e) {
    return new ee(e);
  }
  function M(e, t) {
    return new te(e, t);
  }
  function w(e) {
    const t = { position: [], offset: [] };
    return (t.position = e.reverse()), (t.offset = [20, 20]), t;
  }
  function k(e) {
    let t;
      const i = { position: [], offset: [] };
    return (t = Math.round(e.length / 2)), (i.position = e[t].reverse()), (i.offset = [0, 0]), i;
  }
  function D(e, t) {
    const i = { position: [], offset: [] };
    return (i.position = e.getBounds().getCenter()), (i.offset = [0, 0]), i;
  }
  function z(e, t) {
    const i = /\{([^\]]*)\}/g;
      let o = "";
      let r = "";
    if (
      (void 0 !== e.title && (o = e.title),
      (o = o.replace(i, function(e) {
        const o = i.exec(e);
        return t[o[1]];
      })),
      (r =
        `<div class="leaflet-popup-content-title"><h4>${
        o
        }</h4></div><div class="leaflet-popup-content-description" style="max-height:200px;overflow:auto;">`),
      void 0 !== e.fieldInfos)
    ) {
      for (let n = 0; n < e.fieldInfos.length; n++)
        !0 === e.fieldInfos[n].visible &&
          (r +=
            `<div style="font-weight:bold;color:#999;margin-top:5px;word-break:break-all;">${
            e.fieldInfos[n].label
            }</div><p style="margin-top:0;margin-bottom:5px;word-break:break-all;">${
            t[e.fieldInfos[n].fieldName]
            }</p>`);
      r += "</div>";
    } else if (void 0 !== e.description) {
      const s = e.description.replace(i, function(e) {
        const o = i.exec(e);
        return t[o[1]];
      });
      r += `${s  }</div>`;
    }
    return r;
  }
  function T(e, t, i, o, r) {
    return C(e, t, i, o, r);
  }
  function C(e, i, o, r, n) {
    let s;
      let a;
      let l;
      let u;
      const p = [];
      const f = `${n  }-label`;
    if (e.type === "Feature Collection" || void 0 !== e.featureCollection) {
      o.createPane(f);
      let h; let y;
      if (void 0 === e.itemId)
        for (l = 0, u = e.featureCollection.layers.length; l < u; l++)
          e.featureCollection.layers[l].featureSet.features.length > 0 &&
            (void 0 !== e.featureCollection.layers[l].popupInfo &&
              e.featureCollection.layers[l].popupInfo !== null &&
              (h = e.featureCollection.layers[l].popupInfo),
            void 0 !== e.featureCollection.layers[l].layerDefinition.drawingInfo.labelingInfo &&
              e.featureCollection.layers[l].layerDefinition.drawingInfo.labelingInfo !== null &&
              (y = e.featureCollection.layers[l].layerDefinition.drawingInfo.labelingInfo));
      a = t.featureGroup(p);
      var c = S(null, {
        data: e.itemId || e.featureCollection,
        opacity: e.opacity,
        pane: n,
        onEachFeature(e, t) {
          if (
            (void 0 !== c && ((h = c.popupInfo), (y = c.labelingInfo)), void 0 !== h && h !== null)
          ) {
            const i = z(h, e.properties);
            t.bindPopup(i);
          }
          if (void 0 !== y && y !== null) {
            let o;
              const r = t.feature.geometry.coordinates;
            o =
              t.feature.geometry.type === "Point"
                ? w(r)
                : t.feature.geometry.type === "LineString"
                ? k(r)
                : t.feature.geometry.type === "MultiLineString"
                ? k(r[Math.round(r.length / 2)])
                : D(t);
            const n = M(o.position, {
              zIndexOffset: 1,
              properties: e.properties,
              labelingInfo: y,
              offset: o.offset,
              pane: f,
            });
            a.addLayer(n);
          }
        },
      });
      return (s = t.layerGroup([c, a])), i.push({ type: "FC", title: e.title || "", layer: s }), s;
    }
    if (e.layerType === "ArcGISFeatureLayer" && void 0 !== e.layerDefinition) {
      let d = "1=1";
      if (void 0 !== e.layerDefinition.drawingInfo) {
        if (e.layerDefinition.drawingInfo.renderer.type === "heatmap") {
          const g = {};
          return (
            e.layerDefinition.drawingInfo.renderer.colorStops.map(function(e) {
              g[(Math.round(100 * e.ratio) / 100 + 6) / 7] =
                `rgb(${  e.color[0]  },${  e.color[1]  },${  e.color[2]  })`;
            }),
            (s = t.esri.Heat.heatmapFeatureLayer({
              url: e.url,
              token: r.token || null,
              minOpacity: 0.5,
              max: e.layerDefinition.drawingInfo.renderer.maxPixelIntensity,
              blur: e.layerDefinition.drawingInfo.renderer.blurRadius,
              radius: 1.3 * e.layerDefinition.drawingInfo.renderer.blurRadius,
              gradient: g,
              pane: n,
            })),
            i.push({ type: "HL", title: e.title || "", layer: s }),
            s
          );
        }
        const _ = e.layerDefinition.drawingInfo;
        return (
          (_.transparency = 100 - 100 * e.opacity),
          void 0 !== e.layerDefinition.definitionExpression &&
            (d = e.layerDefinition.definitionExpression),
          o.createPane(f),
          (a = t.featureGroup(p)),
          (s = t.esri.featureLayer({
            url: e.url,
            where: d,
            token: r.token || null,
            drawingInfo: _,
            pane: n,
            onEachFeature(t, i) {
              if (void 0 !== e.popupInfo) {
                const o = z(e.popupInfo, t.properties);
                i.bindPopup(o);
              }
              if (
                void 0 !== e.layerDefinition.drawingInfo.labelingInfo &&
                e.layerDefinition.drawingInfo.labelingInfo !== null
              ) {
                let r;
                  const n = e.layerDefinition.drawingInfo.labelingInfo;
                  const s = i.feature.geometry.coordinates;
                r =
                  i.feature.geometry.type === "Point"
                    ? w(s)
                    : i.feature.geometry.type === "LineString"
                    ? k(s)
                    : i.feature.geometry.type === "MultiLineString"
                    ? k(s[Math.round(s.length / 2)])
                    : D(i);
                const l = M(r.position, {
                  zIndexOffset: 1,
                  properties: t.properties,
                  labelingInfo: n,
                  offset: r.offset,
                  pane: f,
                });
                a.addLayer(l);
              }
            },
          })),
          (s = t.layerGroup([s, a])),
          i.push({ type: "FL", title: e.title || "", layer: s }),
          s
        );
      }
      return (
        void 0 !== e.layerDefinition.definitionExpression &&
          (d = e.layerDefinition.definitionExpression),
        (s = t.esri.featureLayer({
          url: e.url,
          token: r.token || null,
          where: d,
          pane: n,
          onEachFeature(t, i) {
            if (void 0 !== e.popupInfo) {
              const o = z(e.popupInfo, t.properties);
              i.bindPopup(o);
            }
          },
        })),
        i.push({ type: "FL", title: e.title || "", layer: s }),
        s
      );
    }
    if (e.layerType === "ArcGISFeatureLayer")
      return (
        (s = t.esri.featureLayer({
          url: e.url,
          token: r.token || null,
          pane: n,
          onEachFeature(t, i) {
            if (void 0 !== e.popupInfo) {
              const o = z(e.popupInfo, t.properties);
              i.bindPopup(o);
            }
          },
        })),
        i.push({ type: "FL", title: e.title || "", layer: s }),
        s
      );
    if (e.layerType === "CSV")
      return (
        (a = t.featureGroup(p)),
        (s = I(null, {
          url: e.url,
          layerDefinition: e.layerDefinition,
          locationInfo: e.locationInfo,
          opacity: e.opacity,
          pane: n,
          onEachFeature(t, i) {
            if (void 0 !== e.popupInfo) {
              const o = z(e.popupInfo, t.properties);
              i.bindPopup(o);
            }
            if (
              void 0 !== e.layerDefinition.drawingInfo.labelingInfo &&
              e.layerDefinition.drawingInfo.labelingInfo !== null
            ) {
              let r;
                const n = e.layerDefinition.drawingInfo.labelingInfo;
                const s = i.feature.geometry.coordinates;
              r =
                i.feature.geometry.type === "Point"
                  ? w(s)
                  : i.feature.geometry.type === "LineString"
                  ? k(s)
                  : i.feature.geometry.type === "MultiLineString"
                  ? k(s[Math.round(s.length / 2)])
                  : D(i);
              const l = M(r.position, {
                zIndexOffset: 1,
                properties: t.properties,
                labelingInfo: n,
                offset: r.offset,
                pane: f,
              });
              a.addLayer(l);
            }
          },
        })),
        (s = t.layerGroup([s, a])),
        i.push({ type: "CSV", title: e.title || "", layer: s }),
        s
      );
    if (e.layerType === "KML") {
      a = t.featureGroup(p);
      var m = x(null, {
        url: e.url,
        opacity: e.opacity,
        pane: n,
        onEachFeature(e, t) {
          if (void 0 !== m.popupInfo && m.popupInfo !== null) {
            const i = z(m.popupInfo, e.properties);
            t.bindPopup(i);
          }
          if (void 0 !== m.labelingInfo && m.labelingInfo !== null) {
            let o;
              const r = m.labelingInfo;
              const n = t.feature.geometry.coordinates;
            o =
              t.feature.geometry.type === "Point"
                ? w(n)
                : t.feature.geometry.type === "LineString"
                ? k(n)
                : t.feature.geometry.type === "MultiLineString"
                ? k(n[Math.round(n.length / 2)])
                : D(t);
            const s = M(o.position, {
              zIndexOffset: 1,
              properties: e.properties,
              labelingInfo: r,
              offset: o.offset,
              pane: f,
            });
            a.addLayer(s);
          }
        },
      });
      return (s = t.layerGroup([m, a])), i.push({ type: "KML", title: e.title || "", layer: s }), s;
    }
    if (e.layerType === "ArcGISImageServiceLayer")
      return (
        (s = t.esri.imageMapLayer({
          url: e.url,
          token: r.token || null,
          pane: n,
          opacity: e.opacity || 1,
        })),
        i.push({ type: "IML", title: e.title || "", layer: s }),
        s
      );
    if (e.layerType === "ArcGISMapServiceLayer")
      return (
        (s = t.esri.dynamicMapLayer({
          url: e.url,
          token: r.token || null,
          pane: n,
          opacity: e.opacity || 1,
        })),
        i.push({ type: "DML", title: e.title || "", layer: s }),
        s
      );
    if (e.layerType === "ArcGISTiledMapServiceLayer") {
      try {
        s = t.esri.basemapLayer(e.title);
      } catch (i) {
        (s = t.esri.tiledMapLayer({ url: e.url, token: r.token || null })),
          o.options.attributionControl &&
            o.attributionControl &&
            t.esri.request(e.url, {}, function(e, t) {
              if (e) console.log(e);
              else {
                const i = o.getSize().x - 55;
                  const r =
                    `<span class="esri-attributions" style="line-height:14px; vertical-align: -3px; text-overflow:ellipsis; white-space:nowrap; overflow:hidden; display:inline-block; max-width:${
                    i
                    }px;">${
                    t.copyrightText
                    }</span>`;
                o.attributionControl.addAttribution(r);
              }
            });
      }
      return (
        (document.getElementsByClassName("leaflet-tile-pane")[0].style.opacity = e.opacity || 1),
        i.push({ type: "TML", title: e.title || "", layer: s }),
        s
      );
    }
    if (e.layerType === "VectorTileLayer") {
      const v = {
        "World Street Map (with Relief)": "StreetsRelief",
        "World Street Map (with Relief) (Mature Support)": "StreetsRelief",
        "Hybrid Reference Layer": "Hybrid",
        "Hybrid Reference Layer (Mature Support)": "Hybrid",
        "World Street Map": "Streets",
        "World Street Map (Mature Support)": "Streets",
        "World Street Map (Night)": "StreetsNight",
        "World Street Map (Night) (Mature Support)": "StreetsNight",
        "Dark Gray Canvas": "DarkGray",
        "Dark Gray Canvas (Mature Support)": "DarkGray",
        "World Topographic Map": "Topographic",
        "World Topographic Map (Mature Support)": "Topographic",
        "World Navigation Map": "Navigation",
        "World Navigation Map (Mature Support)": "Navigation",
        "Light Gray Canvas": "Gray",
        "Light Gray Canvas (Mature Support)": "Gray",
      };
      return (
        v[e.title]
          ? (s = t.esri.Vector.basemap(v[e.title]))
          : (console.error("Unsupported Vector Tile Layer: ", e), (s = t.featureGroup([]))),
        i.push({ type: "VTL", title: e.title || e.id || "", layer: s }),
        s
      );
    }
    if (e.layerType === "OpenStreetMap")
      return (
        (s = t.tileLayer("http://{s}.tile.osm.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
        })),
        i.push({ type: "TL", title: e.title || e.id || "", layer: s }),
        s
      );
    if (e.layerType === "WebTiledLayer") {
      const b = P(e.templateUrl);
      return (
        (s = t.tileLayer(b, { attribution: e.copyright })),
        (document.getElementsByClassName("leaflet-tile-pane")[0].style.opacity = e.opacity || 1),
        i.push({ type: "TL", title: e.title || e.id || "", layer: s }),
        s
      );
    }
    if (e.layerType === "WMS") {
      let L = "";
      for (l = 0, u = e.visibleLayers.length; l < u; l++)
        (L += e.visibleLayers[l]), l < u - 1 && (L += ",");
      return (
        (s = t.tileLayer.wms(e.url, {
          layers: String(L),
          format: "image/png",
          transparent: !0,
          attribution: e.copyright,
        })),
        i.push({ type: "WMS", title: e.title || e.id || "", layer: s }),
        s
      );
    }
    return (s = t.featureGroup([])), console.log("Unsupported Layer: ", e), s;
  }
  function P(e) {
    let t = e;
    return (
      (t = t.replace(/\{level}/g, "{z}")),
      (t = t.replace(/\{col}/g, "{x}")),
      (t = t.replace(/\{row}/g, "{y}"))
    );
  }
  function J(e, t) {
    return new ie(e, t);
  }
  (t = "default" in t ? t.default : t), (i = "default" in i ? i.default : i);
  const N = t.Class.extend({
      initialize(e, t) {
        (this._symbolJson = e),
          (this.val = null),
          (this._styles = {}),
          (this._isDefault = !1),
          (this._layerTransparency = 1),
          t && t.layerTransparency && (this._layerTransparency = 1 - t.layerTransparency / 100);
      },
      pixelValue(e) {
        return 1.333 * e;
      },
      colorValue(e) {
        return `rgb(${  e[0]  },${  e[1]  },${  e[2]  })`;
      },
      alphaValue(e) {
        return (e[3] / 255) * this._layerTransparency;
      },
      getSize(e, t) {
        const i = e.properties;
          const o = t.field;
          let r = 0;
          let n = null;
        if (o) {
          n = i[o];
          let s;
            const a = t.minSize;
            const l = t.maxSize;
            const u = t.minDataValue;
            const p = t.maxDataValue;
            const f = t.normalizationField;
            const h = i ? parseFloat(i[f]) : void 0;
          if (n === null || (f && (isNaN(h) || h === 0))) return null;
          isNaN(h) || (n /= h),
            a !== null &&
              l !== null &&
              u !== null &&
              p !== null &&
              (n <= u
                ? (r = a)
                : n >= p
                ? (r = l)
                : ((s = (n - u) / (p - u)), (r = a + s * (l - a)))),
            (r = isNaN(r) ? 0 : r);
        }
        return r;
      },
      getColor(e, t) {
        if (!(e.properties && t && t.field && t.stops)) return null;
        let i;
          let o;
          let r;
          let n;
          const s = e.properties;
          let a = s[t.field];
          const l = t.normalizationField;
          const u = s ? parseFloat(s[l]) : void 0;
        if (a === null || (l && (isNaN(u) || u === 0))) return null;
        if ((isNaN(u) || (a /= u), a <= t.stops[0].value)) return t.stops[0].color;
        const p = t.stops[t.stops.length - 1];
        if (a >= p.value) return p.color;
        for (let f = 0; f < t.stops.length; f++) {
          const h = t.stops[f];
          if (h.value <= a) (i = h.color), (r = h.value);
          else if (h.value > a) {
            (o = h.color), (n = h.value);
            break;
          }
        }
        if (!isNaN(r) && !isNaN(n)) {
          const y = n - r;
          if (y > 0) {
            const c = (a - r) / y;
            if (c) {
              const d = (n - a) / y;
              if (d) {
                for (var g = [], _ = 0; _ < 4; _++) g[_] = Math.round(i[_] * d + o[_] * c);
                return g;
              }
              return o;
            }
            return i;
          }
        }
        return null;
      },
    });
    const V = t.Path.extend({
      initialize(e, i, o) {
        t.setOptions(this, o),
          (this._size = i),
          (this._latlng = t.latLng(e)),
          this._svgCanvasIncludes();
      },
      toGeoJSON() {
        return t.GeoJSON.getFeature(this, {
          type: "Point",
          coordinates: t.GeoJSON.latLngToCoords(this.getLatLng()),
        });
      },
      _svgCanvasIncludes() {},
      _project() {
        this._point = this._map.latLngToLayerPoint(this._latlng);
      },
      _update() {
        this._map && this._updatePath();
      },
      _updatePath() {},
      setLatLng(e) {
        return (
          (this._latlng = t.latLng(e)), this.redraw(), this.fire("move", { latlng: this._latlng })
        );
      },
      getLatLng() {
        return this._latlng;
      },
      setSize(e) {
        return (this._size = e), this.redraw();
      },
      getSize() {
        return this._size;
      },
    });
    const F = V.extend({
      initialize(e, t, i) {
        V.prototype.initialize.call(this, e, t, i);
      },
      _updatePath() {
        this._renderer._updateCrossMarker(this);
      },
      _svgCanvasIncludes() {
        t.Canvas.include({
          _updateCrossMarker(e) {
            const t = e._point;
              const i = e._size / 2;
              const o = this._ctx;
            o.beginPath(),
              o.moveTo(t.x, t.y + i),
              o.lineTo(t.x, t.y - i),
              this._fillStroke(o, e),
              o.moveTo(t.x - i, t.y),
              o.lineTo(t.x + i, t.y),
              this._fillStroke(o, e);
          },
        }),
          t.SVG.include({
            _updateCrossMarker(e) {
              const i = e._point;
                let o = e._size / 2;
              t.Browser.vml && (i._round(), (o = Math.round(o)));
              const r =
                `M${
                i.x
                },${
                i.y + o
                }L${
                i.x
                },${
                i.y - o
                }M${
                i.x - o
                },${
                i.y
                }L${
                i.x + o
                },${
                i.y}`;
              this._setPath(e, r);
            },
          });
      },
    });
    const G = function(e, t, i) {
      return new F(e, t, i);
    };
    const O = V.extend({
      initialize(e, t, i) {
        V.prototype.initialize.call(this, e, t, i);
      },
      _updatePath() {
        this._renderer._updateXMarker(this);
      },
      _svgCanvasIncludes() {
        t.Canvas.include({
          _updateXMarker(e) {
            const t = e._point;
              const i = e._size / 2;
              const o = this._ctx;
            o.beginPath(),
              o.moveTo(t.x + i, t.y + i),
              o.lineTo(t.x - i, t.y - i),
              this._fillStroke(o, e);
          },
        }),
          t.SVG.include({
            _updateXMarker(e) {
              const i = e._point;
                let o = e._size / 2;
              t.Browser.vml && (i._round(), (o = Math.round(o)));
              const r =
                `M${
                i.x + o
                },${
                i.y + o
                }L${
                i.x - o
                },${
                i.y - o
                }M${
                i.x - o
                },${
                i.y + o
                }L${
                i.x + o
                },${
                i.y - o}`;
              this._setPath(e, r);
            },
          });
      },
    });
    const E = function(e, t, i) {
      return new O(e, t, i);
    };
    const W = V.extend({
      options: { fill: !0 },
      initialize(e, t, i) {
        V.prototype.initialize.call(this, e, t, i);
      },
      _updatePath() {
        this._renderer._updateSquareMarker(this);
      },
      _svgCanvasIncludes() {
        t.Canvas.include({
          _updateSquareMarker(e) {
            const t = e._point;
              const i = e._size / 2;
              const o = this._ctx;
            o.beginPath(),
              o.moveTo(t.x + i, t.y + i),
              o.lineTo(t.x - i, t.y + i),
              o.lineTo(t.x - i, t.y - i),
              o.lineTo(t.x + i, t.y - i),
              o.closePath(),
              this._fillStroke(o, e);
          },
        }),
          t.SVG.include({
            _updateSquareMarker(e) {
              const i = e._point;
                let o = e._size / 2;
              t.Browser.vml && (i._round(), (o = Math.round(o)));
              let r =
                `M${
                i.x + o
                },${
                i.y + o
                }L${
                i.x - o
                },${
                i.y + o
                }L${
                i.x - o
                },${
                i.y - o
                }L${
                i.x + o
                },${
                i.y - o}`;
              (r += t.Browser.svg ? "z" : "x"), this._setPath(e, r);
            },
          });
      },
    });
    const j = function(e, t, i) {
      return new W(e, t, i);
    };
    const B = V.extend({
      options: { fill: !0 },
      initialize(e, t, i) {
        V.prototype.initialize.call(this, e, t, i);
      },
      _updatePath() {
        this._renderer._updateDiamondMarker(this);
      },
      _svgCanvasIncludes() {
        t.Canvas.include({
          _updateDiamondMarker(e) {
            const t = e._point;
              const i = e._size / 2;
              const o = this._ctx;
            o.beginPath(),
              o.moveTo(t.x, t.y + i),
              o.lineTo(t.x - i, t.y),
              o.lineTo(t.x, t.y - i),
              o.lineTo(t.x + i, t.y),
              o.closePath(),
              this._fillStroke(o, e);
          },
        }),
          t.SVG.include({
            _updateDiamondMarker(e) {
              const i = e._point;
                let o = e._size / 2;
              t.Browser.vml && (i._round(), (o = Math.round(o)));
              let r =
                `M${
                i.x
                },${
                i.y + o
                }L${
                i.x - o
                },${
                i.y
                }L${
                i.x
                },${
                i.y - o
                }L${
                i.x + o
                },${
                i.y}`;
              (r += t.Browser.svg ? "z" : "x"), this._setPath(e, r);
            },
          });
      },
    });
    const q = function(e, t, i) {
      return new B(e, t, i);
    };
    var A = N.extend({
      statics: {
        MARKERTYPES: [
          "esriSMSCircle",
          "esriSMSCross",
          "esriSMSDiamond",
          "esriSMSSquare",
          "esriSMSX",
          "esriPMS",
        ],
      },
      initialize(e, t) {
        let i;
        if ((N.prototype.initialize.call(this, e, t), t && (this.serviceUrl = t.url), e))
          if (e.type === "esriPMS") {
            const o = this._symbolJson.url;
            (o && o.substr(0, 7) === "http://") || o.substr(0, 8) === "https://"
              ? ((i = this.sanitize(o)), (this._iconUrl = i))
              : ((i = `${this.serviceUrl  }images/${  o}`),
                (this._iconUrl = t && t.token ? `${i  }?token=${  t.token}` : i)),
              e.imageData && (this._iconUrl = `data:${  e.contentType  };base64,${  e.imageData}`),
              (this._icons = {}),
              (this.icon = this._createIcon(this._symbolJson));
          } else this._fillStyles();
      },
      sanitize(e) {
        if (!e) return "";
        let t;
        try {
          (t = e.replace(/<br>/gi, "\n")),
            (t = t.replace(/<p.*>/gi, "\n")),
            (t = t.replace(/<a.*href='(.*?)'.*>(.*?)<\/a>/gi, " $2 ($1) ")),
            (t = t.replace(/<(?:.|\s)*?>/g, ""));
        } catch (e) {
          t = null;
        }
        return t;
      },
      _fillStyles() {
        this._symbolJson.outline &&
        this._symbolJson.size > 0 &&
        this._symbolJson.outline.style !== "esriSLSNull"
          ? ((this._styles.stroke = !0),
            (this._styles.weight = this.pixelValue(this._symbolJson.outline.width)),
            (this._styles.color = this.colorValue(this._symbolJson.outline.color)),
            (this._styles.opacity = this.alphaValue(this._symbolJson.outline.color)))
          : (this._styles.stroke = !1),
          this._symbolJson.color
            ? ((this._styles.fillColor = this.colorValue(this._symbolJson.color)),
              (this._styles.fillOpacity = this.alphaValue(this._symbolJson.color)))
            : (this._styles.fillOpacity = 0),
          this._symbolJson.style === "esriSMSCircle" &&
            (this._styles.radius = this.pixelValue(this._symbolJson.size) / 2);
      },
      _createIcon(e) {
        const i = this.pixelValue(e.width);
          let o = i;
        e.height && (o = this.pixelValue(e.height));
        let r = i / 2;
          let n = o / 2;
        e.xoffset && (r += this.pixelValue(e.xoffset)),
          e.yoffset && (n += this.pixelValue(e.yoffset));
        const s = t.icon({ iconUrl: this._iconUrl, iconSize: [i, o], iconAnchor: [r, n] });
        return (this._icons[e.width.toString()] = s), s;
      },
      _getIcon(e) {
        let t = this._icons[e.toString()];
        return t || (t = this._createIcon({ width: e })), t;
      },
      pointToLayer(e, i, o, r) {
        let n = this._symbolJson.size || this._symbolJson.width;
        if (!this._isDefault) {
          if (o.sizeInfo) {
            const s = this.getSize(e, o.sizeInfo);
            s && (n = s);
          }
          if (o.colorInfo) {
            const a = this.getColor(e, o.colorInfo);
            a &&
              ((this._styles.fillColor = this.colorValue(a)),
              (this._styles.fillOpacity = this.alphaValue(a)));
          }
        }
        if (this._symbolJson.type === "esriPMS") {
          const l = t.extend({}, { icon: this._getIcon(n) }, r);
          return t.marker(i, l);
        }
        switch (((n = this.pixelValue(n)), this._symbolJson.style)) {
          case "esriSMSSquare":
            return j(i, n, t.extend({}, this._styles, r));
          case "esriSMSDiamond":
            return q(i, n, t.extend({}, this._styles, r));
          case "esriSMSCross":
            return G(i, n, t.extend({}, this._styles, r));
          case "esriSMSX":
            return E(i, n, t.extend({}, this._styles, r));
        }
        return (this._styles.radius = n / 2), t.circleMarker(i, t.extend({}, this._styles, r));
      },
    });
    var R = N.extend({
      statics: {
        LINETYPES: [
          "esriSLSDash",
          "esriSLSDot",
          "esriSLSDashDotDot",
          "esriSLSDashDot",
          "esriSLSSolid",
        ],
      },
      initialize(e, t) {
        N.prototype.initialize.call(this, e, t), this._fillStyles();
      },
      _fillStyles() {
        if (
          ((this._styles.lineCap = "butt"),
          (this._styles.lineJoin = "miter"),
          (this._styles.fill = !1),
          (this._styles.weight = 0),
          !this._symbolJson)
        )
          return this._styles;
        if (
          (this._symbolJson.color &&
            ((this._styles.color = this.colorValue(this._symbolJson.color)),
            (this._styles.opacity = this.alphaValue(this._symbolJson.color))),
          !isNaN(this._symbolJson.width))
        ) {
          this._styles.weight = this.pixelValue(this._symbolJson.width);
          let e = [];
          switch (this._symbolJson.style) {
            case "esriSLSDash":
              e = [4, 3];
              break;
            case "esriSLSDot":
              e = [1, 3];
              break;
            case "esriSLSDashDot":
              e = [8, 3, 1, 3];
              break;
            case "esriSLSDashDotDot":
              e = [8, 3, 1, 3, 1, 3];
          }
          if (e.length > 0) {
            for (let t = 0; t < e.length; t++) e[t] *= this._styles.weight;
            this._styles.dashArray = e.join(",");
          }
        }
      },
      style(e, t) {
        if (!this._isDefault && t) {
          if (t.sizeInfo) {
            const i = this.pixelValue(this.getSize(e, t.sizeInfo));
            i && (this._styles.weight = i);
          }
          if (t.colorInfo) {
            const o = this.getColor(e, t.colorInfo);
            o &&
              ((this._styles.color = this.colorValue(o)),
              (this._styles.opacity = this.alphaValue(o)));
          }
        }
        return this._styles;
      },
    });
    var U = N.extend({
      statics: { POLYGONTYPES: ["esriSFSSolid"] },
      initialize(e, t) {
        N.prototype.initialize.call(this, e, t),
          e &&
            (e.outline && e.outline.style === "esriSLSNull"
              ? (this._lineStyles = { weight: 0 })
              : (this._lineStyles = c(e.outline, t).style()),
            this._fillStyles());
      },
      _fillStyles() {
        if (this._lineStyles)
          if (this._lineStyles.weight === 0) this._styles.stroke = !1;
          else for (const e in this._lineStyles) this._styles[e] = this._lineStyles[e];
        this._symbolJson &&
          (this._symbolJson.color && U.POLYGONTYPES.indexOf(this._symbolJson.style >= 0)
            ? ((this._styles.fill = !0),
              (this._styles.fillColor = this.colorValue(this._symbolJson.color)),
              (this._styles.fillOpacity = this.alphaValue(this._symbolJson.color)))
            : ((this._styles.fill = !1), (this._styles.fillOpacity = 0)));
      },
      style(e, t) {
        if (!this._isDefault && t && t.colorInfo) {
          const i = this.getColor(e, t.colorInfo);
          i &&
            ((this._styles.fillColor = this.colorValue(i)),
            (this._styles.fillOpacity = this.alphaValue(i)));
        }
        return this._styles;
      },
    });
    const H = t.Class.extend({
      options: { proportionalPolygon: !1, clickable: !0 },
      initialize(e, i) {
        (this._rendererJson = e),
          (this._pointSymbols = !1),
          (this._symbols = []),
          (this._visualVariables = this._parseVisualVariables(e.visualVariables)),
          t.Util.setOptions(this, i);
      },
      _parseVisualVariables(e) {
        const t = {};
        if (e) for (let i = 0; i < e.length; i++) t[e[i].type] = e[i];
        return t;
      },
      _createDefaultSymbol() {
        this._rendererJson.defaultSymbol &&
          ((this._defaultSymbol = this._newSymbol(this._rendererJson.defaultSymbol)),
          (this._defaultSymbol._isDefault = !0));
      },
      _newSymbol(e) {
        return e.type === "esriSMS" || e.type === "esriPMS"
          ? ((this._pointSymbols = !0), y(e, this.options))
          : e.type === "esriSLS"
          ? c(e, this.options)
          : e.type === "esriSFS"
          ? d(e, this.options)
          : void 0;
      },
      _getSymbol() {},
      attachStylesToLayer(e) {
        this._pointSymbols
          ? (e.options.pointToLayer = t.Util.bind(this.pointToLayer, this))
          : ((e.options.style = t.Util.bind(this.style, this)),
            (e._originalStyle = e.options.style));
      },
      pointToLayer(e, i) {
        const o = this._getSymbol(e);
        return o && o.pointToLayer
          ? o.pointToLayer(e, i, this._visualVariables, this.options)
          : t.circleMarker(i, { radius: 0, opacity: 0 });
      },
      style(e) {
        let t;
        this.options.userDefinedStyle && (t = this.options.userDefinedStyle(e));
        const i = this._getSymbol(e);
        return i
          ? this.mergeStyles(i.style(e, this._visualVariables), t)
          : this.mergeStyles({ opacity: 0, fillOpacity: 0 }, t);
      },
      mergeStyles(e, t) {
        let i;
          const o = {};
        for (i in e) e.hasOwnProperty(i) && (o[i] = e[i]);
        if (t) for (i in t) t.hasOwnProperty(i) && (o[i] = t[i]);
        return o;
      },
    });
    var Y = H.extend({
      initialize(e, t) {
        H.prototype.initialize.call(this, e, t),
          (this._field = this._rendererJson.field),
          this._rendererJson.normalizationType &&
            this._rendererJson.normalizationType === "esriNormalizeByField" &&
            (this._normalizationField = this._rendererJson.normalizationField),
          this._createSymbols();
      },
      _createSymbols() {
        let e;
          const t = this._rendererJson.classBreakInfos;
        this._symbols = [];
        for (let i = t.length - 1; i >= 0; i--)
          (e =
            this.options.proportionalPolygon && this._rendererJson.backgroundFillSymbol
              ? this._newSymbol(this._rendererJson.backgroundFillSymbol)
              : this._newSymbol(t[i].symbol)),
            (e.val = t[i].classMaxValue),
            this._symbols.push(e);
        this._symbols.sort(function(e, t) {
          return e.val > t.val ? 1 : -1;
        }),
          this._createDefaultSymbol(),
          (this._maxValue = this._symbols[this._symbols.length - 1].val);
      },
      _getSymbol(e) {
        let t = e.properties[this._field];
        if (this._normalizationField) {
          const i = e.properties[this._normalizationField];
          if (isNaN(i) || i === 0) return this._defaultSymbol;
          t /= i;
        }
        if (t > this._maxValue) return this._defaultSymbol;
        for (
          var o = this._symbols[0], r = this._symbols.length - 1;
          r >= 0 && !(t > this._symbols[r].val);
          r--
        )
          o = this._symbols[r];
        return o;
      },
    });
    var K = H.extend({
      initialize(e, t) {
        H.prototype.initialize.call(this, e, t),
          (this._field = this._rendererJson.field1),
          this._createSymbols();
      },
      _createSymbols() {
        for (var e, t = this._rendererJson.uniqueValueInfos, i = t.length - 1; i >= 0; i--)
          (e = this._newSymbol(t[i].symbol)), (e.val = t[i].value), this._symbols.push(e);
        this._createDefaultSymbol();
      },
      _getSymbol(e) {
        let t = e.properties[this._field];
        if (this._rendererJson.fieldDelimiter && this._rendererJson.field2) {
          const i = e.properties[this._rendererJson.field2];
          if (i) {
            t += this._rendererJson.fieldDelimiter + i;
            const o = e.properties[this._rendererJson.field3];
            o && (t += this._rendererJson.fieldDelimiter + o);
          }
        }
        for (var r = this._defaultSymbol, n = this._symbols.length - 1; n >= 0; n--)
          this._symbols[n].val == t && (r = this._symbols[n]);
        return r;
      },
    });
    var X = H.extend({
      initialize(e, t) {
        H.prototype.initialize.call(this, e, t), this._createSymbol();
      },
      _createSymbol() {
        this._rendererJson.symbol && this._symbols.push(this._newSymbol(this._rendererJson.symbol));
      },
      _getSymbol() {
        return this._symbols[0];
      },
    });
    var $ = t.GeoJSON.extend({
      options: { data: {}, opacity: 1 },
      initialize(e, i) {
        t.setOptions(this, i),
          (this.data = this.options.data),
          (this.opacity = this.options.opacity),
          (this.popupInfo = null),
          (this.labelingInfo = null),
          (this._layers = {});
        let o; let r;
        if (e) for (o = 0, r = e.length; o < r; o++) this.addLayer(e[o]);
        typeof this.data === "string"
          ? this._getFeatureCollection(this.data)
          : this._parseFeatureCollection(this.data);
      },
      _getFeatureCollection(e) {
        const i = `https://www.arcgis.com/sharing/rest/content/items/${  e  }/data`;
        t.esri.request(
          i,
          {},
          function(e, t) {
            e ? console.log(e) : this._parseFeatureCollection(t);
          },
          this
        );
      },
      _parseFeatureCollection(e) {
        let t;
          let i;
          let o = 0;
        for (t = 0, i = e.layers.length; t < i; t++)
          e.layers[t].featureSet.features.length > 0 && (o = t);
        let r = e.layers[o].featureSet.features;
          const n = e.layers[o].layerDefinition.geometryType;
          const s = e.layers[o].layerDefinition.objectIdField;
          const a = e.layers[o].layerDefinition || null;
        e.layers[o].layerDefinition.extent.spatialReference.wkid !== 4326 &&
          (e.layers[o].layerDefinition.extent.spatialReference.wkid !== 102100 &&
            console.error(
              `[L.esri.WebMap] this wkid (${
                e.layers[o].layerDefinition.extent.spatialReference.wkid
                }) is not supported.`
            ),
          (r = this._projTo4326(r, n))),
          void 0 !== e.layers[o].popupInfo && (this.popupInfo = e.layers[o].popupInfo),
          void 0 !== e.layers[o].layerDefinition.drawingInfo.labelingInfo &&
            (this.labelingInfo = e.layers[o].layerDefinition.drawingInfo.labelingInfo),
          console.log(e);
        const l = this._featureCollectionToGeoJSON(r, s);
        a !== null && v(a, this), this.addData(l);
      },
      _projTo4326(e, i) {
        let o;
          let r;
          const n = [];
        for (o = 0, r = e.length; o < r; o++) {
          var s;
            var a;
            var l;
            const u = e[o];
          if (i === "esriGeometryPoint")
            (s = t.Projection.SphericalMercator.unproject(t.point(u.geometry.x, u.geometry.y))),
              (u.geometry.x = s.lng),
              (u.geometry.y = s.lat);
          else if (i === "esriGeometryMultipoint") {
            var p;
            for (a = 0, p = u.geometry.points.length; a < p; a++)
              (s = t.Projection.SphericalMercator.unproject(
                t.point(u.geometry.points[a][0], u.geometry.points[a][1])
              )),
                (u.geometry.points[a][0] = s.lng),
                (u.geometry.points[a][1] = s.lat);
          } else if (i === "esriGeometryPolyline") {
            var f; var h;
            for (a = 0, h = u.geometry.paths.length; a < h; a++)
              for (l = 0, f = u.geometry.paths[a].length; l < f; l++)
                (s = t.Projection.SphericalMercator.unproject(
                  t.point(u.geometry.paths[a][l][0], u.geometry.paths[a][l][1])
                )),
                  (u.geometry.paths[a][l][0] = s.lng),
                  (u.geometry.paths[a][l][1] = s.lat);
          } else if (i === "esriGeometryPolygon") {
            var y; var c;
            for (a = 0, c = u.geometry.rings.length; a < c; a++)
              for (l = 0, y = u.geometry.rings[a].length; l < y; l++)
                (s = t.Projection.SphericalMercator.unproject(
                  t.point(u.geometry.rings[a][l][0], u.geometry.rings[a][l][1])
                )),
                  (u.geometry.rings[a][l][0] = s.lng),
                  (u.geometry.rings[a][l][1] = s.lat);
          }
          n.push(u);
        }
        return n;
      },
      _featureCollectionToGeoJSON(e, t) {
        let i;
          let o;
          const r = { type: "FeatureCollection", features: [] };
          const n = [];
        for (i = 0, o = e.length; i < o; i++) {
          const s = h(e[i], t);
          n.push(s);
        }
        return (r.features = n), r;
      },
    });
    var Q = t.GeoJSON.extend({
      options: { url: "", data: {}, opacity: 1 },
      initialize(e, i) {
        t.setOptions(this, i),
          (this.url = this.options.url),
          (this.layerDefinition = this.options.layerDefinition),
          (this.locationInfo = this.options.locationInfo),
          (this.opacity = this.options.opacity),
          (this._layers = {});
        let o; let r;
        if (e) for (o = 0, r = e.length; o < r; o++) this.addLayer(e[o]);
        this._parseCSV(this.url, this.layerDefinition, this.locationInfo);
      },
      _parseCSV(e, t, o) {
        i.csv(e, { latfield: o.latitudeFieldName, lonfield: o.longitudeFieldName }, this),
          v(t, this);
      },
    });
    var Z = t.GeoJSON.extend({
      options: { opacity: 1, url: "" },
      initialize(e, i) {
        t.setOptions(this, i),
          (this.url = this.options.url),
          (this.opacity = this.options.opacity),
          (this.popupInfo = null),
          (this.labelingInfo = null),
          (this._layers = {});
        let o; let r;
        if (e) for (o = 0, r = e.length; o < r; o++) this.addLayer(e[o]);
        this._getKML(this.url);
      },
      _getKML(e) {
        const i =
          `http://utility.arcgis.com/sharing/kml?url=${
          e
          }&model=simple&folders=&outSR=%7B"wkid"%3A4326%7D`;
        t.esri.request(
          i,
          {},
          function(e, t) {
            e
              ? console.log(e)
              : (this._parseFeatureCollection(t.featureCollection));
          },
          this
        );
      },
      _parseFeatureCollection(e) {
        let t;
        for (t = 0; t < 3; t++)
          if (e.layers[t].featureSet.features.length > 0) {
            const i = e.layers[t].featureSet.features;
              const o = e.layers[t].layerDefinition.objectIdField;
              const r = this._featureCollectionToGeoJSON(i, o);
            void 0 !== e.layers[t].popupInfo && (this.popupInfo = e.layers[t].popupInfo),
              void 0 !== e.layers[t].layerDefinition.drawingInfo.labelingInfo &&
                (this.labelingInfo = e.layers[t].layerDefinition.drawingInfo.labelingInfo),
              v(e.layers[t].layerDefinition, this),
              this.addData(r);
          }
      },
      _featureCollectionToGeoJSON(e, t) {
        let i;
          let o;
          const r = { type: "FeatureCollection", features: [] };
          const n = [];
        for (i = 0, o = e.length; i < o; i++) {
          const s = h(e[i], t);
          n.push(s);
        }
        return (r.features = n), r;
      },
    });
    var ee = t.DivIcon.extend({
      options: { iconSize: null, className: "esri-leaflet-webmap-labels", text: "" },
      createIcon(e) {
        const i = e && e.tagName === "DIV" ? e : document.createElement("div");
          const o = this.options;
        if (
          ((i.innerHTML =
            `<div style="position: relative; left: -50%; text-shadow: 1px 1px 0px #fff, -1px 1px 0px #fff, 1px -1px 0px #fff, -1px -1px 0px #fff;">${
            o.text
            }</div>`),
          (i.style.fontSize = "1em"),
          (i.style.fontWeight = "bold"),
          (i.style.textTransform = "uppercase"),
          (i.style.textAlign = "center"),
          (i.style.whiteSpace = "nowrap"),
          o.bgPos)
        ) {
          const r = t.point(o.bgPos);
          i.style.backgroundPosition = `${-r.x  }px ${  -r.y  }px`;
        }
        return this._setIconStyles(i, "icon"), i;
      },
    });
    var te = t.Marker.extend({
      options: { properties: {}, labelingInfo: {}, offset: [0, 0] },
      initialize(e, i) {
        t.setOptions(this, i), (this._latlng = t.latLng(e));
        const o = this._createLabelText(this.options.properties, this.options.labelingInfo);
        this._setLabelIcon(o, this.options.offset);
      },
      _createLabelText(e, t) {
        const i = /\[([^\]]*)\]/g;
          let o = t[0].labelExpression;
        return (
          o == null && (o = ""),
          (o = o.replace(i, function(t) {
            const o = i.exec(t);
            return e[o[1]];
          }))
        );
      },
      _setLabelIcon(e, t) {
        const i = L({ text: e, iconAnchor: t });
        this.setIcon(i);
      },
    });
    var ie = t.Evented.extend({
      options: { map: {}, token: null, server: "www.arcgis.com" },
      initialize(e, i) {
        t.setOptions(this, i),
          (this._map = this.options.map),
          (this._token = this.options.token),
          (this._server = this.options.server),
          (this._webmapId = e),
          (this._loaded = !1),
          (this._metadataLoaded = !1),
          (this._loadedLayersNum = 0),
          (this._layersNum = 0),
          (this.layers = []),
          (this.title = ""),
          (this.bookmarks = []),
          (this.portalItem = {}),
          (this.VERSION = "0.4.0"),
          this._loadWebMapMetaData(e),
          this._loadWebMap(e);
      },
      _checkLoaded() {
        ++this._loadedLayersNum === this._layersNum && ((this._loaded = !0), this.fire("load"));
      },
      _operationalLayer(e, t, i, o, r) {
        const n = T(e, t, i, o);
        void 0 !== n && !0 === e.visibility && n.addTo(i);
      },
      _loadWebMapMetaData(e) {
        const i = {};
          const o = this._map;
          const r = this;
          const n = `https://${  this._server  }/sharing/rest/content/items/${  e}`;
        this._token && this._token.length > 0 && (i.token = this._token),
          t.esri.request(n, i, function(e, t) {
            e
              ? console.log(e)
              : (
                (r.portalItem = t),
                (r.title = t.title),
                (r._metadataLoaded = !0),
                r.fire("metadataLoad"),
                o.fitBounds([t.extent[0].reverse(), t.extent[1].reverse()]));
          });
      },
      _loadWebMap(e) {
        const i = this._map;
          const o = this.layers;
          const r = this._server;
          const n = {};
          const s = `https://${  r  }/sharing/rest/content/items/${  e  }/data`;
        this._token && this._token.length > 0 && (n.token = this._token),
          t.esri.request(
            s,
            n,
            function(e, s) {
              e
                ? console.log(e)
                : (
                  (this._layersNum = s.baseMap.baseMapLayers.length + s.operationalLayers.length),
                  s.baseMap.baseMapLayers.map(
                    function(s) {
                      if (void 0 !== s.itemId) {
                        const a = `https://${  r  }/sharing/rest/content/items/${  s.itemId}`;
                        t.esri.request(
                          a,
                          n,
                          function(t, r) {
                            t
                              ? console.error(e)
                              : (
                                r.access !== "public"
                                  ? this._operationalLayer(s, o, i, n)
                                  : this._operationalLayer(s, o, i, {})),
                              this._checkLoaded();
                          },
                          this
                        );
                      } else this._operationalLayer(s, o, i, {}), this._checkLoaded();
                    }.bind(this)
                  ),
                  s.operationalLayers.map(
                    function(s, a) {
                      const l = `esri-webmap-layer${  a}`;
                      if ((i.createPane(l), void 0 !== s.itemId)) {
                        const u = `https://${  r  }/sharing/rest/content/items/${  s.itemId}`;
                        t.esri.request(
                          u,
                          n,
                          function(t, r) {
                            t
                              ? console.error(e)
                              : (
                                r.access !== "public"
                                  ? this._operationalLayer(s, o, i, n, l)
                                  : this._operationalLayer(s, o, i, {}, l)),
                              this._checkLoaded();
                          },
                          this
                        );
                      } else this._operationalLayer(s, o, i, {}, l), this._checkLoaded();
                    }.bind(this)
                  ),
                  void 0 !== s.bookmarks &&
                    s.bookmarks.length > 0 &&
                    s.bookmarks.map(
                      function(e) {
                        const i = t.Projection.SphericalMercator.unproject(
                            t.point(e.extent.xmax, e.extent.ymax)
                          );
                          const o = t.Projection.SphericalMercator.unproject(
                            t.point(e.extent.xmin, e.extent.ymin)
                          );
                          const r = t.latLngBounds(o, i);
                        this.bookmarks.push({ name: e.name, bounds: r });
                      }.bind(this)
                    ));
            }.bind(this)
          );
      },
    });
  (e.WebMap = ie),
    (e.webMap = J),
    (e.operationalLayer = T),
    (e.FeatureCollection = $),
    (e.featureCollection = S),
    (e.LabelMarker = te),
    (e.labelMarker = M),
    (e.LabelIcon = ee),
    (e.labelIcon = L),
    (e.createPopupContent = z),
    Object.defineProperty(e, "__esModule", { value: !0 });
});
// # sourceMappingURL=esri-leaflet-webmap.js.map
