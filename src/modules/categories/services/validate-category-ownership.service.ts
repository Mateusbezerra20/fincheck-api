import { Injectable, NotFoundException } from '@nestjs/common';
import { CategoriesRepository } from 'src/shared/database/repositories/categories.repository';

@Injectable()
export class ValidateCategoryOwnershipService {
  constructor(private readonly categoriesRepo: CategoriesRepository) {}

  async validate(id: string, userId: string) {
    const isOwner = await this.categoriesRepo.findFirst({
      where: { id, userId },
    });

    if (!isOwner) {
      throw new NotFoundException('Category not found!');
    }
  }
}
