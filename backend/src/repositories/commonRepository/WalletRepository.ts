import { IWallet } from "../../models/commonModel/WalletModel";
import { BaseRepository } from "./BaseRepository";
import Wallet from "../../models/commonModel/WalletModel";
import { HttpStatus } from "../../constants/Httpstatus";
import { MessageConstants } from "../../constants/MessageConstants";
import { AppError } from "../../utils/AppError";
import mongoose from "mongoose";
import { IWalletRepositoryInterface } from "../../interfaces/wallet/IWalletRepositoryInterface";

export class WalletRepository
  extends BaseRepository<IWallet>
  implements IWalletRepositoryInterface
{
  constructor() {
    super(Wallet);
  }

  async getWalletByUserId(userId: string): Promise<IWallet | null> {
    try {
      return await Wallet.findOne({ user_id: userId }).exec();
    } catch (error) {
      throw new AppError(
        HttpStatus.InternalServerError,
        MessageConstants.INTERNAL_SERVER_ERROR
      );
    }
  }

  async createWallet(userId: string): Promise<IWallet> {
    try {
      const wallet = new Wallet({ user_id: userId, balance: 0 });
      return await wallet.save();
    } catch (error) {
      throw new AppError(
        HttpStatus.InternalServerError,
        MessageConstants.INTERNAL_SERVER_ERROR
      );
    }
  }

  async addCredit(
    userId: string,
    amount: number,
    description: string,
    bookingId?: string
  ): Promise<IWallet> {
    try {
      let wallet = await Wallet.findOne({ user_id: userId });
      console.log(wallet);

      if (!wallet) {
        wallet = new Wallet({ user_id: userId, balance: 0 });
      }

      wallet.balance += amount;
      wallet.transactions.push({
        amount,
        type: "credit",
        description,
        booking_id: bookingId
          ? new mongoose.Types.ObjectId(bookingId)
          : undefined,
        createdAt: new Date(),
      });

      await wallet.save();
      // await session.commitTransaction();
      console.log(" from repo", wallet);
      return wallet;
    } catch (error) {
      // await session.abortTransaction();
      console.error("Wallet Save Error:", error);
      throw new AppError(
        HttpStatus.InternalServerError,
        MessageConstants.INTERNAL_SERVER_ERROR
      );
    }
  }

  async deductAmount(
    userId: string,
    amount: number,
    description: string,
    bookingId?: string
  ): Promise<IWallet> {
    
    try {
      const wallet = await Wallet.findOne({ user_id: userId })

      if (!wallet) {
        throw new AppError(
          HttpStatus.NotFound,
          MessageConstants.WALLET_NOT_FOUND
        );
      }

      if (wallet.balance < amount) {
        throw new AppError(
          HttpStatus.BadRequest,
          MessageConstants.INSUFFICIENT_BALANCE
        );
      }

      wallet.balance -= amount;
      // wallet.transactions.push({
      //   amount,
      //   type: "debit",
      //   description,
      //   booking_id: mongoose.isValidObjectId(bookingId)
      //     ? new mongoose.Types.ObjectId(bookingId)
      //     : undefined,
      //   createdAt: new Date(),
      // });
      wallet.transactions.push({
        amount,
        type: "debit",
        description,
        booking_id: bookingId ? new mongoose.Types.ObjectId(bookingId) : undefined,
        createdAt: new Date()
      });

      await wallet.save();
      return wallet;
    } catch (error) {
      console.error("Wallet deduction error:", error);
      if (error instanceof AppError) throw error;
      throw new AppError(
        HttpStatus.InternalServerError,
        MessageConstants.INTERNAL_SERVER_ERROR
      );
    }
  }

  // async deductAmount(
  //   userId: string,
  //   amount: number,
  //   description: string,
  //   bookingId?: string
  // ): Promise<IWallet> {
  //   const session = await mongoose.startSession();
  //   session.startTransaction();

  //   try {
  //     const wallet = await Wallet.findOne({ user_id: userId }).session(session);

  //     if (!wallet) {
  //       throw new AppError(
  //         HttpStatus.NotFound,
  //         MessageConstants.WALLET_NOT_FOUND
  //       );
  //     }

  //     if (wallet.balance < amount) {
  //       throw new AppError(
  //         HttpStatus.BadRequest,
  //         MessageConstants.INSUFFICIENT_BALANCE
  //       );
  //     }

  //     wallet.balance -= amount;
  //     wallet.transactions.push({
  //       amount,
  //       type: "debit",
  //       description,
  //       booking_id: bookingId ? new mongoose.Types.ObjectId(bookingId) : undefined
  //     });

  //     await wallet.save({ session });
  //     await session.commitTransaction();
  //     return wallet;
  //   } catch (error) {
  //     await session.abortTransaction();
  //     if (error instanceof AppError) throw error;
  //     throw new AppError(
  //       HttpStatus.InternalServerError,
  //       MessageConstants.INTERNAL_SERVER_ERROR
  //     );
  //   } finally {
  //     session.endSession();
  //   }
  // }
}
