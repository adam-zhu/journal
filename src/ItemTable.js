import React from 'react';
import { Link } from 'react-router-dom';
import { time_ago } from './util';

const ItemTable = ({ items, log_handler }) => {
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
                <span className="time">
                  created<br />
                  {time_ago(item.created_date)}
                </span>
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
export default ItemTable;
