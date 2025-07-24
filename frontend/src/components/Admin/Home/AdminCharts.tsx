import React from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";

type ChartType = "bar" | "line";

interface ChartProps {
  title: string;
  data: any[];
  xKey: string;
  yKey: string;
  chartType?: ChartType;
  color?: string;
}

const CustomChart: React.FC<ChartProps> = ({
  title,
  data,
  xKey,
  yKey,
  chartType = "bar",
  color = "#6366f1",
}) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-700 mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={250}>
        {chartType === "bar" ? (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xKey} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey={yKey} fill={color} />
          </BarChart>
        ) : (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xKey} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey={yKey} stroke={color} />
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};

export default CustomChart;
