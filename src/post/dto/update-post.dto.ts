import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class UpdatePostDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsNotEmpty()
    content: string;

    @IsBoolean()
    @IsNotEmpty()
    isPublish: boolean;
}
