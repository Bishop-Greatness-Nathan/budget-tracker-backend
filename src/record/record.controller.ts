import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Req,
} from '@nestjs/common';
import { RecordService } from './record.service';
import { CreateRecordDto } from './dto/create-record.dto';
import { UpdateRecordDto } from './dto/update-record.dto';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from 'src/guards/auth.guard';
import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  user?: { userId: string; email: string; role: string };
}

@UseGuards(AuthGuard)
@Controller('record')
export class RecordController {
  constructor(
    private readonly recordService: RecordService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  async createRecord(
    @UploadedFile() file: Express.Multer.File,
    @Body() data: CreateRecordDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const createdBy = req.user?.userId as string;

    let imageUrl = '';
    let newData = { ...data, createdBy };

    if (file) {
      imageUrl = await this.cloudinaryService.uploadImage(file);
      newData = { ...newData, image: imageUrl };
    }

    return this.recordService.createRecord(newData);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('image'))
  async update(
    @UploadedFile() file: Express.Multer.File,
    @Body() data: UpdateRecordDto,
    @Param('id') id: string,
  ) {
    let imageUrl = '';
    let newData = data;

    if (file) {
      imageUrl = await this.cloudinaryService.uploadImage(file);
      newData = { ...data, image: imageUrl };
    }

    return this.recordService.editRecord({ data: newData, id });
  }

  @Get()
  findAll(@Req() req: AuthenticatedRequest) {
    const query = req.query;
    return this.recordService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.recordService.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.recordService.remove(+id);
  }
}
