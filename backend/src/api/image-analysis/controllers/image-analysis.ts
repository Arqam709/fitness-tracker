import { Context } from "koa";
import { analyzeImage } from "../services/gemini";

export default {
  async analyze(ctx: Context) {
    try {
      const files: any = ctx.request.files;
      const file = files?.image;

      if (!file) {
        return ctx.badRequest("No image uploaded");
      }

      const filePath = file.filepath;
      const mimeType = file.mimetype;

      // ✅ call ONCE, and pass mimeType
      const result = await analyzeImage(filePath, mimeType);

      ctx.send({
        success: true,
        result,
        filePath,
      });
    } catch (error: any) {
      console.error("Gemini analyze error:", error);
      ctx.internalServerError("analysis failed", { error: error?.message });
    }
  },
};

