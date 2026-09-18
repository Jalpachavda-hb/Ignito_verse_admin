import React, { useState, useMemo } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";

interface CourseDistributionChartProps {
  courses: Array<{
    courseLevel?: string;
    streamName?: string;
    microcredentialCoursePrice?: number;
    courseStatus?: string;
  }>;
  loading: boolean;
}

export const CourseDistributionChart: React.FC<CourseDistributionChartProps> = ({
  courses,
  loading,
}) => {
  const [viewMode, setViewMode] = useState<"level" | "stream">("level");

  // Calculate aggregation based on viewMode
  const chartData = useMemo(() => {
    if (!courses || courses.length === 0) {
      return {
        labels: ["No Data"],
        series: [1],
        isEmpty: true,
      };
    }

    const counts: Record<string, number> = {};

    courses.forEach((c) => {
      let key = "";
      if (viewMode === "level") {
        key = (c.courseLevel || "General").trim();
      } else {
        key = (c.streamName || "General").trim();
      }
      if (!key) key = "Unassigned";
      counts[key] = (counts[key] || 0) + 1;
    });

    const labels = Object.keys(counts);
    const series = Object.values(counts);

    return {
      labels,
      series,
      isEmpty: labels.length === 0,
    };
  }, [courses, viewMode]);

  const palette = [
    "#465fff",
    "#10b981",
    "#f59e0b",
    "#8b5cf6",
    "#ec4899",
    "#06b6d4",
    "#f97316",
    "#6366f1",
  ];

  const options: ApexOptions = {
    chart: {
      type: "donut",
      fontFamily: "Outfit, sans-serif",
      toolbar: { show: false },
    },
    colors: chartData.isEmpty ? ["#E5E7EB"] : palette.slice(0, chartData.labels.length),
    labels: chartData.labels,
    dataLabels: {
      enabled: !chartData.isEmpty,
      formatter: (val: number) => `${Math.round(val)}%`,
      dropShadow: { enabled: false },
      style: {
        fontSize: "12px",
        fontWeight: 600,
      },
    },
    legend: {
      position: "bottom",
      fontFamily: "Outfit, sans-serif",
      fontSize: "13px",
      labels: {
        colors: "#6B7280",
      },
      itemMargin: {
        horizontal: 10,
        vertical: 4,
      },
    },
    plotOptions: {
      pie: {
        donut: {
          size: "70%",
          labels: {
            show: true,
            total: {
              show: true,
              label: viewMode === "level" ? "Total Levels" : "Total Streams",
              fontFamily: "Outfit, sans-serif",
              fontSize: "13px",
              fontWeight: 500,
              color: "#6B7280",
              formatter: () => `${courses.length} Courses`,
            },
            value: {
              fontSize: "20px",
              fontWeight: 700,
              fontFamily: "Outfit, sans-serif",
              color: "#111827",
            },
          },
        },
      },
    },
    stroke: {
      width: 2,
      colors: ["#ffffff"],
    },
    tooltip: {
      enabled: !chartData.isEmpty,
      y: {
        formatter: (val: number) => `${val} Courses`,
      },
    },
  };

  return (
    <div className="flex h-full flex-col justify-between rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900 md:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">
            Course Distribution
          </h3>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
            Real breakdown by {viewMode === "level" ? "Course Level" : "Academic Stream"}
          </p>
        </div>

        <div className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-1 dark:border-gray-800 dark:bg-gray-800">
          <button
            onClick={() => setViewMode("level")}
            className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
              viewMode === "level"
                ? "bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            }`}
          >
            By Level
          </button>
          <button
            onClick={() => setViewMode("stream")}
            className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
              viewMode === "stream"
                ? "bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            }`}
          >
            By Stream
          </button>
        </div>
      </div>

      <div className="my-4 flex items-center justify-center">
        {loading ? (
          <div className="flex h-[260px] w-full items-center justify-center">
            <div className="h-44 w-44 animate-pulse rounded-full border-8 border-gray-200 border-t-brand-500 dark:border-gray-800"></div>
          </div>
        ) : (
          <div className="w-full">
            <Chart
              options={options}
              series={chartData.series}
              type="donut"
              height={280}
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 border-t border-gray-100 pt-3 dark:border-gray-800/80 sm:grid-cols-3">
        <div className="rounded-lg bg-gray-50 p-2 text-center dark:bg-gray-800/50">
          <span className="text-[11px] text-gray-500 dark:text-gray-400">Total Catalog</span>
          <p className="font-semibold text-gray-900 dark:text-white">{courses.length}</p>
        </div>
        <div className="rounded-lg bg-gray-50 p-2 text-center dark:bg-gray-800/50">
          <span className="text-[11px] text-gray-500 dark:text-gray-400">Categories</span>
          <p className="font-semibold text-gray-900 dark:text-white">{chartData.labels.length}</p>
        </div>
        <div className="col-span-2 rounded-lg bg-gray-50 p-2 text-center dark:bg-gray-800/50 sm:col-span-1">
          <span className="text-[11px] text-gray-500 dark:text-gray-400">Largest Group</span>
          <p className="truncate font-semibold text-gray-900 dark:text-white">
            {chartData.labels[0] || "None"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CourseDistributionChart;
