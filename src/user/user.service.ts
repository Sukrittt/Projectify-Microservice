import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { ApiResponse } from 'src/types/interfaces/api-response';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async createUser(createUserDto: CreateUserDto): Promise<ApiResponse> {
    try {
      const { data } = createUserDto;

      const user = await this.prisma.user.create({
        data: {
          clerkId: data.id,
          firstName: data.first_name,
          lastName: data.last_name,
          birthday: data.birthday,
          gender: data.gender,
          primaryEmailAddressId: data.primary_email_address_id,
          profileImageUrl: data.image_url,
          username: data.username,
        },
        select: { id: true },
      });

      await this.prisma.emailAddress.createMany({
        data: data.email_addresses.map((address) => ({
          email: address.email_address,
          addressId: address.id,
          userId: user.id,
        })),
      });

      return {
        message: 'User created successfully',
        data: user,
      };
    } catch (error) {
      throw new InternalServerErrorException({
        message: error.message,
        error: 'Failed to create user',
      });
    }
  }

  async updateUser(
    updateUserDto: UpdateUserDto,
    rawClerkId?: string,
  ): Promise<ApiResponse> {
    try {
      const { data } = updateUserDto;

      const clerkId = rawClerkId ?? data.id;

      if (!clerkId) {
        throw new BadRequestException({
          message: 'Clerk id needs to be passed.',
        });
      }

      const existingUser = await this.prisma.user.findFirst({
        where: { clerkId },
        select: { id: true },
      });

      if (!existingUser) {
        throw new NotFoundException({
          message: "We couldn't find your account.",
        });
      }

      await this.prisma.user.update({
        where: { clerkId },
        data: {
          ...data,
        },
      });

      return {
        message: 'User updated successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException({
        message: error.message,
        error: 'Failed to create user',
      });
    }
  }

  async getOnboardingStatus(clerkId: string): Promise<ApiResponse> {
    try {
      const existingUser = await this.prisma.user.findFirst({
        where: {
          clerkId,
        },
        select: { avatarConfig: true },
      });

      if (!existingUser) {
        throw new NotFoundException({
          message: "We couldn't find your account.",
        });
      }

      return {
        message: 'Onboarding status fetched successfully',
        data: {
          status: !!existingUser.avatarConfig,
        },
      };
    } catch (error) {
      throw new InternalServerErrorException({
        message: error.message,
        error: 'Failed to fetch onboarding status.',
      });
    }
  }
}
