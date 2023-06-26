import { ReportNameTypes } from "@models/Enums/ReportTypes";

export interface IDownloadHandler {
    isCategory(category: ReportNameTypes): boolean;
    getData(filter: any): Promise<any>;
}