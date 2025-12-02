import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Testimonial } from './testimonial.entity';
import { CreateTestimonialDto } from './dto/create-testimonial.dto';

@Injectable()
export class TestimonialsService {
  constructor(
    @InjectRepository(Testimonial)
    private readonly repo: Repository<Testimonial>,
  ) {}

  create(data: CreateTestimonialDto) {
    const testimonial = this.repo.create(data);
    return this.repo.save(testimonial);
  }

  findAll() {
    return this.repo.find({
      order: { createdAt: 'DESC' },
    });
  }
}
