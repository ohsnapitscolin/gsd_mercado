import $ from 'jquery';
// import * as firebase from 'firebase';

import React, { Component } from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom'

import '../App.css';

import Edit from './Edit.js';
import Main from './Main.js';
import Navigation from './Navigation.js';
import NotFound from './NotFound.js';

class App extends Component {
  componentWillMount() {
    // var config = {
    //   apiKey: "AIzaSyAYKg_wG1d-8fKCgekMRD2bySxqg6KOtTU",
    //   authDomain: "gsdmercado.firebaseapp.com",
    //   databaseURL: "https://gsdmercado.firebaseio.com",
    //   projectId: "gsdmercado",
    //   storageBucket: "",
    //   messagingSenderId: "267638384764"
    // };
    // firebase.initializeApp(config);
  }

  render() {
    return (
      <BrowserRouter>
        <div>
          <Route
              component={Navigation} onChange={() => {
                $('.content').scrollTop(0);
              }} />
          <div className="content">
            <Switch>
              <Route
                  exact path="/"
                  component={Main} />
              <Route
                  path="/home/"
                  component={Main} />
              <Route
                  path="/edit"
                  component={Edit} />
              <Route
                  component={NotFound} />
            </Switch>
          </div>
        </div>
      </BrowserRouter>
    );
  }
}

export default App;
