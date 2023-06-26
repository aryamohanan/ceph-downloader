export class Logger {
    static error(from: string, error: Error | String) {
        console.error(`Exception generated from ${from}, Error: ${error}`);
    }
    static warn(from: string, warn: String) {
        console.error(`Warning generated from ${from}, ${warn}`);
    }
    static errorDetails(from: string, details: string, error: Error | String) {
        console.error(`Exception generated from: ${from}`, `Details: ${details}`, `Error: ${error}`);
    }
    static logDetails(from: string, details: string) {
        console.log(`Information generated from: ${from}`, `Details: ${details}`);
    }
    static logRequest(functionName: string, methodName: string, request: string, InfoCode?: any) {
        let code = (typeof InfoCode !== 'undefined') ? `${InfoCode}: ` : '';
        console.log(`${code}Request generated at ${functionName} ${methodName} method. Request:  ${request}`);
    }
    static errorLog(functionName: string, methodName: string, error: Error | String) {
        console.error(`ERR-PROV-DOWNLOADER-SERVICE-API-100:Exception generated from ${functionName} ${methodName} method, error: ${error}`);
    }
    static logInfo(functionName: string, methodName: string, message:string) {
        console.info(`INFO-DOWNLOADER-SERVICE-API-200: Information generated from ${functionName} ${methodName} method. Info:  ${message}`);
    }
}