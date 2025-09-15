
export const TYPES={
    
    IPasswordService : Symbol.for("IPassWordService"),
    
    IOtpService : Symbol.for("IOtpService"),
    IOtpRepository : Symbol.for("IOtpRepository"),

    IAuthService : Symbol.for("IAuthService"),
    IAuthController : Symbol.for("IAuthController"),
    AuthRoutes : Symbol.for("AuthRoutes"),

    IUserRepository  : Symbol.for("IUserRepository"),
    IUserService : Symbol.for("IUserService"),
    IUserController : Symbol.for("IUserController"),
    UserRoutes : Symbol.for("UserRoutes"),
    
    IAdminService : Symbol.for("IAdminService"),
    IAdminController : Symbol.for("IAdminController"),
    AdminRoutes : Symbol.for("AdminRoutes"),

    IServiceRepository : Symbol.for("IServiceRepository"),
    ISubServiceRepository: Symbol.for("ISubServiceRepository"),

    ITimeSlotService : Symbol.for("ITimeSlotService"), 
    ITimeSlotController : Symbol.for("ITimeSlotController"),
       

    PartnerRoutes : Symbol.for("PartnerRoutes"),
   
    IBookingRepository : Symbol.for("IBookingRepository"),
    IBookingService : Symbol.for("IBookingService"),
    IBookingController : Symbol.for("IBookingController"),
    BookingRoutes : Symbol.for("BookingRoutes"),
  

    IWalletRepository:Symbol.for("IWalletRepository"),
    IWalletService:Symbol.for("IWalletService"),
    IWalletController:Symbol.for("IWalletController"),
    WalletRoutes : Symbol.for("WalletRoutes"),
    
    ITransactionRepository: Symbol.for("ITransactionRepository"),
    ITransactionService: Symbol.for("ITransactionService"),
    ITransactionController: Symbol.for("ITransactionController"),
    TransactionRoutes: Symbol.for("TransactionRoutes"),

    IChatRepository: Symbol.for("IChatRepository"),
    IChatService: Symbol.for("IChatService"),
    IChatController: Symbol.for("IChatController"),
    ChatRoutes: Symbol.for("ChatRoutes"),

    INotificationRepository: Symbol.for("INotificationRepository"),
    INotificationService: Symbol.for("INotificationService"),
    INotificationController: Symbol.for("INotificationController"),
    NotificationRoutes: Symbol.for("NotificatonRoutes"),

    IOfferRepository: Symbol.for("IOfferRepository"),
    IOfferService: Symbol.for("IOfferService"),
    IOfferController: Symbol.for("IOfferController"),
    OfferRoutes: Symbol.for("OfferRoutes"),


    SocketConfig: Symbol.for('SocketConfig'),

    IStreamService: Symbol.for('IStreamService')
}