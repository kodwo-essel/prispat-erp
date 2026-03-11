import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Supplier from "@/models/Supplier";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const { id } = await params;
        const supplier = await Supplier.findById(id);

        if (!supplier) {
            return NextResponse.json({ success: false, error: "Supplier not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: supplier });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const { id } = await params;
        const body = await request.json();
        const supplier = await Supplier.findByIdAndUpdate(id, body, { new: true });

        if (!supplier) {
            return NextResponse.json({ success: false, error: "Supplier not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: supplier });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const { id } = await params;
        const supplier = await Supplier.findByIdAndDelete(id);

        if (!supplier) {
            return NextResponse.json({ success: false, error: "Supplier not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: { message: "Supplier deleted" } });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}
