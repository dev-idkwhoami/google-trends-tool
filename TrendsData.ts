import api from 'google-trends-api';

export interface TrendsData {
    geoCode: string;
    geoName: string;
    value: number[];
    formattedValue: string[];
    maxValueIndex: number;
    hasData: boolean[];
    timestamp: Date;
}

export function getTrends(keywords: string[], callback: Function, startTime: number = Date.now() - (3600 * 1000), endTime: number = Date.now(), regionResolution: string = 'COUNTRY'): void {
    api.interestByRegion({keyword: keywords, startTime: new Date(startTime), endTime: new Date(endTime), resolution: regionResolution})
        .then(function(results: string): TrendsData[] {
            return JSON.parse(results).default.geoMapData
                .map(item => {
                    let trendsData: TrendsData = item;
                    return trendsData;
                })
        })
        .then((trendsData: TrendsData[]) => callback(trendsData))
        .catch(function(err){
            console.error('Oh no there was an error', err);
        });
}
