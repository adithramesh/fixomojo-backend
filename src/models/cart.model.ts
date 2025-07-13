import mongoose, { Schema, Document } from "mongoose";

export interface ICartSubService {
  subServiceId: mongoose.Types.ObjectId; // Reference to sub-service (embedded in Service)
  subServiceName: string; // Denormalized for display
  serviceId: mongoose.Types.ObjectId; // Reference to parent service
  serviceName: string; // Denormalized for display
  quantity: number;
  price: number; // Price at the time of adding to cart
}

export interface ICart extends Document {
  userId: mongoose.Types.ObjectId;
  services: {
    serviceId: mongoose.Types.ObjectId;
    serviceName: string;
    subServices: ICartSubService[];
  }[];
  totalAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

const cartSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    services: [
      {
        serviceId: { type: Schema.Types.ObjectId, ref: "Service", required: true },
        serviceName: { type: String, required: true },
        subServices: [
          {
            subServiceId: { type: Schema.Types.ObjectId, required: true }, // Not referencing directly, as it's embedded
            subServiceName: { type: String, required: true },
            serviceId: { type: Schema.Types.ObjectId, ref: "Service", required: true },
            serviceName: { type: String, required: true },
            quantity: { type: Number, required: true, min: 1, default: 1 },
            price: { type: Number, required: true, min: 0 },
          },
        ],
      },
    ],
    totalAmount: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

// Pre-save hook to calculate totalAmount
// cartSchema.pre("save", function (next) {
//   this.totalAmount = this.services.reduce((total, service) => {
//     const serviceTotal = service.subServices.reduce(
//       (subTotal, subService) => subTotal + subService.quantity * subService.price,
//       0
//     );
//     return total + serviceTotal;
//   }, 0);
//   next();
// });

export default mongoose.model<ICart>("Cart", cartSchema);