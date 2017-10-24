import $ from 'jquery';
import React, { Component } from 'react';
import * as d3 from 'd3';
import * as mapboxgl from 'mapbox-gl';
import * as topojson from 'topojson-client';

import 'mapbox-gl/dist/mapbox-gl.css';
import 'mapbox-gl/dist/svg/mapboxgl-ctrl-compass.svg';
import 'mapbox-gl/dist/svg/mapboxgl-ctrl-geolocate.svg';
import 'mapbox-gl/dist/svg/mapboxgl-ctrl-zoom-in.svg';
import 'mapbox-gl/dist/svg/mapboxgl-ctrl-zoom-out.svg';

import { ContentTypeEnum, FilterTypeEnum } from './ContentManager.js';
import GeoMapHover from './GeoMapHover.js';

const MAPBOX_ACCESS_TOKEN = "pk.eyJ1Ijoib2hzbmFwaXRzY29saW4iLCJhIjoiY2o3bzkxZ2d1M2ZvajJ4bHh3NTdoMGVzOSJ9.ui98APpgyALQli44gDtXxg";

const GeoNodeClassEnum = {
  POINTS: "points",
  LINES: "lines"
};


class GeoMap extends Component {
  constructor(props) {
    super(props)

    this.contentManager_ = props.contentManager;

    this.map_ = null;
    this.svg_ = null;
    this.pathGroups_ = [];

    this.mapHover_ = null;
    this.moveCounter_ = 0;
  }

  importGeoJsons() {
    const geoJsons = require('../resources/geojsons').geojsons;
    let importPromises = [];
    for (let i = 0; i < geoJsons.length; i++) {
      const geoJson = geoJsons[i];
      importPromises.push(this.importGeoJson(geoJson.file, geoJson.type));
    }
    return Promise.all(importPromises);
  }

  importGeoJson(file, type) {
    return import(`../resources/geojson/${file}.json`).then((geojson) => {
      const className = this.getClassForType(type);
      this.pathGroups_[className] = this.createGeoNodes(geojson, className);
      // if (className == GeoNodeClassEnum.POINTS) {
      //   this.addPoints(geojson);
      // }
    });
  }

  addPoints(geojson) {
    geojson.features.forEach((marker) => {
      var el = document.createElement('div');
      el.className = 'marker';

      var lngLat = marker.geometry.coordinates.splice(-1);
      console.log(lngLat);
      // make a marker for each feature and add to the map
      new mapboxgl.Marker(el)
      .setLngLat(marker.geometry.coordinates)
      .addTo(this.map_);
    });
  }

  getClassForType(type) {
    switch(type) {
      case "points":
        return GeoNodeClassEnum.POINTS;
      case "lines":
        return GeoNodeClassEnum.LINES;
      default:
        throw new Error('Unknown GeoNode type: ' + type);
    }
  }

  createGeoNodes(geojson, className) {
    return this.svg_
      .append('g')
      .selectAll("path")
        .data(geojson.features)
        .enter().append("path")
          .attr("d", this.path_)
          .attr('class', className)
          .attr('id', (d) => { return 'geo_map_' + d.properties.geojsonId; });
  }

  createMap() {
    mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN

    this.map_ = new mapboxgl.Map({
        container: 'geo_mapbox', // container id
        style: 'mapbox://styles/mapbox/light-v9',
        center: [-99.1332, 19.4326],
        zoom: 12,
    });

    this.map_.on("viewreset", () => { this.updatePaths(); });
    this.map_.on("move", () => { this.updatePaths(); });

    // this.map_.on("movestart", () => {
    //   this.svg_.classed("hidden", true);
    // });
    // this.map_.on("moveend", () => {
    //   this.svg_.classed("hidden", false);
    //   this.updatePaths();
    // });

    // this.map_.on("move", () => {
    //   console.log(this.moveCounter_);
    //   if (this.moveCounter_ % 5 == 0) {
    //     console.log('update');
    //     this.updatePaths();
    //   }
    //   this.moveCounter_++;
    // });
    // this.map_.on("moveend", () => {
    //   this.updatePaths();
    //   this.moveCounter_ = 0;
    // });

    const transform = d3.geoTransform({ point: projectPoint });
    this.path_ = d3.geoPath().projection(transform);

    const thisMap = this.map_;
    function projectPoint(lon, lat) {
      const point = thisMap.project(new mapboxgl.LngLat(lon, lat));
      this.stream.point(point.x, point.y);
    }

    this.map_.scrollZoom.disable()
    this.map_.addControl(new mapboxgl.NavigationControl(), 'top-right');

    const container =  this.map_.getCanvasContainer()
    this.svg_ = d3.select(container).append("svg");
  }

  updatePaths() {
    for (let path in this.pathGroups_) {
      this.pathGroups_[path].attr("d", this.path_);
    };
  }

  // React component management

  componentDidMount() {
    this.createMap();
    this.importGeoJsons().then(() => {
      this.updateHovers()
    });
  }

  componentDidUpdate() {
    this.updateHovers();
  }

  updateHovers() {
    var thisGeoMap = this;
    thisGeoMap.pathGroups_[GeoNodeClassEnum.POINTS].each(function(d) {
      var $geoNode = $(this);
      var $geoMap = $('#geo_mapbox');

      $geoNode.click(() => {
        const geoId = d.properties.geojsonId;
        const node = thisGeoMap.contentManager_.getNodeByGeoId(geoId);

        thisGeoMap.mapHover_.showHover(
            $geoMap.offset().top + $geoMap.height(),
            $geoMap.offset().left + $geoMap.width(),
            $geoNode.position().top - $geoMap.offset().top,
            $geoNode.position().left - $geoMap.offset().left,
            node);
        thisGeoMap.contentManager_.hoverNode(node.getId(), ContentTypeEnum.MAP);
      });
    });
  }

  getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  filter(filterType) {
    console.log(filterType);
    if (filterType == FilterTypeEnum.NONE) {
      this.resetFilters();
    }
    if (filterType == FilterTypeEnum.GREEN) {
      this.updateColor('green')
    }
    if (filterType == FilterTypeEnum.RED) {
      this.updateColor('red')
    }
    if (filterType == FilterTypeEnum.POPUPINFO) {
      this.filterNullProperty('PopupInfo')
    }
  }

  flyToNode(geoId) {
    console.log(geoId);
    const element = d3.select('#geo_map_' + geoId);
    console.log(element);
    const coordinates = element.data()[0].geometry.coordinates;
    this.map_.flyTo({
      center: [coordinates[0], coordinates[1]]
    });
  }

  setActiveNode(geoId) {
    this.filterById(geoId);
    this.flyToNode(geoId);
  }

  animateLines() {
    var linePath = this.pathGroups_['lines']
    linePath.each(function(d) {
      d.totalLength = this.getTotalLength();
    });

    linePath
      .attr("stroke-dasharray", (d) => { return d.totalLength + " " + d.totalLength; })
      .attr("stroke-dashoffset", (d) => { return d.totalLength; })
      .transition()
        .duration((d) => {
          return d.totalLength * 10;
        })
        .attr("stroke-dashoffset", 0);
  }

  resetFilters() {
    for (var path in this.pathGroups_) {
      this.pathGroups_[path].style("stroke", "");
      this.pathGroups_[path].style("visibility", "visible");
    };
  }

  filterNullProperty(property) {
    for (var path in this.pathGroups_) {
      this.pathGroups_[path].style("visibility", (d) => {
        return d.properties[property] == null ? "hidden" : "visible";
      });
    }
  }

  filterPropertyByValue(property, value) {
    for (var path in this.pathGroups_) {
      this.pathGroups_[path].style("visibility", (d) => {
        return d.properties[property] != value ? "hidden" : "visible";
      });
    }
  }

  filterById(geoId) {
    for (var path in this.pathGroups_) {
      this.pathGroups_[path].style("visibility", (d) => {
        return d.properties.geojsonId != geoId ? "hidden" : "visible";
      });
    }
  }

  updateData(data) {
    console.log(data);
    for (var path in this.pathGroups_) {
      console.log(path);
      if (path != data) {
        this.pathGroups_[path].style('visibility', 'hidden');
      } else {
        this.pathGroups_[path].style('visibility', 'visible');
      }
    };
  }

  updateColor(color) {
    for (var path in this.pathGroups_) {
      this.pathGroups_[path].style("stroke", color);
    };
  }

  render() {
    console.log('renderGeoMap');
    return (
      <div className="geo_map">
        <GeoMapHover
          contentManager = {this.contentManager_}
          hoverClick = {(geoId) => {
            const nodeId = this.contentManager_.getNodeByGeoId(geoId).getId()
            this.contentManager_.clickNode(nodeId, ContentTypeEnum.MAP);
          }}
          ref = {(node) => { this.mapHover_ = node; }}/>
        <div id="geo_mapbox"/>
      </div>
    );
  }
}

export default GeoMap