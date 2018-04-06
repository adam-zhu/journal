import React, { Component } from "react";
import Header from "./Header";
import Nav from "./Nav";
import ActivityLogTable from "./ActivityLogTable";
import HandleExteriorClickWrapper from "./HandleExteriorClickWrapper";
import "./Overview.css";
import { Link } from "react-router-dom";
import {
  time_ago,
  format_date_full,
  get_daily_log_average,
  scroll_viewport_to_top,
  extract_day,
  extract_this_week,
  extract_this_month,
  extract_this_year,
  extract_range
} from "./util";

class Overview extends Component {
  constructor(props) {
    super(props);

    scroll_viewport_to_top();

    this.state = {
      nav: false,
      selected_view_option: this.view_options[0],
      view_options_dropdown_is_open: false,
      start_date: null,
      end_date: null,
      display_log: null
    };
  }

  view_options = [
    {
      value: "day",
      display_text: "Today"
    },
    {
      value: "week",
      display_text: "Week"
    },
    {
      value: "month",
      display_text: "Month"
    },
    {
      value: "year",
      display_text: "Year"
    },
    {
      value: "range",
      display_text: "Date Range"
    }
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

    const { active_log } = this.props;
    const { start_date, end_date } = this.state;
    const display_log = resolve_display_log({
      selected_view_option: view_option,
      active_log,
      start_date,
      end_date
    });

    this.setState({
      ...this.state,
      selected_view_option: view_option,
      view_options_dropdown_is_open: false,
      display_log
    });
  };

  static getDerivedStateFromProps(nextProps, prevState) {
    const { active_log } = nextProps;
    const { selected_view_option, start_date, end_date } = prevState;
    const display_log = resolve_display_log({ active_log, selected_view_option, start_date, end_date });

    return {
      ...prevState,
      display_log
    };
  }

  render() {
    const { active_log, score, today_score } = this.props;
    const { nav, selected_view_option, view_options_dropdown_is_open, display_log } = this.state;
    const {
      nav_open_handler,
      nav_close_handler,
      view_options_dropdown_toggle_handler,
      view_option_select_handler
    } = this;

    return (
      <div id="container" className={`${nav ? "nav_open" : ""}`}>
        <Header
          title={"Overview"}
          subtitle={null}
          stats={null}
          nav_open_handler={nav_open_handler}
          el_right_side_anchor={
            <Link to={"/journal/home"}>
              <i className="material-icons">home</i>
            </Link>
          }
        />
        <Nav open={nav} active={"overview"} nav_close_handler={nav_close_handler} />
        <div id="overlay" className={nav ? "visible" : ""} onClick={nav_close_handler} />
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
        {resolve_stats({ selected_view_option, display_log, active_log })}
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
        css_class={open ? "dropdown open" : "dropdown"}
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
          <ul key={block_index}>
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
  const week_start_day = "monday";

  switch (selected_view_option.value) {
    case "day":
      return day_stats({ day_log: display_log, all_log: active_log });
    case "week":
    case "month":
    case "year":
    case "range":
    default:
      return null;
  }
};

const resolve_display_log = ({ selected_view_option, start_date, end_date, active_log }) => {
  const week_start_day = "monday";

  switch (selected_view_option.value) {
    case "day":
      return active_log ? extract_day(Date.now(), active_log) : null;
    case "week":
      return active_log ? extract_this_week(week_start_day, active_log) : null;
    case "month":
      return active_log ? extract_this_month(active_log) : null;
    case "year":
      return active_log ? extract_this_year(active_log) : null;
    case "range":
      return active_log ? extract_range({ start: start_date, end: end_date, log: active_log }) : null;
    default:
      return null;
  }
};

const day_stats = ({ day_log, all_log }) => {
  if (!day_log) {
    return null;
  }

  if (!all_log) {
    return null;
  }

  const daily_average = get_daily_log_average(all_log);
  const day_score = day_log.reduce((acc, l) => acc + l.item.value, 0);
  const score = all_log.reduce((acc, l) => acc + l.item.value, 0);
  const stats = [
    {
      label: "today",
      value:
        day_score === 0
          ? 0
          : day_score > 0
            ? [<i className="material-icons">arrow_upward</i>, day_score]
            : [<i className="material-icons">arrow_downward</i>, day_score],
      subtitle: null,
      css_class: ""
    },
    {
      label: "daily avg",
      value: all_log.length ? daily_average : "n/a",
      subtitle: null,
      css_class: ""
    },
    {
      label: "total",
      value: score ? score : <span className="loader stat" />,
      subtitle: null,
      css_class: "total_score"
    }
  ];

  return <OverviewStats stats={stats} />;
};
