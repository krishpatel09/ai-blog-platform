import { IsString, IsNotEmpty } from 'class-validator';

export class ClerkVerifyDto {
    @IsString()
    @IsNotEmpty()
    sessionId: string;
}
