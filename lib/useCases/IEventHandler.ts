import { DownloaderEvent } from "@models/DownloaderEvent";

export interface IEventHandler {
    isType(type: string): boolean;
    call(event: DownloaderEvent );
}