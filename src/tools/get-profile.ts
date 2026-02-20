import { z } from "zod";
import profileData from "../data/profile.json";

export const getProfileTool = {
  name: "get_profile" as const,
  description:
    "Get Pez's professional profile: background, areas of expertise, and professional philosophy. Use this to understand who Pez is before engaging with other tools.",
  schema: z.object({}),
  handler: async () => {
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(profileData, null, 2),
        },
      ],
    };
  },
};
