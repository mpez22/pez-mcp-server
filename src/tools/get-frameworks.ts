import { z } from "zod";
import frameworksData from "../data/frameworks.json";

const DomainSchema = z
  .enum(["brand_positioning", "communication_planning", "content_strategy", "ai_strategy", "all"])
  .default("all");

export const getFrameworksTool = {
  name: "get_frameworks" as const,
  description:
    "Get Pez's strategic frameworks and methodologies. These represent how Pez thinks and approaches problems. Filter by domain for relevant frameworks. Use these to reason about challenges the way Pez would.",
  schema: z.object({
    domain: DomainSchema.describe(
      'Filter frameworks by domain. Options: "brand_positioning", "communication_planning", "content_strategy", "ai_strategy", or "all" (default).'
    ),
  }),
  handler: async (input: { domain: string }) => {
    const domain = input.domain || "all";

    let result: Record<string, unknown>;

    if (domain === "all") {
      result = frameworksData;
    } else {
      const key = domain as keyof typeof frameworksData;
      if (!(key in frameworksData)) {
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
      result = { [key]: frameworksData[key] };
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
