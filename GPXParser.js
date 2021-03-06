let gpxParser = function () {
  (this.xmlSource = ""),
    (this.metadata = {}),
    (this.waypoints = []),
    (this.tracks = []),
    (this.routes = []);
};
(gpxParser.SAMPLING_MODE = { INDEX: "index", DISTANCE: "distance" }),
  (gpxParser.prototype.parse = function (e) {
    let t = this,
      l = new window.DOMParser();
    if (
      ((this.xmlSource = l.parseFromString(e, "text/xml")),
      (metadata = this.xmlSource.querySelector("metadata")),
      null != metadata)
    ) {
      (this.metadata.name = this.getElementValue(metadata, "name")),
        (this.metadata.desc = this.getElementValue(metadata, "desc")),
        (this.metadata.time = this.getElementValue(metadata, "time"));
      let e = {},
        t = metadata.querySelector("author");
      if (null != t) {
        (e.name = this.getElementValue(t, "name")), (e.email = {});
        let l = t.querySelector("email");
        null != l &&
          ((e.email.id = l.getAttribute("id")),
          (e.email.domain = l.getAttribute("domain")));
        let a = {},
          r = t.querySelector("link");
        null != r &&
          ((a.href = r.getAttribute("href")),
          (a.text = this.getElementValue(r, "text")),
          (a.type = this.getElementValue(r, "type"))),
          (e.link = a);
      }
      this.metadata.author = e;
      let l = {},
        a = this.queryDirectSelector(metadata, "link");
      null != a &&
        ((l.href = a.getAttribute("href")),
        (l.text = this.getElementValue(a, "text")),
        (l.type = this.getElementValue(a, "type")),
        (this.metadata.link = l));
    }
    var a = [].slice.call(this.xmlSource.querySelectorAll("wpt"));
    for (let e in a) {
      var r = a[e];
      let l = {};
      (l.name = t.getElementValue(r, "name")),
        (l.lat = parseFloat(r.getAttribute("lat"))),
        (l.lon = parseFloat(r.getAttribute("lon"))),
        (l.ele = parseFloat(t.getElementValue(r, "ele")) || null),
        (l.cmt = t.getElementValue(r, "cmt")),
        (l.desc = t.getElementValue(r, "desc"));
      let n = t.getElementValue(r, "time");
      (l.time = null == n ? null : new Date(n)), t.waypoints.push(l);
    }
    var n = [].slice.call(this.xmlSource.querySelectorAll("rte"));
    for (let e in n) {
      let l = n[e],
        a = {};
      (a.name = t.getElementValue(l, "name")),
        (a.cmt = t.getElementValue(l, "cmt")),
        (a.desc = t.getElementValue(l, "desc")),
        (a.src = t.getElementValue(l, "src")),
        (a.number = t.getElementValue(l, "number"));
      let r = t.queryDirectSelector(l, "type");
      a.type = null != r ? r.innerHTML : null;
      let s = {},
        o = l.querySelector("link");
      null != o &&
        ((s.href = o.getAttribute("href")),
        (s.text = t.getElementValue(o, "text")),
        (s.type = t.getElementValue(o, "type"))),
        (a.link = s);
      let u = [];
      var i = [].slice.call(l.querySelectorAll("rtept"));
      for (let e in i) {
        let l = i[e],
          a = {};
        (a.lat = parseFloat(l.getAttribute("lat"))),
          (a.lon = parseFloat(l.getAttribute("lon"))),
          (a.ele = parseFloat(t.getElementValue(l, "ele")) || null);
        let r = t.getElementValue(l, "time");
        (a.time = null == r ? null : new Date(r)), u.push(a);
      }
      (a.distance = t.calcDistance(u)),
        (a.bounds = t.calcBounds(u)),
        (a.elevation = t.calcElevation(u)),
        (a.slopes = t.calcSlope(u, a.distance.cumul)),
        (a.points = u),
        t.routes.push(a);
    }
    var s = [].slice.call(this.xmlSource.querySelectorAll("trk"));
    for (let e in s) {
      let l = s[e],
        a = {};
      (a.name = t.getElementValue(l, "name")),
        (a.cmt = t.getElementValue(l, "cmt")),
        (a.desc = t.getElementValue(l, "desc")),
        (a.src = t.getElementValue(l, "src")),
        (a.number = t.getElementValue(l, "number"));
      let r = t.queryDirectSelector(l, "type");
      a.type = null != r ? r.innerHTML : null;
      let n = {},
        i = l.querySelector("link");
      null != i &&
        ((n.href = i.getAttribute("href")),
        (n.text = t.getElementValue(i, "text")),
        (n.type = t.getElementValue(i, "type"))),
        (a.link = n);
      let u = [],
        p = [].slice.call(l.querySelectorAll("trkpt"));
      for (let e in p) {
        var o = p[e];
        let l = {};
        (l.lat = parseFloat(o.getAttribute("lat"))),
          (l.lon = parseFloat(o.getAttribute("lon"))),
          (l.ele = parseFloat(t.getElementValue(o, "ele")) || null);
        let a = t.getElementValue(o, "time");
        (l.time = null == a ? null : new Date(a)), u.push(l);
      }
      (a.distance = t.calcDistance(u)),
        (a.bounds = t.calcBounds(u)),
        (a.elevation = t.calcElevation(u)),
        (a.slopes = t.calcSlope(u, a.distance.cumul)),
        (a.points = u),
        t.tracks.push(a);
    }
  }),
  (gpxParser.prototype.getElementValue = function (e, t) {
    let l = e.querySelector(t);
    return null != l
      ? null != l.innerHTML
        ? l.innerHTML
        : l.childNodes[0].data
      : l;
  }),
  (gpxParser.prototype.queryDirectSelector = function (e, t) {
    let l = e.querySelectorAll(t),
      a = l[0];
    if (l.length > 1) {
      let l = e.childNodes;
      for (idx in l) (elem = l[idx]), elem.tagName === t && (a = elem);
    }
    return a;
  }),
  (gpxParser.prototype.calcDistance = function (e) {
    let t = {},
      l = 0,
      a = [];
    for (var r = 0; r < e.length - 1; r++)
      (l += this.calcDistanceBetween(e[r], e[r + 1])), (a[r] = l);
    return (a[e.length - 1] = l), (t.total = l), (t.cumul = a), t;
  }),
  (gpxParser.prototype.calcBounds = function (e) {
    let a = {};
    let sw = {};
    let ne = {};
    return (
      (sw.latitude = Math.min.apply(
        null,
        e.map(function (o) {
          return o.lat;
        }) || null
      )),
      (sw.longitude = Math.min.apply(
        null,
        e.map(function (o) {
          return o.lon;
        }) || null
      )),
      (ne.latitude = Math.max.apply(
        null,
        e.map(function (o) {
          return o.lat;
        }) || null
      )),
      (ne.longitude = Math.max.apply(
        null,
        e.map(function (o) {
          return o.lon;
        }) || null
      )),
      (a.sw = sw),
      (a.ne = ne),
      a
    );
  }),
  (gpxParser.prototype.calcDistanceBetween = function (e, t) {
    let l = {};
    (l.lat = e.lat), (l.lon = e.lon);
    let a = {};
    (a.lat = t.lat), (a.lon = t.lon);
    var r = Math.PI / 180,
      n = l.lat * r,
      i = a.lat * r,
      s = Math.sin(((a.lat - l.lat) * r) / 2),
      o = Math.sin(((a.lon - l.lon) * r) / 2),
      u = s * s + Math.cos(n) * Math.cos(i) * o * o;
    return 6371e3 * (2 * Math.atan2(Math.sqrt(u), Math.sqrt(1 - u)));
  }),
  (gpxParser.prototype.calcElevation = function (e) {
    for (var t = 0, l = 0, a = {}, r = 0; r < e.length - 1; r++) {
      var n = parseFloat(e[r + 1].ele) - parseFloat(e[r].ele);
      n < 0 ? (l += n) : n > 0 && (t += n);
    }
    for (var i = [], s = 0, o = ((r = 0), e.length); r < o; r++) {
      var u = parseFloat(e[r].ele);
      i.push(u), (s += u);
    }
    return (
      (a.max = Math.max.apply(null, i) || null),
      (a.min = Math.min.apply(null, i) || null),
      (a.pos = Math.abs(t) || null),
      (a.neg = Math.abs(l) || null),
      (a.avg = s / i.length || null),
      a
    );
  }),
  (gpxParser.prototype.calcSlope = function (e, t) {
    let l = [];
    for (var a = 0; a < e.length - 1; a++) {
      let r = e[a],
        n = (100 * (e[a + 1].ele - r.ele)) / (t[a + 1] - t[a]);
      l.push(n);
    }
    return l;
  }),
  (gpxParser.prototype.toGeoJSON = function () {
    var e = {
      type: "FeatureCollection",
      features: [],
      properties: {
        name: this.metadata.name,
        desc: this.metadata.desc,
        time: this.metadata.time,
        author: this.metadata.author,
        link: this.metadata.link,
      },
    };
    for (idx in this.tracks) {
      let a = this.tracks[idx];
      var t = {
        type: "Feature",
        geometry: { type: "LineString", coordinates: [] },
        properties: {},
      };
      for (idx in ((t.properties.name = a.name),
      (t.properties.cmt = a.cmt),
      (t.properties.desc = a.desc),
      (t.properties.src = a.src),
      (t.properties.number = a.number),
      (t.properties.link = a.link),
      (t.properties.type = a.type),
      a.points)) {
        let e = a.points[idx];
        (l = []).push(e.lon),
          l.push(e.lat),
          l.push(e.ele),
          t.geometry.coordinates.push(l);
      }
      e.features.push(t);
    }
    for (idx in this.routes) {
      let a = this.routes[idx];
      t = {
        type: "Feature",
        geometry: { type: "LineString", coordinates: [] },
        properties: {},
      };
      for (idx in ((t.properties.name = a.name),
      (t.properties.cmt = a.cmt),
      (t.properties.desc = a.desc),
      (t.properties.src = a.src),
      (t.properties.number = a.number),
      (t.properties.link = a.link),
      (t.properties.type = a.type),
      a.points)) {
        let e = a.points[idx];
        var l;
        (l = []).push(e.lon),
          l.push(e.lat),
          l.push(e.ele),
          t.geometry.coordinates.push(l);
      }
      e.features.push(t);
    }
    for (idx in this.waypoints) {
      let l = this.waypoints[idx];
      ((t = {
        type: "Feature",
        geometry: { type: "Point", coordinates: [] },
        properties: {},
      }).properties.name = l.name),
        (t.properties.cmt = l.cmt),
        (t.properties.desc = l.desc),
        (t.geometry.coordinates = [l.lon, l.lat, l.ele]),
        e.features.push(t);
    }
    return e;
  }),
  "undefined" != typeof module &&
    (require("jsdom-global")(), (module.exports = gpxParser));
