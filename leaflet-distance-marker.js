L.DistanceMarkers = L.FeatureGroup.extend({
	initialize: function (line, map) {
		var len = L.GeometryUtil.length(line);
		var marker_freq = 1000;
		var count = Math.floor(len / marker_freq);
		this._layers = {};
		for (var i = 0; i <= count; ++i) {
			var dist = marker_freq * i;
			var next = L.GeometryUtil.interpolateOnLine(map, line, dist/len);
			var marker = L.marker(next.latLng, { title: i, icon: L.divIcon({ html: i }) });
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
