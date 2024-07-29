import { BaseEntity } from '@modules/shared/base/base.entity';
import { BaseServiceInterface } from './base.interface.service';
import { BaseRepositoryInterface } from '@repositories/base/base.interface.repository';
import { FindAllResponse } from 'src/types/common.type';

export abstract class BaseServiceAbstract<T extends BaseEntity>
	implements BaseServiceInterface<T>
{
	constructor(private readonly repository: BaseRepositoryInterface<T>) {}

	async create(createDto: T | any): Promise<T> {
		return await this.repository.create(createDto);
	}

	async findAll(
		filter?: object,
		options?: object,
	): Promise<FindAllResponse<T>> {
		return await this.repository.findAll(filter, options);
	}

	async findOne(id: string) {
		return await this.repository.findOneById(id);
	}

	async update(id: string, update_dto: Partial<T>) {
		return await this.repository.update(id, update_dto);
	}

	async remove(id: string) {
		return await this.repository.softDelete(id);
	}

	async findOneByCondition(condition?: object) {
		return await this.repository.findOneByCondition(condition);
	}
}
