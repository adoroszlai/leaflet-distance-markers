L.DistanceMarkers = L.FeatureGroup.extend({
	initialize: function (line, map, options) {
		options = options || {};
		var offset = options.offset || 1000;
		var length = L.GeometryUtil.length(line);
		var count = Math.floor(length / offset);
		this._layers = {};
		for (var i = 1; i <= count; ++i) {
			var distance = offset * i;
			var position = L.GeometryUtil.interpolateOnLine(map, line, distance / length);
			var icon = L.divIcon({ className: 'dist-marker', html: i });
			var marker = L.marker(position.latLng, { title: i, icon: icon });
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
