import { Injectable } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class VectoringService {
  private genAI = new GoogleGenerativeAI('YOUR_GEMINI_API_KEY');
  private model = this.genAI.getGenerativeModel({
    model: 'text-embedding-004',
  });

  constructor(private prisma: PrismaService) {}

  async importFromJSON() {
    const filePath = path.join(process.cwd(), 'tech_data.json');
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const lines = fileContent.split('\n').filter((line) => line.trim() !== '');

    for (const line of lines) {
      const data = JSON.parse(line);

      // 1. Tokenization & Embedding happens here via API
      const result = await this.model.embedContent(data.content);
      const vector = result.embedding.values;

      // 2. Store in Vector DB using Raw SQL (Prisma requirement for vectors)
      await this.prisma.$executeRaw`
        INSERT INTO "TechPost" (title, image, content, language, repository, embedding)
        VALUES (
          ${data.title}, 
          ${data.image}, 
          ${data.content}, 
          ${data.language}, 
          ${data.repository}, 
          CAST(${vector} AS vector)
        )
      `;

      console.log(`Saved Post ID: ${data.id}`);
    }
    return { message: 'All 1000 posts embedded and stored!' };
  }
}
