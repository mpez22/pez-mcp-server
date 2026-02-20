import { z } from "zod";
import careerData from "../data/career.json";

export const getCareerTool = {
  name: "get_career" as const,
  description:
    "Get Pez's full career timeline, education, languages, and notable clients. Use this to understand his professional trajectory — from full stack developer to agency founder to brand strategist and AI experimenter.",
  schema: z.object({}),
  handler: async () => {
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(careerData, null, 2),
        },
      ],
    };
  },
};
