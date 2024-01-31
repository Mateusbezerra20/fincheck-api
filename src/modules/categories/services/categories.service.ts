import { Injectable } from '@nestjs/common';
import { CategoriesRepository } from 'src/shared/database/repositories/categories.repository';

@Injectable()
export class CategoriesService {
  constructor(private readonly categoryRepo: CategoriesRepository) {}

  findAllById(userId: string) {
    return this.categoryRepo.findMany({ where: { userId } });
  }
}
