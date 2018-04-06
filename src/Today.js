import React, { Component } from "react";
import Header from "./Header";
import Nav from "./Nav";
import ActivityLogTable from "./ActivityLogTable";
import { Link } from "react-router-dom";
import { time_ago, format_date_full, get_daily_log_average, scroll_viewport_to_top } from "./util";

class Today extends Component {
  constructor(props) {
    super(props);

    scroll_viewport_to_top();

    this.state = {
      nav: false
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

  render() {
    const { active_log, today_log, score, today_score } = this.props;
    const { nav } = this.state;
    const { nav_open_handler, nav_close_handler } = this;
    const daily_average = active_log === null ? null : get_daily_log_average(active_log);
    const stats = [
      {
        label: "today",
        value:
          today_score === null ? (
            <span className="loader stat" />
          ) : today_score === 0 ? (
            0
          ) : today_score > 0 ? (
            [<i className="material-icons">arrow_upward</i>, today_score]
          ) : (
            [<i className="material-icons">arrow_downward</i>, today_score]
          ),
        subtitle: null,
        css_class: "today_score"
      },
      {
        label: "daily avg",
        value: daily_average === null ? <span className="loader stat" /> : active_log.length ? daily_average : "n/a",
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

    return (
      <div id="container" className={`${nav ? "nav_open" : ""}`}>
        <Header
          title={"Home"}
          subtitle={format_date_full(Date.now())}
          stats={stats}
          nav_open_handler={nav_open_handler}
          el_right_side_anchor={
            <Link to={"/journal/log_item"}>
              <i className="material-icons">create</i>
            </Link>
          }
        />
        <Nav open={nav} active={"home"} nav_close_handler={nav_close_handler} />
        <div id="overlay" className={nav ? "visible" : ""} onClick={nav_close_handler} />
        <Link id="log_item_button" className="floating_action_button" to={"/journal/log_item"}>
          <button className="btn-floating btn-large waves-light">
            <i className="material-icons">create</i>
          </button>
        </Link>
        <section id="log">
          {today_log === null ? (
            <span className="loader" />
          ) : Array.isArray(today_log) && today_log.length ? (
            <ActivityLogTable log={today_log} />
          ) : (
            <p className="empty_state">no log entries</p>
          )}
        </section>
      </div>
    );
  }
}

export default Today;
