/* eslint-disable */

/*! https://github.com/PowerPan/leaflet.mouseCoordinate   */

(L.Control.mouseCoordinate = L.Control.extend({
  options: {
    gps: !0,
    gpsLong: !0,
    utm: !1,
    utmref: !1,
    position: "bottomright",
    _sm_a: 6378137,
    _sm_b: 6356752.314,
    _sm_EccSquared: 0.00669437999013,
    _UTMScaleFactor: 0.9996,
  },
  onAdd(t) {
    if (
      ((this._map = t),
      L.Browser.mobile ||
        L.Browser.mobileWebkit ||
        L.Browser.mobileWebkit3d ||
        L.Browser.mobileOpera ||
        L.Browser.mobileGecko)
    )
      return L.DomUtil.create("div");
    const n = (this._container = L.DomUtil.create("div", "leaflet-control-mouseCoordinate"));
    L.DomEvent.disableClickPropagation(n);
    return (
      (this._gpsPositionContainer = L.DomUtil.create("div", "gpsPos", n)),
      t.on("click", this._update, this),
      n
    );
  },
  _update(t) {
    let n = (t.latlng.lat + 90) % 180;
    let r = (t.latlng.lng + 180) % 360;
    n < 0 && (n += 180), (n -= 90), r < 0 && (r += 360);
    const a = { lat: n, lng: (r -= 180) };
    let e = "<table>";
    if (
      this.options.gps &&
      ((e += `<tr><td>LAT/LONG</td></tr><tr><td>DD :</td><td>${Math.round(1e5 * n) /
        1e5}</td><td> ${Math.round(1e5 * r) / 1e5}</td></tr>`),
      this.options.gpsLong)
    ) {
      const o = this._geo2geodeziminuten(a);
      e += `<tr><td>DDM :</td><td class='coords'>${o.NS} ${o.latgrad}&deg; ${o.latminuten}</td><td class='coords'> ${o.WE} ${o.lnggrad}&deg; ${o.lngminuten}</td></tr>`;
      const s = this._geo2gradminutensekunden(a);
      e += `<tr><td>DMS :</td><td>${s.NS} ${s.latgrad}&deg; ${s.latminuten}&prime; ${s.latsekunden}&Prime;</td><td> ${s.WE} ${s.lnggrad}&deg; ${s.lngminuten}&prime; ${s.lngsekunden}&Prime;</td></tr>`;
    }
    if (this.options.utm) {
      const i = UTM.fromLatLng(a);
      void 0 !== i &&
        (e += `<tr><td>UTM :</td><td colspan='2'>${i.zone}&nbsp;${i.x}&nbsp;${i.y}</td></tr>`);
    }
    if (this.options.utmref) {
      const d = UTMREF.fromUTM(UTM.fromLatLng(a));
      void 0 !== d &&
        (e += `<tr><td>UTM REF</td><td colspan='2'>${d.zone}&nbsp;${d.band}&nbsp;${d.x}&nbsp;${d.y}</td></tr>`);
    }
    if (
      (this.options.qth && (e += `<tr><td>QTH</td><td colspan='2'>${QTH.fromLatLng(a)}</td></tr>`),
      this.options.nac)
    ) {
      const l = NAC.fromLatLng(a);
      e += `<tr><td>NAC</td><td colspan='2'>${l.y} ${l.x}</td></tr>`;
    }
    (e += "</table>"), (this._gpsPositionContainer.innerHTML = e);
  },
  _geo2geodeziminuten(t) {
    const n = parseInt(t.lat, 10);
    const r = Math.round(60 * (t.lat - n) * 1e4) / 1e4;
    const a = parseInt(t.lng, 10);
    const e = Math.round(60 * (t.lng - a) * 1e4) / 1e4;
    return this._AddNSEW({ latgrad: n, latminuten: r, lnggrad: a, lngminuten: e });
  },
  _geo2gradminutensekunden(t) {
    const n = parseInt(t.lat, 10);
    let r = 60 * (t.lat - n);
    const a = Math.round(60 * (r - parseInt(r, 10)) * 100) / 100;
    r = parseInt(r, 10);
    const e = parseInt(t.lng, 10);
    let o = 60 * (t.lng - e);
    const s = Math.round(60 * (o - parseInt(o, 10)) * 100) / 100;
    return (
      (o = parseInt(o, 10)),
      this._AddNSEW({
        latgrad: n,
        latminuten: r,
        latsekunden: a,
        lnggrad: e,
        lngminuten: o,
        lngsekunden: s,
      })
    );
  },
  _AddNSEW(t) {
    return (
      (t.NS = "N"),
      (t.WE = "E"),
      t.latgrad < 0 && ((t.latgrad = -1 * t.latgrad), (t.NS = "S")),
      t.lnggrad < 0 && ((t.lnggrad = -1 * t.lnggrad), (t.WE = "W")),
      t
    );
  },
})),
  (L.control.mouseCoordinate = function(t) {
    return new L.Control.mouseCoordinate(t);
  });
var NAC = {
  fromLatLng(t) {
    const n = t.lat;
    const r = t.lng;
    let a = [];
    let e = [];
    const o = [];
    if (((o.x = ""), (o.y = ""), r >= -180 && r <= 180)) {
      const s = (r + 180) / 360;
      a = this._calcValues(s);
    } else a[0] = 0;
    if (n >= -90 && n <= 90) {
      const i = (n + 90) / 180;
      e = this._calcValues(i);
    } else e[0] = 0;
    for (var d = 0; d < a.length; d++) o.x += this._nac2Letter(a[d]);
    for (d = 0; d < e.length; d++) o.y += this._nac2Letter(e[d]);
    return o;
  },
  _calcValues(t) {
    const n = [];
    return (
      (n[0] = parseInt(30 * t, 10)),
      (n[1] = parseInt(30 * (30 * t - n[0]), 10)),
      (n[2] = parseInt(30 * (30 * (30 * t - n[0]) - n[1]), 10)),
      (n[3] = parseInt(30 * (30 * (30 * (30 * t - n[0]) - n[1]) - n[2]), 10)),
      (n[4] = parseInt(30 * (30 * (30 * (30 * (30 * t - n[0]) - n[1]) - n[2]) - n[3]), 10)),
      (n[5] = parseInt(
        30 * (30 * (30 * (30 * (30 * (30 * t - n[0]) - n[1]) - n[2]) - n[3]) - n[4]),
        10
      )),
      n
    );
  },
  _nac2Letter(t) {
    return !isNaN(t) && t < 30 ? "0123456789BCDFGHJKLMNPQRSTVWXZ".substr(t, 1) : 0;
  },
};
var QTH = {
  fromLatLng(t) {
    let n;
    let r;
    let a;
    let e;
    let o;
    let s;
    const i = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let d = 0;
    const l = [0, 0, 0];
    const u = [0, 0, 0, 0, 0, 0, 0];
    for (l[1] = t.lng + 180, l[2] = t.lat + 90, r = 1; r < 3; ++r)
      for (a = 1; a < 4; ++a)
        a !== 3
          ? (r === 1 && (a === 1 && (e = 20), a === 2 && (e = 2)),
            r === 2 && (a === 1 && (e = 10), a === 2 && (e = 1)),
            (o = l[r] / e),
            (l[r] = o),
            (s = l[r] > 0 ? Math.floor(o) : Math.ceil(o)),
            (l[r] = (l[r] - s) * e))
          : ((e = r === 1 ? 12 : 24),
            (o = l[r] * e),
            (l[r] = o),
            (s = l[r] > 0 ? Math.floor(o) : Math.ceil(o))),
          (u[++d] = s);
    return (
      (n = i.charAt(u[1]) + i.charAt(u[4]) + "0123456789".charAt(u[2])),
      (n += "0123456789".charAt(u[5]) + i.charAt(u[3]) + i.charAt(u[6]))
    );
  },
};
var UTM = {
  fromLatLng(t) {
    let n = t.lng;
    let r = t.lat;
    if (
      (n === -180 && (n += 1e-13),
      n === 180 && (n -= 1e-13),
      r === -90 && (r += 1e-13),
      r === 90 && (r -= 1e-13),
      !(n <= -180 || n >= 180 || r <= -80 || r >= 84))
    ) {
      (n = parseFloat(n)), (r = parseFloat(r));
      const a = 0.00335281068;
      const e = Math.PI;
      const o = 6378137 / (1 - a);
      const s = 0.006739496773090375;
      const i = o * (e / 180) * 0.9949771060629756;
      const d = parseInt((n + 180) / 6, 10) + 1;
      let l = d;
      d < 10 && (l = `0${d}`),
        r >= 56 && r < 64 && n >= 3 && n < 12 && (l = 32),
        r >= 72 &&
          r < 84 &&
          (n >= 0 && n < 9
            ? (l = 31)
            : n >= 9 && n < 21
            ? (l = 33)
            : n >= 21 && n < 33
            ? (l = 35)
            : n >= 33 && n < 42 && (l = 37));
      let u;
      const g = parseInt(1 + (r + 80) / 8, 10);
      const h = "CDEFGHJKLMNPQRSTUVWXX".substr(g - 1, 1);
      const p = (r * e) / 180;
      const c = Math.tan(p);
      const m = c * c;
      const f = m * m;
      const M = Math.cos(p);
      const L = M * M;
      const b = L * L;
      const v = L * M;
      const _ = b * M;
      const I = s * L;
      const T = o / Math.sqrt(1 + I);
      const N =
        i * r +
        -16038.508686878376 * Math.sin(2 * p) +
        16.832627424514854 * Math.sin(4 * p) +
        -0.02198090722059709 * Math.sin(6 * p);
      const U = ((n - (6 * (d - 30) - 3)) * e) / 180;
      const A = U * U;
      const C = A * A;
      let E =
        0.9996 *
          (T * M * U +
            (T * v * (1 - m + I) * (A * U)) / 6 +
            (T * _ * (5 - 18 * m + f) * (C * U)) / 120) +
        5e5;
      const S = l + h;
      let F =
        (u =
          r < 0
            ? 1e7 + 0.9996 * (N + (T * L * c * A) / 2 + (T * b * c * (5 - m + 9 * I) * C) / 24)
            : 0.9996 * (N + (T * L * c * A) / 2 + (T * b * c * (5 - m + 9 * I) * C) / 24)) -
        parseInt(u, 10);
      for (u = F < 0.5 ? `${parseInt(u, 10)}` : `${parseInt(u, 10) + 1}`; u.length < 7; )
        u = `0${u}`;
      return (
        (F = E - parseInt(E, 10)),
        (E = F < 0.5 ? `0${parseInt(E, 10)}` : `0${parseInt(E + 1, 10)}`),
        { zone: S, x: E, y: u }
      );
    }
    console.error(
      "Out of lw <= -180 || lw >= 180 || bw <= -80 || bw >= 84 bounds, which is kinda similar to UTM bounds, if you ignore the poles"
    );
  },
  toLatLng(t) {
    let n = t.zone;
    let r = t.x;
    let a = t.y;
    if (n === "" || r === "" || a === "") return (n = ""), (r = ""), void (a = "");
    const e = n.substr(2, 1);
    (n = parseFloat(n)), (r = parseFloat(r)), (a = parseFloat(a));
    let o;
    const s = 0.00335281068;
    const i = Math.PI;
    const d = 6378137 / (1 - s);
    const l = 0.006739496773090375;
    const u = d * (i / 180) * 0.9949771060629756;
    const g = (180 / i) * 0.0025188265953247774;
    const h = (180 / i) * 37009497348592385e-22;
    const p = (180 / i) * 7.447241158930448e-9;
    const c = (o = e >= "N" || e === "" ? a : a - 1e7) / 0.9996 / u;
    const m = (c * i) / 180;
    const f = c + g * Math.sin(2 * m) + h * Math.sin(4 * m) + p * Math.sin(6 * m);
    const M = (f * i) / 180;
    const L = Math.tan(M);
    const b = L * L;
    const v = b * b;
    const _ = Math.cos(M);
    const I = l * (_ * _);
    const T = d / Math.sqrt(1 + I);
    const N = T * T;
    const U = N * N;
    const A = (r - 5e5) / 0.9996;
    const C = A * A;
    const E = C * A;
    return {
      lat:
        f +
        (180 / i) *
          (((-L * (1 + I)) / (2 * N)) * C +
            ((L * (5 + 3 * b + 6 * I * (1 - b))) / (24 * U)) * (C * C) +
            ((-L * (61 + 90 * b + 45 * v)) / (720 * (U * N))) * (E * E)),
      lng:
        6 * (n - 30) -
        3 +
        (180 / i) *
          ((1 / (T * _)) * A +
            (-(1 + 2 * b + I) / (6 * (N * T) * _)) * E +
            ((5 + 28 * b + 24 * v) / (120 * (U * T) * _)) * (E * C)),
    };
  },
};
var UTMREF = {
  fromUTM(t) {
    if (void 0 !== t) {
      let n;
      const r = t.zone;
      const a = t.x;
      const e = t.y;
      const o = r.substr(0, 2);
      const s = (r.substr(2, 1), parseInt(a.substr(0, 2), 10));
      const i = parseInt(e.substr(0, 2), 10);
      const d = a.substr(2, 5);
      const l = e.substr(2, 5);
      let u = o % 3;
      u === 1 && (n = s - 1), u === 2 && (n = s + 7), u === 0 && (n = s + 15);
      let g;
      for (g = (u = o % 2) === 1 ? 0 : 5, u = i; u - 20 >= 0; ) u -= 20;
      return (
        (g += u) > 19 && (g -= 20),
        {
          zone: r,
          band: "ABCDEFGHJKLMNPQRSTUVWXYZ".charAt(n) + "ABCDEFGHJKLMNPQRSTUV".charAt(g),
          x: d,
          y: l,
        }
      );
    }
  },
  toUTM(t) {
    let n;
    const r = t.zone;
    const a = t.band.substr(0, 1);
    const e = (t.band.substr(1, 1), parseInt(r.substr(0, 2), 10) % 3);
    e === 0 && (n = "STUVWXYZ".indexOf(a) + 1),
      e === 1 && (n = "ABCDEFGH".indexOf(a) + 1),
      e === 2 && (n = "JKLMNPQR".indexOf(a) + 1);
    let o;
    const s = `0${n}`;
    const i = this._mgr2utm_find_m_cn(r);
    return (o = i.length === 1 ? `0${i}` : `${i}`), { zone: r, x: s, y: o };
  },
};
