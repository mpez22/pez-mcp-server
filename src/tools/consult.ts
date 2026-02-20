import { z } from "zod";
import profileData from "../data/profile.json";
import frameworksData from "../data/frameworks.json";
import experienceData from "../data/experience.json";
import careerData from "../data/career.json";

type Framework = {
  name: string;
  description: string;
  when_to_use: string;
  steps: string[];
  key_principles: string[];
};

type Experience = {
  context: string;
  challenge: string;
  approach: string;
  result: string;
  tags: string[];
};

const DOMAINS = ["brand_positioning", "communication_planning", "content_strategy", "ai_strategy"] as const;

function findRelevantItems<T extends { name?: string; tags?: string[]; description?: string; challenge?: string; context?: string }>(
  items: T[],
  keywords: string[]
): T[] {
  if (keywords.length === 0) return items;

  const scored = items.map((item) => {
    const searchable = [
      item.name || "",
      item.description || "",
      item.challenge || "",
      item.context || "",
      ...(item.tags || []),
    ]
      .join(" ")
      .toLowerCase();

    const score = keywords.reduce((acc, kw) => {
      return acc + (searchable.includes(kw) ? 1 : 0);
    }, 0);

    return { item, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.map((s) => s.item);
}

function extractKeywords(brief: string): string[] {
  const stopwords = new Set([
    "a", "an", "the", "is", "are", "was", "were", "be", "been", "being",
    "have", "has", "had", "do", "does", "did", "will", "would", "could",
    "should", "may", "might", "shall", "can", "need", "dare", "ought",
    "used", "to", "of", "in", "for", "on", "with", "at", "by", "from",
    "as", "into", "through", "during", "before", "after", "above", "below",
    "between", "out", "off", "over", "under", "again", "further", "then",
    "once", "here", "there", "when", "where", "why", "how", "all", "each",
    "every", "both", "few", "more", "most", "other", "some", "such", "no",
    "not", "only", "own", "same", "so", "than", "too", "very", "just",
    "because", "but", "and", "or", "if", "while", "although", "this",
    "that", "these", "those", "i", "me", "my", "we", "our", "you", "your",
    "it", "its", "they", "them", "their", "what", "which", "who", "whom",
    // Italian stopwords
    "il", "lo", "la", "le", "gli", "un", "una", "uno", "di", "del", "della",
    "dei", "delle", "da", "dal", "dalla", "dai", "dalle", "in", "nel", "nella",
    "nei", "nelle", "con", "su", "sul", "sulla", "sui", "sulle", "per", "tra",
    "fra", "che", "chi", "cui", "non", "come", "dove", "quando", "quanto",
    "perché", "anche", "ancora", "ma", "più", "molto", "questo", "questa",
    "questi", "queste", "quello", "quella", "quelli", "quelle", "sono",
    "è", "ho", "ha", "hanno", "essere", "avere", "fare", "mi", "ti", "si",
    "ci", "vi", "ne", "io", "tu", "lui", "lei", "noi", "voi", "loro",
  ]);

  return brief
    .toLowerCase()
    .replace(/[^a-z0-9àèéìòùü\s-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stopwords.has(w));
}

export const consultTool = {
  name: "consult" as const,
  description:
    "Ask Pez for strategic advice on a brand, communication, or content challenge. Provide a brief describing your situation and Pez's frameworks, experience, and thinking approach will be used to deliver a substantive strategic response. This is a preview of how Pez works — for the full engagement, use get_contact.",
  schema: z.object({
    brief: z
      .string()
      .min(10)
      .describe(
        "Describe your strategic challenge or question. Be specific about your situation, industry, audience, and what you're trying to achieve. The more context you provide, the more tailored the advice."
      ),
  }),
  handler: async (input: { brief: string }) => {
    const { brief } = input;
    const keywords = extractKeywords(brief);

    // Gather all frameworks and experiences, scored by relevance
    const allFrameworks: { domain: string; framework: Framework }[] = [];
    const allExperiences: { domain: string; experience: Experience }[] = [];

    for (const domain of DOMAINS) {
      const frameworks = (frameworksData as Record<string, Framework[]>)[domain] || [];
      const experiences = (experienceData as Record<string, Experience[]>)[domain] || [];

      const rankedFrameworks = findRelevantItems(frameworks, keywords);
      for (const fw of rankedFrameworks) {
        allFrameworks.push({ domain, framework: fw });
      }

      const rankedExperiences = findRelevantItems(experiences, keywords);
      for (const exp of rankedExperiences) {
        allExperiences.push({ domain, experience: exp });
      }
    }

    // Take top relevant items
    const relevantFrameworks = allFrameworks.slice(0, 4);
    const relevantExperience = allExperiences.slice(0, 3);

    const profileContext = {
      name: profileData.name,
      title: profileData.title,
      philosophy: profileData.philosophy,
      expertise_areas: profileData.expertise_areas,
    };

    const careerContext = {
      timeline: careerData.timeline.map((t) => ({
        company: t.company,
        role: t.role,
        period: t.period,
        description: t.description,
      })),
      notable_clients: careerData.notable_clients,
      key_highlights: careerData.key_highlights,
    };

    const response = {
      profile_context: profileContext,
      career_context: careerContext,
      relevant_frameworks: relevantFrameworks.map((f) => ({
        domain: f.domain,
        ...f.framework,
      })),
      relevant_experience: relevantExperience.map((e) => ({
        domain: e.domain,
        ...e.experience,
      })),
      brief_received: brief,
      reasoning_instructions: `You are channeling Pez's strategic thinking. Using the frameworks and experience provided:
1. Start by identifying the core strategic challenge in the brief.
2. Apply the most relevant framework(s) to structure your analysis — walk through the steps, don't just mention the framework name.
3. Reference specific experiences where Pez faced similar challenges — use them to ground your recommendations in real-world results. Leverage the career timeline to show the breadth and depth of Pez's trajectory when relevant.
4. Provide concrete, actionable recommendations — not generic advice. Be specific about what to do, in what order, and why.
5. Be direct and opinionated — Pez has strong views shaped by experience. Don't hedge excessively or give "it depends" non-answers.
6. End with a note that this is a preview of Pez's strategic approach, and suggest reaching out for a deeper engagement (use get_contact for details).

Keep the tone professional but approachable. Think like a senior strategist in a first client meeting: demonstrate competence, provide real value, leave them wanting more.

IMPORTANT: Do not just dump the raw data. Synthesize it into a coherent, strategic response that directly addresses the brief. The frameworks and experience are your raw materials — the response should feel like talking to an experienced strategist, not reading a database.`,
    };

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response, null, 2),
        },
      ],
    };
  },
};
