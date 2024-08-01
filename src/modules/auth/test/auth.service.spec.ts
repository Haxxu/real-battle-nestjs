import { AuthService } from '@modules/auth/auth.service';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '@modules/users/users.service';
import { UsersRepository } from '@repositories/users.repository';
import { User } from '@modules/users/entities/user.entity';
import { UserRolesService } from '@modules/user-roles/user-roles.service';
import { UserRolesRepository } from '@repositories/user-roles.repository';
import { UserRole } from '@modules/user-roles/entities/user-role.entity';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { mockConfigService } from './mocks/config-service.mock';
import { mockJwtService } from './mocks/jwt.mock';

describe('AuthSerivce', function () {
	let authService: AuthService;
	beforeEach(async () => {
		const module_ref = await Test.createTestingModule({
			providers: [
				AuthService,
				{
					provide: ConfigService,
					useValue: mockConfigService,
				},
				{
					provide: JwtService,
					useValue: mockJwtService,
				},
				,
				UsersService,
				UserRolesService,
				{
					provide: 'UsersRepositoryInterface',
					useClass: UsersRepository,
				},
				{
					provide: 'UserRolesRepositoryInterface',
					useClass: UserRolesRepository,
				},
				{
					provide: getModelToken(User.name), // trả về: UserModel
					useValue: {},
				},
				{
					provide: getModelToken(UserRole.name), // trả về: UserRoleModel
					useValue: {},
				},
			],
		}).compile();
		authService = module_ref.get<AuthService>(AuthService);
	});
	it('should be defined', () => {
		expect(authService).toBeDefined();
	});
});
