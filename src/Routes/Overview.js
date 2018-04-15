import React, { Component } from 'react';
import './Overview.css';
import { Link } from 'react-router-dom';
import {
  time_ago,
  format_date_full,
  get_average,
  get_daily_log_average,
  get_weekly_log_average,
  get_monthly_log_average,
  get_yearly_log_average,
  scroll_viewport_to_top,
  extract_day,
  extract_this_week,
  extract_this_month,
  extract_this_year,
  extract_range,
  map_log_to_calendar_chart_data
} from '../Helpers/util';
import HandleExteriorClickWrapper from '../Helpers/HandleExteriorClickWrapper';
import async_wrapper from '../Helpers/AsyncWrapper';
const el_loading = <span className="loader" />;
const Header = async_wrapper(() => import('../Components/Header'), el_loading);
const Nav = async_wrapper(() => import('../Components/Nav'), el_loading);
const ActivityLogTable = async_wrapper(() => import('../Components/ActivityLogTable'), el_loading);

class Overview extends Component {
  constructor(props) {
    super(props);

    scroll_viewport_to_top();

    // load charting library
    window.google.charts.load('current', { packages: ['calendar', 'corechart', 'line'] });

    this.state = {
      nav: false,
      selected_view_option: this.view_options[0],
      view_options_dropdown_is_open: false,
      start_date: null,
      end_date: null,
      display_log: null,
      stats_title: null,
      stats: null
    };
  }

  view_options = [
    {
      value: 'all',
      display_text: 'All Time'
    },
    {
      value: 'day',
      display_text: 'Today'
    },
    {
      value: 'week',
      display_text: 'Week'
    },
    {
      value: 'month',
      display_text: 'Month'
    },
    {
      value: 'year',
      display_text: 'Year'
    }
    // {
    //   value: 'range',
    //   display_text: 'Date Range'
    // }
  ];

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

  view_options_dropdown_toggle_handler = bool => should_prevent_default => e => {
    if (should_prevent_default) {
      e.preventDefault();
    }

    this.setState({
      ...this.state,
      view_options_dropdown_is_open: bool
    });
  };

  view_option_select_handler = view_option => e => {
    e.preventDefault();

    const { active_log, items } = this.props;
    const { start_date, end_date } = this.state;
    const display_log = resolve_display_log({
      selected_view_option: view_option,
      active_log,
      start_date,
      end_date
    });
    const { stats_title, stats } = resolve_stats({
      selected_view_option: view_option,
      display_log,
      active_log
    });

    this.setState({
      ...this.state,
      selected_view_option: view_option,
      view_options_dropdown_is_open: false,
      display_log,
      stats_title,
      stats
    });
  };

  static getDerivedStateFromProps(nextProps, prevState) {
    const { active_log, items } = nextProps;
    const { selected_view_option, start_date, end_date } = prevState;
    const display_log = resolve_display_log({
      active_log,
      selected_view_option,
      start_date,
      end_date
    });
    const { stats_title, stats } = resolve_stats({
      selected_view_option,
      display_log,
      active_log
    });

    return {
      ...prevState,
      display_log,
      stats_title,
      stats
    };
  }

  getSnapshotBeforeUpdate(prevProps, prevState) {
    return (
      prevProps.active_log === null ||
      prevProps.items === null ||
      prevState.selected_view_option.value !== this.state.selected_view_option.value
    );
  }

  render() {
    const { user, log_out_handler, active_log, score, today_score } = this.props;
    const {
      nav,
      selected_view_option,
      view_options_dropdown_is_open,
      display_log,
      stats_title,
      stats
    } = this.state;
    const {
      nav_open_handler,
      nav_close_handler,
      view_options_dropdown_toggle_handler,
      view_option_select_handler
    } = this;
    const el_charts = (
      <div className="charts">
        {selected_view_option.value === 'all' || selected_view_option.value === 'year' ? (
          <div id="overview_calendar_chart" className="calendar_chart" />
        ) : null}
        <div id="overview_line_chart" className="line_chart" />
        <div id="overview_pie_chart" className="pie_chart" />
      </div>
    );

    return (
      <div id="container" className={`${nav ? 'nav_open' : ''}`}>
        <Header
          title={'Overview'}
          subtitle={null}
          stats={null}
          nav_open_handler={nav_open_handler}
          el_right_side_anchor={
            <Link to={'/journal'}>
              <i className="material-icons">home</i>
            </Link>
          }
        />
        <Nav
          user={user}
          log_out_handler={log_out_handler}
          open={nav}
          active={'overview'}
          nav_close_handler={nav_close_handler}
        />
        <div id="overlay" className={nav ? 'visible' : ''} onClick={nav_close_handler} />
        <section id="overview_config">
          <div className="inner">
            <label className="section_label">Viewing</label>
            <ViewOptionsDropdown
              selected={selected_view_option}
              options={this.view_options}
              open={view_options_dropdown_is_open}
              open_toggle_handler={view_options_dropdown_toggle_handler}
              select_handler={view_option_select_handler}
            />
          </div>
        </section>
        <OverviewStats title={stats_title} stats={stats} />
        {display_log && display_log.length ? el_charts : null}
        <section id="log">
          {display_log === null ? (
            <span className="loader" />
          ) : Array.isArray(display_log) && display_log.length ? (
            <ActivityLogTable log={display_log} />
          ) : (
            <p className="empty_state">no log entries</p>
          )}
        </section>
      </div>
    );
  }

  componentDidUpdate(prevProps, prevState, should_render_charts) {
    if (should_render_charts === true) {
      const { display_log, selected_view_option } = this.state;
      const el_calendar_container = document.getElementById('overview_calendar_chart');
      const el_line_container = document.getElementById('overview_line_chart');
      const el_pie_container = document.getElementById('overview_pie_chart');

      render_charts({
        display_log,
        view_option: selected_view_option,
        el_calendar_container,
        el_line_container,
        el_pie_container
      });
    }
  }

  componentDidMount() {
    const { display_log, selected_view_option } = this.state;
    const el_calendar_container = document.getElementById('overview_calendar_chart');
    const el_line_container = document.getElementById('overview_line_chart');
    const el_pie_container = document.getElementById('overview_pie_chart');

    render_charts({
      display_log,
      view_option: selected_view_option,
      el_calendar_container,
      el_line_container,
      el_pie_container
    });
  }
}

export default Overview;

//UTILS
const ViewOptionsDropdown = ({ open, selected, options, open_toggle_handler, select_handler }) => {
  const el_options = options.map((o, i) => {
    return (
      <li className="view_option" key={i}>
        <form onSubmit={select_handler(o)}>
          <button className="option_text">
            {o.display_text}
            {o === selected ? <i className="material-icons">check</i> : null}
          </button>
        </form>
      </li>
    );
  });

  return (
    <div id="view_options_dropdown">
      <form className="view_options_dropdown_toggler" onSubmit={open_toggle_handler(true)(true)}>
        <button className="view_options_selected">
          {selected.display_text} <i className="material-icons">arrow_drop_down</i>
        </button>
      </form>
      <HandleExteriorClickWrapper
        css_class={open ? 'dropdown open' : 'dropdown'}
        exterior_click_handler={open_toggle_handler(false)}
      >
        <ul className="dropdown_options">{el_options}</ul>
      </HandleExteriorClickWrapper>
    </div>
  );
};

const OverviewStats = ({ title, stats }) => {
  // support passing arrays of stats intended to be grouped together
  // normalize stats to blocks for display
  const stat_blocks = stats
    ? stats.reduce((acc, s, i) => {
        if (Array.isArray(s)) {
          const block = s;
          return i !== stats.length - 1 ? acc.concat([block]).concat([]) : acc.concat([block]);
        }

        if (acc.length) {
          const last_block = acc[acc.length - 1];
          const updated_last_block = last_block.concat([s]);
          let updated_acc = acc.slice();
          updated_acc[updated_acc.length - 1] = updated_last_block;

          return updated_acc;
        }

        return acc.concat([[s]]);
      }, [])
    : null;

  return Array.isArray(stat_blocks) && stat_blocks.length ? (
    <div id="overview_stats">
      <div className="inner">
        {title ? <h2 id="overview_stats_title">{title}</h2> : null}
        {stat_blocks.map((b, block_index) => (
          <ul key={`b${block_index}`}>
            {b.map((s, stat_index) => (
              <li className={`overview_stat ${s.css_class}`} key={stat_index}>
                <div className="stat_label">{s.label}</div>
                <div className="stat_value">{s.value}</div>
                {s.subtitle ? <div className="stat_subtitle">{s.subtitle}</div> : null}
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  ) : null;
};

const resolve_stats = ({ selected_view_option, display_log, active_log }) => {
  const week_start_day = 'monday';

  switch (selected_view_option.value) {
    case 'all':
      return all_stats({ all_log: active_log });
    case 'day':
      return day_stats({ day_log: display_log, all_log: active_log });
    case 'week':
      return week_stats({ week_log: display_log, all_log: active_log });
    case 'month':
      return month_stats({ month_log: display_log, all_log: active_log });
    case 'year':
      return year_stats({ year_log: display_log, all_log: active_log });
    case 'range':
    default:
      return day_stats({ day_log: display_log, all_log: active_log });
  }
};

const resolve_display_log = ({ selected_view_option, start_date, end_date, active_log }) => {
  const week_start_day = 'monday';

  switch (selected_view_option.value) {
    case 'all':
      return active_log;
    case 'day':
      return active_log ? extract_day(Date.now(), active_log) : null;
    case 'week':
      return active_log ? extract_this_week(week_start_day, active_log) : null;
    case 'month':
      return active_log ? extract_this_month(active_log) : null;
    case 'year':
      return active_log ? extract_this_year(active_log) : null;
    case 'range':
      return active_log
        ? extract_range({ start: start_date, end: end_date, log: active_log })
        : null;
    default:
      return null;
  }
};

const all_stats = ({ all_log }) => {
  if (!all_log || !all_log.length) {
    return { stats_title: null, stats: null };
  }

  const daily_average = all_log.length === 0 ? 'n/a' : get_daily_log_average(all_log);
  const score = all_log.reduce((acc, l) => acc + l.item.value, 0);
  const stats = [
    {
      label: 'entries',
      value: all_log.length
    },
    {
      label: 'score',
      value:
        score === null ? (
          <span className="loader stat" />
        ) : typeof score === 'number' ? (
          score
        ) : (
          'n/a'
        ),
      css_class: 'total_score'
    },
    {
      label: 'daily avg',
      value: all_log.length ? daily_average : 'n/a'
    }
  ];

  return {
    stats_title: [
      <span>{`${format_date_full(all_log[0].date)}`}</span>,
      ` - `,
      <span>{`${format_date_full(Date.now())}`}</span>
    ],
    stats
  };
};

const day_stats = ({ day_log, all_log }) => {
  if (!day_log) {
    return { stats_title: null, stats: null };
  }

  if (!all_log) {
    return { stats_title: null, stats: null };
  }

  const daily_average = all_log.length === 0 ? 'n/a' : get_daily_log_average(all_log);
  const day_score = day_log.reduce((acc, l) => acc + l.item.value, 0);
  const score = all_log.reduce((acc, l) => acc + l.item.value, 0);
  const stats = [
    {
      label: 'today',
      value:
        day_score === 0
          ? 0
          : day_score > 0
            ? [<i className="material-icons">arrow_upward</i>, day_score]
            : [<i className="material-icons">arrow_downward</i>, day_score],
      subtitle: null,
      css_class: ''
    },
    {
      label: 'daily avg',
      value: all_log.length ? daily_average : 'n/a',
      subtitle: null,
      css_class: ''
    },
    {
      label: 'total',
      value:
        score === null ? (
          <span className="loader stat" />
        ) : typeof score === 'number' ? (
          score
        ) : (
          'n/a'
        ),
      subtitle: null,
      css_class: 'total_score'
    }
  ];

  return { stats_title: null, stats };
};

const week_stats = ({ week_log, all_log }) => {
  if (!week_log) {
    return { stats_title: null, stats: null };
  }

  if (!all_log) {
    return { stats_title: null, stats: null };
  }

  const weekly_average = all_log.length === 0 ? 'n/a' : get_weekly_log_average('monday', all_log);
  const week_score = week_log.reduce((acc, l) => acc + l.item.value, 0);
  const score = all_log.reduce((acc, l) => acc + l.item.value, 0);
  const stats = [
    {
      label: 'week',
      value:
        week_score === 0
          ? 0
          : week_score > 0
            ? [<i className="material-icons">arrow_upward</i>, week_score]
            : [<i className="material-icons">arrow_downward</i>, week_score],
      subtitle: null,
      css_class: ''
    },
    {
      label: 'weekly avg',
      value: all_log.length ? weekly_average : 'n/a',
      subtitle: null,
      css_class: ''
    },
    {
      label: 'total',
      value:
        score === null ? (
          <span className="loader stat" />
        ) : typeof score === 'number' ? (
          score
        ) : (
          'n/a'
        ),
      subtitle: null,
      css_class: 'total_score'
    }
  ];

  return { stats_title: null, stats };
};

const month_stats = ({ month_log, all_log }) => {
  if (!month_log) {
    return { stats_title: null, stats: null };
  }

  if (!all_log) {
    return { stats_title: null, stats: null };
  }

  const monthly_average = all_log.length === 0 ? 'n/a' : get_monthly_log_average(all_log);
  const month_score = month_log.reduce((acc, l) => acc + l.item.value, 0);
  const score = all_log.reduce((acc, l) => acc + l.item.value, 0);
  const stats = [
    {
      label: 'month',
      value:
        month_score === 0
          ? 0
          : month_score > 0
            ? [<i className="material-icons">arrow_upward</i>, month_score]
            : [<i className="material-icons">arrow_downward</i>, month_score],
      subtitle: null,
      css_class: ''
    },
    {
      label: 'monthly avg',
      value: all_log.length ? monthly_average : 'n/a',
      subtitle: null,
      css_class: ''
    },
    {
      label: 'total',
      value:
        score === null ? (
          <span className="loader stat" />
        ) : typeof score === 'number' ? (
          score
        ) : (
          'n/a'
        ),
      subtitle: null,
      css_class: 'total_score'
    }
  ];

  return { stats_title: null, stats };
};

const year_stats = ({ year_log, all_log }) => {
  if (!year_log) {
    return { stats_title: null, stats: null };
  }

  if (!all_log) {
    return { stats_title: null, stats: null };
  }

  const yearly_average = all_log.length === 0 ? 'n/a' : get_yearly_log_average(all_log);
  const year_score = year_log.reduce((acc, l) => acc + l.item.value, 0);
  const score = all_log.reduce((acc, l) => acc + l.item.value, 0);
  const stats = [
    {
      label: 'year',
      value:
        year_score === 0
          ? 0
          : year_score > 0
            ? [<i className="material-icons">arrow_upward</i>, year_score]
            : [<i className="material-icons">arrow_downward</i>, year_score],
      subtitle: null,
      css_class: ''
    },
    {
      label: 'yearly avg',
      value: all_log.length ? yearly_average : 'n/a',
      subtitle: null,
      css_class: ''
    },
    {
      label: 'total',
      value:
        score === null ? (
          <span className="loader stat" />
        ) : typeof score === 'number' ? (
          score
        ) : (
          'n/a'
        ),
      subtitle: null,
      css_class: 'total_score'
    }
  ];

  return { stats_title: null, stats };
};

const render_charts = ({
  display_log,
  view_option,
  items,
  el_calendar_container,
  el_line_container,
  el_pie_container
}) => {
  window.google.charts.setOnLoadCallback(() => {
    if (display_log && display_log.length) {
      // calendar chart
      if (view_option.value === 'all' || view_option.value === 'year') {
        const calendar_data = new window.google.visualization.DataTable();
        const calendar_chart = new window.google.visualization.Calendar(el_calendar_container);
        calendar_data.addColumn({ type: 'date', id: 'Date' });
        calendar_data.addColumn({ type: 'number', id: 'Logged' });
        calendar_data.addRows(map_log_to_calendar_chart_data(display_log));
        calendar_chart.draw(calendar_data, {
          calendar: {
            cellSize: window.innerWidth < 800 ? (window.innerWidth < 500 ? 5.5 : 10) : 14
          },
          width: window.innerWidth < 800 ? (window.innerWidth < 500 ? 320 : 572) : 800,
          height: window.innerWidth < 800 ? (window.innerWidth < 500 ? 72 : 107) : 145
        });
      }

      // line chart
      const line_data = new window.google.visualization.DataTable();
      const line_chart = new window.google.charts.Line(el_line_container);
      const running_totals = display_log.reduce((acc, l) => {
        let new_row;

        if (acc.length > 0) {
          const prev_row_value = acc[acc.length - 1][1];
          new_row = [new Date(l.date), l.item.value + prev_row_value];
        } else {
          new_row = [new Date(l.date), l.item.value];
        }

        return acc.concat([new_row]);
      }, []);
      line_data.addColumn({ type: 'date', id: 'Time' });
      line_data.addColumn({ type: 'number', id: 'Score' });
      running_totals.forEach(rt => line_data.addRow(rt));
      line_chart.draw(
        line_data,
        window.google.charts.Line.convertOptions({
          width: '100%'
        })
      );
    }

    // pie chart
    const pie_data = new window.google.visualization.DataTable();
    pie_data.addColumn({ type: 'string', id: 'Name' });
    pie_data.addColumn({ type: 'number', id: 'Impact' });
    const pie_chart = new window.google.visualization.PieChart(el_pie_container);

    if (view_option.value === 'all' && items && items.length) {
      items.forEach(item => {
        if (item.logs && item.logs.length) {
          pie_data.addRow([item.name, item.logs.length * Math.abs(item.value)]);
        }
      });
    } else {
      const display_log_by_item =
        display_log && display_log.length
          ? display_log.reduce(
              (acc, l) => ({
                ...acc,
                [l.item.key]: acc[l.item.key]
                  ? Object.assign(acc[l.item.key], { log_count: acc[l.item.key].log_count + 1 })
                  : Object.assign({}, l.item, { log_count: 1 })
              }),
              {}
            )
          : [];

      Object.keys(display_log_by_item).forEach(k => {
        const item = display_log_by_item[k];
        pie_data.addRow([item.name, item.log_count * Math.abs(item.value)]);
      });
    }

    pie_chart.draw(pie_data, {
      title: 'Item Impacts',
      pieHole: 0.4,
      width: '100%'
    });
  });
};
