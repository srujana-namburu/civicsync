
import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { format, parseISO } from "date-fns";

interface TemporalDataPoint {
  date: string;
  count: number;
}

interface TemporalAnalysisProps {
  data: TemporalDataPoint[];
}

const TemporalAnalysis: React.FC<TemporalAnalysisProps> = ({ data }) => {
  const formattedData = data.map(item => ({
    ...item,
    formattedDate: format(parseISO(item.date), "MMM dd")
  }));

  // If no data is available, show a message
  if (formattedData.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        No data available
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={formattedData}
          margin={{
            top: 10,
            right: 10,
            left: 0,
            bottom: 20,
          }}
        >
          <defs>
            <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.4} />
          <XAxis 
            dataKey="formattedDate" 
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
            tickMargin={10}
            dy={10}
          />
          <YAxis 
            tickLine={false}
            axisLine={false}
            width={30}
            tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
            tickFormatter={(value) => value}
            domain={[0, 'auto']}
          />
          <Tooltip
            formatter={(value) => [`${value} issues`, 'Reported']}
            labelFormatter={(label) => `Date: ${label}`}
            contentStyle={{
              backgroundColor: 'var(--card)',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              border: '1px solid var(--border)'
            }}
            wrapperStyle={{
              outline: 'none',
            }}
          />
          <Area
            type="monotone"
            dataKey="count"
            stroke="hsl(var(--primary))"
            fill="url(#colorCount)"
            strokeWidth={3}
            activeDot={{ 
              r: 6, 
              strokeWidth: 2, 
              stroke: 'var(--background)', 
              fill: 'hsl(var(--primary))',
            }}
            animationDuration={1500}
            animationEasing="ease-out"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TemporalAnalysis;
