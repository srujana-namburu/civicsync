
import React, { useState, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { IssueCategory } from "@/types";
import CategoryIcon from "@/components/issues/CategoryIcon";
import { motion } from "framer-motion";

interface CategoryDataItem {
  category: IssueCategory;
  count: number;
}

interface CategoryDistributionProps {
  data: CategoryDataItem[];
  onCategoryClick?: (category: string) => void;
  selectedCategory?: string | null;
}

const COLORS = {
  road: "#F59E0B",     // Amber-500 from the updated theme
  water: "#2563EB",    // Blue-600 from the updated theme
  sanitation: "#22C55E", // Green-500 from the updated theme
  electricity: "#38BDF8", // Sky-400 from the updated theme
  other: "#6B7280",    // Gray-500 from the updated theme
};

const HOVER_COLORS = {
  road: "#fbbf24",        // Lighter Amber
  water: "#60a5fa",       // Lighter Blue
  sanitation: "#4ade80",  // Lighter Green
  electricity: "#7dd3fc", // Lighter Sky
  other: "#9ca3af",       // Lighter Gray
};

const CategoryDistribution: React.FC<CategoryDistributionProps> = ({
  data,
  onCategoryClick,
  selectedCategory = null,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const totalIssues = data.reduce((sum, item) => sum + item.count, 0);
  
  // Start animation when component mounts
  useEffect(() => {
    setIsAnimating(true);
  }, []);
  
  const chartData = data.map((item) => ({
    name: item.category,
    value: item.count,
    displayName: item.category.charAt(0).toUpperCase() + item.category.slice(1),
  }));

  // If no data is available, show a message
  if (chartData.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        No data available
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <motion.div 
        className="text-center mb-2"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          {totalIssues}
        </div>
        <div className="text-xs text-muted-foreground">Total Issues</div>
      </motion.div>
      <div className="flex flex-col md:flex-row items-center justify-center gap-8 w-full h-[322px] md:h-[276px]">
        <motion.div 
          className="flex-shrink-0 flex items-center justify-center"
          initial={{ opacity: 0, rotateY: 90 }}
          animate={{ opacity: 1, rotateY: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <ResponsiveContainer width={276} height={276}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius="65%"
                innerRadius="45%"
                fill="#8884d8"
                dataKey="value"
                nameKey="displayName"
                onClick={(entry) => onCategoryClick && onCategoryClick(entry.name)}
                activeIndex={selectedCategory ? chartData.findIndex(item => item.name === selectedCategory) : undefined}
                activeShape={({ cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill }) => {
                  const radiusOffset = 5;
                  return (
                    <g>
                      <path
                        d={`M${cx},${cy} L${cx + (innerRadius - radiusOffset) * Math.cos(-startAngle * Math.PI / 180)},${cy + (innerRadius - radiusOffset) * Math.sin(-startAngle * Math.PI / 180)} A${innerRadius - radiusOffset},${innerRadius - radiusOffset} 0 0 1 ${cx + (innerRadius - radiusOffset) * Math.cos(-endAngle * Math.PI / 180)},${cy + (innerRadius - radiusOffset) * Math.sin(-endAngle * Math.PI / 180)} Z`}
                        fill="#fff"
                      />
                      <path
                        d={`M${cx},${cy} L${cx + (outerRadius + radiusOffset) * Math.cos(-startAngle * Math.PI / 180)},${cy + (outerRadius + radiusOffset) * Math.sin(-startAngle * Math.PI / 180)} A${outerRadius + radiusOffset},${outerRadius + radiusOffset} 0 0 1 ${cx + (outerRadius + radiusOffset) * Math.cos(-endAngle * Math.PI / 180)},${cy + (outerRadius + radiusOffset) * Math.sin(-endAngle * Math.PI / 180)} Z`}
                        fill={fill}
                        stroke="#fff"
                        strokeWidth={2}
                        filter="drop-shadow(0px 2px 4px rgba(0,0,0,0.2))"
                      />
                    </g>
                  );
                }}
                onMouseEnter={(_, index) => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                animationBegin={0}
                animationDuration={1200}
                animationEasing="ease-out"
              >
                {chartData.map((entry, index) => {
                  const category = entry.name as IssueCategory;
                  const isHovered = hoveredIndex === index;
                  return (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        isHovered
                          ? HOVER_COLORS[category] || COLORS[category] || "#6B7280"
                          : COLORS[category] || "#6B7280"
                      }
                      className={`
                        ${selectedCategory && selectedCategory !== entry.name ? "opacity-60" : ""}
                        ${isAnimating ? "animate-scale-in" : ""}
                      `}
                      style={{ 
                        cursor: 'pointer',
                        filter: isHovered ? "drop-shadow(0px 4px 6px rgba(0,0,0,0.1))" : "none",
                        transition: "all 0.2s ease-out"
                      }}
                    />
                  );
                })}
              </Pie>
              <Tooltip
                formatter={(value: number, name: string) => [
                  `${value} issues (${Math.round((value / totalIssues) * 100)}%)`,
                  name
                ]}
                contentStyle={{
                  backgroundColor: 'var(--popover)',
                  color: 'var(--popover-foreground)',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.10)',
                  border: '1px solid var(--border)',
                  fontWeight: 500,
                  padding: '8px 12px'
                }}
                animationDuration={200}
                animationEasing="ease-out"
              />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
        <motion.div 
          className="flex flex-col items-center justify-center"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="flex flex-row md:flex-col gap-4 md:gap-3">
            {chartData.map((item, index) => {
              const category = item.name as IssueCategory;
              const isSelected = selectedCategory === category;
              
              return (
                <motion.span
                  key={category}
                  className={`flex items-center gap-2 cursor-pointer rounded-full px-2 py-1 transition-all duration-200 ${
                    isSelected ? 'bg-primary/10 font-bold' : 'hover:bg-muted/60'
                  }`}
                  onClick={() => onCategoryClick && onCategoryClick(category)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index, duration: 0.4 }}
                >
                  <span 
                    className="inline-block w-3 h-3 rounded-sm" 
                    style={{ 
                      backgroundColor: COLORS[category],
                      boxShadow: isSelected ? `0 0 0 2px var(--background), 0 0 0 4px ${COLORS[category]}55` : 'none'
                    }} 
                  />
                  <CategoryIcon category={category} size={14} />
                  <span>{item.displayName}</span>
                  <span className="text-xs text-muted-foreground">({item.value})</span>
                </motion.span>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CategoryDistribution;
