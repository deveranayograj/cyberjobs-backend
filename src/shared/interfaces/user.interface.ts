export interface IUserResponse {
    id: string;
    email: string;
    fullName: string;
    role: 'SEEKER' | 'EMPLOYER';
    status: string;
}
