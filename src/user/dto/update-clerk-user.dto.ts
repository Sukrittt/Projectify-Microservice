import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

class EmailAddressDto {
  @IsNumber()
  @ApiProperty({
    description: 'Timestamp when the email address was created.',
    example: 1734866835093,
  })
  created_at: number;

  @IsString()
  @ApiProperty({
    description: 'Email address.',
    example: 'sukrit.saha@bca.christuniversity.in',
  })
  email_address: string;

  @IsString()
  @ApiProperty({
    description: 'Unique identifier for the email address.',
    example: 'idn_2qZOsI0x5KgH04KRfjIWkmMdHg5',
  })
  id: string;

  @IsArray()
  @ApiProperty({
    description: 'Linked accounts associated with the email address.',
    example: [{ id: 'idn_2qZP0o4z0uD6ya5qfvgJU3x0BoV', type: 'oauth_google' }],
  })
  linked_to: { id: string; type: string }[];

  @IsBoolean()
  @ApiProperty({
    description: 'Indicates if the email matches an SSO connection.',
    example: false,
  })
  matches_sso_connection: boolean;

  @IsString()
  @ApiProperty({ description: 'Object type.', example: 'email_address' })
  object: string;

  @IsBoolean()
  @ApiProperty({
    description: 'Indicates if the email address is reserved.',
    example: false,
  })
  reserved: boolean;

  @IsNumber()
  @ApiProperty({
    description: 'Timestamp when the email address was last updated.',
    example: 1734866854060,
  })
  updated_at: number;

  @IsObject()
  @ApiProperty({
    description: 'Verification details for the email address.',
    example: {
      attempts: 1,
      expire_at: 1734867435971,
      status: 'verified',
      strategy: 'email_code',
    },
  })
  verification: {
    attempts: number | null;
    expire_at: number;
    status: string;
    strategy: string;
  };
}

class ExternalAccountDto {
  @IsString()
  @ApiProperty({
    description: 'Approved scopes for the external account.',
    example: 'email https://www.googleapis.com/auth/userinfo.email',
  })
  approved_scopes: string;

  @IsNumber()
  @ApiProperty({
    description: 'Timestamp when the external account was created.',
    example: 1734866903734,
  })
  created_at: number;

  @IsString()
  @ApiProperty({
    description: 'Email address associated with the external account.',
    example: 'sukrit.saha@bca.christuniversity.in',
  })
  email_address: string;

  @IsString()
  @ApiProperty({ description: 'Family name of the user.', example: '2241159' })
  family_name: string;

  @IsString()
  @ApiProperty({
    description: 'Given name of the user.',
    example: 'SUKRIT SAHA',
  })
  given_name: string;

  @IsString()
  @ApiProperty({
    description: 'Google ID for the external account.',
    example: '101285733584140932862',
  })
  google_id: string;

  @IsString()
  @ApiProperty({
    description: 'Unique identifier for the external account.',
    example: 'idn_2qZP0o4z0uD6ya5qfvgJU3x0BoV',
  })
  id: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'Label for the external account.',
    example: null,
  })
  label?: string;

  @IsString()
  @ApiProperty({ description: 'Object type.', example: 'google_account' })
  object: string;

  @IsString()
  @ApiProperty({
    description: 'Profile picture URL.',
    example: 'https://lh3.googleusercontent.com/a/ACg8ocKef0YVQ...',
  })
  picture: string;

  @IsObject()
  @ApiProperty({
    description: 'Public metadata associated with the external account.',
    example: {},
  })
  public_metadata: Record<string, any>;

  @IsNumber()
  @ApiProperty({
    description: 'Timestamp when the external account was last updated.',
    example: 1734866903734,
  })
  updated_at: number;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'Username associated with the external account.',
    example: null,
  })
  username?: string;

  @IsObject()
  @ApiProperty({
    description: 'Verification details for the external account.',
    example: { status: 'verified', strategy: 'oauth_google' },
  })
  verification: {
    attempts: number | null;
    expire_at: number;
    status: string;
    strategy: string;
  };
}

class EventAttributesDto {
  @IsObject()
  @ApiProperty({
    description: 'HTTP request details.',
    example: {
      client_ip: '',
      user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)...',
    },
  })
  http_request: { client_ip: string; user_agent: string };
}

class UserDataDto {
  @IsBoolean()
  @ApiProperty({
    description: 'Indicates if backup codes are enabled.',
    example: false,
  })
  backup_code_enabled: boolean;

  @IsBoolean()
  @ApiProperty({
    description: 'Indicates if the user is banned.',
    example: false,
  })
  banned: boolean;

  @IsBoolean()
  @ApiProperty({
    description: 'Indicates if the user can create organizations.',
    example: true,
  })
  create_organization_enabled: boolean;

  @IsNumber()
  @ApiProperty({
    description: 'Timestamp when the user was created.',
    example: 1734866854036,
  })
  created_at: number;

  @IsBoolean()
  @ApiProperty({
    description: 'Indicates if the user can delete themselves.',
    example: true,
  })
  delete_self_enabled: boolean;

  @IsArray()
  @ApiProperty({
    description: 'List of email addresses associated with the user.',
    type: [EmailAddressDto],
  })
  email_addresses: EmailAddressDto[];

  @IsArray()
  @ApiProperty({
    description: 'List of external accounts linked to the user.',
    type: [ExternalAccountDto],
  })
  external_accounts: ExternalAccountDto[];

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'First name of the user.',
    example: 'SUKRIT SAHA',
  })
  first_name?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ description: 'Last name of the user.', example: '2241159' })
  last_name?: string;

  @IsBoolean()
  @ApiProperty({
    description: 'Indicates if the user has an image.',
    example: false,
  })
  has_image: boolean;

  @IsString()
  @ApiProperty({
    description: 'Unique identifier for the user.',
    example: 'user_2qZOucZX1vml5KgNTHsnUL2uAhF',
  })
  id: string;

  @IsString()
  @ApiProperty({
    description: 'URL of the profile image.',
    example: 'https://www.gravatar.com/avatar?d=mp',
  })
  profile_image_url: string;

  @IsBoolean()
  @ApiProperty({
    description: 'Indicates if the password is enabled.',
    example: true,
  })
  password_enabled: boolean;

  @IsObject()
  @ApiProperty({
    description: 'Private metadata associated with the user.',
    example: {},
  })
  private_metadata: Record<string, any>;

  @IsObject()
  @ApiProperty({
    description: 'Public metadata associated with the user.',
    example: {},
  })
  public_metadata: Record<string, any>;

  @IsString()
  @ApiProperty({
    description: 'Primary email address ID.',
    example: 'idn_2qZOsI0x5KgH04KRfjIWkmMdHg5',
  })
  primary_email_address_id: string;

  @IsNumber()
  @ApiProperty({
    description: 'Timestamp when the user was last active.',
    example: 1734866854034,
  })
  last_active_at: number;

  @IsNumber()
  @ApiProperty({
    description: 'Timestamp when the user last signed in.',
    example: 1734866854044,
  })
  last_sign_in_at: number;
}

export class UpdateClerkUserDto {
  @IsObject()
  @ApiProperty({ description: 'The user data.', type: UserDataDto })
  data: UserDataDto;

  @IsObject()
  @ApiProperty({ description: 'Event attributes.', type: EventAttributesDto })
  event_attributes: EventAttributesDto;

  @IsString()
  @ApiProperty({ description: 'Object type.', example: 'event' })
  object: string;

  @IsNumber()
  @ApiProperty({
    description: 'Timestamp when the event occurred.',
    example: 1734866903809,
  })
  timestamp: number;

  @IsString()
  @ApiProperty({ description: 'Type of event.', example: 'user.updated' })
  type: string;
}
