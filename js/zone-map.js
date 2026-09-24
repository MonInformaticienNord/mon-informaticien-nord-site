(function () {
  "use strict";

  var box = document.getElementById("zone-map");
  var canvas = document.getElementById("zone-map-canvas");
  var tagsBox = document.getElementById("zone-tags");
  if (!box || !canvas || !tagsBox) return;

  var VENDOR = "/js/vendor/leaflet/";
  var DEFAULT_LAYER = "topo";
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var IGN = "https://data.geopf.fr/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&STYLE=normal&TILEMATRIXSET=PM&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}";
  var IGN_CREDIT = '&copy; <a href="https://www.ign.fr/" target="_blank" rel="noopener">IGN</a>';
  var LAYERS = {
    topo: {
      label: "Topo",
      url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
      options: {
        subdomains: "abc", maxZoom: 17,
        attribution: 'Données &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>, SRTM | Rendu &copy; <a href="https://opentopomap.org" target="_blank" rel="noopener">OpenTopoMap</a> (CC-BY-SA)'
      }
    },
    plan: {
      label: "Plan",
      url: IGN + "&LAYER=GEOGRAPHICALGRIDSYSTEMS.PLANIGNV2&FORMAT=image/png",
      options: { maxZoom: 17, attribution: IGN_CREDIT + " Plan IGN" }
    },
    sat: {
      label: "Satellite",
      url: IGN + "&LAYER=ORTHOIMAGERY.ORTHOPHOTOS&FORMAT=image/jpeg",
      options: { maxZoom: 17, attribution: IGN_CREDIT + " Orthophotographies" }
    }
  };

  function loadCss(href, done) {
    var l = document.createElement("link");
    l.rel = "stylesheet";
    l.href = href;
    l.onload = done;
    l.onerror = done;
    document.head.appendChild(l);
  }

  function loadJs(src, ok, fail) {
    var s = document.createElement("script");
    s.src = src;
    s.onload = ok;
    s.onerror = fail;
    document.head.appendChild(s);
  }

  // Convex hull (Andrew's monotone chain) of [lat, lng] points
  function hull(points) {
    var pts = points.map(function (p) { return [p[1], p[0]]; }).sort(function (a, b) { return a[0] - b[0] || a[1] - b[1]; });
    function cross(o, a, b) { return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]); }
    var lower = [], upper = [], i;
    for (i = 0; i < pts.length; i++) {
      while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], pts[i]) <= 0) lower.pop();
      lower.push(pts[i]);
    }
    for (i = pts.length - 1; i >= 0; i--) {
      while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], pts[i]) <= 0) upper.pop();
      upper.push(pts[i]);
    }
    upper.pop();
    lower.pop();
    return lower.concat(upper).map(function (p) { return [p[1], p[0]]; });
  }

  // Push each vertex away from the centroid so the outer towns sit inside the zone
  function grow(points, factor) {
    var lat0 = 0, lng0 = 0;
    points.forEach(function (p) { lat0 += p[0]; lng0 += p[1]; });
    lat0 /= points.length;
    lng0 /= points.length;
    return points.map(function (p) {
      return [lat0 + (p[0] - lat0) * factor, lng0 + (p[1] - lng0) * factor];
    });
  }

  // Closed Catmull-Rom spline through the points, for a soft outline
  function smooth(points, steps) {
    var out = [], n = points.length;
    for (var i = 0; i < n; i++) {
      var p0 = points[(i - 1 + n) % n], p1 = points[i], p2 = points[(i + 1) % n], p3 = points[(i + 2) % n];
      for (var t = 0; t < steps; t++) {
        var s = t / steps, s2 = s * s, s3 = s2 * s;
        out.push([0, 1].map(function (c) {
          return 0.5 * ((2 * p1[c]) + (-p0[c] + p2[c]) * s + (2 * p0[c] - 5 * p1[c] + 4 * p2[c] - p3[c]) * s2 + (-p0[c] + 3 * p1[c] - 3 * p2[c] + p3[c]) * s3);
        }));
      }
    }
    return out;
  }

  function init() {
    var L = window.L;
    if (!L) return;

    var places = [].slice.call(tagsBox.querySelectorAll("[data-lat]")).map(function (chip) {
      return {
        el: chip,
        name: chip.textContent.trim(),
        lat: parseFloat(chip.getAttribute("data-lat")),
        lng: parseFloat(chip.getAttribute("data-lng")),
        home: chip.classList.contains("home")
      };
    });
    if (!places.length) return;

    var touch = L.Browser.mobile;
    var map = L.map(canvas, {
      scrollWheelZoom: false,
      dragging: !touch,
      boxZoom: false,
      minZoom: 9,
      maxZoom: 17,
      zoomSnap: 0.25
    });
    map.attributionControl.setPrefix('<a href="https://leafletjs.com" target="_blank" rel="noopener">Leaflet</a>');

    // Base layers
    var tileLayers = {};
    var currentKey = null;
    function useLayer(key) {
      if (!LAYERS[key]) return null;
      if (!tileLayers[key]) tileLayers[key] = L.tileLayer(LAYERS[key].url, LAYERS[key].options);
      if (currentKey && tileLayers[currentKey]) map.removeLayer(tileLayers[currentKey]);
      currentKey = key;
      map.setMaxZoom(LAYERS[key].options.maxZoom);
      map.addLayer(tileLayers[key]);
      return tileLayers[key];
    }
    var first = useLayer(DEFAULT_LAYER);

    // Intervention zone: soft violet blob around the served towns
    var coords = places.map(function (p) { return [p.lat, p.lng]; });
    var blob = smooth(grow(hull(coords), 1.22), 10);
    var zone = L.polygon(blob, {
      color: "#7c3aed", weight: 1.5, opacity: 0.75, dashArray: "6 6",
      fillColor: "#7c3aed", fillOpacity: 0.13, interactive: false
    }).addTo(map);

    function fitAll() {
      map.fitBounds(zone.getBounds(), { padding: [30, 30], animate: !reduceMotion });
    }
    fitAll();

    // Markers
    var openPlace = null;
    places.forEach(function (p) {
      var icon = L.divIcon({
        className: "zm-icon",
        html: p.home ? '<span class="zm-home"><i class="ph-fill ph-house-line"></i></span>' : '<span class="zm-dot"></span>',
        iconSize: p.home ? [40, 40] : [22, 22],
        iconAnchor: p.home ? [20, 20] : [11, 11]
      });
      p.marker = L.marker([p.lat, p.lng], { icon: icon, keyboard: true, riseOnHover: true, zIndexOffset: p.home ? 1000 : 0 }).addTo(map);
      p.marker.bindTooltip(p.home ? "Hem &middot; je suis basé ici" : p.name, {
        permanent: p.home,
        direction: p.home ? "bottom" : "top",
        offset: p.home ? [0, 20] : [0, -10],
        className: "zm-tip",
        opacity: 1
      });
      var node = p.marker.getElement();
      if (node) {
        node.setAttribute("role", "button");
        node.setAttribute("aria-label", p.name);
        p.dot = node.querySelector(".zm-dot, .zm-home");
      }
    });

    function setActive(p, on) {
      p.el.classList.toggle("is-active", on);
      if (p.dot) p.dot.classList.toggle("is-active", on);
    }

    function focusPlace(p) {
      var z = Math.max(map.getZoom(), 13);
      if (reduceMotion) map.setView([p.lat, p.lng], z);
      else map.flyTo([p.lat, p.lng], z, { duration: 0.9 });
      if (openPlace && openPlace !== p && !openPlace.home) openPlace.marker.closeTooltip();
      openPlace = p;
      p.marker.openTooltip();
    }

    places.forEach(function (p) {
      // list -> map
      p.el.setAttribute("role", "button");
      p.el.setAttribute("tabindex", "0");
      p.el.addEventListener("mouseenter", function () { setActive(p, true); if (!p.home) p.marker.openTooltip(); });
      p.el.addEventListener("mouseleave", function () { setActive(p, false); if (!p.home && openPlace !== p) p.marker.closeTooltip(); });
      p.el.addEventListener("focus", function () { setActive(p, true); });
      p.el.addEventListener("blur", function () { setActive(p, false); });
      p.el.addEventListener("click", function () { focusPlace(p); });
      p.el.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); focusPlace(p); }
      });
      // map -> list
      p.marker.on("mouseover", function () { setActive(p, true); });
      p.marker.on("mouseout", function () { setActive(p, false); });
      p.marker.on("click", function () { focusPlace(p); });
    });
    tagsBox.classList.add("is-live");

    // Controls: reset view (under the zoom buttons) and base-layer switch
    var Reset = L.Control.extend({
      options: { position: "topleft" },
      onAdd: function () {
        var bar = L.DomUtil.create("div", "leaflet-bar zm-reset");
        var a = L.DomUtil.create("a", "", bar);
        a.href = "#";
        a.title = "Voir toute la zone";
        a.setAttribute("role", "button");
        a.setAttribute("aria-label", "Voir toute la zone");
        a.innerHTML = '<i class="ph ph-corners-out"></i>';
        L.DomEvent.disableClickPropagation(bar);
        L.DomEvent.on(a, "click", function (e) {
          L.DomEvent.preventDefault(e);
          if (openPlace && !openPlace.home) openPlace.marker.closeTooltip();
          openPlace = null;
          fitAll();
        });
        return bar;
      }
    });
    new Reset().addTo(map);

    var Switch = L.Control.extend({
      options: { position: "topright" },
      onAdd: function () {
        var div = L.DomUtil.create("div", "zm-layers");
        div.setAttribute("role", "group");
        div.setAttribute("aria-label", "Fond de carte");
        Object.keys(LAYERS).forEach(function (key) {
          var b = L.DomUtil.create("button", key === currentKey ? "is-on" : "", div);
          b.type = "button";
          b.textContent = LAYERS[key].label;
          b.setAttribute("data-layer", key);
          b.setAttribute("aria-pressed", key === currentKey ? "true" : "false");
        });
        L.DomEvent.disableClickPropagation(div);
        L.DomEvent.on(div, "click", function (e) {
          var b = e.target;
          while (b && b !== div && b.tagName !== "BUTTON") b = b.parentNode;
          if (!b || b === div) return;
          useLayer(b.getAttribute("data-layer"));
          [].forEach.call(div.querySelectorAll("button"), function (other) {
            var on = other === b;
            other.classList.toggle("is-on", on);
            other.setAttribute("aria-pressed", on ? "true" : "false");
          });
        });
        return div;
      }
    });
    new Switch().addTo(map);

    // Mouse wheel zooms only after a click on the map (keeps page scrolling smooth)
    map.on("click", function () { map.scrollWheelZoom.enable(); });
    canvas.addEventListener("mouseleave", function () { map.scrollWheelZoom.disable(); });

    window.addEventListener("resize", function () { map.invalidateSize(); });

    // Reveal the map once its first tiles are in (or after a short delay)
    var shown = false;
    function reveal() {
      if (shown) return;
      shown = true;
      box.classList.add("is-live");
    }
    if (first) first.once("load", reveal);
    setTimeout(reveal, 3500);
  }

  function start() {
    loadCss(VENDOR + "leaflet.css", function () {
      loadJs(VENDOR + "leaflet.js", init, function () { /* keep the static illustration */ });
    });
  }

  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      if (entries.some(function (e) { return e.isIntersecting; })) {
        io.disconnect();
        start();
      }
    }, { rootMargin: "400px 0px" });
    io.observe(box);
  } else {
    start();
  }
})();
