
import { Issue, IssueCategory, IssueStatus } from "@/types";

// Array of mock issues for demo purposes
export const mockIssues: Issue[] = [
  {
    id: "1",
    title: "Pothole on Main Street",
    description: "Large pothole approximately 2 feet wide near the intersection of Main Street and Oak Avenue. It's causing vehicles to swerve dangerously and has damaged several car tires already.",
    category: "road",
    location: "Main Street & Oak Avenue",
    status: "pending",
    createdAt: new Date(2023, 4, 15),
    updatedAt: new Date(2023, 4, 15),
    userId: "user1",
    imageUrl: "https://images.unsplash.com/photo-1518544801976-5e98c8c3c6e6?w=800&auto=format&fit=crop",
    votes: 12
  },
  {
    id: "2",
    title: "Broken Water Main",
    description: "Water is flowing onto the street from what appears to be a broken water main. The area is becoming flooded and it's affecting local businesses.",
    category: "water",
    location: "27 Elm Street",
    status: "in-progress",
    createdAt: new Date(2023, 4, 10),
    updatedAt: new Date(2023, 4, 10),
    userId: "user2",
    imageUrl: "https://images.unsplash.com/photo-1583952336699-d0d4f0c9b03e?w=800&auto=format&fit=crop",
    votes: 8
  },
  {
    id: "3",
    title: "Overflowing Trash Containers",
    description: "The public trash containers at Cedar Park haven't been emptied for over a week and are now overflowing. Wildlife is getting into the trash and spreading it around the park.",
    category: "sanitation",
    location: "Cedar Park",
    status: "resolved",
    createdAt: new Date(2023, 4, 5),
    updatedAt: new Date(2023, 4, 12),
    userId: "user1",
    imageUrl: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop",
    votes: 5
  },
  {
    id: "4",
    title: "Street Light Out",
    description: "The street light at the corner of Pine and 4th has been out for several days, making the intersection dangerously dark at night.",
    category: "electricity",
    location: "Pine Street & 4th Avenue",
    status: "pending",
    createdAt: new Date(2023, 4, 2),
    updatedAt: new Date(2023, 4, 2),
    userId: "user3",
    votes: 3
  },
  {
    id: "5",
    title: "Fallen Tree Blocking Sidewalk",
    description: "A large tree branch has fallen and is completely blocking the sidewalk on Maple Drive. Pedestrians are forced to walk in the street to get around it.",
    category: "other",
    location: "123 Maple Drive",
    status: "in-progress",
    createdAt: new Date(2023, 3, 30),
    updatedAt: new Date(2023, 3, 30),
    userId: "user2",
    imageUrl: "https://images.unsplash.com/photo-1517660029921-0cbea2f15f8f?w=800&auto=format&fit=crop",
    votes: 7
  },
  {
    id: "6",
    title: "Graffiti on Public Building",
    description: "The west wall of the community center has been vandalized with graffiti. This is a historic building and the graffiti is quite extensive.",
    category: "other",
    location: "Community Center, 500 Main Street",
    status: "resolved",
    createdAt: new Date(2023, 3, 20),
    updatedAt: new Date(2023, 4, 1),
    userId: "user3",
    imageUrl: "https://images.unsplash.com/photo-1567240044533-ad2193ab95d9?w=800&auto=format&fit=crop",
    votes: 4
  }
];

// Mock user issues
export const mockUserIssues: Issue[] = [
  {
    id: "1",
    title: "Pothole on Main Street",
    description: "Large pothole approximately 2 feet wide near the intersection of Main Street and Oak Avenue. It's causing vehicles to swerve dangerously and has damaged several car tires already.",
    category: "road",
    location: "Main Street & Oak Avenue",
    status: "pending",
    createdAt: new Date(2023, 4, 15),
    updatedAt: new Date(2023, 4, 15),
    userId: "user1",
    imageUrl: "https://images.unsplash.com/photo-1518544801976-5e98c8c3c6e6?w=800&auto=format&fit=crop",
    votes: 12
  },
  {
    id: "3",
    title: "Overflowing Trash Containers",
    description: "The public trash containers at Cedar Park haven't been emptied for over a week and are now overflowing. Wildlife is getting into the trash and spreading it around the park.",
    category: "sanitation",
    location: "Cedar Park",
    status: "resolved",
    createdAt: new Date(2023, 4, 5),
    updatedAt: new Date(2023, 4, 12),
    userId: "user1",
    imageUrl: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop",
    votes: 5
  },
];

// Function to simulate API call to get issues
export const getIssues = (): Promise<Issue[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockIssues);
    }, 500);
  });
};

// Function to simulate API call to get a specific issue
export const getIssueById = (id: string): Promise<Issue | undefined> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const issue = mockIssues.find(issue => issue.id === id);
      resolve(issue);
    }, 300);
  });
};

// Function to simulate API call to get user's issues
export const getUserIssues = (): Promise<Issue[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockUserIssues);
    }, 500);
  });
};

// Function to simulate creating a new issue
export const createIssue = (issueData: Partial<Issue>): Promise<Issue> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newIssue: Issue = {
        id: `issue-${Date.now()}`,
        title: issueData.title || "",
        description: issueData.description || "",
        category: issueData.category as IssueCategory || "other",
        location: issueData.location || "",
        status: "pending" as IssueStatus,
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: "user1",
        votes: 0,
        imageUrl: issueData.imageUrl,
      };
      
      mockUserIssues.unshift(newIssue);
      mockIssues.unshift(newIssue);
      
      resolve(newIssue);
    }, 1000);
  });
};

// Function to simulate updating an issue
export const updateIssue = (id: string, issueData: Partial<Issue>): Promise<Issue | undefined> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const issueIndex = mockUserIssues.findIndex(issue => issue.id === id);
      if (issueIndex === -1) {
        resolve(undefined);
        return;
      }
      
      const updatedIssue = {
        ...mockUserIssues[issueIndex],
        ...issueData,
        updatedAt: new Date()
      };
      
      mockUserIssues[issueIndex] = updatedIssue;
      
      const globalIssueIndex = mockIssues.findIndex(issue => issue.id === id);
      if (globalIssueIndex !== -1) {
        mockIssues[globalIssueIndex] = updatedIssue;
      }
      
      resolve(updatedIssue);
    }, 1000);
  });
};

// Function to simulate deleting an issue
export const deleteIssue = (id: string): Promise<boolean> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const issueIndex = mockUserIssues.findIndex(issue => issue.id === id);
      if (issueIndex === -1) {
        resolve(false);
        return;
      }
      
      mockUserIssues.splice(issueIndex, 1);
      
      const globalIssueIndex = mockIssues.findIndex(issue => issue.id === id);
      if (globalIssueIndex !== -1) {
        mockIssues.splice(globalIssueIndex, 1);
      }
      
      resolve(true);
    }, 1000);
  });
};

// Function to simulate voting on an issue
export const voteOnIssue = (id: string): Promise<Issue | undefined> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const issue = mockIssues.find(issue => issue.id === id);
      if (!issue) {
        resolve(undefined);
        return;
      }
      
      issue.votes += 1;
      
      const userIssue = mockUserIssues.find(issue => issue.id === id);
      if (userIssue) {
        userIssue.votes += 1;
      }
      
      resolve(issue);
    }, 300);
  });
};
