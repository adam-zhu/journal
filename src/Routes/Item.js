import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import {
  time_ago,
  disable_form,
  get_daily_item_average,
  map_item_to_calendar_chart_data,
  scroll_viewport_to_top
} from '../Helpers/util';
import { add_entry_for_item } from '../Helpers/db_actions';
import async_wrapper from '../Helpers/AsyncWrapper';
const el_loading = <span className="loader" />;
const Header = async_wrapper(() => import('../Components/Header'), el_loading);
const Nav = async_wrapper(() => import('../Components/Nav'), el_loading);

class Item extends Component {
  constructor(props) {
    super(props);

    scroll_viewport_to_top();

    // load charting library
    window.google.charts.load('current', { packages: ['calendar', 'corechart'] });

    this.state = {
      nav: false,
      header_actions_is_open: false,
      item: null,
      calendar_chart: null
    };
  }

  $CALENDAR_CHART_ID = 'item_detail_calendar_chart';
  $PIE_CHART_ID = 'item_detail_pie_chart';

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

  log_handler = item => e => {
    const el_form = e.target;

    e.preventDefault();

    if (window.confirm(`Log ${item.name} for ${item.value}?`)) {
      const { db, user } = this.props;
      const log_the_item = add_entry_for_item({ db, uid: user.uid });
      const redirect_to_home = () => this.props.history.push('/journal');

      disable_form(el_form)
        .then(log_the_item(item))
        .then(redirect_to_home)
        .catch(alert);
    }
  };

  static getDerivedStateFromProps(nextProps, prevState) {
    const { match, items } = nextProps;
    const { item_id } = match.params;
    const item = items === null ? null : items.find(i => i.key === item_id);

    return {
      ...prevState,
      item
    };
  }

  getSnapshotBeforeUpdate(prevProps, prevState) {
    return {
      should_render_charts:
        this.state.item && !prevState.item && Array.isArray(this.props.active_log)
    };
  }

  render() {
    const { user, log_out_handler, items, active_log, today_log, score, today_score } = this.props;
    const { nav, header_actions_is_open, item } = this.state;
    const {
      $CALENDAR_CHART_ID,
      $PIE_CHART_ID,
      nav_open_handler,
      nav_close_handler,
      header_actions_menu_toggler,
      log_handler
    } = this;
    const stats = [
      [
        {
          label: 'value',
          value:
            item === null ? (
              <span className="loader stat" />
            ) : item === undefined ? (
              'n/a'
            ) : (
              item.value
            ),
          subtitle: null,
          css_class: ''
        },
        {
          label: 'logged',
          value:
            item === null || today_log === null ? (
              <span className="loader stat" />
            ) : item === undefined ? (
              'n/a'
            ) : (
              today_log.filter(l => l.item.key === item.key).length
            ),
          subtitle: item === null ? null : `times today`,
          css_class: ''
        },
        {
          label: 'daily avg',
          value:
            item === null ? (
              <span className="loader stat" />
            ) : item === undefined || !item.logs || !item.logs.length ? (
              'n/a'
            ) : (
              get_daily_item_average(item)
            ),
          subtitle: 'times',
          css_class: ''
        },
        {
          label: 'logged',
          value:
            item === null ? (
              <span className="loader stat" />
            ) : item === undefined ? (
              'n/a'
            ) : (
              item.logs.length
            ),
          subtitle: item === null ? null : `times total`,
          css_class: ''
        }
      ],
      [
        {
          label: 'last logged',
          value:
            item === null ? (
              <span className="loader stat" />
            ) : item === undefined ? (
              'n/a'
            ) : item.logs.length ? (
              time_ago(item.logs[item.logs.length - 1].date)
            ) : (
              'never'
            ),
          subtitle: '',
          css_class: 'text_value'
        },
        {
          label: 'created',
          value:
            item === null ? (
              <span className="loader stat" />
            ) : item === undefined ? (
              'n/a'
            ) : (
              time_ago(item.created_date)
            ),
          subtitle: '',
          css_class: 'text_value'
        }
      ]
    ];
    const el_header_actions_dropdown = (
      <ul>
        <li>
          {item !== null ? (
            <form onSubmit={log_handler(item)} className="log_item">
              <button className="btn-flat">
                <i className="material-icons">create</i> Log
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
          title={'Item Details'}
          subtitle={item === null ? null : item === undefined ? 'item not found' : item.name}
          stats={stats}
          nav_open_handler={nav_open_handler}
          el_right_side_anchor={
            <Link to={'/journal/items'}>
              <i className="material-icons">list</i>
            </Link>
          }
          actions={header_actions}
        />
        <Nav
          user={user}
          log_out_handler={log_out_handler}
          open={nav}
          active={'items'}
          nav_close_handler={nav_close_handler}
        />
        <div id="overlay" className={nav ? 'visible' : ''} onClick={nav_close_handler} />
        <div className="charts">
          <div id={$CALENDAR_CHART_ID} className="calendar_chart" />
          <div id={$PIE_CHART_ID} className="pie_chart" />
        </div>
        <div className="item_log">
          {!item ? (
            <span className="loader" />
          ) : item.logs && item.logs.length ? (
            <table>
              <tbody>
                {item.logs
                  .slice()
                  .reverse()
                  .map(l => (
                    <tr key={l.key}>
                      <td>
                        <Link to={`/journal/entries/${l.key}`}>
                          {item.name}
                          <span className={item.value < 0 ? 'value negative' : 'value positive'}>
                            {item.value}
                          </span>
                        </Link>
                      </td>
                      <td>
                        <span className="grey-text time">{time_ago(l.date)}</span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          ) : (
            <p className="empty_state">no log entries</p>
          )}
        </div>
        <form className="floating_action_button" onSubmit={log_handler(item)}>
          <button className="btn-floating btn-large waves-light">
            <i className="material-icons">create</i>
          </button>
        </form>
      </div>
    );
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    const { should_render_charts } = snapshot;

    if (should_render_charts === true) {
      const { $CALENDAR_CHART_ID, $PIE_CHART_ID } = this;
      const { active_log } = this.props;
      const { item } = this.state;

      render_charts({
        item,
        active_log,
        el_calendar_container: document.getElementById($CALENDAR_CHART_ID),
        el_pie_container: document.getElementById($PIE_CHART_ID)
      });
    }
  }

  componentDidMount() {
    const { $CALENDAR_CHART_ID, $PIE_CHART_ID } = this;
    const { active_log } = this.props;
    const { item } = this.state;

    if (active_log && item) {
      render_charts({
        item,
        active_log,
        el_calendar_container: document.getElementById($CALENDAR_CHART_ID),
        el_pie_container: document.getElementById($PIE_CHART_ID)
      });
    }
  }
}

export default Item;

const render_charts = ({ item, active_log, el_calendar_container, el_pie_container }) => {
  window.google.charts.setOnLoadCallback(() => {
    // calendar chart
    const calendar_data = new window.google.visualization.DataTable();

    calendar_data.addColumn({ type: 'date', id: 'Date' });
    calendar_data.addColumn({ type: 'number', id: 'Logged' });
    calendar_data.addRows(
      item && item.logs && item.logs.length ? map_item_to_calendar_chart_data(item) : []
    );

    const calendar_chart = new window.google.visualization.Calendar(el_calendar_container);

    calendar_chart.draw(calendar_data, {
      calendar: {
        cellSize: window.innerWidth < 800 ? (window.innerWidth < 500 ? 5.5 : 10) : 14
      },
      width: window.innerWidth < 800 ? (window.innerWidth < 500 ? 320 : 572) : 800,
      height: window.innerWidth < 800 ? (window.innerWidth < 500 ? 72 : 107) : 145
    });

    // pie chart
    const pie_data = new window.google.visualization.DataTable();

    pie_data.addColumn({ type: 'string', id: 'Item' });
    pie_data.addColumn({ type: 'number', id: 'Logged' });

    const total_item_score = item.logs.length * Math.abs(item.value);
    const total_log_score = active_log.reduce((acc, l) => acc + Math.abs(l.item.value), 0);

    pie_data.addRow([item.name, total_item_score]);
    pie_data.addRow(['all other items', total_log_score - total_item_score]);

    const pie_chart = new window.google.visualization.PieChart(el_pie_container);

    pie_chart.draw(pie_data, {
      title: 'Impact',
      pieHole: 0.4,
      width: '100%'
    });
  });
};
