export interface UploadFileResponse {
    errorMessage?: Error | string;
    successMessage?: string;
    success: boolean;
    cephTag?: string;
    fileName?:string;
    numberOfSubscriptions?:number;
}
  