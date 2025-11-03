import { endOfYear, format, startOfYear } from 'date-fns';
import { es } from 'date-fns/locale';

export const formatDateToMMDD = (date?: Date | string) => {
	if (!date) {
		return '';
	}
	return format(new Date(date), 'dd-MMM', { locale: es });
};

export const dateStartOfYear = (year?: number) => {
	const date = year ? new Date(year, 1, 1) : new Date();
	const dateFormat = format(startOfYear(date), 'yyyy-MM-dd', { locale: es });

	return dateFormat;
};

export const dateEndOfYear = (year?: number) => {
	const date = year ? new Date(year, 1, 1) : new Date();
	const dateFormat = format(endOfYear(date), 'yyyy-MM-dd', { locale: es });

	return dateFormat;
};
