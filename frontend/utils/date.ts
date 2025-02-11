/**
 * ISO形式の日付文字列をYYYY-MM-DD形式に変換する
 * @param dateString - ISO形式の日付文字列 (例: "2025-02-09T15:00:00.000Z")
 * @returns YYYY-MM-DD形式の文字列 (例: "2025-02-09")
 */
export const formatDate = (dateString: string) => {
	const date = new Date(dateString);
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
};
