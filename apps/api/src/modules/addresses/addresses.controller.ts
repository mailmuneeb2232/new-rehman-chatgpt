import { Controller, Get, Post, Put, Patch, Delete, Body, Param, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AddressesService } from './addresses.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('addresses')
@Controller({ path: 'addresses', version: '1' })
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @Get() @ApiOperation({ summary: 'Get my addresses' })
  findAll(@CurrentUser('id') userId: string) { return this.addressesService.findAll(userId); }

  @Get(':id') @ApiOperation({ summary: 'Get address by ID' })
  findOne(@Param('id') id: string, @CurrentUser('id') userId: string) { return this.addressesService.findOne(id, userId); }

  @Post() @ApiOperation({ summary: 'Create address' })
  create(@CurrentUser('id') userId: string, @Body() dto: CreateAddressDto) { return this.addressesService.create(userId, dto); }

  @Put(':id') @ApiOperation({ summary: 'Update address' })
  update(@Param('id') id: string, @CurrentUser('id') userId: string, @Body() dto: UpdateAddressDto) { return this.addressesService.update(id, userId, dto); }

  @Delete(':id') @HttpCode(HttpStatus.OK) @ApiOperation({ summary: 'Delete address' })
  remove(@Param('id') id: string, @CurrentUser('id') userId: string) { return this.addressesService.remove(id, userId); }

  @Patch(':id/default') @ApiOperation({ summary: 'Set as default address' })
  setDefault(@Param('id') id: string, @CurrentUser('id') userId: string) { return this.addressesService.setDefault(id, userId); }
}
