import React, { Component } from 'react';
import $ from 'jquery';
import { Link } from 'react-router-dom';

var resources = "../resources/"

var PathEnum = {
    HOME : 0,
    NOT_FOUND : 1
}

class Navigation extends Component {
  render() {
    console.log('render');
    return (
      <div className="navigation">
        <Link id="home_link" to="/home" onClick={this.props.onClick}>
          <div>Home</div>
        </Link>
        <Link id="notfound_link" to="/notfound" onClick={this.props.onClick}>
          <div>Not Found</div>
        </Link>
      </div>
    );
  };

  // Should be called with this.props.location.pathname
  getPath(pathname) {
    switch(pathname) {
      case '/':
      case '/home':
      case '/home/':
        return PathEnum.HOME;
      default:
        return PathEnum.NOT_FOUND;
    }
  };
}

export default Navigation;