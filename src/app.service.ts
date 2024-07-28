import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
	constructor() {} // <=== Thêm vào constructor ở đây
	getHello(): string {
		return 'Hello World!';
	}
}
