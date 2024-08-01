// import { Test } from '@nestjs/testing';
// import { UsersService } from '../users.service';
// import { createMock } from '@golevelup/ts-jest';
// import { UserRolesService } from '@modules/user-roles/user-roles.service';
// import { UsersRepositoryInterface } from '../interfaces/users.interface';
// import { UsersRepository } from '@repositories/users.repository';
// import { User } from '../entities/user.entity';
// import { createUserStub } from './stubs/user.stub';
// import { ConfigService } from '@nestjs/config';

// jest.mock('../../user-roles/user-roles.service.ts');
// describe('UserService', () => {
// 	let users_service: UsersService;
// 	let users_repository: UsersRepository;
// 	beforeEach(async () => {
// 		const module_ref = await Test.createTestingModule({
// 			providers: [
// 				UsersService,
// 				UserRolesService,
// 				{
// 					provide: 'UsersRepositoryInterface',
// 					useValue: createMock<UsersRepositoryInterface>(),
// 				},
// 				{
// 					provide: ConfigService,
// 					useValue: createMock<ConfigService>(),
// 				},
// 			],
// 		}).compile();
// 		users_service = module_ref.get(UsersService);
// 		users_repository = module_ref.get('UsersRepositoryInterface');
// 	});

// 	describe('Daily Check-in', () => {
// 		describe('Case 1: User never check-in before', () => {
// 			it('should receive reward if it is the last day of month (case 1.1)', async () => {
// 				// Arrange
// 				const user = createUserStub();
// 				const testing_date = '2023-01-31';
// 				const check_in_time = new Date(testing_date);

// 				// Act
// 				await users_service.updateDailyCheckIn(user, testing_date);
// 				// Assert
// 				expect(users_repository.update).toBeCalledWith(user._id, {
// 					point: user.point + 1,
// 					last_check_in: check_in_time,
// 					last_get_check_in_rewards: check_in_time,
// 					daily_check_in: [
// 						{
// 							eligible_for_reward: true,
// 							checked_date: check_in_time,
// 						},
// 					],
// 				});
// 			});
// 		});
// 	});
// });
