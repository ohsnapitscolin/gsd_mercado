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

import { FilterTypeEnum } from './ContentManager.js';
import GeoMapHover from './GeoMapHover.js';

const MAPBOX_ACCESS_TOKEN = "pk.eyJ1Ijoib2hzbmFwaXRzY29saW4iLCJhIjoiY2o3bzkxZ2d1M2ZvajJ4bHh3NTdoMGVzOSJ9.ui98APpgyALQli44gDtXxg";

const GeoNodeClassEnum = {
  POINTS: 'points',
  LINES: 'lines'
};

const GeoNodeTypeEnum = {
  MARKER: 'marker',
  PATH: 'path'
}

const LoadingStateEnum = {
  WAITING: 'waiting',
  LOADING: 'loading',
  LOADED: 'loaded'
}


class GeoMap extends Component {
  constructor(props) {
    super(props)

    this.contentManager_ = props.contentManager;

    this.map_ = null;
    this.svg_ = null;
    this.pathGroups_ = [];

    this.mapHover_ = null;
    this.moveCounter_ = 0;

    this.importCompletedPromise_ = null;

    this.geoNodes_ = new Map();
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
      switch(className) {
        case GeoNodeClassEnum.LINES:
          const geoPath = this.createGeoPath(geojson, className);
          geoPath.each((path, i) => {
            const geoNode = new GeoNode(
              path.properties.geojsonId,
              GeoNodeTypeEnum.PATH,
              undefined /* this.coordinates */,
              path);
            this.geoNodes_.set(geoNode.getGeoId(), geoNode);
          });
          this.pathGroups_[className] = geoPath;
          break;
        case GeoNodeClassEnum.POINTS:
          this.addPoints(geojson);
          break;
      }
    });
  }

  addPoints(geojson) {
    geojson.features.forEach((marker) => {
      const el = document.createElement('div');

      $(el).attr('id', 'geo-' + marker.properties.geojsonId);
      $(el).attr('class', 'geo_marker');

      var lngLat = marker.geometry.coordinates.splice(-1);

      const thisGeoMap = this;
      $(el).click(function() {
        const geoId = $(this).attr('id').split('-')[1];
        thisGeoMap.clickGeoId(geoId, $(this));
      });

      $(el).hover(function() {
        $(this).addClass('hovered');
      }, function() {
        $(this).removeClass('hovered');
      });

      // make a marker for each feature and add to the map
      new mapboxgl.Marker(el)
          .setLngLat(marker.geometry.coordinates)
          .addTo(this.map_);

      const geoNode = new GeoNode(
          marker.properties.geojsonId + "",
          GeoNodeTypeEnum.MARKER,
          marker.geometry.coordinates,
          undefined /* path */);
      this.geoNodes_.set(geoNode.getGeoId(), geoNode);
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

  createGeoPath(geojson, className) {
    return this.svg_
      .append('g')
      .selectAll("path")
        .data(geojson.features)
        .enter().append("path")
          .attr("d", this.path_)
          .attr('class', className)
          .attr('id', (d) => { return 'geo-' + d.properties.geojsonId; })
          .style("visibility", "hidden");
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
    // this.geoNodes_.forEach((geoNode) => {
    //   if (geoNode.getGeoNodeType() == GeoNodeTypeEnum.PATH) {
    //     this.geoNode.getPath().attr("d", this.path_);
    //   }
    // });
    for (let path in this.pathGroups_) {
      this.pathGroups_[path].attr("d", this.path_);
    }
  }

  updateActivePaths() {

  }

  // React component management

  componentDidMount() {
    this.isMounted_ = true;
    this.createMap();

    this.importCompletedPromise_ = Promise.resolve(this.importGeoJsons());
    this.importCompletedPromise_.then(() => {
      // this.updateHovers();
    })
  }

  componentDidUpdate() {
    this.importCompletedPromise_.then(() => {
      // this.updateHovers();
    });
  }

  componentWillUnmount() {
    this.isMounted_ = false;
  }

  clickGeoId(geoId, $element) {
    const $geoMap = $('#geo_mapbox');
    const node = this.contentManager_.getNodeByGeoId(geoId);


    this.mapHover_.showHover(
        $geoMap.offset().top + $geoMap.height(),
        $geoMap.offset().left + $geoMap.width(),
        $element.position().top,
        $element.position().left,
        node);
    // this.contentManager_.hoverNode(node.getId());
  }

  getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  showGeoIds(geoIds) {
    $(".geo_marker").each(function() {
      const $marker = $(this);
      const geoId = $marker.attr('id').split('-')[1];
      $marker.css({
        'visibility': geoIds.includes(geoId) ? "visible" : "hidden"
      });
    });

    for (var path in this.pathGroups_) {
      this.pathGroups_[path].style("visibility", (d) => {
        return geoIds.includes(d.properties.geojsonId)  ? "visible" : "hidden";
      });
    }
  }

  filter(filterType) {
    console.log(filterType);
    if (filterType == FilterTypeEnum.NONE) {
      this.showAllGeoNodes();
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
    this.map_.easeTo({
      center: this.geoNodes_.get(geoId + "").getCoordinates()
    });
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

  showAllGeoNodes() {
    $(".geo_marker").each(function() {
      $(this).css({
        'visibility': 'visible'
      })
    });

    for (var path in this.pathGroups_) {
      this.pathGroups_[path].style("stroke", "");
      this.pathGroups_[path].style("visibility", "visible");
    };
  }

  hideAllGeoNodes() {
    $(".geo_marker").each(function() {
      $(this).css({
        'visibility': 'hidden'
      })
    });

    for (var path in this.pathGroups_) {
      this.pathGroups_[path].style("stroke", "");
      this.pathGroups_[path].style("visibility", "hidden");
    };
  }

  resetFocus() {
    $(".geo_marker").each(function() {
      $(this).removeClass('hovered');
    });
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

  completeLoad() {
    return this.importCompletedPromise_;
  }

  render() {
    console.log('renderGeoMap');
    return (
      <div className="geo_map">
        <GeoMapHover
          contentManager = {this.contentManager_}
          hoverClick = {(geoId) => {
            const nodeId = this.contentManager_.getNodeByGeoId(geoId).getId()
            this.contentManager_.clickNode(nodeId);
          }}
          ref = {(node) => { this.mapHover_ = node; }}/>
        <div id="geo_mapbox"/>
      </div>
    );
  }
}

class GeoNode {
  constructor(geoId, geoNodeType, coordinates, path) {
    this.geoId_ = geoId;
    this.geoNodeType_ = geoNodeType;
    this.coordinates_ = coordinates;
    this.path_ = path;
    this.isActive_ = true;
  }

  getGeoId() {
    return this.geoId_;
  }

  getGeoNodeType() {
    return this.geoNodeType_;
  }

  getCoordinates() {
    return this.coordinates_;
  }

  getPath() {
    return this.path_;
  }

  setActive(isActive) {
    this.isActive_ = isActive;
  }

  isActive() {
    return this.isActive_;
  }
}

export default GeoMap