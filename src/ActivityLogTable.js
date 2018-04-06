import React from "react";
import { Link } from "react-router-dom";
import { time_ago } from "./util";

const ActivityLogTable = ({ log }) => (
  <table>
    <tbody>
      {log
        .slice()
        .reverse() // most recent first
        .map(l => (
          <tr key={l.key}>
            <td>
              <Link to={`/journal/entries/${l.key}`}>
                {l.item.name}
                <span className="grey-text time">{time_ago(l.date)}</span>
              </Link>
            </td>
            <td>
              <span className={l.item.value < 0 ? "value negative" : "value positive"}>{l.item.value}</span>
            </td>
          </tr>
        ))}
    </tbody>
  </table>
);

export default ActivityLogTable;
