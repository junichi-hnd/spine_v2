import EventData from './EventData';
class Event {
    public data: EventData;
    public intValue: number;
    public floatValue: number;
    public stringValue: string;
    public time: number;

    constructor (time: number, data: EventData) {
        if (data == null) {
            throw new Error('data cannot be null.');
        }
        this.time = time;
        this.data = data;
    }
}
export default Event;
