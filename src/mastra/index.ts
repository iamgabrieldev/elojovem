import { Mastra } from "@mastra/core";

import { mentorAgent } from "./agents/mentor-agent";
import { devotionalAgent } from "./agents/devotional-agent";

export const mastra = new Mastra({
  agents: {
    mentorAgent,
    devotionalAgent,
  },
});
