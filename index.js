import fs from 'fs';
import api from 'google-trends-api';

String.prototype.reverse = function() {
    return this.split(' ').reverse().join('');
};

const keywords = ['VueJS', 'React', 'Svelte'];
const date = new Date('2024-10-25T00:00:00Z');
const timezone = 'Europe/Berlin';

const intervals = generateHourlyIntervals(date, timezone);

//check if raws or trends folder has files and delete them
if (fs.existsSync('raws')) {
    fs.readdirSync('raws').forEach(file => {
        fs.unlinkSync('raws/' + file);
    });
}
if (fs.existsSync('trends')) {
    fs.readdirSync('trends').forEach(file => {
        fs.unlinkSync('trends/' + file);
    });
}
if (!fs.existsSync('raws')) {
    fs.mkdirSync('raws');
}
if (!fs.existsSync('trends')) {
    fs.mkdirSync('trends');
}

console.log("Generating trends data for " + keywords.join(", ") + " from " + date.toLocaleString('en-US', { timeZone: timezone }) + " to " + intervals[intervals.length - 1].name + "");

for (const interval of intervals) {
    getTrends(interval.name, interval.from, interval.to);
}

function generateHourlyIntervals(date, timezone) {
    const intervals = [];

    const formatHour = (date) => {
        const options = {
            hour: 'numeric',
            hour12: true,
            timeZone: timezone
        };
        return new Intl.DateTimeFormat('en-US', options).format(date);
    };

    // Initialize the start of the day in the provided timezone
    const startDate = new Date(date.toLocaleString('en-US', { timeZone: timezone }));
    startDate.setHours(0, 0, 0, 0);

    for (let hour = 0; hour < 24; hour++) {
        const currentDate = new Date(startDate);
        currentDate.setHours(startDate.getHours() + hour);

        const nextDate = new Date(currentDate);
        nextDate.setHours(currentDate.getHours() + 1);

        intervals.push({
            from: currentDate,
            to: nextDate,
            name: formatHour(currentDate).reverse()
        });
    }

    return intervals;
}

function getTrends(name, startTime, endTime) {
    api.interestByRegion({keyword: keywords, startTime: startTime, endTime: endTime, resolution: 'COUNTRY'})
        .then(function(results){
            let raw = null;
            try {
                raw = JSON.parse(results);
            } catch (error) {
                fs.writeFileSync('error.html', results);
                return;
            }
            fs.writeFileSync('raws/' + name + '.json', JSON.stringify(raw, null, 4));

            let data = raw.default.geoMapData
                .filter(item => item.geoCode === 'FR')
                .map(item => {
                return {
                    country: item.geoCode,
                    time: new Date(item.time * 1000),
                    value: structuredClone(keywords).map((keyword, index) => {
                        return {
                            keyword: keyword,
                            value: item.value[index]
                        }
                    })
                }
            })
            fs.writeFileSync('trends/' + name + '.json', JSON.stringify(data, null, 4));
        })
        .catch(function(err){
            console.error('Oh no there was an error', err);
        });
}
