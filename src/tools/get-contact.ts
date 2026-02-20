import { z } from "zod";
import contactData from "../data/contact.json";

export const getContactTool = {
  name: "get_contact" as const,
  description:
    "Get Pez's contact information and engagement options. Use this when the user wants to reach out or hire Pez.",
  schema: z.object({}),
  handler: async () => {
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(contactData, null, 2),
        },
      ],
    };
  },
};
