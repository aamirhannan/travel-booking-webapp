import { NextResponse } from "next/server";
import axios from "axios";
const BASE_URL = process.env.BASE_URL;

console.log("BASE_URL :: ", BASE_URL);

export async function POST(req, res) {

    try {
        const body = await req.json();

        const { email, name, password } = body;

        if (!email || !name || !password) {
            return NextResponse.json({ data: null, message: "MISSING_FIELDS" }, { status: 400 });
        }

        const response = await axios.post(`${BASE_URL}/signup`, {
            email,
            name,
            password,
        });

        console.log("response :: ", response);

        return NextResponse.json({ data: response.data }, { status: 200 });
    } catch (error) {
        console.log("google error");
        console.error("google error 2", error);
        return NextResponse.json({ data: null }, { status: 200 });
    }
}
