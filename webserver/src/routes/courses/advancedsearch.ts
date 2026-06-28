import { scheduler } from "../../lib/cache-scheduler/scheduler";
import { Request, Response } from "express";
import { HEADERS } from "./search"

const CACHE_KEY = "rit_courses";
const COURSES_URL = "https://academiccatalog.rit.edu/course-search/api/?page=fose&route=search";
const STALE_CACHE_MS = 1000 * 60 * 60 * 24 * 4; // 4 days

export const GET = async (req: Request, res: Response) => {
    const { college, keyword, gradType, subject, ged, perspective, typeofWritingIntensive, honors, onlyNTID } = req.query;

    let criteria: object[] = [];
    if (college) criteria.push({ field: "col", value: college });
    if (keyword) criteria.push({ field: "keyword", value: keyword });
    if (gradType) {
        if (gradType == "undergrad") {
            criteria.push({ field: "coursetype_ugrad", value: "Y" });
        }
        if (gradType == "grad") {
            criteria.push({ field: "coursetype_grad", value: "Y" });
        }
    }
    if (subject) criteria.push({ field: "subject", value: subject });
    if (ged) criteria.push({ field: "generation_education_elective_GENED_ELEC", value: ged });
    if (perspective) criteria.push({ field: `perspectives_${perspective}`, value: "Y" });
    if (typeofWritingIntensive) {
        if (typeofWritingIntensive == "writing_intensive_course_WI_GE") {
            criteria.push({ field: "writing_intensive_course_WI_GE", value: "Y" });
        }
        if (typeofWritingIntensive == "writing_intensive_course_FYW") {
            criteria.push({ field: "writing_intensive_course_FYW", value: "Y" });
        }
    }
    if (honors) criteria.push({ field: "honors_HONORS", value: "Y" });
    if (onlyNTID) criteria.push({ field: "ntid_NTIDINSTR", value: "Y" });

    if(criteria.length == 0) {
        return res.status(400).json({ error: "At least one search criteria must be provided." });
    }

    if(criteria.length == 1) {
        const { field, value } = criteria[0] as { field: string; value: any };
        const cached = scheduler.getCache(`rit_courses_${field}_${value}`);
        if (cached && Date.now() - cached.cacheTime < STALE_CACHE_MS) { // 4 days
            return res.header("Content-Type", "application/json").json(cached.data);
        }
    }

    const response = await fetch(COURSES_URL, {
        method: "POST",
        headers: HEADERS,
        body: JSON.stringify({ other: { srcdb: "" }, criteria }),
    });

    const data = await response.json();

    if (criteria.length === 1) {
        const { field, value } = criteria[0] as { field: string; value: any };
        await scheduler.setCache(`rit_courses_${field}_${value}`, data);
    }

    return res.status(response.status).json(data);
};
