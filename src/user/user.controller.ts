import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  Req,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from './guard/Auth.guard';
import { Roles } from './decorator/Roles.decorator';

@Controller('/v1/user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * @docs Create user - For Admin
   * @endpoint POST - http://localhost:3000/api/v1/user
   * @access Private
   */
  @Post()
  @Roles(['admin'])
  @UseGuards(AuthGuard)
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  /**
   * @docs Get all users - For Admin
   * @endpoint GET - http://localhost:3000/api/v1/user
   * @access Private
   */
  @Get()
  @Roles(['admin'])
  @UseGuards(AuthGuard)
  findAll(@Query() query) {
    return this.userService.findAll(query);
  }

  /**
   * @docs Get user by id - For Admin
   * @endpoint GET - http://localhost:3000/api/v1/user/:id
   * @access Private
   */
  @Get(':id')
  @Roles(['admin'])
  @UseGuards(AuthGuard)
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  /**
   * @docs Update user by id - For Admin
   * @endpoint PATCH - http://localhost:3000/api/v1/user/:id
   * @access Private
   */
  @Patch(':id')
  @Roles(['admin'])
  @UseGuards(AuthGuard)
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  /**
   * @docs Delete user by id - For Admin
   * @endpoint DELETE - http://localhost:3000/api/v1/user/:id
   * @access Private
   */
  @Delete(':id')
  @Roles(['admin'])
  @UseGuards(AuthGuard)
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}

@Controller('/v1/profile')
export class UserProfileController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @Roles(['user', 'admin'])
  @UseGuards(AuthGuard)
  getProfile(@Req() req) {
    return this.userService.getProfile(req.user);
  }

  @Patch()
  @Roles(['user', 'admin'])
  @UseGuards(AuthGuard)
  updateProfile(@Req() req, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.updateProfile(req.user, updateUserDto);
  }

  @Delete()
  @Roles(['user', 'admin'])
  @UseGuards(AuthGuard)
  deleteProfile(@Req() req) {
    return this.userService.deleteProfile(req.user);
  }
}
