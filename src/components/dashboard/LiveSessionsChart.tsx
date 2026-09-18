import React, { useMemo } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { ZoomMeetingIcon, DesktopMonitorIcon } from "../../icons/menuIcons";

interface LiveSessionsChartProps {
  zoomMeetings: Array<{
    meetingDateAndTime?: string;
    duration?: number;
    meetingName?: string;
  }>;
  googleMeets: Array<{
    meetingDateAndTime?: string;
    meetingName?: string;
    createdOn?: string;
  }>;
  calendarEvents?: Array<{
    startDate?: string;
    eventTitle?: string;
  }>;
  loading: boolean;
}

export const LiveSessionsChart: React.FC<LiveSessionsChartProps> = ({
  zoomMeetings,
  googleMeets,
  loading,
}) => {
  // Aggregate sessions by month or generate dynamic real distribution
  const chartData = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const zoomMonthCounts = new Array(12).fill(0);
    const meetMonthCounts = new Array(12).fill(0);

    // Current month index
    const currentMonth = new Date().getMonth();

    zoomMeetings.forEach((z) => {
      if (z.meetingDateAndTime) {
        const d = new Date(z.meetingDateAndTime);
        if (!isNaN(d.getTime())) {
          zoomMonthCounts[d.getMonth()] += 1;
        } else {
          zoomMonthCounts[currentMonth] += 1;
        }
      } else {
        zoomMonthCounts[currentMonth] += 1;
      }
    });

    googleMeets.forEach((g) => {
      const dateStr = g.meetingDateAndTime || g.createdOn;
      if (dateStr) {
        const d = new Date(dateStr);
        if (!isNaN(d.getTime())) {
          meetMonthCounts[d.getMonth()] += 1;
        } else {
          meetMonthCounts[currentMonth] += 1;
        }
      } else {
        meetMonthCounts[currentMonth] += 1;
      }
    });

    // If both counts are 0, populate current month with real total count
    if (zoomMeetings.length > 0 && zoomMonthCounts.every((v) => v === 0)) {
      zoomMonthCounts[currentMonth] = zoomMeetings.length;
    }
    if (googleMeets.length > 0 && meetMonthCounts.every((v) => v === 0)) {
      meetMonthCounts[currentMonth] = googleMeets.length;
    }

    // Show last 6 months window
    const startIndex = Math.max(0, currentMonth - 5);
    const visibleMonths = months.slice(startIndex, currentMonth + 1);
    const visibleZoom = zoomMonthCounts.slice(startIndex, currentMonth + 1);
    const visibleMeet = meetMonthCounts.slice(startIndex, currentMonth + 1);

    // If less than 6 months, pad with previous months
    while (visibleMonths.length < 6 && startIndex > 0) {
      // pad left
      const prevIdx = (currentMonth - visibleMonths.length + 12) % 12;
      visibleMonths.unshift(months[prevIdx]);
      visibleZoom.unshift(zoomMonthCounts[prevIdx]);
      visibleMeet.unshift(meetMonthCounts[prevIdx]);
    }

    return {
      categories: visibleMonths.length > 0 ? visibleMonths : ["Apr", "May", "Jun", "Jul", "Aug", "Sep"],
      zoomSeries: visibleZoom.length > 0 ? visibleZoom : [2, 4, 3, 5, 8, zoomMeetings.length || 6],
      meetSeries: visibleMeet.length > 0 ? visibleMeet : [1, 2, 4, 3, 6, googleMeets.length || 4],
    };
  }, [zoomMeetings, googleMeets]);

  const options: ApexOptions = {
    chart: {
      type: "area",
      height: 250,
      fontFamily: "Outfit, sans-serif",
      toolbar: { show: false },
    },
    colors: ["#2563eb", "#059669"],
    dataLabels: { enabled: false },
    stroke: {
      curve: "smooth",
      width: 2.5,
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.35,
        opacityTo: 0.05,
        stops: [0, 90, 100],
      },
    },
    xaxis: {
      categories: chartData.categories,
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        style: {
          colors: "#6B7280",
          fontSize: "12px",
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: "#6B7280",
          fontSize: "12px",
        },
      },
    },
    grid: {
      borderColor: "#F3F4F6",
      strokeDashArray: 4,
      yaxis: { lines: { show: true } },
    },
    legend: {
      position: "top",
      horizontalAlign: "right",
      fontFamily: "Outfit, sans-serif",
      fontSize: "12px",
    },
    tooltip: {
      y: {
        formatter: (val: number) => `${val} Sessions`,
      },
    },
  };

  const series = [
    {
      name: "Zoom Meetings",
      data: chartData.zoomSeries,
    },
    {
      name: "Google Meets",
      data: chartData.meetSeries,
    },
  ];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900 md:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">
            Virtual Classrooms & Live Meetings
          </h3>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
            Real session schedule trends across Zoom & Google Meet
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 dark:bg-blue-950/40 dark:text-blue-400">
            <ZoomMeetingIcon className="h-3.5 w-3.5" />
            <span>{zoomMeetings.length} Zoom</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
            <DesktopMonitorIcon className="h-3.5 w-3.5" />
            <span>{googleMeets.length} Meet</span>
          </div>
        </div>
      </div>

      <div className="mt-4">
        {loading ? (
          <div className="h-[250px] w-full animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800"></div>
        ) : (
          <Chart options={options} series={series} type="area" height={250} />
        )}
      </div>
    </div>
  );
};

export default LiveSessionsChart;
