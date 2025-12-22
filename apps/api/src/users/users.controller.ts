import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  NotFoundException,
} from "@nestjs/common";
import { UsersService } from "./users.service";
import { AuthService } from "../auth/auth.service";
import { type NewUser } from "@monorepo/db";
import type { UpdateProfileData } from "@monorepo/db/types";
import { UserRole } from "@monorepo/db/types";
import { Roles } from "../auth/decorators/roles.decorator";
import { InviteUserDto } from "../auth/dto/auth.dto";

@Controller("api/users")
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService
  ) {}

  @Get()
  @Roles(UserRole.ADMIN)
  async findAll() {
    return this.usersService.findAll();
  }

  @Post("invite")
  @Roles(UserRole.ADMIN)
  async inviteUser(@Body() inviteUserDto: InviteUserDto) {
    return this.authService.inviteUser(inviteUserDto);
  }

  @Get(":id")
  @Roles(UserRole.ADMIN)
  async findOne(@Param("id") id: string) {
    const user = await this.usersService.findOneWithProfile(id);
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return user;
  }

  @Put(":id/profile")
  @Roles(UserRole.ADMIN)
  async updateUserProfile(
    @Param("id") id: string,
    @Body() updateProfileDto: UpdateProfileData & { role?: UserRole }
  ) {
    const user = await this.usersService.updateUserProfile(
      id,
      updateProfileDto
    );
    return {
      message: "Profilo aggiornato con successo",
      user,
    };
  }

  @Post()
  async create(@Body() createUserDto: NewUser) {
    return this.usersService.create(createUserDto);
  }

  @Put(":id")
  async update(
    @Param("id") id: string,
    @Body() updateUserDto: Partial<NewUser>
  ) {
    const user = await this.usersService.update(id, updateUserDto);
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return user;
  }

  @Delete(":id")
  async delete(@Param("id") id: string) {
    const deleted = await this.usersService.delete(id);
    if (!deleted) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return { deleted: true };
  }
}
