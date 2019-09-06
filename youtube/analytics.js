const { google } = require("googleapis");
const oAuth = require("../oAuth");

const scopes = [
  "https://www.googleapis.com/auth/youtube",
  "https://www.googleapis.com/auth/youtube.readonly"
];

// initialize the Youtube API library
const youtube = google.youtube({
  version: "v3",
  auth: oAuth.oAuth2Client
});

const ChannelData = reqObj => {
  return new Promise(async (resolve, reject) => {
    try {
      await oAuth.authenticate(scopes);
      const youtubeAnalytics = google.youtubeAnalytics({
        version: "v2",
        auth: oAuth.oAuth2Client
      });
      const metrics =
        "views,estimatedMinutesWatched,averageViewDuration,averageViewPercentage,subscribersGained";
      const data = await youtubeAnalytics.reports.query({
        metrics,
        ...reqObj
      });
      const results = data && data.data && data.data.rows ? data.data.rows : [];
      const keys = ["date", ...metrics.split(",")];
      const response = results.map(item => {
        var temp = {};
        for (var i = 0; i < keys.length; i++) temp[keys[i]] = item[i];
        return temp;
      });
      resolve(response);
    } catch (error) {
      console.log("The API returned an error: ", error);
      reject(error);
    }
  });
};

module.exports = { ChannelData };
