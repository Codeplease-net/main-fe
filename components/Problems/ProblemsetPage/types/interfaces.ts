export interface Category {
    code: string;
    name: string;
}

export interface Translation {
    vi: string;
    en: string;
    'zh-cn': string;
}

export interface Problem {
    id: string;
    displayTitle: any;
    title: Translation;
    categories: string[];
    difficulty: number;
}
  
export interface ProblemFilters {
    search?: string;
    categories?: string[];
    page?: number;
    limit?: number;
}
  