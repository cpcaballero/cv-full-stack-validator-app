import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

const validatorSchema = z.object({
  success: z.boolean(),
  mismatches: z.array(z.string()),
});

export const cvRouter = createTRPCRouter({
  submitCV: publicProcedure
    .input(
      z.object({
        fullName: z.string(),
        email: z.string().email(),
        phone: z.string(),
        skills: z.string(),
        experience: z.string(),
        pdfBase64: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { fullName, email, phone, skills, experience, pdfBase64 } = input;

      await ctx.db.user.create({
        data: { fullName, email, phone, skills, experience },
      });

      const response = await fetch("http://ai-validator:3001/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          email,
          phone,
          skills,
          experience,
          pdfBase64,
        }),
      });

      const result = validatorSchema.parse(await response.json());

      if (
        !result ||
        typeof result.success !== "boolean" ||
        !Array.isArray(result.mismatches)
      ) {
        return {
          success: false,
          mismatches: ["Invalid response from validator"],
        };
      }

      return {
        success: result.success,
        mismatches: result.mismatches,
      };
    }),
});
