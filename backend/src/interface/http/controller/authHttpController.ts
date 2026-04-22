import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiProperty,
} from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';
import { AuthService } from '../../../service/authService';
import { JwtAuthGuard } from '../../../infra/auth/jwtAuthGuard';
import { CurrentToken } from '../../../infra/auth/currentUser';

export class InitiateAuthDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email!: string;
}

export class LoginDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(1)
  @ApiProperty({ example: '123456' })
  credential!: string;
}

export class RegisterDto {
  @IsString()
  @MinLength(1)
  @ApiProperty({ example: 'John Doe' })
  name!: string;

  @IsEmail()
  @ApiProperty({ example: 'user@example.com' })
  email!: string;

  @IsString()
  @MinLength(1)
  @ApiProperty({ example: '123456' })
  credential!: string;
}

export class TokenResponseDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  token!: string;
}

@ApiTags('auth')
@Controller('auth')
export class AuthHttpController {
  constructor(private readonly authService: AuthService) {}

  @Post('initiate')
  @HttpCode(204)
  @ApiOperation({ summary: 'Send OTP to the given email address' })
  @ApiResponse({ status: 204, description: 'OTP sent successfully' })
  @ApiResponse({ status: 400, description: 'Invalid email' })
  async initiate(@Body() dto: InitiateAuthDto): Promise<void> {
    await this.authService.initiateAuth(dto.email);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login with email and OTP credential' })
  @ApiResponse({
    status: 201,
    description: 'JWT token returned',
    type: TokenResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Invalid or expired credential' })
  async login(@Body() dto: LoginDto): Promise<TokenResponseDto> {
    const token = await this.authService.login(dto.email, dto.credential);
    return { token };
  }

  @Post('register')
  @ApiOperation({
    summary: 'Register a new user with email and OTP credential',
  })
  @ApiResponse({
    status: 201,
    description: 'JWT token returned',
    type: TokenResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Invalid or expired credential' })
  async register(@Body() dto: RegisterDto): Promise<TokenResponseDto> {
    const token = await this.authService.register(
      dto.name,
      dto.email,
      dto.credential,
    );
    return { token };
  }

  @Post('logout')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout and revoke the current JWT token' })
  @ApiResponse({ status: 204, description: 'Logged out successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async logout(@CurrentToken() token: string): Promise<void> {
    await this.authService.logout(token);
  }
}
