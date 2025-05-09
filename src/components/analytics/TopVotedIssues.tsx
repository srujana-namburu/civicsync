
import React from "react";
import { useNavigate } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from "recharts";
import { IssueCategory, IssueStatus, Issue } from "@/types";
import CategoryIcon from "@/components/issues/CategoryIcon";
import StatusBadge from "@/components/issues/StatusBadge";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";

interface TopVotedIssuesProps {
  issues: Issue[];
}

const COLORS = {
  road: "#F59E0B",     // amber from our updated theme
  water: "#2563EB",    // blue from our updated theme
  sanitation: "#22C55E", // green from our updated theme
  electricity: "#38BDF8", // sky from our updated theme
  other: "#6B7280",    // gray
};

const TopVotedIssues: React.FC<TopVotedIssuesProps> = ({ issues }) => {
  const navigate = useNavigate();
  const sortedData = [...issues].sort((a, b) => b.votes - a.votes);

  const handleClick = (issue: Issue) => {
    navigate(`/issues/${issue.id}`);
  };

  // If no data is available, show a message
  if (sortedData.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="h-80 flex items-center justify-center text-muted-foreground">
          No data available
        </div>
        
        <Card className="p-4 h-80 flex items-center justify-center text-muted-foreground">
          No data available
        </Card>
      </div>
    );
  }

  // Create animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 }
    }
  };

  return (
    <motion.div 
      className="grid grid-cols-1 md:grid-cols-2 gap-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div 
        className="h-[300px] w-full"
        variants={itemVariants}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={sortedData}
            layout="vertical"
            margin={{
              top: 10,
              right: 10,
              left: 0,
              bottom: 10,
            }}
          >
            <XAxis 
              type="number" 
              tickLine={false} 
              axisLine={false}
              tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
            />
            <YAxis
              dataKey="title"
              type="category"
              tickLine={false}
              axisLine={false}
              width={90}
              tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
              tickFormatter={(value) => value.length > 15 ? `${value.substring(0, 15)}...` : value}
            />
            <Tooltip 
              formatter={(value: number) => [`${value} votes`, 'Votes']}
              labelFormatter={(label) => label}
              contentStyle={{
                backgroundColor: 'var(--card)',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                border: '1px solid var(--border)'
              }}
              wrapperStyle={{ outline: 'none' }}
            />
            <Bar 
              dataKey="votes" 
              barSize={20} 
              radius={[0, 4, 4, 0]}
              cursor="pointer"
              onClick={handleClick}
              animationDuration={1500}
              animationEasing="ease-out"
            >
              {sortedData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[entry.category]} 
                  style={{ filter: 'drop-shadow(0px 2px 3px rgba(0,0,0,0.1))' }}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </motion.div>
      
      <motion.div variants={itemVariants}>
        <Card className="p-4 h-[300px] overflow-auto border border-border/50 shadow-md hover:shadow-lg transition-all duration-300">
          <table className="w-full">
            <thead className="text-sm text-muted-foreground sticky top-0 bg-card z-10">
              <tr>
                <th className="text-left font-medium py-2">Issue</th>
                <th className="text-center font-medium py-2 w-24">Votes</th>
                <th className="text-center font-medium py-2 w-32">Status</th>
              </tr>
            </thead>
            <tbody>
              {sortedData.map((issue, idx) => (
                <motion.tr 
                  key={issue.id}
                  className="border-t border-border hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => handleClick(issue)}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05, duration: 0.3 }}
                  whileHover={{ backgroundColor: 'var(--accent-foreground/5)' }}
                >
                  <td className="py-3">
                    <div className="flex items-start gap-2">
                      <div className="mt-1">
                        <CategoryIcon category={issue.category} size={16} />
                      </div>
                      <span className="line-clamp-2">{issue.title}</span>
                    </div>
                  </td>
                  <td className="text-center font-medium">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: idx * 0.05 + 0.3, type: "spring", stiffness: 200 }}
                    >
                      {issue.votes}
                    </motion.div>
                  </td>
                  <td className="text-center">
                    <div className="flex justify-center py-1">
                      <StatusBadge status={issue.status} size="sm" />
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          
          {sortedData.length === 0 && (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              No data available
            </div>
          )}
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default TopVotedIssues;
