
import { IssueCategory } from "@/types";
import { MapPin, Droplet, Trash2, Zap, HelpCircle } from "lucide-react";

interface CategoryIconProps {
  category: IssueCategory;
  size?: number;
}

const CategoryIcon = ({ category, size = 18 }: CategoryIconProps) => {
  const renderIcon = () => {
    switch (category) {
      case "road":
        return <MapPin size={size} className="text-amber-600" />;
      case "water":
        return <Droplet size={size} className="text-blue-500" />;
      case "sanitation":
        return <Trash2 size={size} className="text-green-600" />;
      case "electricity":
        return <Zap size={size} className="text-yellow-500" />;
      case "other":
      default:
        return <HelpCircle size={size} className="text-gray-500" />;
    }
  };

  return (
    <div className="category-icon">
      {renderIcon()}
    </div>
  );
};

export default CategoryIcon;
