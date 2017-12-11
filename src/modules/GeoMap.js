import $ from 'jquery';
import React, { Component } from 'react';
import * as d3 from 'd3';
import * as mapboxgl from 'mapbox-gl';

import 'mapbox-gl/dist/mapbox-gl.css';
import 'mapbox-gl/dist/svg/mapboxgl-ctrl-compass.svg';
import 'mapbox-gl/dist/svg/mapboxgl-ctrl-geolocate.svg';
import 'mapbox-gl/dist/svg/mapboxgl-ctrl-zoom-in.svg';
import 'mapbox-gl/dist/svg/mapboxgl-ctrl-zoom-out.svg';

import GeoMapHover from './GeoMapHover.js';
import OverlayData from './OverlayData.js';
import OverlayLabel from './OverlayLabel.js';

const MAPBOX_ACCESS_TOKEN = "pk.eyJ1Ijoib2hzbmFwaXRzY29saW4iLCJhIjoiY2o3bzkxZ2d1M2ZvajJ4bHh3NTdoMGVzOSJ9.ui98APpgyALQli44gDtXxg";

const GeoNodeClassEnum = {
  POINTS: 'points',
  GEO_PATH: 'geo_path',
  DELEGACION: 'delegacion'
};

const GeoNodeTypeEnum = {
  MARKER: 'marker',
  PATH: 'path'
}


class GeoMap extends Component {
  constructor(props) {
    super(props)

    this.contentManager_ = props.contentManager;

    this.map_ = null;
    this.svg_ = null;
    this.pathGroups_ = [];
    this.overlayGroups_ = [];

    this.mapHover_ = null;
    this.moveCounter_ = 0;

    this.importCompletedPromise_ = null;

    this.state = {
      activeOverlay: null
    }

    this.overlays_ = new Map();
    this.geoNodes_ = new Map();
  }

  importGeoJsons() {
    const geoJsons = require('../resources/geojsons').geojsons;
    let importPromises = [];
    for (let i = 0; i < geoJsons.length; i++) {
      const geoJson = geoJsons[i];
      importPromises.push(this.importGeoJson(geoJson.file, geoJson.type));
    }
    const overlays = require('../resources/overlays.json');
    this.parseOverlays(overlays);
    return Promise.all(importPromises);
  }

  parseOverlays(overlays) {
    for (let i = 0; i < overlays.length; i++) {
      const overlayObject = overlays[i];
      this.overlays_.set(
          overlayObject.property, new OverlayData(overlayObject));
    }
  }

  importGeoJson(file, type) {
    return import(`../resources/geojson/${file}.json`).then((geojson) => {
      const className = type;
      let geoPath;
      switch(className) {
        case GeoNodeClassEnum.DELEGACION:
          geoPath = this.createDelegacion(geojson, className);
          geoPath.each((path, i) => {
            const geoNode = new GeoNode(
              path.properties.geojsonId,
              GeoNodeTypeEnum.PATH,
              this.getPathCoordinates(path) /* this.coordinates */,
              path);
            this.geoNodes_.set(geoNode.getGeoId(), geoNode);
          });
          this.overlayGroups_[className] = geoPath;
          break;
        case GeoNodeClassEnum.GEO_PATH:
          geoPath = this.createGeoPath(geojson, className);
          geoPath.each((path, i) => {
            const geoNode = new GeoNode(
              path.properties.geojsonId,
              GeoNodeTypeEnum.PATH,
              this.getPathCoordinates(path) /* this.coordinates */,
              path);
            this.geoNodes_.set(geoNode.getGeoId(), geoNode);
          });
          this.pathGroups_[className] = geoPath;
          break;
        case GeoNodeClassEnum.POINTS:
          this.addPoints(geojson);
          break;
        default:
          break;
      }
    });
  }

  getPathCoordinates(path) {
    const coordinates = path.geometry.coordinates;
    if (!coordinates || !coordinates.length) {
      return null;
    }
    const length = coordinates.length;
    const lngLat = coordinates[Math.floor(length / 2)];
    lngLat.splice(-1);
    return lngLat;
  }

  addPoints(geojson) {
    geojson.features.forEach((marker) => {
      const el = document.createElement('div');
      // const img = $('<img class="location_icon">');
      // img.attr('src', require("../resources/location_icon.svg"));

      // img.appendTo($(el));
      $(el).attr('id', 'geo-' + marker.properties.geojsonId);
      $(el).attr('class', 'geo_marker');

      marker.geometry.coordinates.splice(-1);

      const thisGeoMap = this;
      $(el).click(function() {
        const geoId = $(this).attr('id').split('-')[1];
        thisGeoMap.clickGeoId(geoId, $(this));
      });

      $(el).hover(function() {
        $(this).addClass("hovered");
      }, function() {
        $(this).removeClass("hovered");
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

  createGeoPath(geojson, className) {
    return this.svg_
      .append('g')
      .selectAll("path")
        .data(geojson.features)
        .enter().append("path")
          .attr("d", this.path_)
          .attr('class', `${className} hidden`)
          .attr('id', (d) => { return 'geo-' + d.properties.geojsonId; })
          .on('mouseover', function() {$(this).addClass("hovered") })
          .on('mouseout', function() {$(this).removeClass("hovered") });
  }

  createDelegacion(geojson, className) {
    return this.svg_
      .append('g')
      .selectAll("path")
        .data(geojson.features)
        .enter().append("path")
          .attr("d", this.path_)
          .attr('class', `${className}`)
          .attr('id', (d) => { return 'delegacion-' + d.properties.POB1; })
          .on('mouseover', function(d) {
            $(this).addClass("hovered")
            // const g = d3.select('svg'); // The node
            // // The class is used to remove the additional text later
            // const info = g.append('text')
            //    .classed('info', true)
            //    .attr('x', 10)
            //    .attr('y', 10)
            //    .text(d.properties.delegacion);
          })
          .on('mouseout', function() {
            $(this).removeClass("hovered")
            // d3.select('svg').select('text.info').remove();
          });
  }

  updateOverlays(property) {
    const overlayData = this.overlays_.get(property);
    const thisGeoMap = this;

    if (!overlayData) {
      for (let path in this.overlayGroups_) {
        this.overlayGroups_[path].each(function(d) {
          thisGeoMap.removeActivePath($(this));
        });
      }
      this.setState({ activeOverlay: null });
      return;
    }

    for (let path in this.overlayGroups_) {
      this.overlayGroups_[path].each(function(d) {
      thisGeoMap.setActivePath($(this))
        d3.select(this).style("fill", function(d) {
          return overlayData.getColor(d.properties[property]);
        });
      });
    }
    this.setState({ activeOverlay: property });
  }

  createMap() {
    mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN

    this.map_ = new mapboxgl.Map({
        container: 'geo_mapbox', // container id
        style: 'mapbox://styles/mapbox/light-v9',
        center: [-99.1332, 19.4326],
        zoom: 10,
    });

    // this.map_.on("viewreset", () => { this.updatePaths(); });
    this.map_.on("move", () => { this.updateActivePaths(); });
    this.map_.on("moveend", () => { this.updatePaths(); });

    this.map_.on("movestart", () => {
      this.hideOverlays("hidden", true);
    });
    this.map_.on("moveend", () => {
      this.showOverlays();
    });

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
    }
    for (let path in this.overlayGroups_) {
      this.overlayGroups_[path].attr("d", this.path_);
    }
  }

  updateActivePaths() {
    const thisGeoMap = this;
    for (let path in this.pathGroups_) {
      this.pathGroups_[path].each(function(d) {
        if (!$(this).hasClass("hidden")) {
          d3.select(this).attr("d", thisGeoMap.path_);
        }
      });
    }
    // for (let path in this.overlayGroups_) {
    //   this.overlayGroups_[path].attr("d", this.path_);
    // }
  }

  hideOverlays() {
    const thisGeoMap = this;
    for (var path in this.overlayGroups_) {
      this.overlayGroups_[path].attr("class", function(d) {
        return thisGeoMap.hidePath($(this));
      });
    }
  }

  showOverlays() {
    const thisGeoMap = this;
    for (var path in this.overlayGroups_) {
      this.overlayGroups_[path].attr("class", function(d) {
        return thisGeoMap.showPath($(this));
      });
    }
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

    this.mapHover_.showHover(
        $geoMap.height(),
        $geoMap.width(),
        $element.position().top,
        $element.position().left,
        geoId);
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

  showGeoIds(geoIds, hideOthers) {
    $(".geo_marker").each(function() {
      const $marker = $(this);
      const geoId = $marker.attr('id').split('-')[1];
      if (geoIds.includes(geoId)) {
        $marker.removeClass("hidden");
      } else if (hideOthers) {
        $marker.addClass("hidden");
      }
    });

    const thisGeoMap = this;
    for (var path in this.pathGroups_) {
      this.pathGroups_[path].attr("class", function(d) {
        const geoId = d.properties.geojsonId;
        if (hideOthers) {
          return geoIds.includes(geoId) ?
              thisGeoMap.showPath($(this)) : thisGeoMap.hidePath($(this));
        } else {
          return geoIds.includes(geoId) ?
              thisGeoMap.showPath($(this)) : $(this).attr("class");
        }
      });
    }
  }

  hideGeoIds(geoIds) {
    $(".geo_marker").each(function() {
      const $marker = $(this);
      const geoId = $marker.attr('id').split('-')[1];
      if (geoIds.includes(geoId)) {
        $marker.addClass("hidden");
      }
    });

    const thisGeoMap = this;
    for (var path in this.pathGroups_) {
      this.pathGroups_[path].attr("class", function(d) {
        const geoId = d.properties.geojsonId;
        return geoIds.includes(geoId) ?
            thisGeoMap.hidePath($(this)) : $(this).attr("class");
      });
    }
  }

  flyToNode(geoId) {
    const geoNode = this.geoNodes_.get(geoId);
    const coordinates = (geoNode && geoNode.getCoordinates()) || null;
    if (coordinates) {
      this.map_.easeTo({
        center: coordinates
      });
    }
  }

  animateGeoId(geoId) {
    const totalLength = 500;
    for (var path in this.pathGroups_) {
      this.pathGroups_[path].each(function(d) {
        if (d.properties.geojsonId === geoId) {
          d3.select(this)
            .attr("stroke-dasharray", (d) => {
              return totalLength + " " + totalLength; })
            .attr("stroke-dashoffset", (d) => { return totalLength; })
              .transition()
              .duration((d) => {
                return totalLength * 10;
               })
            .attr("stroke-dashoffset", 0);
        }
      });
    }
  }

  stopAnimation(geoId) {
    for (var path in this.pathGroups_) {
      this.pathGroups_[path].each(function(d) {
        if (d.properties.geojsonId === geoId) {
          d3.select(this)
            .attr("stroke-dasharray", null)
              .transition()
              .duration(0);
        }
      });
    }
  }

  showAllGeoNodes() {
    $(".geo_marker").each(function() {
      $(this).removeClass("hidden");
    });

    const thisGeoMap = this;
    for (var path in this.pathGroups_) {
      this.pathGroups_[path].attr("class", function(d) {
        return thisGeoMap.showPath($(this));
      });
    };
  }

  hideAllGeoNodes() {
    $(".geo_marker").each(function() {
      $(this).addClass("hidden");
    });

    const thisGeoMap = this;
    for (var path in this.pathGroups_) {
      this.pathGroups_[path].attr("class", function(d) {
        return thisGeoMap.hidePath($(this));
      });
    };
  }

  hidePath($path) {
    $path.addClass('hidden');
    return $path.attr('class');
  }

  showPath($path) {
    $path.removeClass('hidden');
    return $path.attr('class');
  }

  setActivePath($path) {
    $path.addClass('active');
    return $path.attr('class');
  }

  removeActivePath($path) {
    $path.removeClass('active');
    return $path.attr('class');
  }

  resetFocus() {
    $(".geo_marker").each(function() {
      $(this).removeClass('hovered');
    });

    for (var path in this.pathGroups_) {
      this.pathGroups_[path].each(function(d) {
        $(this).removeClass('hovered');
      });
    }
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
        <OverlayLabel overlayData={
            this.overlays_.get(this.state.activeOverlay)}/>
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