import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schema/user.schema';
import { Model } from 'mongoose';
import { Request } from 'express';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly authService: AuthService,
  ) {}

  async currentUser(userId: string) {
    const user = await this.userModel
      .findById(userId)
      .select('-password')
      .select('-email');
    if (!user) throw new NotFoundException('User not found');

    return user;
  }

  async findAll() {
    return await this.userModel.find({});
  }

  async findOne(id: string) {
    const existingUser = await this.userModel.findById(id);
    if (!existingUser) throw new NotFoundException('user not found');

    return existingUser;
  }

  async update({ id, data }: { id: string; data: UpdateUserDto }) {
    await this.findOne(id);
    return await this.userModel.findByIdAndUpdate(id, data, {
      runValidators: true,
      new: true,
    });
  }

  async changePassword({
    oldPassword,
    newPassword,
    id,
  }: {
    oldPassword: string;
    newPassword: string;
    id: string;
  }) {
    if (!oldPassword || !newPassword)
      throw new BadRequestException('Please provide all values');

    if (oldPassword === newPassword)
      throw new BadRequestException('Passwords must be different');

    const user = await this.userModel.findOne({ _id: id });
    if (!user) throw new NotFoundException('User does not exist');

    const passwordCorrect = await this.authService.confirmPassword(
      oldPassword,
      user.password,
    );

    if (!passwordCorrect)
      throw new UnauthorizedException('Authentication invalid');

    const changedPassword = await this.authService.encodePassword(newPassword);
    user.password = changedPassword;
    await user.save();

    return `password changed successfully`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
