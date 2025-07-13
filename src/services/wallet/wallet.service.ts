import { inject, injectable } from "inversify";
import { IWalletService } from "./wallet.service.interface";
import { TYPES } from "../../types/types";
import { WalletRepository } from "../../repositories/wallet/wallet.repository";
import { IWallet } from "../../models/wallet.model";
import { stripe } from "../../config/stripe.config";
import { TransactionService } from "../transaction/transaction.service";

@injectable()
export class WalletService implements IWalletService {
    constructor(
         @inject(TYPES.WalletRepository) private _walletRepository:WalletRepository,
         @inject(TYPES.TransactionService) private _transactionService:TransactionService
    ){}

//     async credit(userId: string, share: number, role: "partner" | "admin" | "user" | undefined, referenceId: string): Promise<{success: boolean, message: string, wallet?: IWallet}> {
//     try {
//         let wallet = await this._walletRepository.findWalletByUserId(userId);
        
//         if (!wallet) {
//             wallet = await this._walletRepository.createWallet(userId, role || "partner", share, referenceId);
//         } else {
//             wallet.balance += share;
//             await wallet.save();
//         }
        
//         return {
//             success: true,
//             message: "Wallet is credited",
//             wallet: wallet
//         };
//     // eslint-disable-next-line @typescript-eslint/no-explicit-any
//     } catch (error: any) {
//         console.error("Failed to credit the share:", error);
//         return {
//             success: false,
//             message: `Failed to credit the share: ${error.message || error}`,
//         };
//     }
// }

async credit(userId: string, amount: number, role: "partner" | "admin" | "user" | undefined, referenceId: string): Promise<{ success: boolean, message: string, wallet?: IWallet }> {
  try {
    let wallet = await this._walletRepository.findWalletByUserId(userId);

    if (!wallet) {
      if (amount < 0) {
        return { success: false, message: "Insufficient balance: wallet doesn't exist." };
      }
      wallet = await this._walletRepository.createWallet(userId, role || "partner", amount, referenceId);
    } else {
      if (wallet.balance + amount < 0) {
        return { success: false, message: "Insufficient balance in wallet." };
      }
      wallet.balance += amount;
      await wallet.save();
    }

    return {
      success: true,
      message: amount >= 0 ? "Wallet credited successfully." : "Wallet debited successfully.",
      wallet
    };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Wallet update failed:", error);
    return {
      success: false,
      message: `Wallet update failed: ${error.message || error}`,
    };
  }
}


async getWallet(userId: string): Promise<{success: boolean, message: string, wallet?: IWallet}> {
    try {
        const wallet = await this._walletRepository.findWalletByUserId(userId);
        
        if (!wallet) {
            return {
                success: false,
                message: 'Wallet not found'
            };
        }
        
        return {
            success: true,
            message: 'Wallet retrieved successfully',
            wallet: wallet
        };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        console.error("Error fetching wallet:", error);
        return {
            success: false,
            message: `Failed to fetch wallet: ${error.message || error}`,
        };
    }
}

async walletRecharge(userId:string, amount: number): Promise<{ success: boolean; checkoutUrl?: string; message: string; }> {
   try {
      if (!userId || !amount || amount < 10) {
        return {
          success: false,
          message: 'Invalid user ID or amount',
        };
      }
          const amountInCents = Math.round(amount * 100);
          const session = await stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          mode: 'payment',
          line_items: [
            {
              price_data: {
                currency: 'inr',
                product_data: {
                  name: 'Fixomojo Wallet Recharge',
                },
                unit_amount: amountInCents,
              },
              quantity: 1,
            },
          ],
          metadata: {
            userId,
            amount: amount.toString(),
            purpose: 'Wallet Recharge',
          },
          success_url: `http://localhost:4200/payment-success?session_id={CHECKOUT_SESSION_ID}&type=wallet`,
          cancel_url: `http://localhost:4200/payment-cancelled`,
        });

    return {
      success: true,
      checkoutUrl: session.url ?? '',
      message: 'Wallet recharge initiated. Proceed to payment.',
    };

   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   } catch (error: any) {
    return {
      success: false,
      message: `Error in recharging wallet service layer: ${error.message || error}`,
    };
  }
 }

 async walletRechargeConfirm(sessionId: string): Promise<{ success: boolean; message: string; }> {
   try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const userId = session.metadata?.userId;
    if(!userId){
        return { success: false, message: 'Payment not initiated by user.' };
    }
    // console.log("session", session);
    
    if (session.payment_status !== 'paid') {
     
      return { success: false, message: 'Payment not completed.' };
    } 
     const existingTxn = await this._transactionService.getTransactionByReference(sessionId);
    if (existingTxn) {
      console.log("inside existing txn", existingTxn);
      return { success: true, message: 'Wallet already credited.' };
    } else{
        try {
        await this.credit(userId, parseInt(session.metadata?.amount as string), 'user', "wallet-recharge");    
        await this._transactionService.logTransaction({
          userId: userId,
          amount: parseInt(session.metadata?.amount as string),
          transactionType: 'credit',
          purpose: "wallet-topup",
          referenceId: sessionId,
          role:"user"
        });
      } catch (logError) {
        console.error("Error logging transaction:", logError);
        // Optionally, you can handle this error further, e.g., update booking status
      }
      return { success: true, message: 'Wallet successfully credited.' };
    }
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   } catch (error: any) {
    return {
      success: false,
      message: `Error in wallet recharge confirmation service layer : ${error.message || error}`,
    };
  }
 }
 }
