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
  ApiProperty,
} from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';
import { BarcodeService } from '../../../service/barcodeService';
import { RoomService } from '../../../service/roomService';
import { JwtAuthGuard } from '../../../infra/auth/jwtAuthGuard';
import { CurrentUser } from '../../../infra/auth/currentUser';
import type { TokenPayload } from '../../../service/tokenService';
import { DomainError } from '../../../error/domainError';
import { Barcode } from '../../../model/barcode';

export class CreateBarcodeDto {
  @IsString()
  @MinLength(1)
  @ApiProperty({ example: '123456789012' })
  value!: string;
}

export class UpdateBarcodeDto {
  @IsString()
  @MinLength(1)
  @ApiProperty({ example: '123456789012' })
  @IsOptional()
  value?: string;

  @IsInt()
  @ApiProperty({ example: 1 })
  @Min(1)
  @IsOptional()
  quantity?: number;
}

@ApiTags('barcodes')
@ApiBearerAuth()
@Controller('rooms/:roomId/barcodes')
@UseGuards(JwtAuthGuard)
export class BarcodeHttpController {
  constructor(
    private readonly barcodeService: BarcodeService,
    private readonly roomService: RoomService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a barcode in a room' })
  @ApiResponse({ status: 201, description: 'Barcode created', type: Barcode })
  @ApiResponse({ status: 404, description: 'Room not found' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async create(
    @Param('roomId') roomId: string,
    @Body() dto: CreateBarcodeDto,
    @CurrentUser() user: TokenPayload,
  ) {
    const room = await this.roomService.getRoomById(roomId);
    if (!room) throw new DomainError('Room not found', 404);
    if (!(await this.roomService.canViewRoom(room, user.userId)))
      throw new DomainError('Forbidden', 403);
    return this.barcodeService.createBarcode(roomId, dto.value);
  }

  @Get()
  @ApiOperation({ summary: 'List barcodes in a room' })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of barcodes',
    type: [Barcode],
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  async list(
    @Param('roomId') roomId: string,
    @CurrentUser() user: TokenPayload,
    @Query('page') page = '1',
    @Query('pageSize') pageSize = '10',
  ) {
    const room = await this.roomService.getRoomById(roomId);
    if (!room) throw new DomainError('Room not found', 404);
    if (!(await this.roomService.canViewRoom(room, user.userId)))
      throw new DomainError('Forbidden', 403);
    return this.barcodeService.getRoomBarcodes(
      roomId,
      Number(page),
      Number(pageSize),
    );
  }

  @Get('export')
  @ApiOperation({ summary: 'Export all barcodes in a room' })
  @ApiResponse({
    status: 200,
    description: 'All barcodes in the room',
    type: [Barcode],
  })
  async exportAll(
    @Param('roomId') roomId: string,
    @CurrentUser() user: TokenPayload,
  ) {
    const room = await this.roomService.getRoomById(roomId);
    if (!room) throw new DomainError('Room not found', 404);
    if (!(await this.roomService.canViewRoom(room, user.userId)))
      throw new DomainError('Forbidden', 403);
    return this.barcodeService.exportAllBarcodes(roomId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a barcode by ID' })
  @ApiResponse({ status: 200, description: 'Barcode found', type: Barcode })
  @ApiResponse({ status: 404, description: 'Barcode or room not found' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getById(
    @Param('roomId') roomId: string,
    @Param('id') id: string,
    @CurrentUser() user: TokenPayload,
  ) {
    const barcode = await this.barcodeService.getBarcodeById(id);
    if (!barcode) throw new DomainError('Barcode not found', 404);
    const room = await this.roomService.getRoomById(roomId);
    if (!room) throw new DomainError('Room not found', 404);
    if (!(await this.barcodeService.canViewBarcode(barcode, room, user.userId)))
      throw new DomainError('Forbidden', 403);
    return barcode;
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a barcode' })
  @ApiResponse({ status: 200, description: 'Barcode updated', type: Barcode })
  @ApiResponse({ status: 404, description: 'Barcode or room not found' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async update(
    @Param('roomId') roomId: string,
    @Param('id') id: string,
    @Body() dto: UpdateBarcodeDto,
    @CurrentUser() user: TokenPayload,
  ) {
    const barcode = await this.barcodeService.getBarcodeById(id);
    if (!barcode) throw new DomainError('Barcode not found', 404);
    const room = await this.roomService.getRoomById(roomId);
    if (!room) throw new DomainError('Room not found', 404);
    if (
      !(await this.barcodeService.canUpdateBarcode(barcode, room, user.userId))
    )
      throw new DomainError('Forbidden', 403);
    return this.barcodeService.updateBarcode(id, dto.value, dto.quantity);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete a barcode' })
  @ApiResponse({ status: 204, description: 'Barcode deleted' })
  @ApiResponse({ status: 404, description: 'Barcode or room not found' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async delete(
    @Param('roomId') roomId: string,
    @Param('id') id: string,
    @CurrentUser() user: TokenPayload,
  ) {
    const barcode = await this.barcodeService.getBarcodeById(id);
    if (!barcode) throw new DomainError('Barcode not found', 404);
    const room = await this.roomService.getRoomById(roomId);
    if (!room) throw new DomainError('Room not found', 404);
    if (
      !(await this.barcodeService.canDeleteBarcode(barcode, room, user.userId))
    )
      throw new DomainError('Forbidden', 403);
    await this.barcodeService.deleteBarcode(id);
  }
}
