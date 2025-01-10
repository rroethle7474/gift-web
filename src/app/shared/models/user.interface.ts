export interface User {
    userId: number;
    username?: string;
    name?: string;
    email?: string;
    isAdmin?: boolean;
    spendingLimit?: number;
    sillyDescription?: string | null;
    greetingMessage?: string | null;
    parentEmail1?: string | null;
    parentEmail2: string | null;
    parentPhone1: string | null;
    parentPhone2: string | null;
    birthday: string | null;
}

export interface LoginRequest {
    username: string;
    password: string;
}

export interface LoginResponse {
    token: string;
    user: User;
}

export interface CreateUserRequest {
    username: string;
    password: string;
    email: string;
    name: string;
    isAdmin: boolean;
    spendingLimit: number | null;
    sillyDescription: string | null;
    greetingMessage: string | null;
    parentEmail1: string | null;
    parentEmail2: string | null;
    parentPhone1: string | null;
    parentPhone2: string | null;
    birthday: string | null;
}

export interface UpdateUserRequest {
    username?: string;
    email?: string;
    name?: string;
    isAdmin?: boolean;
    spendingLimit?: number | null;
    sillyDescription?: string | null;
    greetingMessage?: string | null;
    parentEmail1?: string | null;
    parentEmail2?: string | null;
    parentPhone1?: string | null;
    parentPhone2?: string | null;
    birthday?: string | null;
}
