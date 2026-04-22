import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';
import { UserService } from '../../../service/userSerivice';
import { JwtAuthGuard } from '../../../infra/auth/jwtAuthGuard';
import { CurrentUser } from '../../../infra/auth/currentUser';
import type { TokenPayload } from '../../../service/tokenService';
import { DomainError } from '../../../error/domainError';
import { User } from '../../../model/user';

export class UpdateUserDto {
  @IsString()
  @MinLength(1)
  name!: string;
}

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserHttpController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get the current authenticated user' })
  @ApiResponse({ status: 200, description: 'Current user', type: User })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getMe(@CurrentUser() user: TokenPayload) {
    const found = await this.userService.getUserById(user.userId);
    if (!found) throw new DomainError('User not found', 404);
    return found;
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update the current authenticated user' })
  @ApiResponse({ status: 200, description: 'Updated user', type: User })
  async updateMe(
    @CurrentUser() user: TokenPayload,
    @Body() dto: UpdateUserDto,
  ) {
    return this.userService.updateUser(user.userId, dto.name);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a user by ID (only own profile)' })
  @ApiResponse({ status: 200, description: 'User found', type: User })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getById(@Param('id') id: string, @CurrentUser() user: TokenPayload) {
    if (id !== user.userId) throw new DomainError('Forbidden', 403);
    const found = await this.userService.getUserById(id);
    if (!found) throw new DomainError('User not found', 404);
    return found;
  }

  @Delete('me')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete the current authenticated user' })
  @ApiResponse({ status: 204, description: 'User deleted' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async deleteMe(@CurrentUser() userToken: TokenPayload) {
    const user = await this.userService.getUserById(userToken.userId);
    if (!(await this.userService.canDeleteUser(user, userToken.userId))) {
      throw new DomainError('Forbidden', 403);
    }
    await this.userService.deleteUser(userToken.userId);
  }
}
