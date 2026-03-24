import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Product } from '../products/entities/product.entity';
import { ProductsService } from '../products/products.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderItem } from './entities/order-item.entity';
import { Order } from './entities/order.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly productsService: ProductsService,
  ) {}

  findAll(): Promise<Order[]> {
    return this.ordersRepository.find({
      relations: ['items', 'items.product'],
      order: { createdAt: 'DESC' },
    });
  }

  async create(dto: CreateOrderDto): Promise<Order> {
    const resolvedItems: { product: Product; quantity: number }[] = [];

    for (const itemDto of dto.items) {
      const product = await this.productsService.findOne(itemDto.productId);

      if (product.stock < itemDto.quantity) {
        throw new BadRequestException(
          `Stock insuficiente para "${product.name}". Disponible: ${product.stock}, solicitado: ${itemDto.quantity}`,
        );
      }

      resolvedItems.push({ product, quantity: itemDto.quantity });
    }

    return this.dataSource.transaction(async (manager) => {
      let total = 0;
      const items: OrderItem[] = [];

      for (const { product, quantity } of resolvedItems) {
        await manager.decrement(Product, { id: product.id }, 'stock', quantity);

        items.push(
          manager.create(OrderItem, {
            product,
            quantity,
            unitPrice: product.price,
          }),
        );

        total += Number(product.price) * quantity;
      }

      const order = manager.create(Order, { items, total });
      return manager.save(Order, order);
    });
  }
}
