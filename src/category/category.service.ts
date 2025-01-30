import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Model } from 'mongoose';
import { Category, CategoryDocument } from './category.schema';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name)
    private readonly categoryModel: Model<CategoryDocument>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto) {
    const { name } = createCategoryDto;
    const category = await this.categoryModel.findOne({ name });
    if (category) throw new BadRequestException('Category already exists');
    const newCategory = await this.categoryModel.create(createCategoryDto);
    return {
      status: 201,
      message: 'Category created successfully',
      data: newCategory,
    };
  }

  async findAll(query) {
    const { name } = query;
    const categories = await this.categoryModel
      .find()
      .where({
        name: new RegExp(name, 'i'),
      })
      .select('-__v');
    return {
      status: 200,
      length: categories.length,
      isEmpty: categories.length > 0 ? 'false' : 'true',
      data: categories,
    };
  }

  async findOne(id: string) {
    const category = await this.categoryModel.findById(id).select('-__v');
    if (!category) throw new NotFoundException('Category not found');
    return {
      status: 200,
      data: category,
    };
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    const category = await this.categoryModel.findById(id);
    if (!category) throw new NotFoundException('Category not found');
    const updatedCategory = await this.categoryModel
      .findByIdAndUpdate(id, updateCategoryDto, { new: true })
      .select('-__v');
    return {
      status: 201,
      message: 'Category updated successfully',
      data: updatedCategory,
    };
  }

  async remove(id: string) {
    const category = await this.categoryModel.findById({ _id: id });
    if (!category) throw new NotFoundException('Category not found');
    await this.categoryModel.findByIdAndDelete(id);
    return {
      status: 200,
      message: 'Category deleted successfully',
    };
  }
}
