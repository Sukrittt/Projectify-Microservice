import { Injectable, InternalServerErrorException } from '@nestjs/common';

import { CreateUserDto } from './dto/create-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
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
          primaryPhoneNumberId: data.primary_phone_number_id,
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
        message: 'Failed to create user',
        error: error.message,
      });
    }
  }
}
