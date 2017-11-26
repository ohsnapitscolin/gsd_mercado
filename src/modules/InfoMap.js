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

    this.ignoreHoverChanges = false;

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

  setIgnoreHoverChanges(ignoreHoverChnages) {
    this.ignoreHoverChnages_ = ignoreHoverChnages;
  }

  addPoints(node, color) {
    var el = document.createElement('div');

    $(el).attr('id', 'type-' + node.getTypeId());
    $(el).attr('class', 'info_marker');

    const id = node.getTypeId();
    $(el).append(id);

    const thisInfoMap = this;
    $(el).hover(function() {
      const nodeId = $(this).attr('id').split('-')[1];
      thisInfoMap.hover(nodeId);
    }, function() {
      const nodeId = $(this).attr('id').split('-')[1];
      thisInfoMap.unhover(nodeId);
    });
    $(el).click(function() {
      const nodeId = $(this).attr('id').split('-')[1];
      thisInfoMap.contentManager_.updateActiveTypeId(nodeId);
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


  hover(typeId) {
    if (this.ignoreHoverChnages_) {
      return;
    }
    this.focusType(typeId);
  }

  focusTypes(typeIds, activeConnectionsOnly) {
    for (var path in this.pathGroups_) {
      this.pathGroups_[path].style("stroke", (d) => {
        const startNode = d.properties.startNode;
        const endNode = d.properties.endNode;

        let focusPath = false;
        if (typeIds.includes(startNode)) {
          if (!activeConnectionsOnly || typeIds.includes(endNode)) {
            focusPath = true;
          }
        } else if (typeIds.includes(endNode)) {
          if (!activeConnectionsOnly || typeIds.includes(startNode)) {
            focusPath = true;
          }
        }
        return focusPath ? "white" : "";
      });
    }
    this.focusGraphNodes(typeIds);
  }

  focusType(typeId) {
    const totalLength = 300;
    let typeIdsToHover = [typeId];
    for (var path in this.pathGroups_) {
      this.pathGroups_[path].each(function(d) {
        const startNode = d.properties.startNode;
        const endNode = d.properties.endNode;

        let focusPath = false;
        if (startNode == typeId) {
          typeIdsToHover.push(endNode);
          focusPath = true;
        } else if (endNode == typeId) {
          typeIdsToHover.push(startNode);
          focusPath = true;
        }

        if (focusPath) {
          $(this).addClass("animated");
          d3.select(this)
            .attr("stroke-dasharray", (d) => { return totalLength + " " + totalLength; })
            .attr("stroke-dashoffset", (d) => { return totalLength; })
              .transition()
              .duration((d) => {
                return 2500;
               })
            .attr("stroke-dashoffset", 0)
        } else {
          $(this).removeClass("animated");
          d3.select(this).attr("stroke-dashoffset", 0)
            .attr("stroke-dasharray", null)
            .transition()
            .duration(0);
        }
      });
    }
    this.focusGraphNodes(typeIdsToHover);
  }

  focusGraphNodes(typeIds) {
    for (let i = 0; i < typeIds.length; i++) {
      const typeId = typeIds[i];
      const type = this.contentManager_.getType(typeId);

      const element = $("#type-" + typeId);
      element.addClass('hovered');
      element.css({
        'background-color': (type && type.getCategory()) || 'red'
      });
    }
  }

  unhover(typeId) {
    if (this.ignoreHoverChnages_) {
      return;
    }
    this.resetFocus(typeId);
  }

  resetFocus() {
    for (var path in this.pathGroups_) {
      this.pathGroups_[path].style("stroke", (d) => {
        return "";
      });
    }
    for (let pair of this.graphNodes_) {
      const typeId = pair[0];
      const element = $("#type-" + typeId);
      element.removeClass('hovered');
      element.css({
        'background-color': ""
      });
    }
  }

  createMap() {
    mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN

    this.map_ = new mapboxgl.Map({
        container: 'info_mapbox', // container id
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
    this.graphNodes_ = new Map();
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
            new GraphNode(node.id, coordinates, node.connections);
        this.graphNodes_.set(node.id, nodeObject);
        this.addPoints(nodeObject);
      }
    }
  }

  createGeoLines() {
    for (let pair of this.graphNodes_) {
      const node = pair[1];
      const connections = node.getConnections();
      for (let k = 0; k < connections.length; k++) {
        const connection = connections[k];
        this.createGeoLine(node, this.graphNodes_.get(connection));
      }
    }
    console.log(this.geojsonLine_);

    const className = "lines"
    this.pathGroups_[className] =
        this.createGeoNodes(this.geojsonLine_, className);
  }

  flyToNode(typeId) {
    const type = this.graphNodes_.get(typeId);
    this.map_.easeTo({
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
          "startNode": startNode.getTypeId(),
          "endNode": endNode.getTypeId()
        }
      }
    );
  }

  setFocusedNode(typeId) {
    // if (this.focusedTypeId_) {
    //   this.unfocusType(this.focusedTypeId_);
    // }
    // this.focusType(typeId);
    this.flyToNode(typeId);
  }

  render() {
    console.log('renderInfoMap');
    return (
      <div className="info_map">
        <div id="info_mapbox"/>
      </div>
    );
  }
}

class GraphNode {
  constructor(typeId, coordinates, connections) {
    this.typeId_ = typeId;
    this.coordinates_ = coordinates;
    this.connections_ = connections;
  }

  getTypeId() {
    return this.typeId_;
  }

  getCoordinates() {
    return this.coordinates_;
  }

  getConnections() {
    return this.connections_;
  }
}

export default InfoMap