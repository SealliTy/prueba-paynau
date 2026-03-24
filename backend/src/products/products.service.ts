import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
  ) {}

  findAll(): Promise<Product[]> {
    return this.productsRepository.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productsRepository.findOne({ where: { id } });
    if (!product)
      throw new NotFoundException(`No se encontro el producto ${id}`);
    return product;
  }

  async create(dto: CreateProductDto): Promise<Product> {
    await this.assertNameUnique(dto.name);
    const product = this.productsRepository.create(dto);
    return this.productsRepository.save(product);
  }

  async update(id: string, dto: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(id);
    if (dto.name && dto.name !== product.name) {
      await this.assertNameUnique(dto.name, id);
    }
    Object.assign(product, dto);
    return this.productsRepository.save(product);
  }

  private async assertNameUnique(
    name: string,
    excludeId?: string,
  ): Promise<void> {
    const existing = await this.productsRepository.findOne({
      where: { name: ILike(name) },
      withDeleted: true,
    });
    if (existing && existing.id !== excludeId)
      throw new ConflictException(`El producto "${name}" ya existe`);
  }
}
