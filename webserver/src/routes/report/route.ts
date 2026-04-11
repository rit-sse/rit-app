
import { Request, Response } from "express";

const SMELLY_STINKY_WEBHOOK = process.env.DISCORD_WEBHOOK_FOR_APP_REPORTS || "";

export async function GET(req: Request, res: Response) {
    res.send("hey chicken nugget what you doin here >:(");
}

export const POST = (req: Request, res: Response) => {
    if (!req.body || !req.body["report"] || typeof req.body["report"] !== "string") {
        res.status(400).send("Invalid report format. Expected JSON with a 'report' field of type string.");
        return;
    }

    const reportContent = req.body["report"];
    
    // Send the report to the Discord webhook
    fetch(SMELLY_STINKY_WEBHOOK, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            content: `New report received:\n${reportContent}\nget on this noob <@521818273067696129>`,
        }),
    })
    .then(() => {
        res.status(200).send({
            "message": "Report received successfully."
        });
    })
    .catch((error) => {
        console.error("Error sending report to Discord:", error);
        res.status(500).send({
            "message": "Failed to send report. Please try again later."
        });
    });
}