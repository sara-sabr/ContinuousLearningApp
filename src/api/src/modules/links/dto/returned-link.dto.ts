export class ReturnedLinkDTO {
    id: number;
    url: string;
    title: string;
    language: string;
    description?: string;
    imageLink?: string;
    createdOn: Date;
    updatedOn?: Date;
}