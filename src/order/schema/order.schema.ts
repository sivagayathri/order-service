import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Order extends Document {
  @Prop({ required: true })
  userId: string;

  @Prop({
    type: [
      {
        productId: { type: String, required: true },
        quantity: { type: Number, required: true },
        priceAtPurchase: { type: Number, required: true },
      },
    ],
  })
  items: { productId: string; quantity: number; priceAtPurchase: number }[];

  @Prop({ required: true })
  totalAmount: number;

  @Prop({
    default: 'pending',
    enum: ['pending', 'processing', 'completed', 'cancelled'],
  })
  status: string;

  @Prop({ default: 'pending', enum: ['pending', 'paid', 'failed'] })
  paymentStatus: string;

  @Prop()
  paymentMethod: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
