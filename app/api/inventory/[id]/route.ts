import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Inventory from "@/models/Inventory";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const { id } = await params;
        const item = await Inventory.findById(id);

        if (!item) {
            return NextResponse.json({ success: false, error: "Item not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: item });
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
        const item = await Inventory.findByIdAndUpdate(id, body, { new: true });

        if (!item) {
            return NextResponse.json({ success: false, error: "Item not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: item });
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
        const item = await Inventory.findByIdAndDelete(id);

        if (!item) {
            return NextResponse.json({ success: false, error: "Item not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: { message: "Item deleted" } });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}
