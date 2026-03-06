export type SuccessDTO<T> = {
	result: T;
	status_code: number;
};

export type ErrorDTO = {
	message: string;
	status_code: number;
};
