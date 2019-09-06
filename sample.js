const analytics = require("./youtube/analytics.js");

const request = {
  dimensions: "day",
  startDate: "2019-08-20",
  endDate: "2019-09-20",
  ids: "channel==MINE",
  metrics:
    "views,estimatedMinutesWatched,averageViewDuration,averageViewPercentage,subscribersGained",
  sort: "day"
};

analytics.ChannelData(request).then(res => console.log(res)).catch(e => console.log(e));
