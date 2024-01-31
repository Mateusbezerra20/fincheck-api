import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { TransactionsRepository } from 'src/shared/database/repositories/transactions.repository';
import { ValidateBankAccountOwnershipService } from '../bank-accounts/services/validate-bank-account-ownership.service';
import { ValidateCategoryOwnershipService } from '../categories/services/validate-category-ownership.service';
import { TransactionType } from './entities/Transaction';

@Injectable()
export class TransactionsService {
  constructor(
    private readonly transactionsRepo: TransactionsRepository,
    private readonly validateBankAccountOwnership: ValidateBankAccountOwnershipService,
    private readonly validateCategoryOwnership: ValidateCategoryOwnershipService,
  ) {}

  async create(userId: string, createTransactionDto: CreateTransactionDto) {
    const { bankAccountId, categoryId, name, date, type, value } =
      createTransactionDto;

    await this.validateEntitiesOwnership({ bankAccountId, categoryId, userId });

    return this.transactionsRepo.create({
      data: {
        userId,
        bankAccountId,
        categoryId,
        name,
        date,
        type,
        value,
      },
    });
  }

  findAll(
    userId: string,
    filters: {
      month: number;
      year: number;
      bankAccountId?: string;
      type?: TransactionType;
    },
  ) {
    return this.transactionsRepo.findMany({
      where: {
        userId,
        bankAccountId: filters.bankAccountId,
        type: filters.type,
        date: {
          gte: new Date(Date.UTC(filters.year, filters.month)),
          lt: new Date(Date.UTC(filters.year, filters.month + 1)),
        },
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            icon: true,
          }
        }
      }
    });
  }

  async update(
    id: string,
    userId: string,
    updateTransactionDto: UpdateTransactionDto,
  ) {
    const { bankAccountId, categoryId, name, date, type, value } =
      updateTransactionDto;
    await this.validateEntitiesOwnership({
      bankAccountId,
      categoryId,
      userId,
      id,
    });

    return this.transactionsRepo.update({
      where: { id },
      data: {
        bankAccountId,
        categoryId,
        name,
        date,
        type,
        value,
      },
    });
  }

  async remove(id: string, userId: string) {
    await this.validateTransactionOwnership(id, userId);

    await this.transactionsRepo.delete({
      where: { id },
    });

    return null;
  }

  private async validateEntitiesOwnership({
    bankAccountId,
    categoryId,
    userId,
    id,
  }: {
    bankAccountId: string;
    categoryId: string;
    userId: string;
    id?: string;
  }) {
    await Promise.all([
      id && (await this.validateTransactionOwnership(id, userId)),
      await this.validateBankAccountOwnership.validate(bankAccountId, userId),
      await this.validateCategoryOwnership.validate(categoryId, userId),
    ]);
  }

  private async validateTransactionOwnership(
    transactionId: string,
    userId: string,
  ) {
    const isOwner = await this.transactionsRepo.findFirst({
      where: { id: transactionId, userId },
    });

    if (!isOwner) {
      throw new NotFoundException('Transaction not found!');
    }
  }
}
