import { Injectable, NotFoundException } from '@nestjs/common';
import { BankAccountsRepository } from 'src/shared/database/repositories/bank-accounts.repository';

@Injectable()
export class ValidateBankAccountOwnershipService {
  constructor(private readonly bankAccountsRepo: BankAccountsRepository) {}

  async validate(id: string, userId: string) {
    const isOwner = await this.bankAccountsRepo.findFirst({
      where: { id, userId },
    });

    if (!isOwner) {
      throw new NotFoundException('Bank Account not found!');
    }
  }
}
