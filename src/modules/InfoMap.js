import $ from 'jquery';
import React, { Component } from 'react';
import * as d3 from 'd3';
import * as mapboxgl from 'mapbox-gl';


const MAPBOX_ACCESS_TOKEN = "pk.eyJ1Ijoib2hzbmFwaXRzY29saW4iLCJhIjoiY2o3bzkxZ2d1M2ZvajJ4bHh3NTdoMGVzOSJ9.ui98APpgyALQli44gDtXxg";

class InfoMap extends Component {
  constructor(props) {
    super(props)

    this.contentManager_ = props.contentManager;

    this.map_ = null;
    this.svg_ = null;
    this.pathGroups_ = [];

    this.mapHover_ = null;
    this.moveCounter_ = 0;

    this.graph_ = require('../resources/graph.json');
    console.log(this.graph_);

    this.maxWidth_ = -1;
    this.maxWidthLevel_ = -1;
    for (let i = 0; i < this.graph_.levels.length; i++) {
      let level = this.graph_.levels[i];
      if (level.nodes.length > this.maxWidthLevel_) {
        this.maxWidth_ = level.nodes.length;
        this.maxWidthLevel_ = i;
      }
    }
  }

  addPoints(node, color) {
    var el = document.createElement('div');

    $(el).attr('id', 'type-' + node.getId());
    $(el).attr('class', 'marker');



    const id = node.getId();
    $(el).append(id);

    const thisInfoMap = this;
    $(el).hover(function() {
      const nodeId = $(this).attr('id').split('-')[1];
      thisInfoMap.hover(nodeId);
    }, function() {
      const nodeId = $(this).attr('id').split('-')[1];
      thisInfoMap.unhover(nodeId);
    });

    new mapboxgl.Marker(el)
    .setLngLat(node.getCoordinates())
    .addTo(this.map_);
  }

  createGeoNodes(geojson, className) {
    return this.svg_
      .append('g')
      .selectAll("path")
        .data(geojson.features)
        .enter().append("path")
          .attr("d", this.path_)
          .attr('class', className);
          // .attr('id', (d) => { return 'geo_map_' + d.properties.geojsonId; });
  }

  handleHoverNode(typeId) {
    this.hover(typeId);
  }

  handleUnhoverNode(typeId) {
    this.unhover(typeId);
  }

  hover(nodeId) {
    let nodesToHover = [nodeId];
    for (var path in this.pathGroups_) {
      this.pathGroups_[path].style("stroke", (d) => {
        if (d.properties.startNode == nodeId) {
          nodesToHover.push(d.properties.endNode);
          return "black";
        } else if (d.properties.endNode == nodeId) {
          nodesToHover.push(d.properties.startNode);
          return "black";
        } else {
          return "";
        }
      });
    }

    for (let i = 0; i < nodesToHover.length; i++) {
      const nodeId = nodesToHover[i];
      const type = this.contentManager_.getType(nodeId);

      const element = $("#type-" + nodeId);
      element.addClass('hovered');
      element.css({
        'background-color': (type && type.getCategory()) || 'red'
      });
    }
  }

  unhover(nodeId) {
    for (var path in this.pathGroups_) {
      this.pathGroups_[path].style("stroke", (d) => {
        return "";
      });
    }
    for (let pair of this.nodes_) {
      const nodeId = pair[0];
      const element = $("#type-" + nodeId);
      element.removeClass('hovered');
      element.css({
        'background-color': ""
      });
    }
  }

  createMap() {
    mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN

    this.map_ = new mapboxgl.Map({
        container: 'geo_mapbox', // container id
        style: 'mapbox://styles/mapbox/light-v9',
        center: [0, -.15],
        zoom: 10,
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
    // this.map_.addControl(new mapboxgl.NavigationControl(), 'top-right');

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
    this.addGraph();
    this.createGeoLines();
    // this.importGraph().then(() => {

    // });
  }

  addGraph() {
    this.nodes_ = new Map();
    const width = .07;
    const height = .05;
    for (let i = 0; i < this.graph_.levels.length; i++) {
      const level = this.graph_.levels[i];
      const levelWidth = level.nodes.length;
      const spreadLevel = level.spread;
      console.log(spreadLevel);
      const offset =
          (levelWidth - 1) * width * spreadLevel / 2 * -1;
      for (let j = 0; j < level.nodes.length; j++) {
        const node = level.nodes[j];
        if (!node.id || node.id < 0) {
          continue;
        }
        const coordinates = [
            offset + (j * width * spreadLevel),
            i * height * 1.5 * -1];
        const nodeObject =
            new Node(node.id, coordinates, node.connections);
        this.nodes_.set(node.id, nodeObject);
        this.addPoints(nodeObject);
      }
    }
  }

  createGeoLines() {
    for (let pair of this.nodes_) {
      const node = pair[1];
      const connections = node.getConnections();
      for (let k = 0; k < connections.length; k++) {
        const connection = connections[k];
        this.createGeoLine(node, this.nodes_.get(connection));
      }
    }
    console.log(this.geojsonLine_);

    const className = "lines"
    this.pathGroups_[className] =
        this.createGeoNodes(this.geojsonLine_, className);
  }

  flyToNode(typeId) {
    const type = this.nodes_.get(typeId);
    this.map_.flyTo({
      center: type.getCoordinates()
    });
  }

  createGeoLine(startNode, endNode) {
    if (!this.geojsonLine_) {
      this.geojsonLine_ =
          { "type": "FeatureCollection",
            "features": []
          }
    }

    this.geojsonLine_.features.push(
      { "type": "Feature",
        "geometry": {
          "type": "LineString",
          "coordinates": [
            startNode.getCoordinates(), endNode.getCoordinates()
          ]
        },
        "properties": {
          "startNode": startNode.getId(),
          "endNode": endNode.getId()
        }
      }
    );
  }

  setActiveNode(geoId) {
    this.filterById(geoId);
    this.flyToNode(geoId);
  }

  render() {
    console.log('renderGeoMap');
    return (
      <div className="geo_map">
        <div id="geo_mapbox"/>
      </div>
    );
  }
}

class Node {
  constructor(id, coordinates, connections) {
    this.id_ = id;
    this.coordinates_ = coordinates;
    this.connections_ = connections;
  }

  getId() {
    return this.id_;
  }

  getCoordinates() {
    return this.coordinates_;
  }

  getConnections() {
    return this.connections_;
  }
}

export default InfoMap