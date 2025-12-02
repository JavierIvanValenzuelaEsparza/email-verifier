import { IsInt, IsNotEmpty, Max, Min } from 'class-validator';

export class CreateTestimonialDto {
  @IsNotEmpty()
  fullName: string;

  @IsNotEmpty()
  company: string;

  @IsNotEmpty()
  projectType: string;

  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsNotEmpty()
  opinion: string;
}
