import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { HumanMessage } from '@langchain/core/messages';
import { z } from 'zod';

// Define a strict schema for the blog post
const BlogSchema = z.object({
  title: z.string().describe('A catchy and relevant blog title'),
  content: z
    .string()
    .describe('The blog post body in HTML format using p, h2, h3, and ul tags'),
  tags: z.array(z.string()).describe('3 to 5 relevant hashtags or keywords'),
  seoDescription: z
    .string()
    .max(160)
    .describe('A concise summary for search engines'),
});

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private model: ChatGoogleGenerativeAI;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('GOOGLE_API_KEY');

    this.model = new ChatGoogleGenerativeAI({
      apiKey,
      // 2026 Stable Standard
      model: 'gemini-2.5-flash',
      temperature: 0.7,
      // Handles 429 errors by retrying with exponential backoff
      maxRetries: 3,
    });
  }

  async generateBlogFromImage(imageUrl: string) {
    this.logger.log(`Starting blog generation for image: ${imageUrl}`);

    try {
      /** STEP 1: FETCH IMAGE & CONVERT TO BASE64 */
      const imageResp = await fetch(imageUrl);
      if (!imageResp.ok)
        throw new Error(`Fetch failed: ${imageResp.statusText}`);

      const buffer = Buffer.from(await imageResp.arrayBuffer());
      const base64Image = buffer.toString('base64');
      const mimeType = imageResp.headers.get('content-type') ?? 'image/jpeg';

      /** STEP 2: MULTIMODAL VISION TASK */
      const visionResponse = await this.model.invoke([
        new HumanMessage({
          content: [
            {
              type: 'text',
              text: 'Analyze this image in detail. Focus on the scene, mood, and potential story.',
            },
            {
              type: 'image_url',
              image_url: `data:${mimeType};base64,${base64Image}`,
            },
          ],
        }),
      ]);

      const imageDescription = visionResponse.content.toString();

      /** STEP 3: STRUCTURED BLOG GENERATION */
      // This forces the AI to return a validated JSON object matching our schema
      const structuredLlm = this.model.withStructuredOutput(BlogSchema);

      const result = await structuredLlm.invoke([
        {
          role: 'system',
          content:
            'You are a professional travel and tech blogger. Use the image description to create a structured blog post in HTML.',
        },
        {
          role: 'user',
          content: `IMAGE DESCRIPTION: ${imageDescription}`,
        },
      ]);

      this.logger.log('Blog generation successful');
      return result;
    } catch (error) {
      this.handleError(error);
    }
  }

  private handleError(error: any) {
    this.logger.error('AiService Failure:', error.message);

    // Specific mapping for common Gemini API errors
    if (error.status === 429) {
      throw new HttpException(
        'AI Quota exceeded. Please wait a minute.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
    if (error.status === 404) {
      throw new HttpException(
        'AI Model not found. Check model parameter.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    throw new HttpException(
      'Failed to generate blog.',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
