import React from 'react';
import { Link } from 'react-router-dom';
import { time_ago } from '../Helpers/util';

const ItemLogTable = ({ items, log_handler, delete_handler }) => {
  return (
    <table>
      <tbody>
        {items.map(item => {
          return (
            <tr key={item.key}>
              <td title={item.name}>
                <Link to={`/journal/items/${item.key}`}>
                  {item.name}
                  <strong
                    title={`value: ${item.value}`}
                    className={item.value < 0 ? 'negative value' : 'positive value'}
                  >
                    {item.value}
                  </strong>
                </Link>
              </td>
              <td>
                {Array.isArray(item.logs) && item.logs.length ? (
                  <span className="time">
                    last logged<br />
                    {time_ago(item.logs[item.logs.length - 1].date)}
                  </span>
                ) : (
                  <span className="time">never logged</span>
                )}
              </td>
              <td>
                <form onSubmit={log_handler(item)}>
                  <button className="btn-flat blue-text enter waves-light">Log</button>
                </form>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};
export default ItemLogTable;
