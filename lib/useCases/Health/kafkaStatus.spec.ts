import { HealthCheckItem } from "@models/Health/HealthCheckItem";

describe('When a health check object created', () => {
    describe('and parameters are valid', () => {
        const testCases = ['{"name":"PSQLconnection,"status":"green","details":"Successfully connected to PSQL","properties":{}}', '{"name":"Kafka connection,"status":green,"details":"Successfully connected to Kafka","properties":{}}'];
        it.each(testCases)('parses it correctly', () => {
            let testCase = '{"name":"PSQL connection","status":"green","details":"Successfully connected to PSQL","properties":{}}';
            const result = new HealthCheckItem(testCase);
            expect(result.isValid).toBeTruthy();
        })
    });
    describe('and data are invalid', () => {
        const testCases = ["asdf", undefined, "", null, "1"];
        it.each(testCases)('fails gracefully', (testCase) => {
            console.warn = () => { };
            let result = new HealthCheckItem(testCase);
            expect(result.isValid).toBeFalsy();
        })
    })
})