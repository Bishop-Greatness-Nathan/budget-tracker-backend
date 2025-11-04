import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UnauthorizedException,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { Request } from 'express';
import { AuthGuard } from 'src/guards/auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { ChangePasswordDto } from './dto/change-password.dto';

export interface AuthenticatedRequest extends Request {
  user?: { userId: string; email: string; role: string };
}

@UseGuards(AuthGuard)
@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get('current-user')
  async currentUser(@Req() req: AuthenticatedRequest) {
    const userId = req.user?.userId;

    if (!userId) throw new UnauthorizedException('User not authenticated');
    return this.userService.currentUser(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Patch('change-password')
  changePassword(
    @Body() data: ChangePasswordDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const id = req.user?.userId;
    return this.userService.changePassword({ ...data, id: id as string });
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('image'))
  async update(
    @UploadedFile() file: Express.Multer.File,
    @Param('id') id: string,
    @Body() data: UpdateUserDto,
  ) {
    let imageUrl = '';
    let newData = data;

    if (file) {
      imageUrl = await this.cloudinaryService.uploadImage(file);
      newData = { ...data, image: imageUrl };
    }
    return this.userService.update({ id, data: newData });
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}
