import {getBusSchedule} from '@server/lib/bus';

export async function GET() {
    const data = await getBusSchedule();
    return Response.json(data);
}