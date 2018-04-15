import React from 'react';
import HandleExteriorClickWrapper from '../Helpers/HandleExteriorClickWrapper';

const Header = ({ title, subtitle, nav_open_handler, stats, actions, el_right_side_anchor }) => {
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

  return (
    <header>
      <div id="header_top">
        <form id="nav_control" onSubmit={nav_open_handler}>
          <button className="btn-flat white-text">
            <i className="material-icons">menu</i>
          </button>
        </form>
        <h1 id="header_title">{title}</h1>
        {el_right_side_anchor ? el_right_side_anchor : null}
      </div>
      <div id="header_stats">
        {Array.isArray(stats) && stats.length ? (
          <div className="inner">
            {subtitle ? <h2 id="header_subtitle">{subtitle}</h2> : null}
            {stat_blocks.map((b, block_index) => (
              <ul key={`b${block_index}`}>
                {b.map((s, stat_index) => (
                  <li className={`header_stat ${s.css_class}`} key={stat_index}>
                    <div className="stat_label">{s.label}</div>
                    <div className="stat_value">{s.value}</div>
                    {s.subtitle ? <div className="stat_subtitle">{s.subtitle}</div> : null}
                  </li>
                ))}
              </ul>
            ))}
          </div>
        ) : null}
        {actions ? (
          <div id="header_actions">
            <form
              className="actions_menu_toggler"
              onSubmit={actions.menu_toggle_handler(true)(true)}
            >
              <button>
                <i className="material-icons">more_vert</i>
              </button>
            </form>
            <HandleExteriorClickWrapper
              css_class={actions.is_open ? 'dropdown open' : 'dropdown'}
              exterior_click_handler={actions.menu_toggle_handler(false)}
            >
              {actions.el_dropdown}
            </HandleExteriorClickWrapper>
          </div>
        ) : null}
      </div>
    </header>
  );
};

export default Header;
