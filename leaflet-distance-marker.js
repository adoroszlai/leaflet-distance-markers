L.DistanceMarkers = L.FeatureGroup.extend({
	initialize: function (line, map) {
		this._layers = {};
		var len = L.GeometryUtil.length(line);
		var marker_freq = 1000;
		for (var dist = 0; dist < len; dist += marker_freq) {
			var next = L.GeometryUtil.interpolateOnLine(map, line, dist/len);
			var marker = L.marker(next.latLng, { title: dist/marker_freq });
			this.addLayer(marker);
		}
	}
});

L.Polyline.include({

	_originalOnAdd: L.Polyline.prototype.onAdd,
	_originalOnRemove: L.Polyline.prototype.onRemove,

	onAdd: function (map) {
		this._originalOnAdd(map);
		this._distanceMarkers = new L.DistanceMarkers(this, map);
		map.addLayer(this._distanceMarkers);
	},

	onRemove: function (map) {
		map.removeLayer(this._distanceMarkers);
		this._originalOnRemove(map);
	}

});
