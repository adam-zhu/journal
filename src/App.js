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
import CreateItem from './CreateItem';
import Overview from './Overview';
import { extract_items_from_snapshot, extract_day } from './util';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      items: null,
      log: null,
      active_log: null,
      today_log: null,
      score: null,
      today_score: null
    };

    // load initial data and set up change listeners
    this.props.db.ref('items').on('value', snapshot => {
      const all_items = extract_items_from_snapshot(snapshot).reverse();
      const score = this.state.log
        ? this.state.log.reduce((acc, l) => acc + l.item.value, 0)
        : null;
      const today_log = this.state.log ? extract_day(Date.now(), this.state.log) : null;
      const today_score = this.state.today_log
        ? this.state.today_log.reduce((acc, l) => acc + l.item.value, 0)
        : null;

      this.setState({
        ...this.state,
        items: all_items.filter(i => i.active).map(i => ({
          ...i,
          logs: this.state.active_log
            ? this.state.active_log.filter(l => l.item && l.item.key === i.key)
            : []
        })),
        score,
        today_score,
        today_log
      });
    });

    this.props.db.ref('log').on('value', snapshot => {
      const log = extract_items_from_snapshot(snapshot);
      const active_log = log ? log.filter(l => l.active !== false) : null;
      const score = active_log ? active_log.reduce((acc, l) => acc + l.item.value, 0) : null;
      const today_log = active_log ? extract_day(Date.now(), active_log) : null;
      const today_score = today_log ? today_log.reduce((acc, l) => acc + l.item.value, 0) : null;

      this.setState({
        ...this.state,
        items:
          this.state.items === null
            ? null
            : this.state.items.map(i => ({
                ...i,
                logs: active_log.filter(l => l.item && l.item.key === i.key)
              })),
        log,
        active_log,
        today_log,
        score,
        today_score
      });
    });
  }

  render() {
    return (
      <Router>
        <Switch>
          <Route
            exact
            path={`/journal`}
            render={props => (
              <Home
                {...props}
                db={this.props.db}
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
                db={this.props.db}
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
                db={this.props.db}
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
                db={this.props.db}
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
            path={`/journal/create_item`}
            render={props => (
              <CreateItem
                {...props}
                db={this.props.db}
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
                db={this.props.db}
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
