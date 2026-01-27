// Mock API client
export const base44 = {
  entities: {
    Progress: {
      list: () => Promise.resolve([
        { level_id: 1, stars_earned: 3, completed: true },
        { level_id: 2, stars_earned: 2, completed: true },
        { level_id: 3, stars_earned: 1, completed: true },
        // Add more as needed
      ]),
      create: (data) => Promise.resolve(data),
      update: (id, data) => Promise.resolve({ ...data, id }),
    },
    MistakeNote: {
      list: () => Promise.resolve([]),
      create: (data) => Promise.resolve(data),
      update: (id, data) => Promise.resolve({ ...data, id }),
      delete: (id) => Promise.resolve(),
    },
    TimeChallengeScore: {
      list: () => Promise.resolve([]),
      create: (data) => Promise.resolve(data),
    },
  },
};