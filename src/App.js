import React, { Component } from 'react';
import './materialize.css';
import materialize from 'materialize-css';
import './App.css';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { extract_items_from_snapshot, extract_day } from './Helpers/util';
import firebase, { auth, provider } from './firebase.js';
import async_wrapper from './Helpers/AsyncWrapper';
const el_loading = <span className="loader page" />;
const Home = async_wrapper(() => import('./Routes/Home'), el_loading);
const Entry = async_wrapper(() => import('./Routes/Entry'), el_loading);
const Items = async_wrapper(() => import('./Routes/Items'), el_loading);
const Item = async_wrapper(() => import('./Routes/Item'), el_loading);
const Overview = async_wrapper(() => import('./Routes/Overview'), el_loading);

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      items: null,
      active_items: null,
      log: null,
      active_log: null,
      today_log: null,
      score: null,
      today_score: null,
      user: null
    };

    this.init_data_observers.bind(this);
    this.destroy_data_observers.bind(this);
  }

  db = firebase.database();

  init_data_observers = user => {
    // mounts an observer that runs when attached
    this.db.ref(`${user.uid}/items`).on('value', async snapshot => {
      const items = extract_items_from_snapshot(snapshot);
      const active_items = items.filter(i => i.active !== false);
      const active_sorted_items = active_items.reverse();
      const log = await new Promise((resolve, reject) =>
        this.db
          .ref(`${user.uid}/log`)
          .once('value', snapshot => resolve(extract_items_from_snapshot(snapshot)))
      );
      const active_log = log.filter(l => l.active !== false);
      const formatted_items = active_sorted_items.map(i => ({
        ...i,
        logs: active_log ? active_log.filter(l => l.item && l.item.key === i.key) : []
      }));

      this.setState({
        items: formatted_items
      });
    });

    // mounts an observer that runs when attached
    this.db.ref(`${user.uid}/log`).on('value', snapshot => {
      const log = extract_items_from_snapshot(snapshot);
      const active_log = log.filter(l => l.active !== false);
      const score = active_log.reduce((acc, l) => acc + l.item.value, 0);
      const today_log = extract_day(Date.now(), active_log);
      const today_score = today_log.reduce((acc, l) => acc + l.item.value, 0);
      const items = this.state.items;
      const formatted_items = items
        ? items.map(i => ({
            ...i,
            logs: active_log.filter(l => l.item && l.item.key === i.key)
          }))
        : items;

      this.setState({
        items: formatted_items,
        log,
        active_log,
        today_log,
        score,
        today_score
      });
    });
  };

  destroy_data_observers = user => {
    this.db.ref(`${user.uid}/log`).off('value');
    this.db.ref(`${user.uid}/items`).off('value');
  };

  log_in_handler = e => {
    e.preventDefault();
    auth.signInWithPopup(provider);
  };

  log_out_handler = e => {
    e.preventDefault();
    auth.signOut();
  };

  componentDidMount() {
    // mounts an observer that runs when attached
    // passes back null if user is not signed in
    auth.onAuthStateChanged(authed_user => {
      const current_user = this.state.user;

      if (current_user && (!authed_user || authed_user.uid !== current_user.uid)) {
        this.destroy_data_observers(current_user);
      }

      if (authed_user) {
        this.init_data_observers(authed_user);
      }

      this.setState({
        user: authed_user === null ? false : authed_user
      });
    });
  }

  render() {
    const { db, log_in_handler, log_out_handler } = this;
    const { user, active_log, today_log, score, today_score, items } = this.state;
    const route_props = {
      db,
      user,
      log_out_handler,
      active_log,
      today_log,
      score,
      today_score,
      items
    };

    if (this.state.user === null) {
      return el_loading;
    }

    if (this.state.user === false) {
      return (
        <div id="container">
          <div id="log_in">
            <form onSubmit={log_in_handler}>
              <p>Sign in with your Google account.</p>
              <button className="btn blue">SIGN IN</button>
            </form>
          </div>
        </div>
      );
    }

    return (
      <Router>
        <Switch>
          <Route exact path={`/journal`} render={props => <Home {...props} {...route_props} />} />
          <Route
            path={`/journal/entries/:entry_id`}
            render={props => <Entry {...props} {...route_props} />}
          />
          <Route
            exact
            path={`/journal/items`}
            render={props => <Items {...props} {...route_props} />}
          />
          <Route
            path={`/journal/items/:item_id`}
            render={props => <Item {...props} {...route_props} />}
          />
          <Route
            exact
            path={`/journal/overview`}
            render={props => <Overview {...props} {...route_props} />}
          />
        </Switch>
      </Router>
    );
  }
}

export default App;
