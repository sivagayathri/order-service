import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument, OrderStatus } from './schemas/order.schema';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
  ) {}

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    const totalAmount = createOrderDto.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    const order = new this.orderModel({
      orderId: `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      ...createOrderDto,
      totalAmount,
      status: OrderStatus.PENDING,
    });

    return order.save();
  }

  async findAll(): Promise<Order[]> {
    return this.orderModel.find().sort({ createdAt: -1 }).exec();
  }

  async findOne(orderId: string): Promise<Order | null> {
    return this.orderModel.findOne({ orderId }).exec();
  }

  async findByCustomerId(customerId: number): Promise<Order[]> {
    return this.orderModel
      .find({ customerId })
      .sort({ createdAt: -1 })
      .exec();
  }

  async updateStatus(
    orderId: string,
    status: OrderStatus,
  ): Promise<Order | null> {
    return this.orderModel
      .findOneAndUpdate({ orderId }, { status }, { new: true })
      .exec();
  }

  async update(
    orderId: string,
    updateOrderDto: UpdateOrderDto,
  ): Promise<Order | null> {
    return this.orderModel
      .findOneAndUpdate({ orderId }, updateOrderDto, { new: true })
      .exec();
  }

  async cancel(orderId: string): Promise<Order | null> {
    return this.orderModel
      .findOneAndUpdate(
        { orderId, status: { $nin: [OrderStatus.SHIPPED, OrderStatus.DELIVERED] } },
        { status: OrderStatus.CANCELLED },
        { new: true },
      )
      .exec();
  }

  async delete(orderId: string): Promise<Order | null> {
    return this.orderModel.findOneAndDelete({ orderId }).exec();
  }
}
