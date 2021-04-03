import React, { Component } from 'react';
import PropTypes from 'prop-types';
import MapBox from 'mapbox';
export default class LocationTypeAhead extends Component {
  static propTypes = {
    onLocationUpdate: PropTypes.func.isRequired,
    onLocationSelect: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);

    this.state = {
      text: '',
      locations: [],
      selectedLocation: null
    };

    this.mapbox = new MapBox(process.env.MAPBOX_API_TOKEN);

    this.handleLocationUpdate = this.handleLocationUpdate.bind(this);
    this.handleSearchChange = this.handleSearchChange.bind(this);
    this.handleSelectLocation = this.handleSelectLocation.bind(this);
    this.resetSearch = this.resetSearch.bind(this);
  }

  componentWillUnmount () {
    this.resetSearch();
  }

  handleLocationUpdate (location) {
    this.setState(() => {
      return {
        text: location.name,
        locations: [],
        selectedLocation: location
      };
    });

    this.props.onLocationUpdate(location);
  }

  handleSearchChange (e) {
    const text = e.target.value;
    this.setState(() => ({ text }));

    if (!text) return;

    this.mapbox.geocodeForward(text, {}).then(loc => {
      if (!loc.entity.features || !loc.entity.features.length) {
        return;
      }

      const locations = loc.entity.features.map(feature => {
        const [lng, lat] = feature.center;

        return {
          name: feature.place_name,
          lat,
          lng
        };
      });

      this.setState(() => ({ locations }));
    });
  }

  resetSearch () {
    this.setState(() => {
      return {
        text: '',
        locations: [],
        selectedLocation: null
      };
    });
  }

  handleSelectLocation () {
    this.props.onLocationSelect(this.state.selectedLocation);
  }

  attemptGeoLocation () {
    // 检测浏览器是否支持geolocation
    if ('geolocation' in navigator) {
      // 获取用户设备的当前位置
      navigator.geolocation.getCurrentPosition(({ coords }) => {
        const { latitude, longitude } = coords;

        this.mapbox.geocodeReverse({ latitude, longitude }, {}).then(loc => {
          if (!loc.entity.features || !loc.entity.features.length) {
            return;
          }

          // 提取经纬度
          const feature = loc.entity.features[0];
          const [lng, lat] = feature.center;

          // 创建要使用的位置荷载并用其更新组件状态
          const currentLocation = {
            name: feature.place_name,
            lat,
            lng
          };
          this.setState(() => ({
            locations: [currentLocation],
            selectedLocation: currentLocation,
            text: currentLocation.name
          }));

          // 使用新位置信息调用handleLocationUpdate属性
          this.handleLocationUpdate(currentLocation);
        });
      }, null, {
        // 传递给Geolocation API的选项
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      });
    }
  }

  render () {
    return [
      <div key="location-typeahead" className="location-typeahead">
        <i className="fa fa-location-arrow" onClick={this.attemptGeoLocation} />
        <input onChange={this.handleSearchChange} type="text" placeholder="Enter a location ..." value={this.state.text} />
        <button disabled={!this.state.selectedLocation} onClick={this.handleSearchChange} className="open">Select</button>
      </div>,

      this.state.text.length && this.state.locations.length ? (
        <div key="location-typeahead-results" className="location-typeahead-results">
          {this.state.locations.map(location => {
            return (
              <div onClick={e => {
                e.preventDefault();
                this.handleLocationUpdate(location);
              }} key={location.name} className="result">
                {location.name}
              </div>
            );
          })}
        </div>
      ) : null
    ];
  }
}