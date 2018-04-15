import React, { Component } from 'react';
import { add_entry_for_item, create_item_and_add_entry } from '../Helpers/db_actions';
import { Link } from 'react-router-dom';
import {
  time_ago,
  format_date_full,
  get_daily_log_average,
  scroll_viewport_to_top,
  disable_form,
  by_name_asc,
  by_name_desc,
  by_value_asc,
  by_value_desc,
  by_created_date_desc,
  by_last_logged_date_asc,
  by_last_logged_date_desc
} from '../Helpers/util';
import async_wrapper from '../Helpers/AsyncWrapper';
const el_loading = <span className="loader" />;
const Header = async_wrapper(() => import('../Components/Header'), el_loading);
const Nav = async_wrapper(() => import('../Components/Nav'), el_loading);
const ActivityLogTable = async_wrapper(() => import('../Components/ActivityLogTable'), el_loading);
const NewItemForm = async_wrapper(() => import('../Components/NewItemForm'), el_loading);
const ItemLogTable = async_wrapper(() => import('../Components/ItemLogTable'), el_loading);

class Home extends Component {
  constructor(props) {
    super(props);

    scroll_viewport_to_top();

    this.state = {
      nav: false,
      modal: false,
      find_options_open: false,
      find_query: '',
      item_sort: null,
      filtered_sorted_items: null
    };
  }

  $MODAL_ID = 'modal';

  reset_modal_form_inputs_DOM = () => {
    const { $MODAL_ID } = this;
    document
      .getElementById($MODAL_ID)
      .querySelectorAll('.input-field')
      .forEach(el => {
        const el_input = el.querySelector('input');
        const el_label = el.querySelector('label');

        el_input.value = '';
        el_label.classList.remove('active');
      });
  };

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

  modal_open_handler = e => {
    e.preventDefault();

    // hack
    this.reset_modal_form_inputs_DOM();

    this.setState({
      ...this.state,
      modal: true,
      item_sort: null,
      find_options_open: false,
      find_query: '',
      filtered_sorted_items: this.props.items
    });
  };

  modal_close_handler = e => {
    e.preventDefault();

    this.setState({
      ...this.state,
      modal: false
    });
  };

  add_new_submit_handler = e => {
    const el_form = e.target;
    const name = el_form.name.value.trim();
    const value = Number(el_form.value.value);

    e.preventDefault();

    if (!name) {
      return alert('Item cannot be blank');
    }

    if (isNaN(value) || value === 0) {
      return alert('Value must be a nonzero number');
    }

    const active = true;
    const created_date = Date.now();
    const item_model = {
      name,
      value,
      active,
      created_date
    };
    const { db, user } = this.props;
    const create_and_log = create_item_and_add_entry({ db, uid: user.uid });

    disable_form(el_form)
      .then(create_and_log(item_model))
      .then(() => {
        this.setState({
          ...this.state,
          modal: false
        });
      })
      .catch(alert);
  };

  log_handler = item => e => {
    const el_form = e.target;

    e.preventDefault();

    if (window.confirm(`Log ${item.name} for ${item.value}?`)) {
      const { db, user } = this.props;
      const log_the_item = add_entry_for_item({ db, uid: user.uid });

      disable_form(el_form)
        .then(log_the_item(item))
        .then(() => {
          this.setState({
            ...this.state,
            modal: false
          });
        })
        .catch(alert);
    }
  };

  find_options_open_handler = e => {
    e.preventDefault();

    this.setState({
      ...this.state,
      find_options_open: true
    });
  };

  find_options_close_handler = e => {
    e.preventDefault();

    this.setState({
      ...this.state,
      find_options_open: false
    });
  };

  find_query_input_handler = e => {
    const find_query = e.target.value;
    const items = this.props.items;
    const trimmed_cased_query = find_query.trim().toLowerCase();
    const filtered =
      trimmed_cased_query !== ''
        ? items.filter(i => i.name.toLowerCase().indexOf(trimmed_cased_query) !== -1)
        : items;
    const filtered_sorted_items = sort_items(this.state.item_sort, filtered);

    e.preventDefault();

    this.setState({
      ...this.state,
      find_query,
      filtered_sorted_items
    });
  };

  sort_handler = item_sort => e => {
    const find_query = this.state.find_query;
    const items = this.props.items;
    const trimmed_cased_query = find_query.trim().toLowerCase();
    const filtered =
      trimmed_cased_query !== ''
        ? items.filter(i => i.name.toLowerCase().indexOf(trimmed_cased_query) !== -1)
        : items;
    const filtered_sorted_items = sort_items(item_sort, filtered);

    e.preventDefault();

    this.setState({
      ...this.state,
      item_sort,
      filtered_sorted_items
    });
  };

  render() {
    const { user, log_out_handler, active_log, today_log, score, today_score, items } = this.props;
    const {
      nav,
      modal,
      find_options_open,
      find_query,
      item_sort,
      filtered_sorted_items
    } = this.state;
    const {
      $MODAL_ID,
      nav_open_handler,
      nav_close_handler,
      modal_open_handler,
      modal_close_handler,
      add_new_submit_handler,
      log_handler,
      find_options_open_handler,
      find_options_close_handler,
      find_query_input_handler,
      sort_handler
    } = this;
    const daily_average =
      active_log && active_log.length === 0
        ? 'n/a'
        : active_log === null ? null : get_daily_log_average(active_log);
    const stats = [
      {
        label: 'Home',
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
        css_class: 'today_score'
      },
      {
        label: 'daily avg',
        value:
          daily_average === null ? (
            <span className="loader stat" />
          ) : active_log.length ? (
            daily_average
          ) : (
            'n/a'
          ),
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
    const table_items = filtered_sorted_items || items;
    const trimmed_cased_query = find_query.trim().toLowerCase();

    return (
      <div id="container" className={`${nav ? 'nav_open' : ''} ${modal ? 'modal_open' : ''}`}>
        <Header
          title={'Home'}
          subtitle={format_date_full(Date.now())}
          stats={stats}
          nav_open_handler={nav_open_handler}
          el_right_side_anchor={
            <Link to={'/journal/overview'}>
              <i className="material-icons">dashboard</i>
            </Link>
          }
        />
        <Nav
          user={user}
          log_out_handler={log_out_handler}
          open={nav}
          active={'home'}
          nav_close_handler={nav_close_handler}
        />
        <div id="overlay" className={nav ? 'visible' : ''} onClick={nav_close_handler} />
        <form className="floating_action_button" onSubmit={modal_open_handler}>
          <button className="btn-floating btn-large waves-light">
            <i className="material-icons">create</i>
          </button>
        </form>
        <section id="log">
          {today_log === null ? (
            <span className="loader" />
          ) : Array.isArray(today_log) && today_log.length ? (
            <ActivityLogTable log={today_log} />
          ) : (
            <p className="empty_state">no log entries</p>
          )}
        </section>
        <div id={$MODAL_ID} className={modal ? 'open' : 'closed'}>
          <div id="modal_top">
            <form id="modal_control" onSubmit={modal_close_handler}>
              <button>
                <i className="material-icons">close</i>
              </button>
            </form>
            <h2 id="modal_title">
              Home<i className="material-icons">chevron_right</i>New Log Entry
            </h2>
          </div>
          <div className="row new_item">
            <span className="section_label">Log New Item</span>
            <NewItemForm submit_handler={add_new_submit_handler} button_text={'Log New'} />
          </div>
          <div className="item_table">
            <div className={`find_options ${find_options_open ? 'open' : ''}`}>
              <form
                className={find_options_open ? 'find_options_toggle open' : 'find_options_toggle'}
                onSubmit={
                  find_options_open ? find_options_close_handler : find_options_open_handler
                }
              >
                <button className="btn-flat">
                  Options <i className="material-icons">chevron_right</i>
                </button>
              </form>
              <div id="find_options" className={find_options_open ? 'open' : ''}>
                <form className="find_query_wrapper">
                  <div className="input-field row">
                    <input
                      id="find_query"
                      name="find_query"
                      type="text"
                      onInput={find_query_input_handler}
                    />
                    <label htmlFor="find_query">Find item</label>
                  </div>
                </form>
                <div className="sort_options_wrapper">
                  <span className="section_label">Sort</span>
                  {generate_sort_options(item_sort, sort_handler)}
                </div>
              </div>
            </div>
            <div id="item_table">
              {table_items === null ? (
                <span className="loader" />
              ) : table_items.length === 0 ? (
                trimmed_cased_query ? (
                  <p className="empty_state">{`no items matching "${trimmed_cased_query}"`}</p>
                ) : (
                  <p className="empty_state">no items available</p>
                )
              ) : (
                <ItemLogTable items={table_items} log_handler={log_handler} />
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Home;

// UTILS
const sort_items = (item_sort, items) => {
  switch (item_sort) {
    case 'name asc':
      return items ? items.sort(by_name_asc) : items;
    case 'name desc':
      return items ? items.sort(by_name_desc) : items;
    case 'value asc':
      return items ? items.sort(by_value_asc) : items;
    case 'value desc':
      return items ? items.sort(by_value_desc) : items;
    case 'last_logged asc':
      return items ? items.sort(by_last_logged_date_asc) : items;
    case 'last_logged desc':
      return items ? items.sort(by_last_logged_date_desc) : items;
    default:
      return items ? items.sort(by_created_date_desc) : items;
  }
};
const generate_sort_options = (item_sort, sort_handler) => {
  let name = {
    css_class: 'chip name',
    on_submit: sort_handler('name asc'),
    text: 'Name',
    icon: ''
  };
  let value = {
    css_class: 'chip value',
    on_submit: sort_handler('value asc'),
    text: 'Value',
    icon: ''
  };
  let last_logged = {
    css_class: 'chip last_logged',
    on_submit: sort_handler('last_logged asc'),
    text: 'Last Logged',
    icon: ''
  };
  const sort_options = [name, value, last_logged];

  switch (item_sort) {
    case 'name asc':
      name.css_class = name.css_class + ' blue white-text';
      name.on_submit = sort_handler('name desc');
      name.icon = <i className="material-icons">arrow_upward</i>;
      break;
    case 'name desc':
      name.css_class = name.css_class + ' blue white-text';
      name.on_submit = sort_handler(null);
      name.icon = <i className="material-icons">arrow_downward</i>;
      break;
    case 'value asc':
      value.css_class = value.css_class + ' blue white-text';
      value.on_submit = sort_handler('value desc');
      value.icon = <i className="material-icons">arrow_upward</i>;
      break;
    case 'value desc':
      value.css_class = value.css_class + ' blue white-text';
      value.on_submit = sort_handler(null);
      value.icon = <i className="material-icons">arrow_downward</i>;
      break;
    case 'last_logged asc':
      last_logged.css_class = last_logged.css_class + ' blue white-text';
      last_logged.on_submit = sort_handler('last_logged desc');
      last_logged.icon = <i className="material-icons">arrow_upward</i>;
      break;
    case 'last_logged desc':
      last_logged.css_class = last_logged.css_class + ' blue white-text';
      last_logged.on_submit = sort_handler(null);
      last_logged.icon = <i className="material-icons">arrow_downward</i>;
      break;
    default:
      break;
  }

  const generate_option_markup = (sort_option, i) => (
    <li className={sort_option.css_class} onClick={sort_option.on_submit} key={i}>
      {sort_option.text}
      {sort_option.icon}
    </li>
  );
  const wrap = options => (
    <ul className={item_sort ? `sort_options ${item_sort}` : 'sort_options'}>{options}</ul>
  );

  return wrap(sort_options.map(generate_option_markup));
};
