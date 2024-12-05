import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

class ClerkUserDto {
  @IsString()
  @ApiProperty({
    description: 'Unique identifier for the user.',
    example: 'user_29w83sxmDNGwOuEthce5gg56FcC',
  })
  id: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'First name of the user.',
    example: 'Example',
  })
  first_name?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'Username of the user.',
    example: 'example',
  })
  username?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'Last name of the user.',
    example: 'Example',
  })
  last_name?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'Birthday of the user.',
    example: '',
  })
  birthday?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'Gender of the user.',
    example: '',
  })
  gender?: string;

  @IsArray()
  @ApiProperty({
    description: 'List of email addresses associated with the user.',
    example: [
      {
        email_address: 'example@example.org',
        id: 'idn_29w83yL7CwVlJXylYLxcslromF1',
        object: 'email_address',
        verification: { status: 'verified', strategy: 'ticket' },
      },
    ],
  })
  email_addresses: {
    email_address: string;
    id: string;
    object: string;
    verification: { status: string; strategy: string };
  }[];

  @IsString()
  @ApiProperty({
    description: 'Primary email address ID.',
    example: 'idn_29w83yL7CwVlJXylYLxcslromF1',
  })
  primary_email_address_id: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'Primary phone number ID.',
    example: null,
  })
  primary_phone_number_id?: string;

  @IsBoolean()
  @ApiProperty({
    description: 'Indicates if the user has enabled two-factor authentication.',
    example: false,
  })
  two_factor_enabled: boolean;

  @IsNumber()
  @ApiProperty({
    description: 'Timestamp when the user was created.',
    example: 1654012591514,
  })
  created_at: number;

  @IsNumber()
  @ApiProperty({
    description: 'Timestamp when the user last signed in.',
    example: 1654012591514,
  })
  last_sign_in_at: number;

  @IsString()
  @ApiProperty({
    description: 'URL of the user profile image.',
    example: 'https://www.gravatar.com/avatar?d=mp',
  })
  profile_image_url: string;

  @IsString()
  @ApiProperty({
    description: 'Image URL of the user.',
    example: 'https://img.clerk.com/xxxxxx',
  })
  image_url: string;

  @IsBoolean()
  @ApiProperty({
    description: 'Indicates if the password is enabled for the user.',
    example: true,
  })
  password_enabled: boolean;

  @IsOptional()
  @ApiProperty({
    description: 'External accounts linked to the user.',
    example: [],
  })
  external_accounts?: any[];

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'External ID associated with the user.',
    example: '567772',
  })
  external_id?: string;

  @IsOptional()
  @ApiProperty({
    description: 'Private metadata associated with the user.',
    example: {},
  })
  private_metadata?: Record<string, any>;

  @IsOptional()
  @ApiProperty({
    description: 'Public metadata associated with the user.',
    example: {},
  })
  public_metadata?: Record<string, any>;
}

export class CreateUserDto {
  @IsObject()
  @ApiProperty({
    description: 'The user data from Clerk.',
    type: ClerkUserDto,
  })
  data: ClerkUserDto;
}
