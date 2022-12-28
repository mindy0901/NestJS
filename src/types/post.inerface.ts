export interface Post {
    id: number;
    title: string;
    content: string;
    isPublish: boolean;
    authorId: number;
    createdAt: string;
    updatedAt: string;
}

export type CreatePost = Pick<Post, 'title' | 'content' | 'isPublish'>;
export type UpdatePost = Pick<Post, 'title' | 'content' | 'isPublish'>;
