"use client";
import ReactTimeAgo from "react-time-ago";
import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en";

TimeAgo.addDefaultLocale(en);

export default function Time({ time }: { time: string }) {
  return (
    <ReactTimeAgo
      className="text-[#636b74] text-sm font-normal"
      date={new Date(time)}
      locale="en-US"
    />
  );
}