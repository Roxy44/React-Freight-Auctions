export class ApiError extends Error {
    readonly status: number;
    readonly code: string | null;

    constructor(message: string, status: number, code: string | null = null) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.code = code;
    }
}

export type ValidationErrorItem = {
    field: string;
    code: string | null;
    message: string;
};

export class ValidationApiError extends ApiError {
    readonly errors: ValidationErrorItem[];

    constructor(message: string, errors: ValidationErrorItem[]) {
        super(message, 422, 'validation_error');
        this.name = 'ValidationApiError';
        this.errors = errors;
    }
}

type ErrorBody = {
    message?: string;
    code?: string | null;
    errors?: ValidationErrorItem[];
};

export async function parseApiError(response: Response): Promise<ApiError> {
    let body: ErrorBody = {};

    try {
        body = (await response.json()) as ErrorBody;
    } catch {
        // non-JSON body
    }

    if (response.status === 422) {
        return new ValidationApiError(body.message ?? 'Ошибка валидации', body.errors ?? []);
    }

    return new ApiError(body.message ?? (response.statusText || 'Ошибка запроса'), response.status, body.code ?? null);
}
