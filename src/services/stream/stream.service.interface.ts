export interface IStreamService {
    generateStreamToken(userId: string): Promise<string>
}