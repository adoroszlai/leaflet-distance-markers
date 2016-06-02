/*
 * https://github.com/adoroszlai/leaflet-distance-markers
 *
 * The MIT License (MIT)
 *
 * Copyright (c) 2014 Doroszlai Attila, 2016 Phil Whitehurst
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */


    L.DistanceMarkers = L.LayerGroup.extend({
        initialize: function (line, map, options) {
            options = options || {};
            var offset = options.offset || 1000;
            var showAll = Math.min(map.getMaxZoom(), options.showAll || 12);
            var cssClass = options.cssClass || 'dist-marker';

            var zoomLayers = {};

            // Get line coords as an array
            if (typeof line.getLatLngs == 'function') {
                var coords = line.getLatLngs();
            }
            // Get accumulated line lengths as well as overall length
            var accumulated = L.GeometryUtil.accumulatedLengths(line);
            var length = accumulated.length > 0 ? accumulated[accumulated.length - 1] : 0;
            // Position in accumulated line length array
            var j = 0;
            // Number of distance markers to be added
            var count = Math.floor(length / offset);

            for (var i = 1; i <= count; ++i) {
                var distance = offset * i;
                // Find the first accumulated distance that is greater
                // than the distance of this marker
                while (j < length - 1 && accumulated[j] < distance) {
                    ++j;
                }
                // Now grab the two nearest trackpoints either side of
                // distance marker position and create a simple line to
                // interpolate on
                var p1 = coords[j];
                var p2 = coords[j + 1];
                var m_line = L.polyline([p1, p2]);
                var ratio = (distance - accumulated[j - 1]) / (accumulated[j] - accumulated[j - 1]);


                var position = L.GeometryUtil.interpolateOnLine(map, m_line, ratio);
                var icon = L.divIcon({className: cssClass, html: i});
                var marker = L.marker(position.latLng, {title: i, icon: icon});

                // visible only starting at a specific zoom level
                var zoom = this._minimumZoomLevelForItem(i, showAll);
                if (zoomLayers[zoom] === undefined) {
                    zoomLayers[zoom] = L.layerGroup();
                }
                zoomLayers[zoom].addLayer(marker);
            }

            var currentZoomLevel = 0;
            var markerLayer = this;
            var updateMarkerVisibility = function () {
                var oldZoom = currentZoomLevel;
                var newZoom = currentZoomLevel = map.getZoom();

                if (newZoom > oldZoom) {
                    for (var i = oldZoom + 1; i <= newZoom; ++i) {
                        if (zoomLayers[i] !== undefined) {
                            markerLayer.addLayer(zoomLayers[i]);
                        }
                    }
                } else if (newZoom < oldZoom) {
                    for (var i = oldZoom; i > newZoom; --i) {
                        if (zoomLayers[i] !== undefined) {
                            markerLayer.removeLayer(zoomLayers[i]);
                        }
                    }
                }
            };
            map.on('zoomend', updateMarkerVisibility);

            this._layers = {}; // need to initialize before adding markers to this LayerGroup
            updateMarkerVisibility();
        },
        _minimumZoomLevelForItem: function (item, showAllLevel) {
            var zoom = showAllLevel;
            var i = item;
            while (i > 0 && i % 2 === 0) {
                --zoom;
                i = Math.floor(i / 2);
            }
            return zoom;
        },
    });

    L.Polyline.include({
        _originalOnAdd: L.Polyline.prototype.onAdd,
        _originalOnRemove: L.Polyline.prototype.onRemove,
        addDistanceMarkers: function () {
            if (this._map && this._distanceMarkers) {
                this._map.addLayer(this._distanceMarkers);
            }
        },
        removeDistanceMarkers: function () {
            if (this._map && this._distanceMarkers) {
                this._map.removeLayer(this._distanceMarkers);
            }
        },
        onAdd: function (map) {
            this._originalOnAdd(map);

            var opts = this.options.distanceMarkers || {};
            if (this._distanceMarkers === undefined) {
                this._distanceMarkers = new L.DistanceMarkers(this, map, opts);
            }
            if (opts.lazy === undefined || opts.lazy === false) {
                this.addDistanceMarkers();
            }
        },
        onRemove: function (map) {
            this.removeDistanceMarkers();
            this._originalOnRemove(map);
        }

    });


