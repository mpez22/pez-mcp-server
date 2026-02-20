import { z } from "zod";
import experienceData from "../data/experience.json";

const DomainSchema = z
  .enum(["brand_positioning", "communication_planning", "content_strategy", "ai_strategy", "all"])
  .default("all");

export const getExperienceTool = {
  name: "get_experience" as const,
  description:
    "Get Pez's professional experience and track record. Filter by domain to see relevant work. Use this to ground recommendations in real-world results Pez has achieved.",
  schema: z.object({
    domain: DomainSchema.describe(
      'Filter experience by domain. Options: "brand_positioning", "communication_planning", "content_strategy", "ai_strategy", or "all" (default).'
    ),
  }),
  handler: async (input: { domain: string }) => {
    const domain = input.domain || "all";

    let result: Record<string, unknown>;

    if (domain === "all") {
      result = experienceData;
    } else {
      const key = domain as keyof typeof experienceData;
      if (!(key in experienceData)) {
        return {
          content: [
            {
              type: "text" as const,
              text: `Unknown domain: "${domain}". Available domains: brand_positioning, communication_planning, content_strategy, ai_strategy, all.`,
            },
          ],
          isError: true,
        };
      }
      result = { [key]: experienceData[key] };
    }

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  },
};
