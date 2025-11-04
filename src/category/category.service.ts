import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Category } from './schema/category.schema';
import { Model } from 'mongoose';

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<Category>,
  ) {}

  async createCategory({
    data,
    role,
  }: {
    data: CreateCategoryDto;
    role: string;
  }) {
    if (!data.name)
      throw new BadRequestException('Please provide category name');
    if (role !== 'admin')
      throw new UnauthorizedException(
        'Not authorized to perform this operation',
      );

    const alreadyExists = await this.categoryModel.findOne({ name: data.name });

    if (alreadyExists)
      throw new BadRequestException('This category already exists');

    return await this.categoryModel.create(data);
  }

  async findAll() {
    const categories = await this.categoryModel.find({});
    return categories;
  }

  async findOne(id: string) {
    const category = await this.categoryModel.findById(id);
    return category;
  }

  async update({
    data,
    role,
    id,
  }: {
    data: UpdateCategoryDto;
    role: string;
    id: string;
  }) {
    if (!data.name)
      throw new BadRequestException('Please provide category name');
    if (role !== 'admin')
      throw new UnauthorizedException(
        'Not authorized to perform this operation',
      );

    const category = await this.categoryModel.findById(id);
    if (!category) throw new NotFoundException(`No category with id: ${id}`);

    const newCategory = await this.categoryModel.findByIdAndUpdate(id, data, {
      runValidators: true,
      new: true,
    });

    return newCategory;
  }

  async remove({ id, role }: { id: string; role: string }) {
    if (role !== 'admin')
      throw new UnauthorizedException(
        'Not authorized to perform this operation',
      );

    const category = await this.categoryModel.findById(id);

    if (!category) throw new NotFoundException(`No category with id: ${id}`);

    return await this.categoryModel.findByIdAndDelete(id);
  }
}
