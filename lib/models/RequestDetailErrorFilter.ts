import { RequestUrnFormat } from "./Enums/RequestUrnFormat";

export class RequestDetailErrorFilter  {
    requestUrn: string;
    requestId: number;
    orgUrn: string;
    static fromJson(json: any): RequestDetailErrorFilter
    {
        const filter = new RequestDetailErrorFilter();
        filter.requestUrn = json?.requestUrn;
        filter.requestId = json?.requestId;
        filter.orgUrn = json?.orgUrn;
        if(filter?.requestUrn?.startsWith(RequestUrnFormat.LEGACY))
        {
            filter.requestId =  Number(filter.requestUrn.replace(RequestUrnFormat.LEGACY, ""));
            filter.requestUrn = '';
        }
        return filter;
    }
}