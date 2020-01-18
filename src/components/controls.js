import React, { Component } from "react";
import { mapStylePicker, layerControl } from "./style";

export const SCATTERPLOT_CONTROLS = {
  showScatterplot: {
    displayName: "Show Scatterplot",
    type: "boolean",
    value: true
  },
  radiusScale: {
    displayName: "Scatterplot Radius",
    type: "range",
    value: 2,
    step: 10,
    min: 10,
    max: 10
  }
};

const MAPBOX_DEFAULT_MAPSTYLES = [
  { label: "Streets", value: "mapbox://styles/mapbox/streets-v10" },
  { label: "Outdoors", value: "mapbox://styles/mapbox/outdoors-v10" },
  { label: "Light", value: "mapbox://styles/mapbox/light-v10" },
  { label: "Dark", value: "mapbox://styles/mapbox/dark-v10" },
  { label: "Satellite", value: "mapbox://styles/mapbox/satellite-v10" },
  {
    label: "Satellite Streets V10",
    value: "mapbox://styles/mapbox/satellite-streets-v10"
  },
  {
    label: "Navigation Preview Day V4",
    value: "mapbox://styles/mapbox/navigation-preview-day-v4"
  },
  {
    label: "Navitation Preview Night V4",
    value: "mapbox://styles/mapbox/navigation-preview-night-v4"
  },
  {
    label: "Navigation Guidance Day V4",
    value: "mapbox://styles/mapbox/navigation-guidance-day-v4"
  },
  {
    label: "Navigation Guidance Night V4",
    value: "mapbox://styles/mapbox/navigation-guidance-night-v4"
  }
];

export function MapStylePicker({ currentStyle, onStyleChange }) {
  return (
    <select
      className="map-style-picker"
      style={mapStylePicker}
      value={currentStyle}
      onChange={e => onStyleChange(e.target.value)}
    >
      {MAPBOX_DEFAULT_MAPSTYLES.map(style => (
        <option key={style.value} value={style.value}>
          {style.label}
        </option>
      ))}
    </select>
  );
}

export class LayerControls extends Component {
  _onValueChange(settingName, newValue) {
    const { settings } = this.props;
    // Only update if we have a confirmed change
    if (settings[settingName] !== newValue) {
      // Create a new object so that shallow-equal detects a change
      const newSettings = {
        ...this.props.settings,
        [settingName]: newValue
      };

      this.props.onChange(newSettings);
    }
  }

  render() {
    const { title, settings, propTypes = {} } = this.props;

    return (
      <div className="layer-controls" style={layerControl}>
        {title && <h4>{title}</h4>}
        {Object.keys(settings).map(key => (
          <div key={key}>
            <label>{propTypes[key].displayName}</label>
            <div style={{ display: "inline-block", float: "right" }}>
              {settings[key]}
            </div>
            <Setting
              settingName={key}
              value={settings[key]}
              propType={propTypes[key]}
              onChange={this._onValueChange.bind(this)}
            />
          </div>
        ))}
      </div>
    );
  }
}

const Setting = props => {
  const { propType } = props;
  if (propType && propType.type) {
    switch (propType.type) {
      case "range":
        return <Slider {...props} />;

      case "boolean":
        return <Checkbox {...props} />;
      default:
        return <input {...props} />;
    }
  }
};

const Checkbox = ({ settingName, value, onChange }) => {
  return (
    <div key={settingName}>
      <div className="input-group">
        <input
          type="checkbox"
          id={settingName}
          checked={value}
          onChange={e => onChange(settingName, e.target.checked)}
        />
      </div>
    </div>
  );
};

const Slider = ({ settingName, value, propType, onChange }) => {
  const { max = 100 } = propType;

  return (
    <div key={settingName}>
      <div className="input-group">
        <div>
          <input
            type="range"
            id={settingName}
            min={0}
            max={max}
            step={max / 100}
            value={value}
            onChange={e => onChange(settingName, Number(e.target.value))}
          />
        </div>
      </div>
    </div>
  );
};
