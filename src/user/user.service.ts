import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { User } from '@prisma/client';

import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { UpdateUserDto } from 'src/user/dto/update-user.dto';
import { ApiResponse } from 'src/types/interfaces/api-response';
import { UpdateClerkUserDto } from 'src/user/dto/update-clerk-user.dto';

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

      const promises = [
        this.prisma.emailAddress.createMany({
          data: data.email_addresses.map((address) => ({
            email: address.email_address,
            addressId: address.id,
            userId: user.id,
          })),
        }),
        this.prisma.additionalUserInfo.create({
          data: {
            userId: user.id,
          },
        }),
      ];

      await Promise.all(promises);

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
    clerkId: string,
    updateUserDto: UpdateUserDto,
  ): Promise<ApiResponse> {
    try {
      const { data } = updateUserDto;

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
  async getUserInfo(
    clerkId: string,
    attributes: string[],
  ): Promise<ApiResponse> {
    try {
      const validAttributes: (keyof User)[] = [
        'id',
        'firstName',
        'lastName',
        'username',
        'gender',
        'clerkId',
        'profileImageUrl',
        'avatarConfig',
        'birthday',
        'primaryEmailAddressId',
        'createdAt',
        'updatedAt',
      ];

      const selectedAttributes = attributes.filter((attr) =>
        validAttributes.includes(attr as any),
      );

      if (selectedAttributes.length === 0) {
        throw new BadRequestException({
          message: 'No valid attributes specified to fetch.',
        });
      }

      const existingUser = await this.prisma.user.findFirst({
        where: {
          clerkId,
        },
        select: selectedAttributes.reduce(
          (acc, attr) => {
            acc[attr] = true;
            return acc;
          },
          {} as Record<string, boolean>,
        ),
      });

      if (!existingUser) {
        throw new NotFoundException({
          message: "We couldn't find your account.",
        });
      }

      return {
        message: 'User info fetched successfully',
        data: existingUser,
      };
    } catch (error) {
      throw new InternalServerErrorException({
        message: error.message,
        error: 'Failed to fetch onboarding status.',
      });
    }
  }

  async updateClerkUser(
    updateClerkUserDto: UpdateClerkUserDto,
  ): Promise<ApiResponse> {
    try {
      const { data } = updateClerkUserDto;

      const clerkId = data.id;

      const existingUser = await this.prisma.user.findFirst({
        where: {
          clerkId,
        },
        select: { id: true },
      });

      if (!existingUser) {
        throw new NotFoundException({
          message: "We couldn't find your account.",
        });
      }

      const user = await this.prisma.user.update({
        where: { clerkId },
        data: {
          firstName: data.first_name,
          lastName: data.last_name,
          profileImageUrl: data.profile_image_url,
          primaryEmailAddressId: data.primary_email_address_id,
        },
      });

      return {
        message: 'User updated successfully',
        data: user,
      };
    } catch (error) {
      throw new InternalServerErrorException({
        message: error.message,
        error: 'Failed to update user through clerk webhook.',
      });
    }
  }
}
