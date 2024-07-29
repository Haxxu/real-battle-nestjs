import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Model } from 'mongoose';

import { BaseEntity } from '@modules/shared/base/base.entity';
import { UserRole } from '@modules/user-roles/entities/user-role.entity';
import { Address, AddressSchema } from './address.entity';
import { FlashCardDocument } from '@modules/flash-cards/entities/flash-card.entity';
import { NextFunction } from 'express';
import { CollectionDocument } from '@modules/collections/entities/collection.entity';

export type UserDocument = HydratedDocument<User>;

export enum GENDER {
	Male = 'MALE',
	Female = 'FEMALE',
	Other = 'OTHER',
}

export enum LANGUAGES {
	ENGLISH = 'English',
	FRENCH = 'French',
	JAPANESE = 'Japanese',
	KOREAN = 'Korean',
	SPANISH = 'Spanish',
}

@Schema({
	timestamps: {
		createdAt: 'created_at',
		updatedAt: 'updated_at',
	},
	toJSON: {
		getters: true,
		virtuals: true,
	},
})
export class User extends BaseEntity {
	@Prop({
		required: true,
		minlength: 2,
		maxlength: 60,
		set: (firstName: string) => {
			return firstName.trim();
		},
	})
	first_name: string;

	@Prop({
		required: true,
		minlength: 2,
		maxlength: 60,
		set: (lastName: string) => {
			return lastName.trim();
		},
	})
	last_name: string;

	@Prop({
		required: true,
		unique: true,
		match: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
	})
	email: string;

	@Prop({
		match: /^([+]\d{2})?\d{10}$/,
		get: (phoneNumber: string) => {
			if (!phoneNumber) return;
			const lastThreeDigits = phoneNumber.slice(phoneNumber.length - 4);
			return `****-***-${lastThreeDigits}`;
		},
	})
	phone_number: string;

	@Prop({
		required: true,
		select: false,
	})
	password: string;

	@Prop({
		default:
			'https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_960_720.png',
	})
	avatar: string;

	@Prop()
	date_of_birth: Date;

	@Prop({
		enum: GENDER,
	})
	gender: string;

	@Prop({ default: 0 })
	point: number;

	@Prop({
		type: mongoose.Schema.Types.ObjectId,
		ref: UserRole.name,
	})
	role: UserRole;

	@Prop()
	headline: string;

	@Prop()
	friendly_id: number;

	@Prop({
		type: [AddressSchema],
		default: [],
	})
	address: Address[];

	default_address?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

export const UserSchemaFactory = (
	flashCardModel: Model<FlashCardDocument>,
	collectionModel: Model<CollectionDocument>,
) => {
	const userSchema = UserSchema;

	userSchema.pre('findOneAndDelete', async function (next: NextFunction) {
		const user = await this.model.findOne(this.getFilter());
		await Promise.all([
			flashCardModel
				.deleteMany({
					user: user._id,
				})
				.exec(),
			collectionModel
				.deleteMany({
					user: user._id,
				})
				.exec(),
		]);
		return next();
	});

	userSchema.virtual('default_address').get(function (this: UserDocument) {
		if (this.address.length) {
			return `${(this.address[0].street && ' ') || ''}${this.address[0].city} ${
				this.address[0].state
			} ${this.address[0].country}`;
		}
	});

	return userSchema;
};
