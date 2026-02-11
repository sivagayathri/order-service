import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto, UpdateOrderStatusDto } from './dto/update-order.dto';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  async create(@Body() createOrderDto: CreateOrderDto) {
    return this.orderService.create(createOrderDto);
  }

  @Get()
  async findAll(@Query('customerId') customerId?: string) {
    if (customerId) {
      return this.orderService.findByCustomerId(parseInt(customerId));
    }
    return this.orderService.findAll();
  }

  @Get(':orderId')
  async findOne(@Param('orderId') orderId: string) {
    const order = await this.orderService.findOne(orderId);
    if (!order) {
      throw new HttpException('Order not found', HttpStatus.NOT_FOUND);
    }
    return order;
  }

  @Put(':orderId')
  async update(
    @Param('orderId') orderId: string,
    @Body() updateOrderDto: UpdateOrderDto,
  ) {
    const order = await this.orderService.update(orderId, updateOrderDto);
    if (!order) {
      throw new HttpException('Order not found', HttpStatus.NOT_FOUND);
    }
    return order;
  }

  @Put(':orderId/status')
  async updateStatus(
    @Param('orderId') orderId: string,
    @Body() updateStatusDto: UpdateOrderStatusDto,
  ) {
    const order = await this.orderService.updateStatus(
      orderId,
      updateStatusDto.status,
    );
    if (!order) {
      throw new HttpException('Order not found', HttpStatus.NOT_FOUND);
    }
    return order;
  }

  @Put(':orderId/cancel')
  async cancel(@Param('orderId') orderId: string) {
    const order = await this.orderService.cancel(orderId);
    if (!order) {
      throw new HttpException(
        'Order not found or cannot be cancelled',
        HttpStatus.BAD_REQUEST,
      );
    }
    return order;
  }

  @Delete(':orderId')
  async delete(@Param('orderId') orderId: string) {
    const order = await this.orderService.delete(orderId);
    if (!order) {
      throw new HttpException('Order not found', HttpStatus.NOT_FOUND);
    }
    return { message: 'Order deleted successfully' };
  }
}
