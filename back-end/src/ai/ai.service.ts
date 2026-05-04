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
      model: 'gemini-2.5-flash',
      temperature: 0.7,
      maxRetries: 3,
    });
  }

  async generateBlogFromImage(imageUrl: string) {
    this.logger.log(`Starting blog generation for image: ${imageUrl}`);

    try {
      const imageResp = await fetch(imageUrl);
      if (!imageResp.ok)
        throw new Error(`Fetch failed: ${imageResp.statusText}`);

      const buffer = Buffer.from(await imageResp.arrayBuffer());
      const base64Image = buffer.toString('base64');
      const mimeType = imageResp.headers.get('content-type') ?? 'image/jpeg';

      const visionResponse = await this.model.invoke([
        new HumanMessage({
          content: [
            {
              type: 'text',
              text: `Analyze this image in detail as a creative director. 
              Identify the core subject, the emotional atmosphere (mood), the color palette, and any interesting background details. 
              Think about the "story" behind this image—what happened right before or what might happen next?`,
            },
            {
              type: 'image_url',
              image_url: `data:${mimeType};base64,${base64Image}`,
            },
          ],
        }),
      ]);

      const imageDescription = visionResponse.content.toString();

      const structuredLlm = this.model.withStructuredOutput(BlogSchema);

      const result = await structuredLlm.invoke([
        {
          role: 'system',
          content:
            'You are a world-class storyteller and professional blogger. ' +
            'Your task is to transform an image description into a captivating, high-quality blog post. ' +
            'The post should be engaging, insightful, and formatted with clean HTML. ' +
            'Use a tone that is professional yet personal and inspiring.',
        },
        {
          role: 'user',
          content: `IMAGE DESCRIPTION: ${imageDescription}
          
          Based on the description above, write a complete blog post. 
          Include:
          1. An attention-grabbing title.
          2. A narrative introduction that sets the scene.
          3. 2-3 body sections with clear headings (h2/h3) that explore themes, details, or stories suggested by the image.
          4. A thought-provoking conclusion.
          5. Relevant tags and a compelling SEO description.`,
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
