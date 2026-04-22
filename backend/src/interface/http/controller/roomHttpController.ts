import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';
import { RoomService } from '../../../service/roomService';
import { JwtAuthGuard } from '../../../infra/auth/jwtAuthGuard';
import { CurrentUser } from '../../../infra/auth/currentUser';
import type { TokenPayload } from '../../../service/tokenService';
import { DomainError } from '../../../error/domainError';
import { Room } from '../../../model/room';

export class CreateRoomDto {
  @IsString()
  @MinLength(1)
  name!: string;
}

export class UpdateRoomDto {
  @IsString()
  @MinLength(1)
  name!: string;
}

@ApiTags('rooms')
@ApiBearerAuth()
@Controller('rooms')
@UseGuards(JwtAuthGuard)
export class RoomHttpController {
  constructor(private readonly roomService: RoomService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new room' })
  @ApiResponse({ status: 201, description: 'Room created', type: Room })
  async create(@CurrentUser() user: TokenPayload, @Body() dto: CreateRoomDto) {
    return this.roomService.createRoom(dto.name, user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'List rooms for the current user' })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of rooms',
    type: [Room],
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  async list(
    @CurrentUser() user: TokenPayload,
    @Query('page') page = '1',
    @Query('pageSize') pageSize = '10',
  ) {
    return this.roomService.getUserRooms(
      user.userId,
      Number(page),
      Number(pageSize),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a room by ID' })
  @ApiResponse({ status: 200, description: 'Room found', type: Room })
  @ApiResponse({ status: 404, description: 'Room not found' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getById(@Param('id') id: string, @CurrentUser() user: TokenPayload) {
    const room = await this.roomService.getRoomById(id);
    if (!room) throw new DomainError('Room not found', 404);
    if (!(await this.roomService.canViewRoom(room, user.userId)))
      throw new DomainError('Forbidden', 403);
    return room;
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a room' })
  @ApiResponse({ status: 200, description: 'Room updated', type: Room })
  @ApiResponse({ status: 404, description: 'Room not found' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateRoomDto,
    @CurrentUser() user: TokenPayload,
  ) {
    const room = await this.roomService.getRoomById(id);
    if (!room) throw new DomainError('Room not found', 404);
    if (!(await this.roomService.canUpdateRoom(room, user.userId)))
      throw new DomainError('Forbidden', 403);
    return this.roomService.updateRoom(id, dto.name);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete a room' })
  @ApiResponse({ status: 204, description: 'Room deleted' })
  @ApiResponse({ status: 404, description: 'Room not found' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async delete(@Param('id') id: string, @CurrentUser() user: TokenPayload) {
    const room = await this.roomService.getRoomById(id);
    if (!room) throw new DomainError('Room not found', 404);
    if (!(await this.roomService.canDeleteRoom(room, user.userId)))
      throw new DomainError('Forbidden', 403);
    await this.roomService.deleteRoom(id);
  }
}
