// Array of high-quality community/civic-related images
const heroImages = [
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1538681105587-85e3c448cb4e?w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1494256997604-768d1f608cac?w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1600715044311-8f6fc5a3b909?w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1523289333742-be1143f6b766?w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1608826987636-79383a55502f?w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1593604572579-eba6b7a33a7e?w=1200&auto=format&fit=crop"
];

// Get a pseudo-random image based on current date (changes daily)
export const getDailyImage = (): string => {
  const today = new Date();
  const dateIndex = (today.getDate() + today.getMonth()) % heroImages.length;
  return heroImages[dateIndex];
};

// Get a random image (changes on each visit/refresh)
export const getRandomImage = (): string => {
  const randomIndex = Math.floor(Math.random() * heroImages.length);
  return heroImages[randomIndex];
};

// Get an image based on user ID (consistent for same user)
export const getUserBasedImage = (userId?: string): string => {
  if (!userId) return getRandomImage();
  
  // Use the userId string to generate a consistent index
  const charSum = userId.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const userIndex = charSum % heroImages.length;
  return heroImages[userIndex];
};
