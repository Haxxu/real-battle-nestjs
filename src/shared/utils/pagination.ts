import { BaseEntity } from '@modules/shared/base/base.entity';

export function generateNextKey<T extends BaseEntity>(
	items: T[],
	sort_fields: any[],
) {
	if (items.length === 0) {
		return null;
	}

	// Lấy ra item cuối cùng
	const item = items[items.length - 1];

	// Nếu không truyền vào field nào thì mặc định là _id
	if (sort_fields.length === 0) {
		return { _id: item._id };
		// Nếu chỉ có một field thì kết hợp với id và trả về
	} else if (sort_fields.length === 1) {
		return { _id: item._id, [sort_fields[0]]: item[sort_fields[0]] };
	}

	// Nếu có trên 2 field thì sẽ trả về object gồm các cặp key-value và kết hơp với _id
	//
	return {
		_id: item._id,
		...sort_fields.reduce(
			(result, sort_field) => (result[sort_field] = item[sort_field]),
			{},
		),
	};
}
