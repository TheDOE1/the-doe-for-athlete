import { createTRPCRouter } from "./trpc";
import { playerRouter } from "./routers/player";
import { teamRouter } from "./routers/team";
import { wellnessRouter } from "./routers/wellness";
import { sessionRouter } from "./routers/session";
import { preventionRouter } from "./routers/prevention";
import { planningRouter } from "./routers/planning";
import { labRouter } from "./routers/lab";
import { preseasonRouter } from "./routers/preseason";
import { femaleRouter } from "./routers/female";
import { aiRouter } from "./routers/ai";

export const appRouter = createTRPCRouter({
  player: playerRouter,
  team: teamRouter,
  wellness: wellnessRouter,
  session: sessionRouter,
  prevention: preventionRouter,
  planning: planningRouter,
  lab: labRouter,
  preseason: preseasonRouter,
  female: femaleRouter,
  ai: aiRouter,
});

export type AppRouter = typeof appRouter;
