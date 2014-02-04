# leaflet-distance-markers

Plugin for Leaflet to display markers along a route at equivalent distances.

## Example

```javascript
// use defaults
var line = L.polyline(coords);

// override defaults
var line = L.polyline(coords, {
	distanceMarkers: { showAll: 11, offset: 1600 }
});
```

## Options

 * **offset**: distance in meters between the markers (default: 1000 (= 1 km))
 * **showAll**: the zoom level at which all distance markers will be shown -- zooming out once from this level will remove approximately half of the markers (default: 12)
 * **lazy**: postpone adding the markers until Polyline.addDistanceMarkers is explicitly called (default: false)

## Requirements

 * [Leaflet.GeometryUtil](https://github.com/makinacorpus/Leaflet.GeometryUtil)

