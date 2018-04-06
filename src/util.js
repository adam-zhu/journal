const extract_items_from_snapshot = snapshot => {
  let extracted = [];

  snapshot.forEach(d => {
    const item = d.val();

    extracted.push({
      key: d.key,
      ...item
    });
  });

  return extracted;
};

const extract_day = (day, log) => {
  if (typeof day !== "object") {
    day = new Date(day);
  }

  const day_date = new Date(day.getFullYear(), day.getMonth(), day.getDate());
  const day_interval = 1000 * 60 * 60 * 24;
  const next_day_date = new Date(day_date.getTime() + day_interval);

  return log.filter(l => day_date <= l.date && l.date < next_day_date);
};

const extract_this_week = (week_start, log) => {
  const now = new Date(Date.now());
  const current_weekday_date = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const sunday_start_weekday_index = now.getDay();
  const weekday_index =
    week_start && week_start === "sunday"
      ? sunday_start_weekday_index
      : sunday_start_weekday_index === 0 ? 6 : sunday_start_weekday_index - 1;
  const day_interval = 1000 * 60 * 60 * 24;
  const week_start_date = current_weekday_date - weekday_index * day_interval;

  return log.filter(l => l.date >= week_start_date);
};

const extract_this_month = log => {
  const now = new Date(Date.now());
  const current_month_date = new Date(now.getFullYear(), now.getMonth());

  return log.filter(l => l.date >= current_month_date);
};

const extract_this_year = log => {
  const now = new Date(Date.now());
  const current_year_date = new Date(now.getFullYear());

  return log.filter(l => l.date >= current_year_date);
};

const extract_range = ({ start, end, log }) => {
  if (typeof start !== "object") {
    start = new Date(start);
  }

  if (typeof end !== "object") {
    end = new Date(end);
  }

  return log.filter(l => start <= l.date && l.date < end);
};

const disable_form = el_form => Promise.resolve(el_form.childNodes.forEach(el => (el.disabled = true)));

const time_ago = date => {
  if (typeof date !== "object") {
    date = new Date(date);
  }

  const dt_now_seconds = Math.floor((new Date() - date) / 1000);
  const minute = 60;
  const hour = 60 * minute;
  const day = 24 * hour;
  const week = 7 * day;
  const month = 30 * day;
  const year = 365 * day;

  const year_interval = Math.floor(dt_now_seconds / year);
  const month_interval = Math.floor(dt_now_seconds / month);
  const week_interval = Math.floor(dt_now_seconds / week);
  const day_interval = Math.floor(dt_now_seconds / day);
  const hour_interval = Math.floor(dt_now_seconds / hour);
  const minute_interval = Math.floor(dt_now_seconds / minute);

  let interval;
  if (year_interval >= 1) {
    return year_interval === 1 ? `a year ago` : `${year_interval} years ago`;
  } else if (month_interval >= 1) {
    return month_interval === 1 ? `a month ago` : `${month_interval} months ago`;
  } else if (week_interval >= 1) {
    return week_interval === 1 ? `a week ago` : `${week_interval} weeks ago`;
  } else if (day_interval >= 1) {
    return day_interval === 1 ? `a day ago` : `${day_interval} days ago`;
  } else if (hour_interval >= 1) {
    return hour_interval === 1 ? `an hour ago` : `${hour_interval} hours ago`;
  } else if (minute_interval >= 1) {
    if (minute_interval === 1) {
      return "a minute ago";
    } else if (minute_interval < 5) {
      return "a few minutes ago";
    } else {
      return `${minute_interval} minutes ago`;
    }
  } else if (dt_now_seconds < 15) {
    return "just now";
  } else if (dt_now_seconds < 30) {
    return "a few seconds ago";
  } else {
    return `${dt_now_seconds} seconds ago`;
  }
};

const format_date_full = date => {
  if (typeof date !== "object") {
    date = new Date(date);
  }

  const days_of_the_week = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ];
  const weekday_index = date.getDay();
  const day = date.getDate();
  const month_index = date.getMonth();
  const year = date.getFullYear();

  return `${days_of_the_week[weekday_index]} ${months[month_index]} ${day}, ${year}`;
};

const format_time_of_day = date => {
  if (typeof date !== "object") {
    date = new Date(date);
  }
  const hour = date.getHours();
  const minute = date.getMinutes();

  let hour_12 = hour;
  let am_pm = "AM";
  if (hour > 12) {
    hour_12 -= 12;
    am_pm = "PM";
  } else if (hour === 0) {
    hour_12 = 12;
  }

  return `${hour_12}:${minute < 10 ? "0" + minute : minute} ${am_pm}`;
};

const by_name_asc = (a, b) => {
  const a_name = a.name.toUpperCase();
  const b_name = b.name.toUpperCase();

  if (a_name < b_name) {
    return -1;
  }

  if (b_name < a_name) {
    return 1;
  }

  return 0;
};
const by_name_desc = (a, b) => {
  const a_name = a.name.toUpperCase();
  const b_name = b.name.toUpperCase();

  if (a_name < b_name) {
    return 1;
  }

  if (b_name < a_name) {
    return -1;
  }

  return 0;
};
const by_value_asc = (a, b) => a.value - b.value;
const by_value_desc = (a, b) => b.value - a.value;
const by_created_date_asc = (a, b) => a.created_date - b.created_date;
const by_created_date_desc = (a, b) => b.created_date - a.created_date;
const by_last_logged_date_asc = (a, b) => {
  if (b.logs.length) {
    if (!a.logs.length) {
      return -1;
    }

    return a.logs[a.logs.length - 1].date - b.logs[b.logs.length - 1].date;
  }

  if (a.logs.length) {
    return 1;
  }

  return 0;
};
const by_last_logged_date_desc = (a, b) => {
  if (b.logs.length) {
    if (!a.logs.length) {
      return 1;
    }

    return b.logs[b.logs.length - 1].date - a.logs[a.logs.length - 1].date;
  }

  if (a.logs.length) {
    return -1;
  }

  return 0;
};

const get_daily_log_average = log => {
  const ms_per_day = 1000 * 60 * 60 * 24;
  const first_date = new Date(log[0].date);
  const last_date = new Date(log[log.length - 1].date);
  const first_day = new Date(first_date.getFullYear(), first_date.getMonth(), first_date.getDate());
  const last_day = new Date(last_date.getFullYear(), last_date.getMonth(), last_date.getDate());
  const diff_in_days = (last_day.getTime() - first_day.getTime()) / ms_per_day + 1;
  const day_chunks = Array.apply(null, Array(diff_in_days)).map(function(_, i) {
    return first_day.getTime() + i * ms_per_day;
  });
  const daily_totals = day_chunks.reduce((acc, day_chunk) => {
    const next_day_chunk = day_chunk + ms_per_day;
    const this_day_entries = log.filter(l => day_chunk <= l.date && l.date < next_day_chunk);
    const this_day_score = this_day_entries.reduce((acc, l) => acc + l.item.value, 0);

    return acc.concat([{ date: new Date(day_chunk), total: this_day_score }]);
  }, []);

  return Math.floor(daily_totals.reduce((acc, t) => acc + t.total, 0) / daily_totals.length);
};

const get_daily_item_average = item => {
  const { logs } = item;
  const ms_per_day = 1000 * 60 * 60 * 24;
  const first_date = new Date(logs[0].date);
  const last_date = new Date(logs[logs.length - 1].date);
  const first_day = new Date(first_date.getFullYear(), first_date.getMonth(), first_date.getDate());
  const last_day = new Date(last_date.getFullYear(), last_date.getMonth(), last_date.getDate());
  const diff_in_days = (last_day.getTime() - first_day.getTime()) / ms_per_day + 1;
  const day_chunks = Array.apply(null, Array(diff_in_days)).map(function(_, i) {
    return first_day.getTime() + i * ms_per_day;
  });
  const daily_totals = day_chunks.reduce((acc, day_chunk) => {
    const next_day_chunk = day_chunk + ms_per_day;
    const this_day_entries = logs.filter(l => day_chunk <= l.date && l.date < next_day_chunk);

    return acc.concat([{ date: new Date(day_chunk), total: this_day_entries.length }]);
  }, []);

  return Math.floor(daily_totals.reduce((acc, t) => acc + t.total, 0) / daily_totals.length);
};

const map_to_calendar_chart_data = item => {
  const { logs } = item;

  if (!Array.isArray(logs) || logs.length === 0) {
    return logs;
  }

  if (logs.length === 1) {
    return [[new Date(logs[0].date), 1]];
  }

  const ms_per_day = 1000 * 60 * 60 * 24;
  const first_date = new Date(logs[0].date);
  const last_date = new Date(logs[logs.length - 1].date);
  const first_day = new Date(first_date.getFullYear(), first_date.getMonth(), first_date.getDate());
  const last_day = new Date(last_date.getFullYear(), last_date.getMonth(), last_date.getDate());
  const diff_in_days = (last_day.getTime() - first_day.getTime()) / ms_per_day + 1;
  const day_chunks = Array.apply(null, Array(diff_in_days)).map(function(_, i) {
    return first_day.getTime() + i * ms_per_day;
  });

  return day_chunks.reduce((acc, day_chunk) => {
    const next_day_chunk = day_chunk + ms_per_day;
    const this_day_entries = logs.filter(l => day_chunk <= l.date && l.date < next_day_chunk);

    return acc.concat([[new Date(day_chunk), this_day_entries.length]]);
  }, []);
};

const scroll_viewport_to_top = () => {
  window.scrollTo(0, 0);

  // fuck you mobile safari
  document.body.scrollTop = 0;
};

const get_today_start_date = () => {
  const now = new Date(Date.now());
  const day_date = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  return day_date;
};

const get_this_week_start_date = week_start => {
  const now = new Date(Date.now());
  const current_weekday_date = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const sunday_start_weekday_index = now.getDay();
  const weekday_index =
    week_start && week_start === "sunday"
      ? sunday_start_weekday_index
      : sunday_start_weekday_index === 0 ? 6 : sunday_start_weekday_index - 1;
  const day_interval = 1000 * 60 * 60 * 24;
  const week_start_date = new Date(current_weekday_date - weekday_index * day_interval);

  return week_start_date;
};

const get_this_month_start_date = () => {
  const now = new Date(Date.now());
  const current_month_date = new Date(now.getFullYear(), now.getMonth());

  return current_month_date;
};

const get_this_year_start_date = () => {
  const now = new Date(Date.now());
  const current_year_date = new Date(now.getFullYear());

  return current_year_date;
};

module.exports = {
  extract_items_from_snapshot,
  extract_day,
  extract_this_week,
  extract_this_month,
  extract_this_year,
  extract_range,
  disable_form,
  time_ago,
  format_date_full,
  format_time_of_day,
  by_name_asc,
  by_name_desc,
  by_value_asc,
  by_value_desc,
  by_created_date_asc,
  by_created_date_desc,
  by_last_logged_date_asc,
  by_last_logged_date_desc,
  get_daily_log_average,
  get_daily_item_average,
  map_to_calendar_chart_data,
  scroll_viewport_to_top,
  get_today_start_date,
  get_this_week_start_date,
  get_this_month_start_date,
  get_this_year_start_date
};
