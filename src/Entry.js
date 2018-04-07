import React, { Component } from 'react';
import Header from './Header';
import Nav from './Nav';
import { Link } from 'react-router-dom';
import { deactivate_entry } from './db_actions';
import {
  time_ago,
  format_date_full,
  format_time_of_day,
  disable_form,
  get_daily_item_average,
  map_to_calendar_chart_data,
  scroll_viewport_to_top
} from './util';

class Entry extends Component {
  constructor(props) {
    super(props);

    scroll_viewport_to_top();

    this.state = {
      nav: false,
      header_actions_is_open: false,
      entry: null
    };
  }

  nav_open_handler = e => {
    e.preventDefault();

    this.setState({
      ...this.state,
      nav: true
    });
  };

  nav_close_handler = e => {
    e.preventDefault();

    this.setState({
      ...this.state,
      nav: false
    });
  };

  header_actions_menu_toggler = bool => should_prevent_default => e => {
    if (should_prevent_default) {
      e.preventDefault();
    }

    this.setState({
      ...this.state,
      header_actions_is_open: bool
    });
  };

  deactivate_handler = entry => e => {
    const el_form = e.target;

    e.preventDefault();

    if (window.confirm(`Delete this entry?`)) {
      const deactivate = deactivate_entry(this.props.db);
      const redirect_to_home = () => this.props.history.push('/journal');
      disable_form(el_form)
        .then(deactivate(entry.key))
        .then(redirect_to_home)
        .catch(alert);
    }
  };

  static getDerivedStateFromProps(nextProps, prevState) {
    const { match, active_log } = nextProps;
    const { entry_id } = match.params;
    const entry = active_log === null ? null : active_log.find(l => l.key === entry_id);

    return {
      ...prevState,
      entry
    };
  }

  render() {
    const { nav, entry, header_actions_is_open } = this.state;
    const {
      nav_open_handler,
      nav_close_handler,
      header_actions_menu_toggler,
      deactivate_handler
    } = this;
    const stats = [
      {
        label: 'logged',
        value:
          entry === null ? (
            <span className="loader stat" />
          ) : entry === undefined ? (
            'n/a'
          ) : (
            time_ago(entry.date)
          ),
        css_class: 'text_value'
      },
      {
        label: 'value',
        value:
          entry === null ? (
            <span className="loader stat" />
          ) : entry === undefined ? (
            'n/a'
          ) : (
            entry.item.value
          )
      }
    ];
    const el_header_actions_dropdown = (
      <ul>
        <li>
          {entry !== null ? (
            <form onSubmit={deactivate_handler(entry)} className="delete_item">
              <button className="btn-flat">
                <i className="material-icons">delete</i> Delete
              </button>
            </form>
          ) : null}
        </li>
      </ul>
    );
    const header_actions = {
      is_open: header_actions_is_open,
      menu_toggle_handler: header_actions_menu_toggler,
      el_dropdown: el_header_actions_dropdown
    };

    return (
      <div id="container" className={`${nav ? 'nav_open' : ''}`}>
        <Header
          title={'Entry Details'}
          subtitle={
            entry === null ? (
              <span className="loader stat" />
            ) : entry === undefined ? (
              'entry not found'
            ) : (
              entry.item.name
            )
          }
          stats={stats}
          nav_open_handler={nav_open_handler}
          el_right_side_anchor={
            <Link to={'/journal'}>
              <i className="material-icons">home</i>
            </Link>
          }
          actions={header_actions}
        />
        <Nav open={nav} active={'home'} nav_close_handler={nav_close_handler} />
        <div id="overlay" className={nav ? 'visible' : ''} onClick={nav_close_handler} />
        {entry ? (
          <div className="entry_details">
            <ul>
              <li className="detail">
                <label className="section_label">Item</label>
                <Link className="item_name" to={`/journal/items/${entry.item.key}`}>
                  {entry.item.name}
                </Link>
              </li>
              <li className="detail">
                <label className="section_label">Value</label>
                <span className={entry.item.value > 0 ? 'positive' : 'negative'}>
                  {entry.item.value}
                </span>
              </li>
              <li className="detail">
                <label className="section_label">Date</label>
                {format_date_full(entry.date)}
              </li>
              <li className="detail">
                <label className="section_label">Time</label>
                {format_time_of_day(entry.date)}
              </li>
            </ul>
            {/* <form onSubmit={deactivate_handler(entry)} className="floating_action_button">
              <button className="btn-floating btn-large waves-light">
                <i className="material-icons">delete</i>
              </button>
            </form> */}
          </div>
        ) : null}
      </div>
    );
  }
}

export default Entry;
