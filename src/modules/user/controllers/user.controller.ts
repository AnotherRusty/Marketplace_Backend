import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser, Public } from '@common/decorators';
import { AccessTokenGuard } from '@common/guards';
import { IPayloadUserJwt } from '@common/interfaces';
import { UpdateUsernameDto } from '@modules/user/dto/update-username.dto';
import { UserService } from '@modules/user/services/user.service';
import { User } from '@prisma/client';

const moduleName = 'user';

@ApiTags(moduleName)
@Controller(moduleName)
export class UserController {
  constructor(private userService: UserService) {}

  @ApiOperation({ summary: 'Get me' })
  @UseGuards(AccessTokenGuard)
  @Get('me')
  @HttpCode(HttpStatus.OK)
  async getMe(@CurrentUser() user: User) {
    return await this.userService.getUser({
      where: { id: user.id },
      include: {
        profile: true,
      },
    });
  }

  @ApiOperation({ summary: 'Get user by id' })
  @Public()
  @Get(':id')
  async getById(@Param('id') id: string) {
    const user = await this.userService.getUser({
      where: { id },
      include: {
        profile: true,
      },
    });
    if (!user)
      throw new HttpException('Invalid user id', HttpStatus.BAD_REQUEST);
    else return user;
  }

  @ApiOperation({ summary: 'Update username' })
  @ApiBody({ type: UpdateUsernameDto })
  @UseGuards(AccessTokenGuard)
  @Patch('update-username')
  async updateUsername(
    @CurrentUser() payload: IPayloadUserJwt,
    @Body() data: UpdateUsernameDto,
  ) {
    return await this.userService.updateUsername(payload.id, data);
  }

  @ApiOperation({ summary: 'Can I use this username?' })
  @ApiBody({ type: UpdateUsernameDto })
  @Public()
  @Post('available-username')
  async availableUsername(@Body() data: UpdateUsernameDto) {
    console.log('here');
    return await this.userService.availableUsername(data);
  }
}
