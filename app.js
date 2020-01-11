import {Deck} from '@deck.gl/core'
import {AmbientLight, PointLight, LightingEffect} from '@deck.gl/core'
import {HeatmapLayer, IconLayer, PolygonLayer, TripsLayer} from '@deck.gl/layers';
import mapboxgl from 'mapbox-gl'

const DATA = 'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_10m_airports.geojson'

