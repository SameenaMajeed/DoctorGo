// controllers/WalletController.ts
import { Request, Response } from "express";
import { WalletRepository } from "../../repositories/commonRepository/WalletRepository";
import { HttpStatus } from "../../constants/Httpstatus";
import { MessageConstants } from "../../constants/MessageConstants";
import { AppError } from "../../utils/AppError";
import { sendError, sendResponse } from "../../utils/responseUtils";

export class WalletController {
  private _walletRepo: WalletRepository;

  constructor() {
    this._walletRepo = new WalletRepository();
  }

  async getWallet(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.data?.id; 
      if (!userId)
        throw new AppError(
          HttpStatus.Unauthorized,
          MessageConstants.UNAUTHORIZED
        );

      const wallet = await this._walletRepo.getWalletByUserId(userId);
      if (!wallet) {
        // Create wallet if not exists
        const newWallet = await this._walletRepo.createWallet(userId);
        sendResponse(res, HttpStatus.OK, MessageConstants.SUCCESS, newWallet);
        return;
      }

      sendResponse(res, HttpStatus.OK, MessageConstants.SUCCESS, wallet);
    } catch (error) {
      if (error instanceof AppError) {
        sendError(res, error.status, error.message);
      } else {
        sendError(
          res,
          HttpStatus.InternalServerError,
          MessageConstants.INTERNAL_SERVER_ERROR
        );
      }
    }
  }

  async getWalletBalance(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.data?.id;
      if (!userId)
        throw new AppError(
          HttpStatus.Unauthorized,
          MessageConstants.UNAUTHORIZED
        );

      const wallet = await this._walletRepo.getWalletByUserId(userId);
      if (!wallet) {
        // If wallet doesn't exist, create one with zero balance
        const newWallet = await this._walletRepo.createWallet(userId);
        sendResponse(res, HttpStatus.OK, MessageConstants.SUCCESS, {
          balance: 0,
        });
        return;
      }

      sendResponse(res, HttpStatus.OK, MessageConstants.SUCCESS, {
        balance: wallet.balance,
      });
    } catch (error) {
      if (error instanceof AppError) {
        sendError(res, error.status, error.message);
      } else {
        sendError(
          res,
          HttpStatus.InternalServerError,
          MessageConstants.INTERNAL_SERVER_ERROR
        );
      }
    }
  }
}
