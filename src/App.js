import React, { Component } from 'react';
import './materialize.css';
import materialize from 'materialize-css';
import './App.css';
import './loader.css';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Home from './Home';
import Entry from './Entry';
import Items from './Items';
import Item from './Item';
import Overview from './Overview';
import { extract_items_from_snapshot, extract_day } from './util';
import firebase, { auth, provider } from './firebase.js';

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
  }

  db = firebase.database();

  log_in_handler = e => {
    e.preventDefault();

    auth.signInWithPopup(provider).then(result => {
      const user = result.user;
      const get_log = () =>
        new Promise((resolve, reject) =>
          this.db
            .ref(`${user.uid}/log`)
            .once('value', snapshot => resolve(extract_items_from_snapshot(snapshot)))
        );
      this.setState({
        user
      });

      this.db.ref(`${user.uid}/items`).on('value', snapshot => {
        const items = extract_items_from_snapshot(snapshot);
        const active_items = items.filter(i => i.active !== false);
        const active_sorted_items = active_items.reverse();

        get_log()
          .then(log => {
            const active_log = log.filter(l => l.active !== false);
            const formatted_items = active_sorted_items.map(i => ({
              ...i,
              logs: active_log ? active_log.filter(l => l.item && l.item.key === i.key) : []
            }));

            this.setState({
              items: formatted_items
            });
          })
          .catch(alert);
      });

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
    });
  };

  log_out_handler = e => {
    e.preventDefault();
    auth.signOut().then(() => this.setState({ user: null }));
  };

  render() {
    return this.state.user === null ? (
      <div id="container">
        <div id="log_in">
          <form onSubmit={this.log_in_handler}>
            <p>Sign in with your Google account.</p>
            <button className="btn blue">SIGN IN</button>
          </form>
        </div>
      </div>
    ) : (
      <Router>
        <Switch>
          <Route
            exact
            path={`/journal`}
            render={props => (
              <Home
                {...props}
                db={this.db}
                user={this.state.user}
                log_out_handler={this.log_out_handler}
                active_log={this.state.active_log}
                today_log={this.state.today_log}
                score={this.state.score}
                today_score={this.state.today_score}
                items={this.state.items}
              />
            )}
          />
          <Route
            path={`/journal/entries/:entry_id`}
            render={props => (
              <Entry
                {...props}
                db={this.db}
                user={this.state.user}
                log_out_handler={this.log_out_handler}
                active_log={this.state.active_log}
                today_log={this.state.today_log}
                score={this.state.score}
                today_score={this.state.today_score}
                items={this.state.items}
              />
            )}
          />
          <Route
            exact
            path={`/journal/items`}
            render={props => (
              <Items
                {...props}
                db={this.db}
                user={this.state.user}
                log_out_handler={this.log_out_handler}
                active_log={this.state.active_log}
                today_log={this.state.today_log}
                score={this.state.score}
                today_score={this.state.today_score}
                items={this.state.items}
              />
            )}
          />
          <Route
            path={`/journal/items/:item_id`}
            render={props => (
              <Item
                {...props}
                db={this.db}
                user={this.state.user}
                log_out_handler={this.log_out_handler}
                active_log={this.state.active_log}
                today_log={this.state.today_log}
                score={this.state.score}
                today_score={this.state.today_score}
                items={this.state.items}
              />
            )}
          />
          <Route
            exact
            path={`/journal/overview`}
            render={props => (
              <Overview
                {...props}
                db={this.db}
                user={this.state.user}
                log_out_handler={this.log_out_handler}
                active_log={this.state.active_log}
                today_log={this.state.today_log}
                score={this.state.score}
                today_score={this.state.today_score}
                items={this.state.items}
              />
            )}
          />
        </Switch>
      </Router>
    );
  }
}

export default App;
