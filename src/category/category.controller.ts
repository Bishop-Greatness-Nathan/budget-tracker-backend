import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { AuthGuard } from 'src/guards/auth.guard';

interface AuthenticatedRequest extends Request {
  user?: { userId: string; email: string; role: string };
}

@UseGuards(AuthGuard)
@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  createCategory(
    @Body() data: CreateCategoryDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const role = req.user?.role;
    return this.categoryService.createCategory({ data, role: role as string });
  }

  @Get()
  findAll() {
    return this.categoryService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoryService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() data: UpdateCategoryDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const role = req.user?.role;
    return this.categoryService.update({ id, data, role: role as string });
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    const role = req.user?.role;
    return this.categoryService.remove({ id, role: role as string });
  }
}
