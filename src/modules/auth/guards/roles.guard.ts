import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { ROLES } from 'src/decorators/roles.decorator';
import { RequestWithUser } from 'src/types/request.type';

@Injectable()
export class RolesGuard implements CanActivate {
	constructor(private reflector: Reflector) {}

	canActivate(
		context: ExecutionContext,
	): boolean | Promise<boolean> | Observable<boolean> {
		const roles: string[] = this.reflector.getAllAndOverride<string[]>(ROLES, [
			context.getHandler(),
			context.getClass(),
		]);
		const request: RequestWithUser = context.switchToHttp().getRequest();

		return roles.includes(request.user.role as unknown as string);
	}
}
