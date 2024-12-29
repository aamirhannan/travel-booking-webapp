import { NextResponse } from "next/server";
import axios from "axios";
const BASE_URL = process.env.BASE_URL;


export async function POST(req, res) {
    try {
        const body = await req.json();

        const { email } = body;
        console.log("email :: ", email);
        const response = await axios.post(`${BASE_URL}/cancel-ticket`, {
            email: email,
        });

        console.log("response :: ", response);

        return NextResponse.json({ data: response.data }, { status: 200 });
    } catch (error) {
        console.log("error :: ", error);
        return NextResponse.json({ data: null }, { status: 500 });
    }
}
