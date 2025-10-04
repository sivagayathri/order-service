import { Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/order.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Order } from './schema/order.schema';
import { Model } from 'mongoose';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>,
    @InjectQueue('product-events') private productQueue: Queue,
  ) {}

  async create(createOrder: CreateOrderDto) {
    const order = new this.orderModel(createOrder);
    const savedOrder = await order.save();

    for (const item of createOrder.items) {
      await this.productQueue.add('decrease-stock', {
        productId: item.productId,
        quantity: item.quantity,
      });
    }

    return savedOrder;
  }
}
