export interface ExtractRequest {
    url: string;
}

export interface ExtractResponse {
    data: any;
}

export interface EmbedRequest {
    embeddings: number[];
}

export interface EmbedResponse {
    success: boolean;
    message?: string;
}

export interface AskRequest {
    question: string;
}

export interface AskResponse {
    answer: string;
}

export interface QuizRequest {
    criteria: string;
}

export interface QuizResponse {
    questions: Array<{
        question: string;
        options: string[];
        correctAnswer: string;
    }>;
}