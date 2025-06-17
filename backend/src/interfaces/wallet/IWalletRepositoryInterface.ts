import { IWallet } from '../../models/commonModel/WalletModel';

export interface IWalletRepositoryInterface {
  getWalletByUserId(userId: string): Promise<IWallet | null> 
  createWallet(userId: string): Promise<IWallet>
  addCredit(
    userId: string,
    amount: number,
    description: string,
    bookingId?: string
  ): Promise<IWallet>
  deductAmount(
    userId: string,
    amount: number,
    description: string,
    bookingId?: string
  ): Promise<IWallet>
}
