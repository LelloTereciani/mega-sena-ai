import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  draws: router({
    list: publicProcedure.query(async () => {
      return db.getAllDraws();
    }),
    
    latest: publicProcedure
      .input(z.object({ limit: z.number().min(1).max(1000).default(100) }))
      .query(async ({ input }) => {
        return db.getLatestDraws(input.limit);
      }),
    
    count: publicProcedure.query(async () => {
      return db.getDrawsCount();
    }),
    
    import: protectedProcedure
      .input(z.object({
        draws: z.array(z.object({
          contest: z.number(),
          drawDate: z.date(),
          ball1: z.number().min(1).max(60),
          ball2: z.number().min(1).max(60),
          ball3: z.number().min(1).max(60),
          ball4: z.number().min(1).max(60),
          ball5: z.number().min(1).max(60),
          ball6: z.number().min(1).max(60),
          winners6: z.number().optional(),
          prize: z.number().optional(),
        }))
      }))
      .mutation(async ({ input }) => {
        // Delete existing draws before importing
        await db.deleteAllDraws();
        // Insert new draws
        await db.insertDraws(input.draws);
        return { success: true, count: input.draws.length };
      }),
  }),
});

export type AppRouter = typeof appRouter;
