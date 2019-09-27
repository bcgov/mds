/* eslint-disable */
/* prettier-ignore */

/*! https://github.com/PowerPan/leaflet.mouseCoordinate   */

L.Control.mouseCoordinate=L.Control.extend({options:{gps:!0,gpsLong:!0,utm:!1,utmref:!1,position:"bottomright",_sm_a:6378137,_sm_b:6356752.314,_sm_EccSquared:.00669437999013,_UTMScaleFactor:.9996},onAdd:function(t){if(this._map=t,L.Browser.mobile||L.Browser.mobileWebkit||L.Browser.mobileWebkit3d||L.Browser.mobileOpera||L.Browser.mobileGecko)return L.DomUtil.create("div");var n=this._container=L.DomUtil.create("div","leaflet-control-mouseCoordinate");L.DomEvent.disableClickPropagation(n);return this._gpsPositionContainer=L.DomUtil.create("div","gpsPos",n),t.on("click",this._update,this),n},_update:function(t){var n=(t.latlng.lat+90)%180,r=(t.latlng.lng+180)%360;n<0&&(n+=180),n-=90,r<0&&(r+=360);var a={lat:n,lng:r-=180},e="<table>";if(this.options.gps&&(e+="<tr><td>DD :</td><td>"+Math.round(1e5*n)/1e5+"</td><td> "+Math.round(1e5*r)/1e5+"</td></tr>",this.options.gpsLong)){var o=this._geo2geodeziminuten(a);e+="<tr><td>DDM :</td><td>"+o.NS+" "+o.latgrad+"&deg; "+o.latminuten+"</td><td> "+o.WE+" "+o.lnggrad+"&deg; "+o.lngminuten*-1+"</td></tr>";var s=this._geo2gradminutensekunden(a);e+="<tr><td>DMS :</td><td>"+s.NS+" "+s.latgrad+"&deg; "+s.latminuten+"&prime; "+s.latsekunden+"&Prime;</td><td> "+s.WE+" "+s.lnggrad+"&deg; "+s.lngminuten*-1+"&prime; "+s.lngsekunden*-1+"&Prime;</td></tr>"}if(this.options.utm){var i=UTM.fromLatLng(a);void 0!==i&&(e+="<tr><td>UTM :</td><td colspan='2'>"+i.zone+"&nbsp;"+i.x+"&nbsp;"+i.y+"</td></tr>")}if(this.options.utmref){var d=UTMREF.fromUTM(UTM.fromLatLng(a));void 0!==d&&(e+="<tr><td>UTM REF</td><td colspan='2'>"+d.zone+"&nbsp;"+d.band+"&nbsp;"+d.x+"&nbsp;"+d.y+"</td></tr>")}if(this.options.qth&&(e+="<tr><td>QTH</td><td colspan='2'>"+QTH.fromLatLng(a)+"</td></tr>"),this.options.nac){var l=NAC.fromLatLng(a);e+="<tr><td>NAC</td><td colspan='2'>"+l.y+" "+l.x+"</td></tr>"}e+="</table>",this._gpsPositionContainer.innerHTML=e},_geo2geodeziminuten:function(t){var n=parseInt(t.lat,10),r=Math.round(60*(t.lat-n)*1e4)/1e4,a=parseInt(t.lng,10),e=Math.round(60*(t.lng-a)*1e4)/1e4;return this._AddNSEW({latgrad:n,latminuten:r,lnggrad:a,lngminuten:e})},_geo2gradminutensekunden:function(t){var n=parseInt(t.lat,10),r=60*(t.lat-n),a=Math.round(60*(r-parseInt(r,10))*100)/100;r=parseInt(r,10);var e=parseInt(t.lng,10),o=60*(t.lng-e),s=Math.round(60*(o-parseInt(o,10))*100)/100;return o=parseInt(o,10),this._AddNSEW({latgrad:n,latminuten:r,latsekunden:a,lnggrad:e,lngminuten:o,lngsekunden:s})},_AddNSEW:function(t){return t.NS="N",t.WE="E",t.latgrad<0&&(t.latgrad=-1*t.latgrad,t.NS="S"),t.lnggrad<0&&(t.lnggrad=-1*t.lnggrad,t.WE="W"),t}}),L.control.mouseCoordinate=function(t){return new L.Control.mouseCoordinate(t)};
var NAC = {
    fromLatLng: function(t) {
      var n = t.lat,
        r = t.lng,
        a = [],
        e = [],
        o = [];
      if (((o.x = ""), (o.y = ""), r >= -180 && r <= 180)) {
        var s = (r + 180) / 360;
        a = this._calcValues(s);
      } else a[0] = 0;
      if (n >= -90 && n <= 90) {
        var i = (n + 90) / 180;
        e = this._calcValues(i);
      } else e[0] = 0;
      for (var d = 0; d < a.length; d++) o.x += this._nac2Letter(a[d]);
      for (d = 0; d < e.length; d++) o.y += this._nac2Letter(e[d]);
      return o;
    },
    _calcValues: function(t) {
      var n = [];
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
    _nac2Letter: function(t) {
      return !isNaN(t) && t < 30 ? "0123456789BCDFGHJKLMNPQRSTVWXZ".substr(t, 1) : 0;
    },
  },
  QTH = {
    fromLatLng: function(t) {
      var n,
        r,
        a,
        e,
        o,
        s,
        i = "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
        d = 0,
        l = [0, 0, 0],
        u = [0, 0, 0, 0, 0, 0, 0];
      for (l[1] = t.lng + 180, l[2] = t.lat + 90, r = 1; r < 3; ++r)
        for (a = 1; a < 4; ++a)
          3 !== a
            ? (1 === r && (1 === a && (e = 20), 2 === a && (e = 2)),
              2 === r && (1 === a && (e = 10), 2 === a && (e = 1)),
              (o = l[r] / e),
              (l[r] = o),
              (s = l[r] > 0 ? Math.floor(o) : Math.ceil(o)),
              (l[r] = (l[r] - s) * e))
            : ((e = 1 === r ? 12 : 24),
              (o = l[r] * e),
              (l[r] = o),
              (s = l[r] > 0 ? Math.floor(o) : Math.ceil(o))),
            (u[++d] = s);
      return (
        (n = i.charAt(u[1]) + i.charAt(u[4]) + "0123456789".charAt(u[2])),
        (n += "0123456789".charAt(u[5]) + i.charAt(u[3]) + i.charAt(u[6]))
      );
    },
  },
  UTM = {
    fromLatLng: function(t) {
      var n = t.lng,
        r = t.lat;
      if (
        (-180 === n && (n += 1e-13),
        180 === n && (n -= 1e-13),
        -90 === r && (r += 1e-13),
        90 === r && (r -= 1e-13),
        !(n <= -180 || n >= 180 || r <= -80 || r >= 84))
      ) {
        (n = parseFloat(n)), (r = parseFloat(r));
        var a = 0.00335281068,
          e = Math.PI,
          o = 6378137 / (1 - a),
          s = 0.006739496773090375,
          i = o * (e / 180) * 0.9949771060629756,
          d = parseInt((n + 180) / 6, 10) + 1,
          l = d;
        d < 10 && (l = "0" + d),
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
        var u,
          g = parseInt(1 + (r + 80) / 8, 10),
          h = "CDEFGHJKLMNPQRSTUVWXX".substr(g - 1, 1),
          p = (r * e) / 180,
          c = Math.tan(p),
          m = c * c,
          f = m * m,
          M = Math.cos(p),
          L = M * M,
          b = L * L,
          v = L * M,
          _ = b * M,
          I = s * L,
          T = o / Math.sqrt(1 + I),
          N =
            i * r +
            -16038.508686878376 * Math.sin(2 * p) +
            16.832627424514854 * Math.sin(4 * p) +
            -0.02198090722059709 * Math.sin(6 * p),
          U = ((n - (6 * (d - 30) - 3)) * e) / 180,
          A = U * U,
          C = A * A,
          E =
            0.9996 *
              (T * M * U +
                (T * v * (1 - m + I) * (A * U)) / 6 +
                (T * _ * (5 - 18 * m + f) * (C * U)) / 120) +
            5e5,
          S = l + h,
          F =
            (u =
              r < 0
                ? 1e7 + 0.9996 * (N + (T * L * c * A) / 2 + (T * b * c * (5 - m + 9 * I) * C) / 24)
                : 0.9996 * (N + (T * L * c * A) / 2 + (T * b * c * (5 - m + 9 * I) * C) / 24)) -
            parseInt(u, 10);
        for (u = F < 0.5 ? "" + parseInt(u, 10) : "" + (parseInt(u, 10) + 1); u.length < 7; )
          u = "0" + u;
        return (
          (F = E - parseInt(E, 10)),
          (E = F < 0.5 ? "0" + parseInt(E, 10) : "0" + parseInt(E + 1, 10)),
          { zone: S, x: E, y: u }
        );
      }
      console.error(
        "Out of lw <= -180 || lw >= 180 || bw <= -80 || bw >= 84 bounds, which is kinda similar to UTM bounds, if you ignore the poles"
      );
    },
    toLatLng: function(t) {
      var n = t.zone,
        r = t.x,
        a = t.y;
      if ("" === n || "" === r || "" === a) return (n = ""), (r = ""), void (a = "");
      var e = n.substr(2, 1);
      (n = parseFloat(n)), (r = parseFloat(r)), (a = parseFloat(a));
      var o,
        s = 0.00335281068,
        i = Math.PI,
        d = 6378137 / (1 - s),
        l = 0.006739496773090375,
        u = d * (i / 180) * 0.9949771060629756,
        g = (180 / i) * 0.0025188265953247774,
        h = (180 / i) * 37009497348592385e-22,
        p = (180 / i) * 7.447241158930448e-9,
        c = (o = e >= "N" || "" === e ? a : a - 1e7) / 0.9996 / u,
        m = (c * i) / 180,
        f = c + g * Math.sin(2 * m) + h * Math.sin(4 * m) + p * Math.sin(6 * m),
        M = (f * i) / 180,
        L = Math.tan(M),
        b = L * L,
        v = b * b,
        _ = Math.cos(M),
        I = l * (_ * _),
        T = d / Math.sqrt(1 + I),
        N = T * T,
        U = N * N,
        A = (r - 5e5) / 0.9996,
        C = A * A,
        E = C * A;
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
  },
  UTMREF = {
    fromUTM: function(t) {
      if (void 0 !== t) {
        var n,
          r = t.zone,
          a = t.x,
          e = t.y,
          o = r.substr(0, 2),
          s = (r.substr(2, 1), parseInt(a.substr(0, 2), 10)),
          i = parseInt(e.substr(0, 2), 10),
          d = a.substr(2, 5),
          l = e.substr(2, 5),
          u = o % 3;
        1 === u && (n = s - 1), 2 === u && (n = s + 7), 0 === u && (n = s + 15);
        var g;
        for (g = 1 === (u = o % 2) ? 0 : 5, u = i; u - 20 >= 0; ) u -= 20;
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
    toUTM: function(t) {
      var n,
        r = t.zone,
        a = t.band.substr(0, 1),
        e = (t.band.substr(1, 1), parseInt(r.substr(0, 2), 10) % 3);
      0 === e && (n = "STUVWXYZ".indexOf(a) + 1),
        1 === e && (n = "ABCDEFGH".indexOf(a) + 1),
        2 === e && (n = "JKLMNPQR".indexOf(a) + 1);
      var o,
        s = "0" + n,
        i = this._mgr2utm_find_m_cn(r);
      return (o = 1 === i.length ? "0" + i : "" + i), { zone: r, x: s, y: o };
    },
  };
