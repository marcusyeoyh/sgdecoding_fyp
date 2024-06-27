const mongoose = require("mongoose");

const StatisticsSchema = new mongoose.Schema({
    _id: {
      type: String,
      required: true,
    },
    total_jobs: {
      type: Number,
      required: true,
    },
    pending_jobs: {
      type: Number,
      required: true,
    },
    total_minutes_transcribed: {
      type: Number,
      required: true,
    },
    monthly_live_minutes: {
      type: Number,
      required: true,
    },
    monthly_offline_minutes: {
      type: Number,
      required: true,
    },
    updated: {
      type: Boolean,
      required: true,
    },
    start_date: {
      type: Date,
      required: true
    },
    end_date: {
      type: Date,
      required: true
    },
  });

const Statistic = mongoose.model("Statistic", StatisticsSchema);

module.exports = Statistic;