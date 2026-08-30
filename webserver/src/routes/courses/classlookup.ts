import { Request, Response } from "express";

const CLASSLOOKUP_URL = "https://api.rit.edu/api/courses";

/**
 * Class for a specific subject or course. For some reason, the API does not return anything using the course code, so we will have to manually filter the results to find the course we want through our subject.
 * @param req
 * @param res
 * @returns
 */
export const GET = async (req: Request, res: Response) => {
    const { course_code, subject_code, terms } = req.query;

    if (!course_code && !subject_code) {
        return res.status(400).json({ error: "Missing required query param: course_code or subject_code" });
    }
    const token = process.env.API_RIT_EDU_TOKEN;
    if (!token) {
        return res.status(500).json({ error: "Server misconfiguration: API_RIT_EDU_TOKEN is not set." });
    }

    const url = new URL(CLASSLOOKUP_URL);
    // url.searchParams.set("course_code", course_code as string);

    // Default to course_code since course_code will already have the subject code in it.
    if(course_code) {
        url.searchParams.set("subject_code", (course_code as string).split("-")[0]);
    } else if(subject_code) {
        url.searchParams.set("subject_code", subject_code as string);
    }
    if(terms) {
        url.searchParams.set("terms", terms as string);
    }

    const response = await fetch(url, {
        headers: {
            "Authorization": `Bearer ${token}`,
        },
    });

    const data = await response.json();

    if(course_code) {
        const filteredData = data.data.filter((course: any) => {
            let coursecode = course.course_code.split("-").slice(0, 2).join("-");
            return coursecode == course_code;
        });
        return res.status(response.status).json(filteredData);
    } else {
        return res.status(response.status).json(data.data);
    }
};