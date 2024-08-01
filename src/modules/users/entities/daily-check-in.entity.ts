export class DailyCheckIn {
	checked_date: Date; // Ngày check in

	access_amount: number; // Số lượng truy cập trong ngày

	eligible_for_reward: boolean; // Nếu là true thì là ngày nhận thưởng

	reward_days_count: number; // Số ngày đã check, dùng để hiển thị hoặc tính phần thưởng
}
