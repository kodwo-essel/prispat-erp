import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import CustomerFeedback from "@/models/CustomerFeedback";
import { getSession } from "@/lib/auth";

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        await dbConnect();
        const deletedFeedback = await CustomerFeedback.findByIdAndDelete(id);

        if (!deletedFeedback) {
            return NextResponse.json({ success: false, error: "Feedback not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: deletedFeedback });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}
