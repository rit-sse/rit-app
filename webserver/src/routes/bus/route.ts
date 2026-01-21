import { getBusSchedule } from '../../lib/bus';

export async function GET() {
    const data = await getBusSchedule();
    return Response.json(data);
}