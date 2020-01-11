import {Deck} from '@deck.gl/core'
import {AmbientLight, PointLight, LightingEffect} from '@deck.gl/core'
import {HeatmapLayer, IconLayer, PolygonLayer, TripsLayer} from '@deck.gl/layers';
import mapboxgl from 'mapbox-gl'

const DATA = {
    BULDINGS: 
        'https://raw.githubusercontent.com/dinohossain/pathfinding/master/data/buildings.json',
    NODES: 
        'https://raw.githubusercontent.com/dinohossain/pathfinding/master/data/roads.json',
    TRIPS:
        'https://raw.githubusercontent.com/uber-common/deck.gl-data/master/examples/trips/trips-v7.json'
}

layers: {
    new TripsLayer({
        id: 'trips',
        data: trips,
        getPath: d => d.path,
        getTimestamps: d => d.timestamps,
        getColor: d => (d.vendor === 0 ? theme.trailColor0 : theme.trailColor1),
        opacity: 0.3,
        widthMinPixels: 2,
        rounded: true,
        trailLength,
        currentTime: this.state.time,

        shadowEnabled: false
      })
}