import React, { Component } from "react";
import { layerControl } from "./style";
import { Form } from "react-bootstrap";

export const SCATTERPLOT_CONTROLS = {
  showScatterplot: {
    type: "boolean",
    value: true
  },
  radiusScale: {
    type: "range",
    value: 0.6,
    step: 2,
    min: 10,
    max: 10
  }
};

const MAPBOX_DEFAULT_MAPSTYLES = [
  { label: "Streets", value: "mapbox://styles/mapbox/streets-v10" },
  { label: "Outdoors", value: "mapbox://styles/mapbox/outdoors-v10" },
  { label: "Light", value: "mapbox://styles/mapbox/light-v10" },
  { label: "Dark", value: "mapbox://styles/mapbox/dark-v10" },
  { label: "Satellite", value: "mapbox://styles/mapbox/satellite-v9" },
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
    <Form.Control
      as="select"
      size="md"
      className="col-sm-2 sm"
      value={currentStyle}
      onChange={e => onStyleChange(e.target.value)}
    >
      {MAPBOX_DEFAULT_MAPSTYLES.map(style => (
        <option key={style.value} value={style.value}>
          {style.label}
        </option>
      ))}
    </Form.Control>
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
    <Form>
      <Form.Check
        type="switch"
        id={settingName}
        checked={value}
        onChange={e => onChange(settingName, e.target.checked)}
        label="Show Scatterplot"
      />
    </Form>
  );
};

const Slider = ({ settingName, value, propType, onChange }) => {
  const { max = 100 } = propType;

  return (
    <div className="Slider">
      <label htmlFor="customRange1">Scatterplot Radius</label>
      <input
        type="range"
        className="custom-range"
        id="customRange1"
        min={0}
        max={max}
        step={max / 100}
        value={value}
        onChange={e => onChange(settingName, Number(e.target.value))}
      />
    </div>
  );
};
